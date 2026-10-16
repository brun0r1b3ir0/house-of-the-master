import { chamarBackend } from "@/lib/backend";
import { responder } from "@/lib/resposta";

// GET /api/campanhas/[id]/fichas/[fid]/eventos?antes=<instante>&limite=<n>
export async function GET(req, { params }) {
  const { id, fid } = await params;
  const consulta = req.nextUrl.searchParams.toString();
  const base = `/campanhas/${encodeURIComponent(id)}/fichas/${encodeURIComponent(fid)}/eventos`;
  const { status, dados } = await chamarBackend(req, consulta ? `${base}?${consulta}` : base);
  return responder(status, dados);
}