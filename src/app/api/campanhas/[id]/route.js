import { NextResponse } from "next/server";
import { chamarBackend } from "@/lib/backend";

export async function GET(req, { params }) {
  const { id } = await params;

  const { status, dados } = await chamarBackend(
    req,
    `/campanhas/${encodeURIComponent(id)}`
  );

  return NextResponse.json(dados, { status });
}