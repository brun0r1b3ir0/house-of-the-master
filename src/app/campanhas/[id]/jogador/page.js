import { redirect } from "next/navigation";
import { exigirCampanha } from "@/lib/campanha";
import { lerDoBackend } from "@/lib/backend-servidor";
import Mesa from "@/components/campanha/Mesa";
import CardFichas from "@/components/campanha/CardFichas";
import CardJogadores from "@/components/campanha/CardJogadores";

export default async function JogadorPage({ params }) {
  const { id } = await params;
  const campanha = await exigirCampanha(id);

  // Quem é Mestre desta campanha vai para a visão de Mestre
  if (campanha.papel === "MESTRE") {
    redirect(`/campanhas/${id}/mestre`);
  }

  const { status, dados } = await lerDoBackend(`/campanhas/${encodeURIComponent(id)}/fichas`);
  const fichas = status === 200 && Array.isArray(dados) ? dados : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
      <div className="lg:col-span-2">
        <Mesa />
      </div>
      <CardFichas campanhaId={id} eMestre={false} fichas={fichas} erro={status !== 200} />
      <CardJogadores campanha={campanha} eMestre={false} />
    </div>
  );
}