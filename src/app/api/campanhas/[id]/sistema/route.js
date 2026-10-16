import { chamarBackend } from "@/lib/backend";
import { responder } from "@/lib/resposta";

// GET /api/campanhas/[id]/sistema  -> catálogo de perícias e estágios de Sanidade
export async function GET(req, { params }) {
  const { id } = await params;
  const { status, dados } = await chamarBackend(req, `/campanhas/${encodeURIComponent(id)}/sistema`);
  return responder(status, dados);
}