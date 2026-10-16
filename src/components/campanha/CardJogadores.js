import Card from "./Card";
import CopiarCodigo from "./CopiarCodigo";

export default function CardJogadores({ campanha, eMestre }) {
  const n = campanha.jogadores;
  const max = campanha.maxJogadores;

  return (
    <Card
      titulo="Jogadores"
      acao={
        typeof n === "number" ? (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">
            {n}
            {max ? ` / ${max}` : ""}
          </span>
        ) : null
      }
    >
      {eMestre && campanha.codigoConvite && (
        <div className="mb-2.5 flex items-center justify-between gap-2 border border-dashed border-wi-ink px-3 py-2.5">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.07em] text-wi-steel">
              Código de convite
            </span>
            <b className="font-mono text-[19px] font-medium tracking-[0.14em]">
              {campanha.codigoConvite}
            </b>
          </div>
          <CopiarCodigo codigo={campanha.codigoConvite} />
        </div>
      )}
      <p className="py-1 italic text-wi-steel">
        A lista com os nomes chega junto com as fichas.
      </p>
      {!eMestre && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.07em] text-wi-steel">
          Você só vê as suas fichas. O Mestre vê todas.
        </p>
      )}
    </Card>
  );
}