import Link from "next/link";
import Card from "./Card";
import FichaItem from "./FichaItem";

const botao =
  "border border-wi-blood bg-wi-blood px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-wi-bone transition-opacity hover:opacity-85";

const LIMITE = 5;

export default function CardFichas({ campanhaId, eMestre, fichas = [], erro = false }) {
  const recentes = fichas.slice(0, LIMITE);
  const restantes = fichas.length - recentes.length;

  return (
    <Card
      titulo={eMestre ? "Fichas da campanha" : "Minhas fichas"}
      acao={
        <Link href={`/campanhas/${campanhaId}/fichas/nova`} className={botao}>
          {eMestre ? "+ Ficha de NPC" : "+ Nova ficha"}
        </Link>
      }
    >
      {erro ? (
        <p className="py-2 italic text-wi-steel">Não foi possível carregar as fichas agora.</p>
      ) : recentes.length === 0 ? (
        <p className="py-2 italic text-wi-steel">
          {eMestre
            ? "Nenhuma ficha ainda. As fichas dos jogadores aparecem aqui, em leitura."
            : "Você ainda não tem fichas nesta campanha."}
        </p>
      ) : (
        <div className="grid gap-2">
          {recentes.map((ficha) => (
            <FichaItem key={ficha.id} campanhaId={campanhaId} ficha={ficha} mostrarDono={eMestre} />
          ))}
          {restantes > 0 && (
            <Link
              href={`/campanhas/${campanhaId}/fichas`}
              className="pt-1 font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel hover:text-wi-bone"
            >
              Ver todas ({fichas.length}) →
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}