import { exigirCampanha } from "@/lib/campanha";
import { exigirDoBackend } from "@/lib/backend-servidor";
import FichaEditavel from "@/components/ficha/FichaEditavel";

export default async function FichaPage({ params }) {
  const { id, fid } = await params;
  const campanha = await exigirCampanha(id);
  const base = `/campanhas/${encodeURIComponent(id)}`;

  const [ficha, sistema] = await Promise.all([
    exigirDoBackend(`${base}/fichas/${encodeURIComponent(fid)}`),
    exigirDoBackend(`${base}/sistema`),
  ]);

  // O Mestre só lê fichas de PJ; o resto (as suas e as dos NPCs) ele edita.
  const somenteLeitura = campanha.papel === "MESTRE" && ficha.tipo === "PJ";

  return (
    <FichaEditavel
      key={ficha.id}
      campanhaId={id}
      fichaInicial={ficha}
      sistema={sistema}
      editavel={!somenteLeitura}
      avisoMestre={somenteLeitura}
    />
  );
}