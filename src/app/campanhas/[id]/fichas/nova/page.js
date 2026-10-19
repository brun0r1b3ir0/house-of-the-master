import { redirect } from "next/navigation";
import { exigirCampanha } from "@/lib/campanha";
import Card from "@/components/campanha/Card";
import FormNovaFicha from "@/components/campanha/FormNovaFicha";
 
// Só o Mestre usa este formulário (ficha de NPC). Jogador cria o personagem
// pelo botão "+ Nova ficha" da lista, que abre o assistente de criação.
export default async function NovaFichaPage({ params }) {
  const { id } = await params;
  const campanha = await exigirCampanha(id);
 
  if (campanha.papel !== "MESTRE") {
    redirect(`/campanhas/${encodeURIComponent(id)}/fichas`);
  }
 
  return (
    <Card titulo="Nova ficha de NPC">
      <FormNovaFicha campanhaId={id} tipo="NPC" />
    </Card>
  );
}
