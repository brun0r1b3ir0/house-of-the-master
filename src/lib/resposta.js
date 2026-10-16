import { NextResponse } from "next/server";

// Resposta das rotas /api: o status 204 (sem corpo) não aceita JSON no Next.
export function responder(status, dados) {
  if (status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(dados, { status });
}

// Lê o corpo JSON da requisição; devolve null se vier vazio ou inválido.
export async function lerJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export const corpoInvalido = () => responder(400, { mensagem: "Corpo da requisição inválido." });