import Link from "next/link";
import { exigirCampanha } from "@/lib/campanha";
import { exigirDoBackend } from "@/lib/backend-servidor";
import Card from "@/components/campanha/Card";
import FichaItem from "@/components/campanha/FichaItem";

const botao =
  "border border-wi-blood bg-wi-blood px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-wi-bone transition-opacity hover:opacity-85";

function Lista({ campanhaId, fichas, mostrarDono, vazio }) {
  if (fichas.length === 0) return <p className="py-2 italic text-wi-steel">{vazio}</p>;
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {fichas.map((ficha) => (
        <FichaItem key={ficha.id} campanhaId={campanhaId} ficha={ficha} mostrarDono={mostrarDono} />
      ))}
    </div>
  );
}

export default async function FichasPage({ params }) {
  const { id } = await params;
  const campanha = await exigirCampanha(id);
  const eMestre = campanha.papel === "MESTRE";
  const fichas = await exigirDoBackend(`/campanhas/${encodeURIComponent(id)}/fichas`);

  const nova = (
    <Link href={`/campanhas/${id}/fichas/nova`} className={botao}>
      {eMestre ? "+ Ficha de NPC" : "+ Nova ficha"}
    </Link>
  );

  if (!eMestre) {
    return (
      <Card titulo="Minhas fichas" acao={nova}>
        <Lista
          campanhaId={id}
          fichas={fichas}
          mostrarDono={false}
          vazio="Você ainda não tem fichas nesta campanha."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card titulo="Personagens dos jogadores">
        <Lista
          campanhaId={id}
          fichas={fichas.filter((f) => f.tipo === "PJ")}
          mostrarDono
          vazio="Nenhum jogador criou ficha ainda. Elas aparecem aqui, em leitura."
        />
      </Card>
      <Card titulo="NPCs" acao={nova}>
        <Lista
          campanhaId={id}
          fichas={fichas.filter((f) => f.tipo === "NPC")}
          mostrarDono={false}
          vazio="Nenhum NPC ainda."
        />
      </Card>
    </div>
  );
}
