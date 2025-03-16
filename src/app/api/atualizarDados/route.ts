import { NextApiRequest, NextApiResponse } from 'next';

// Simulação de um "banco de dados" em memória
const jogadores: { jogador: string; pontuacao: number }[] = [
  { jogador: "Jogador 1", pontuacao: 3 },
  { jogador: "Jogador 2", pontuacao: 5 },
  { jogador: "Jogador 3", pontuacao: 2 },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { jogador, pontuacao } = req.body;

    // Validação dos dados recebidos
    if (!jogador || typeof pontuacao !== 'number') {
      return res.status(400).json({ mensagem: 'Dados inválidos' });
    }

    // Procura o jogador no "banco de dados"
    const jogadorIndex = jogadores.findIndex((j) => j.jogador === jogador);

    if (jogadorIndex === -1) {
      return res.status(404).json({ mensagem: 'Jogador não encontrado' });
    }

    // Atualiza a pontuação do jogador
    jogadores[jogadorIndex].pontuacao = pontuacao;

    // Retorna uma resposta de sucesso
    return res.status(200).json({ mensagem: 'Jogador atualizado com sucesso!', jogador: jogadores[jogadorIndex] });
  } else {
    // Método não permitido
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }
}