import Link from "next/link";
import { exigirCampanha } from "@/lib/campanha";
import { exigirDoBackend } from "@/lib/backend-servidor";
import { calcularFicha } from "@/lib/warif";
import { rotuloRaca } from "@/lib/fichas";
import CardAtributos from "@/components/ficha/CardAtributos";
import CardEstado from "@/components/ficha/CardEstado";

export default async function FichaPage({ params }) {
  const { id, fid } = await params;
  const campanha = await exigirCampanha(id);
  const base = `/campanhas/${encodeURIComponent(id)}`;

  const [ficha, sistema] = await Promise.all([
    exigirDoBackend(`${base}/fichas/${encodeURIComponent(fid)}`),
    exigirDoBackend(`${base}/sistema`),
  ]);

  const calc = calcularFicha(ficha, sistema);
  const eMestre = campanha.papel === "MESTRE";

  return (
    <div className="grid gap-4">
      <div>
        <Link
          href={`/campanhas/${id}/fichas`}
          className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel hover:text-wi-bone"
        >
          ← Fichas
        </Link>
        <h1 className="mt-1 font-wi-display text-4xl tracking-wide text-wi-bone">{ficha.nome}</h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.07em] text-wi-steel">
          {[ficha.ocupacao, rotuloRaca(ficha.raca) || "Sem raça", ficha.tipo, eMestre && ficha.tipo === "PJ" ? ficha.donoNome : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {(calc.colapso?.ativo || calc.mumificado || calc.linhagemNaoImplementada) && (
        <div className="border border-wi-accent px-3 py-2 text-sm text-wi-accent">
          {calc.colapso?.ativo && <p>Colapso Mágico ativo.</p>}
          {calc.mumificado && <p>Mumificado: efeitos de Sangria aplicados.</p>}
          {calc.linhagemNaoImplementada && (
            <p>Linhagem Verdadeira ainda não tem efeito calculado nesta versão.</p>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <CardAtributos base={ficha.estado.atributos} efetivos={calc.atributos} />
        <CardEstado atuais={ficha.estado.atuais} derivados={calc.derivados} />
      </div>
    </div>
  );
}