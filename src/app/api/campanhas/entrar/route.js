import { NextResponse } from "next/server";
import { chamarBackend } from "@/lib/backend";

export async function POST(req) {
  const { codigo } = await req.json();

  const { status, dados } = await chamarBackend(req, "/campanhas/entrar", {
    method: "POST",
    body: JSON.stringify({ codigo }),
  });

  return NextResponse.json(dados, { status });
}