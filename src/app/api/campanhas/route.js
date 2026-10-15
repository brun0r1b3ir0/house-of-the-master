import { NextResponse } from "next/server";
import { chamarBackend } from "@/lib/backend";

export async function GET(req) {
  const { status, dados } = await chamarBackend(req, "/campanhas");
  return NextResponse.json(dados, { status });
}

export async function POST(req) {
  const { nome, sistema, descricao, maxJogadores } = await req.json();

  const { status, dados } = await chamarBackend(req, "/campanhas", {
    method: "POST",
    body: JSON.stringify({ nome, sistema, descricao, maxJogadores }),
  });

  return NextResponse.json(dados, { status });
}