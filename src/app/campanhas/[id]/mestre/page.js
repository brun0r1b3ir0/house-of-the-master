import { redirect } from "next/navigation";
import { exigirCampanha } from "@/lib/campanha";
import Mesa from "@/components/campanha/Mesa";
import CardFichas from "@/components/campanha/CardFichas";
import CardJogadores from "@/components/campanha/CardJogadores";
import CardAtividade from "@/components/campanha/CardAtividade";

export default async function MestrePage({ params }) {
  const { id } = await params;
  const campanha = await exigirCampanha(id);

  // Quem não é Mestre desta campanha vai para a visão de Jogador
  if (campanha.papel !== "MESTRE") {
    redirect(`/campanhas/${id}/jogador`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
      <div className="lg:col-span-2">
        <Mesa />
      </div>
      <CardFichas eMestre />
      <CardJogadores campanha={campanha} eMestre />
      <div className="lg:col-span-2">
        <CardAtividade />
      </div>
    </div>
  );
}