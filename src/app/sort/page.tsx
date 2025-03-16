"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, PlusCircle, X, Users, Edit, Trash2 } from "lucide-react"; // Adicionei Trash2 para o ícone de remover
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Defina a interface para o tipo de jogador
interface Jogador {
  jogador: string;
  pontuacao: number;
}

// Interface para os times
interface Time {
  nome: string;
  jogadores: Jogador[];
  pontuacaoTotal: number;
}

const Sort = () => {
  // Estados
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [jogadoresSelecionados, setJogadoresSelecionados] = useState<Jogador[]>([]);
  const [novoJogador, setNovoJogador] = useState("");
  const [novaPontuacao, setNovaPontuacao] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [quantidadeTimes, setQuantidadeTimes] = useState<string>("2");
  const [showQuantidadeDialog, setShowQuantidadeDialog] = useState(false);
  const [timesSorteados, setTimesSorteados] = useState<Time[]>([]);
  const [showResultado, setShowResultado] = useState(false);
  const [jogadorEditando, setJogadorEditando] = useState<Jogador | null>(null); // Estado para edição

  // Buscar jogadores ao montar o componente
  useEffect(() => {
    buscarJogadores();
  }, []);

  // Função para buscar jogadores da API
  const buscarJogadores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lerDados');
      
      // Verifica o tipo de conteúdo retornado
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("A API não retornou um JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setJogadores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao buscar jogadores');
      // Define uma lista vazia em caso de erro
      setJogadores([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar novo jogador
  const cadastrarJogador = async () => {
    if (!novoJogador.trim()) {
      setErro('Nome do jogador é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      
      const response = await fetch('/api/salvarDados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jogador: novoJogador.trim(),
          pontuacao: novaPontuacao
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensagem || 'Erro ao cadastrar jogador');
      }

      // Limpar campos
      setNovoJogador("");
      setNovaPontuacao(3);
      
      // Atualizar lista de jogadores
      await buscarJogadores();
      
      setSucesso('Jogador cadastrado com sucesso!');
      setTimeout(() => setSucesso(null), 3000);
    } catch (error) {
      console.error('Erro ao cadastrar jogador:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao cadastrar jogador');
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar/remover jogador da seleção
  const toggleJogadorSelecionado = (jogador: Jogador) => {
    setJogadoresSelecionados(prev => {
      const jaExiste = prev.some(j => j.jogador === jogador.jogador);
      
      if (jaExiste) {
        return prev.filter(j => j.jogador !== jogador.jogador);
      } else {
        return [...prev, jogador];
      }
    });
  };

  // Função para remover jogador da seleção
  const removerJogadorSelecionado = (jogador: Jogador) => {
    setJogadoresSelecionados(prev => prev.filter(j => j.jogador !== jogador.jogador));
  };

  // Verificar se um jogador está selecionado
  const isJogadorSelecionado = (jogador: string) => {
    return jogadoresSelecionados.some(j => j.jogador === jogador);
  };

  // Completar a seleção de jogadores
  const concluirSelecao = () => {
    setOpen(false);
  };

  // Iniciar o processo de sorteio
  const iniciarSorteio = () => {
    setShowQuantidadeDialog(true);
  };

  // Algoritmo para realizar o sorteio de times equilibrados
  const sortearTimes = () => {
    const numTimes = parseInt(quantidadeTimes);
    
    if (jogadoresSelecionados.length < numTimes) {
      setErro(`Você precisa selecionar pelo menos ${numTimes} jogadores para formar ${numTimes} times`);
      return;
    }

    // Ordenar jogadores por pontuação (decrescente)
    const jogadoresOrdenados = [...jogadoresSelecionados].sort((a, b) => b.pontuacao - a.pontuacao);
    
    // Inicializar times vazios
    const times: Time[] = Array.from({ length: numTimes }, (_, i) => ({
      nome: `Time ${i + 1}`,
      jogadores: [],
      pontuacaoTotal: 0
    }));

    // Distribuir jogadores usando o método "serpentina"
    let direcao = 1;
    let indiceTime = 0;

    for (const jogador of jogadoresOrdenados) {
      times[indiceTime].jogadores.push(jogador);
      times[indiceTime].pontuacaoTotal += jogador.pontuacao;
      
      indiceTime += direcao;
      
      if (indiceTime >= numTimes) {
        direcao = -1;
        indiceTime = numTimes - 2;
      } else if (indiceTime < 0) {
        direcao = 1;
        indiceTime = 1;
      }
    }

    // Atualizar times sorteados
    setTimesSorteados(times);
    setShowQuantidadeDialog(false);
    setShowResultado(true);
  };

  // Função para atualizar a pontuação do jogador
  const atualizarPontuacaoJogador = async (jogador: Jogador, novaPontuacao: number) => {
    try {
      setLoading(true);
      setErro(null);
  
      const response = await fetch('/api/atualizarDados', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jogador: jogador.jogador,
          pontuacao: novaPontuacao,
        }),
      });
  
      console.log('Resposta da API:', response); // Log da resposta
  
      // Verifica se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text(); // Lê o corpo da resposta como texto
        console.error('Resposta inválida:', errorText); // Log do erro
        throw new Error(`Resposta inválida: ${errorText}`);
      }
  
      if (!response.ok) {
        const errorData = await response.json(); // Tenta parsear o JSON de erro
        throw new Error(errorData.mensagem || 'Erro ao atualizar pontuação do jogador');
      }
  
      const data = await response.json(); // Processa a resposta JSON de sucesso
      console.log('Resposta JSON:', data); // Log da resposta JSON
  
      // Atualiza a lista de jogadores
      await buscarJogadores();
  
      // Atualiza o jogador na lista de selecionados (se estiver lá)
      setJogadoresSelecionados((prev) =>
        prev.map((j) =>
          j.jogador === jogador.jogador ? { ...j, pontuacao: novaPontuacao } : j
        )
      );
  
      setSucesso('Pontuação do jogador atualizada com sucesso!');
      setTimeout(() => setSucesso(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar pontuação do jogador:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao atualizar pontuação do jogador');
    } finally {
      setLoading(false);
      setJogadorEditando(null); // Fechar o modal de edição
    }
  };

  // Modal de edição de jogador
  const ModalEditarJogador = () => {
    const [novaPontuacao, setNovaPontuacao] = useState(jogadorEditando?.pontuacao || 3);

    return (
      <Dialog open={!!jogadorEditando} onOpenChange={() => setJogadorEditando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pontuação</DialogTitle>
            <DialogDescription>
              Edite a pontuação do jogador {jogadorEditando?.jogador}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label>Nova Pontuação (1-5)</Label>
            <RadioGroup
              value={novaPontuacao.toString()}
              onValueChange={(value) => setNovaPontuacao(parseInt(value))}
              className="flex justify-between"
            >
              {[1, 2, 3, 4, 5].map((valor) => (
                <div key={valor} className="flex items-center space-x-1">
                  <RadioGroupItem value={valor.toString()} id={`edit-rating-${valor}`} />
                  <Label htmlFor={`edit-rating-${valor}`}>{valor}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setJogadorEditando(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                jogadorEditando && atualizarPontuacaoJogador(jogadorEditando, novaPontuacao)
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>Sorteador de Times</CardTitle>
          <CardDescription>Cadastre jogadores e sorteie times equilibrados</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Dialog para selecionar jogadores */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Selecionar Jogadores
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md md:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Jogadores disponíveis</DialogTitle>
                  <DialogDescription>
                    Selecione os jogadores para o sorteio ou adicione novos.
                  </DialogDescription>
                </DialogHeader>
                
                {/* Lista de jogadores cadastrados */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {loading ? (
                    <p className="text-center py-4">Carregando jogadores...</p>
                  ) : jogadores.length > 0 ? (
                    jogadores.map((jogador) => (
                      <div
                        key={jogador.jogador}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${isJogadorSelecionado(jogador.jogador)
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        onClick={() => toggleJogadorSelecionado(jogador)}
                      >
                        <div className="flex items-center gap-2">
                          {isJogadorSelecionado(jogador.jogador) && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                          <span className="dark:text-white">{jogador.jogador}</span>
                        </div>
                        <Badge variant="outline">{jogador.pontuacao}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4">Nenhum jogador cadastrado</p>
                  )}
                </div>
                
                {/* Formulário para adicionar novo jogador */}
                <div className="my-4 space-y-4 border-t pt-4">
                  <h4 className="font-medium">Adicionar novo jogador</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="novoJogador">Nome do jogador</Label>
                    <Input
                      id="novoJogador"
                      value={novoJogador}
                      onChange={(e) => setNovoJogador(e.target.value)}
                      placeholder="Digite o nome do jogador"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pontuação (1-5)</Label>
                    <RadioGroup
                      value={novaPontuacao.toString()}
                      onValueChange={(value) => setNovaPontuacao(parseInt(value))}
                      className="flex justify-between"
                    >
                      {[1, 2, 3, 4, 5].map((valor) => (
                        <div key={valor} className="flex items-center space-x-1">
                          <RadioGroupItem value={valor.toString()} id={`rating-${valor}`} />
                          <Label htmlFor={`rating-${valor}`}>{valor}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  {erro && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>{erro}</AlertDescription>
                    </Alert>
                  )}
                  
                  {sucesso && (
                    <Alert variant="default" className="py-2 bg-green-50 text-green-700 border-green-200">
                      <AlertDescription>{sucesso}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    onClick={cadastrarJogador}
                    disabled={loading || !novoJogador.trim()}
                  >
                    {loading ? 'Salvando...' : 'Adicionar Jogador'}
                  </Button>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={concluirSelecao}>
                    Concluir ({jogadoresSelecionados.length} selecionados)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Dialog para selecionar quantidade de times */}
            <Dialog open={showQuantidadeDialog} onOpenChange={setShowQuantidadeDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Quantidade de Times</DialogTitle>
                  <DialogDescription>
                    Selecione quantos times deseja formar com os {jogadoresSelecionados.length} jogadores selecionados.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Label htmlFor="quantidade-times" className="mb-2 block">Número de times:</Label>
                  <Select
                    value={quantidadeTimes}
                    onValueChange={setQuantidadeTimes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a quantidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Times</SelectItem>
                      <SelectItem value="3">3 Times</SelectItem>
                      <SelectItem value="4">4 Times</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Jogadores por time: aproximadamente {Math.ceil(jogadoresSelecionados.length / parseInt(quantidadeTimes || "2"))}
                  </p>
                </div>
                
                {erro && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{erro}</AlertDescription>
                  </Alert>
                )}
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowQuantidadeDialog(false)}>Cancelar</Button>
                  <Button onClick={sortearTimes}>Sortear Times</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Jogadores selecionados */}
            {!showResultado && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Jogadores selecionados:</h3>
                {jogadoresSelecionados.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {jogadoresSelecionados.map((jogador) => (
                      <div
                        key={jogador.jogador}
                        className="flex items-center justify-between p-2 rounded-md border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <span className="dark:text-white">{jogador.jogador}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{jogador.pontuacao}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setJogadorEditando(jogador)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerJogadorSelecionado(jogador)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum jogador selecionado ainda.</p>
                )}
              </div>
            )}
  
            {/* Botão para iniciar o sorteio */}
            {!showResultado && jogadoresSelecionados.length > 0 && (
              <div className="mt-6">
                <Button className="w-full" onClick={iniciarSorteio}>
                  <Users className="mr-2 h-4 w-4" /> Sortear Times
                </Button>
              </div>
            )}
  
            {/* Exibição dos times sorteados */}
            {showResultado && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Times Sorteados:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {timesSorteados.map((time, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader>
                        <CardTitle>{time.nome}</CardTitle>
                        <CardDescription>Pontuação Total: {time.pontuacaoTotal}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {time.jogadores.map((jogador, jogadorIndex) => (
                            <div 
                              key={jogadorIndex}
                              className="flex items-center justify-between p-2 rounded-md border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center gap-2">
                                <span className="dark:text-white">{jogador.jogador}</span>
                              </div>
                              <Badge variant="outline">{jogador.pontuacao}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
  
                {/* Botão para reiniciar o sorteio */}
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setShowResultado(false);
                      setJogadoresSelecionados([]);
                      setTimesSorteados([]);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Reiniciar Sorteio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de edição de jogador */}
      <ModalEditarJogador />
    </div>
  );
};

export default Sort;