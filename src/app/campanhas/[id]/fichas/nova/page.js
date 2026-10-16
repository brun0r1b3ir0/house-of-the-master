import { exigirCampanha } from "@/lib/campanha";
import Card from "@/components/campanha/Card";
import FormNovaFicha from "@/components/campanha/FormNovaFicha";

export default async function NovaFichaPage({ params }) {
  const { id } = await params;
  const campanha = await exigirCampanha(id);
  const eMestre = campanha.papel === "MESTRE";

  return (
    <Card titulo={eMestre ? "Nova ficha de NPC" : "Nova ficha"}>
      <FormNovaFicha campanhaId={id} tipo={eMestre ? "NPC" : "PJ"} />
    </Card>
  );
}
