import { NextResponse } from "next/server";

export async function POST(req) {
  const { nome, email, senha } = await req.json();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
      cache: "no-store",
    });

    const texto = await res.text();
    let dados;
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { mensagem: texto };
    }

    return NextResponse.json(dados, { status: res.status });
  } catch {
    return NextResponse.json(
      { mensagem: "Servidor indisponível. Tente novamente." },
      { status: 502 }
    );
  }
}