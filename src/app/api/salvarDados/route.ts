// app/api/salvarDados/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jogador, pontuacao } = body;
    
    if (!jogador || typeof pontuacao !== 'number' || pontuacao < 1 || pontuacao > 5) {
      return NextResponse.json(
        { mensagem: 'Dados inválidos! Nome do jogador e pontuação entre 1 e 5 são obrigatórios.' },
        { status: 400 }
      );
    }

    const caminhoArquivo = path.join(process.cwd(), 'dados.json');
    
    let dadosAtuais = [];
    try {
      const conteudo = await fs.readFile(caminhoArquivo, 'utf-8');
      dadosAtuais = JSON.parse(conteudo);
      
      // Verificação de jogador duplicado
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jogadorExistente = dadosAtuais.find((item: any) => item.jogador === jogador);
      if (jogadorExistente) {
        return NextResponse.json(
          { mensagem: 'Jogador já cadastrado!' },
          { status: 400 }
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Se o arquivo não existir, continuamos com array vazio
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Adicionando novos dados
    dadosAtuais.push({ jogador, pontuacao });

    // Salvando no arquivo JSON
    await fs.writeFile(caminhoArquivo, JSON.stringify(dadosAtuais, null, 2));

    return NextResponse.json({ mensagem: 'Dados salvos com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return NextResponse.json(
      { mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}