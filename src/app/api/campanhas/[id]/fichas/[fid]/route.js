import { chamarBackend } from "@/lib/backend";
import { responder, lerJson, corpoInvalido } from "@/lib/resposta";

const caminho = (id, fid) => `/campanhas/${encodeURIComponent(id)}/fichas/${encodeURIComponent(fid)}`;

// GET /api/campanhas/[id]/fichas/[fid]  -> ficha completa
export async function GET(req, { params }) {
  const { id, fid } = await params;
  const { status, dados } = await chamarBackend(req, caminho(id, fid));
  return responder(status, dados);
}

// PATCH /api/campanhas/[id]/fichas/[fid]  -> { ops: [{ campo, valor }] }
export async function PATCH(req, { params }) {
  const { id, fid } = await params;
  const corpo = await lerJson(req);
  if (!corpo) return corpoInvalido();

  const { status, dados } = await chamarBackend(req, caminho(id, fid), {
    method: "PATCH",
    body: JSON.stringify({ ops: corpo.ops }),
  });
  return responder(status, dados);
}

// DELETE /api/campanhas/[id]/fichas/[fid]  -> arquiva (204)
export async function DELETE(req, { params }) {
  const { id, fid } = await params;
  const { status, dados } = await chamarBackend(req, caminho(id, fid), { method: "DELETE" });
  return responder(status, dados);
}