import { notFound, redirect } from "next/navigation";
import { exigirCampanha } from "@/lib/campanha";
import { exigirDoBackend } from "@/lib/backend-servidor";
import { acentoDaRaca } from "@/lib/ficha-visual";
import AcentoDaPagina from "@/components/ficha/AcentoDaPagina";
import AssistenteCriacao from "@/components/criacao/AssistenteCriacao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CriarFichaPage({ params }) {
  const { id, fid } = await params;
  // Id inválido na URL (ex.: /fichas/nova/criar) vira "não encontrada", não erro 500.
  if (!UUID.test(fid)) notFound();

  const campanha = await exigirCampanha(id);
  const base = `/campanhas/${encodeURIComponent(id)}`;
  const fichaUrl = `${base}/fichas/${encodeURIComponent(fid)}`;
  const [ficha, sistema] = await Promise.all([exigirDoBackend(fichaUrl), exigirDoBackend(`${base}/sistema`)]);

  // Mestre só lê PJ de jogador: a criação é do dono da ficha.
  if (campanha.papel === "MESTRE" && ficha.tipo === "PJ") redirect(fichaUrl);

  const acento = acentoDaRaca(ficha.raca);
  return (
    <div style={{ "--ac-t": acento.t, "--ac-p": acento.p }}>
      <AcentoDaPagina t={acento.t} p={acento.p} />
      <AssistenteCriacao
        ficha={{ id: ficha.id, nome: ficha.nome, ocupacao: ficha.ocupacao, raca: ficha.raca }}
        campanhaId={id}
        sistema={sistema}
        voltarPara={fichaUrl}
      />
    </div>
  );
}