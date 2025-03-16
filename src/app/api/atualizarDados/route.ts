import { NextResponse } from 'next/server';

const jogadores = [
  { jogador: 'Jogador 1', pontuacao: 3 },
  { jogador: 'Jogador 2', pontuacao: 5 },
  { jogador: 'Jogador 3', pontuacao: 2 },
];

export async function PUT(request: Request) {
  try {
    const { jogador, pontuacao } = await request.json();

    // Validação dos dados recebidos
    if (!jogador || typeof pontuacao !== 'number') {
      return NextResponse.json({ mensagem: 'Dados inválidos' }, { status: 400 });
    }

    // Atualizando a pontuação do jogador
    const jogadorIndex = jogadores.findIndex((j) => j.jogador === jogador);
    if (jogadorIndex === -1) {
      return NextResponse.json({ mensagem: 'Jogador não encontrado' }, { status: 404 });
    }

    jogadores[jogadorIndex].pontuacao = pontuacao;

    return NextResponse.json({
      mensagem: 'Jogador atualizado com sucesso!',
      jogador: jogadores[jogadorIndex],
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ mensagem: 'Erro no servidor', erro: error.message }, { status: 500 });
  }
}
