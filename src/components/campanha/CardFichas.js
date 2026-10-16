import Card from "./Card";

export default function CardFichas({ eMestre }) {
  return (
    <Card
      titulo={eMestre ? "Fichas da campanha" : "Minhas fichas"}
      acao={
        <button
          type="button"
          disabled
          className="cursor-not-allowed border border-wi-blood bg-wi-blood px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-wi-bone opacity-55"
        >
          {eMestre ? "+ Ficha de NPC" : "+ Nova ficha"}
        </button>
      }
    >
      <p className="py-2 italic text-wi-steel">
        {eMestre
          ? "Nenhuma ficha ainda. As fichas dos jogadores aparecem aqui, em leitura."
          : "Você ainda não tem fichas nesta campanha."}
      </p>
    </Card>
  );
}