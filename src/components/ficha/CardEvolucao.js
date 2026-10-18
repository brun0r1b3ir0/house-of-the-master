"use client";

import { useMemo } from "react";
import { calcularEvolucao } from "@/lib/warif/evolucao";

const sinal = (n) => (n > 0 ? `+${n}` : String(n));
const corDiff = (n) => (n > 0 ? "text-wi-bone" : n < 0 ? "text-wi-accent" : "text-wi-steel");

function Linha({ nome, criacao, atual, diff }) {
  return (
    <div className="grid grid-cols-[1fr_3rem_3rem_3rem] items-baseline gap-2 border-b border-wi-steel/20 py-1 text-sm">
      <span className="truncate">{nome}</span>
      <span className="text-right font-mono text-wi-steel">{criacao}</span>
      <span className="text-right font-mono">{atual}</span>
      <span className={`text-right font-mono ${corDiff(diff)}`}>{diff === 0 ? "·" : sinal(diff)}</span>
    </div>
  );
}

function Cabecalho() {
  return (
    <div className="grid grid-cols-[1fr_3rem_3rem_3rem] gap-2 pb-1 font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">
      <span />
      <span className="text-right">Criação</span>
      <span className="text-right">Hoje</span>
      <span className="text-right">Δ</span>
    </div>
  );
}

// Só aparece em fichas que passaram pela criação. Compara valores digitados:
// bônus de raça e condições (fome, sanidade...) não entram.
export default function CardEvolucao({ ficha, sistema }) {
  const evo = useMemo(() => calcularEvolucao(ficha, sistema), [ficha, sistema]);
  if (!evo) return null;

  return (
    <details className="border border-wi-steel/40 p-4">
      <summary className="cursor-pointer font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel hover:text-wi-bone">
        Evolução · {evo.totais.pontosGanhos >= 0 ? "+" : ""}
        {evo.totais.pontosGanhos} pontos em perícias desde a criação
      </summary>

      <p className="mt-3 text-xs text-wi-steel">
        Valores digitados, sem bônus de raça nem condições. Criação distribuiu {evo.totais.pontosCriacao} pontos em perícias.
      </p>

      <h4 className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-bone">Atributos</h4>
      <Cabecalho />
      {evo.atributos.map((a) => (
        <Linha key={a.chave} nome={a.chave} criacao={a.criacao} atual={a.atual} diff={a.diff} />
      ))}

      <h4 className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-bone">Perícias</h4>
      <Cabecalho />
      {evo.pericias.map((p) => (
        <Linha key={p.nome} nome={p.nome} criacao={p.criacao} atual={p.atual} diff={p.diff} />
      ))}
    </details>
  );
}
