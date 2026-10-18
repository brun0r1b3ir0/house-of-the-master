import { chamarBackend } from "@/lib/backend";
import { responder, lerJson, corpoInvalido } from "@/lib/resposta";

// POST /api/campanhas/[id]/fichas/[fid]/criacao/concluir
// Corpo: { atributos, profissao: { principal, secundario, pericias }, ganhos: { profissao, interesse } }
export async function POST(req, { params }) {
  const { id, fid } = await params;
  const corpo = await lerJson(req);
  if (!corpo) return corpoInvalido();

  const caminho = `/campanhas/${encodeURIComponent(id)}/fichas/${encodeURIComponent(fid)}/criacao/concluir`;
  const { status, dados } = await chamarBackend(req, caminho, {
    method: "POST",
    body: JSON.stringify({ atributos: corpo.atributos, profissao: corpo.profissao, ganhos: corpo.ganhos }),
  });
  return responder(status, dados);
}