import Link from "next/link";
import { rotuloRaca, formatarData } from "@/lib/fichas";

// Linha/cartão de uma ficha na lista. `mostrarDono` é para o Mestre ver de quem é o PJ.
export default function FichaItem({ campanhaId, ficha, mostrarDono = false }) {
  const detalhes = [
    ficha.ocupacao,
    rotuloRaca(ficha.raca),
    mostrarDono && ficha.tipo === "PJ" ? ficha.donoNome : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/campanhas/${campanhaId}/fichas/${ficha.id}`}
      className="block border border-wi-deep px-3 py-2.5 transition-colors hover:border-wi-steel"
    >
      <div className="flex items-start justify-between gap-2">
        <b className="font-wi-display text-lg font-normal leading-tight">{ficha.nome}</b>
        <span className="shrink-0 border border-wi-deep px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.07em] text-wi-steel">
          {ficha.tipo}
        </span>
      </div>
      {detalhes.length > 0 && <p className="mt-0.5 text-sm text-wi-steel">{detalhes.join(" · ")}</p>}
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.07em] text-wi-steel">
        Atualizada em {formatarData(ficha.atualizadaEm)}
      </p>
    </Link>
  );
}
