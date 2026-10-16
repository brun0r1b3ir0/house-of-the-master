import Card from "./Card";

export default function CardAtividade() {
  return (
    <Card
      titulo="Atividade recente"
      acao={
        <span className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">
          log de fichas
        </span>
      }
    >
      <p className="py-1 italic text-wi-steel">Nenhuma alteração registrada ainda.</p>
    </Card>
  );
}