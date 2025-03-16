/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/lerDados/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Certifique-se de que o caminho do arquivo seja consistente com o usado em salvarDados
    const caminhoArquivo = path.join(process.cwd(), 'dados.json');
    
    try {
      const conteudo = await fs.readFile(caminhoArquivo, 'utf-8');
      const dados = JSON.parse(conteudo);
      return NextResponse.json(dados);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Arquivo não encontrado
        return NextResponse.json(
          { mensagem: 'Nenhum dado encontrado!' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    return NextResponse.json(
      { mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}