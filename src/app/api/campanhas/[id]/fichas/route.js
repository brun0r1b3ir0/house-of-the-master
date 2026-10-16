import { chamarBackend } from "@/lib/backend";
import { responder, lerJson, corpoInvalido } from "@/lib/resposta";

// GET  /api/campanhas/[id]/fichas  -> lista as fichas que o usuário pode ver
export async function GET(req, { params }) {
  const { id } = await params;
  const { status, dados } = await chamarBackend(req, `/campanhas/${encodeURIComponent(id)}/fichas`);
  return responder(status, dados);
}

// POST /api/campanhas/[id]/fichas  -> cria ficha (PJ do jogador ou NPC do Mestre)
export async function POST(req, { params }) {
  const { id } = await params;
  const corpo = await lerJson(req);
  if (!corpo) return corpoInvalido();

  const { tipo, nome, ocupacao, raca } = corpo;
  const { status, dados } = await chamarBackend(req, `/campanhas/${encodeURIComponent(id)}/fichas`, {
    method: "POST",
    body: JSON.stringify({ tipo, nome, ocupacao, raca }),
  });
  return responder(status, dados);
}
