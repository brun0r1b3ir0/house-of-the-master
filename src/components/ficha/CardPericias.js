"use client";

import { useMemo, useState } from "react";
import Card from "@/components/campanha/Card";
import { metade, quinto } from "@/lib/warif";
import { CampoNumero } from "./controles";

const normalizar = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const GRADE =
  "grid min-w-[560px] grid-cols-[minmax(150px,1.6fr)_90px_44px_80px_30px_30px_44px] items-center gap-1.5";

const chip =
  "border px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.04em] transition-colors ";
const chipOff = "border-wi-ink text-wi-ink hover:bg-wi-line";
const chipOn = "border-[var(--ac-p)] bg-[var(--ac-p)] text-wi-bone";

const acompanhaAtributo = (nome) => nome === "Esquivar" || nome.startsWith("Língua Nativa");

export default function CardPericias({ pericias = [], editavel, alterar }) {
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");

  const categorias = useMemo(
    () => [...new Set(pericias.map((p) => p.categoria).filter(Boolean))],
    [pericias],
  );

  const visiveis = useMemo(() => {
    const q = normalizar(busca.trim());
    return pericias
      .filter((p) => !categoria || p.categoria === categoria)
      .filter((p) => !q || normalizar(p.nome).includes(q));
  }, [pericias, categoria, busca]);

  return (
    <Card titulo="Perícias">
      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="buscar perícia"
        aria-label="Buscar perícia"
        className="mb-3 w-full rounded-none border-0 border-b border-wi-ink bg-transparent px-0.5 py-1.5 font-mono text-xs text-wi-ink outline-none placeholder:text-wi-steel focus:border-[var(--ac-p)]"
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        <button type="button" aria-pressed={!categoria} onClick={() => setCategoria("")} className={chip + (!categoria ? chipOn : chipOff)}>
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === categoria}
            onClick={() => setCategoria(c === categoria ? "" : c)}
            className={chip + (c === categoria ? chipOn : chipOff)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto [scrollbar-color:var(--ac-p)_transparent] [scrollbar-width:thin]">
        <div className={`${GRADE} border-b border-wi-ink pb-1 font-mono text-[9.5px] uppercase tracking-[0.05em] text-wi-steel`}>
          <span>Perícia</span>
          <span>Categoria</span>
          <span className="text-center">Valor</span>
          <span className="text-center">(Inicial) Efetivo</span>
          <span className="text-center">½</span>
          <span className="text-center">⅕</span>
          <span>Mágico</span>
        </div>

        {visiveis.length === 0 && <p className="py-3 italic text-wi-steel">Nenhuma perícia encontrada.</p>}

        {visiveis.map((p) => (
          <div key={p.nome} className={`${GRADE} border-b border-wi-line py-1 text-[14.5px]`}>
            <span>{p.nome}</span>
            <span className="font-mono text-[10px] text-wi-steel">{p.categoria}</span>
            <span className="text-center font-mono text-[13px]">
              {editavel ? (
                // Digitar um valor grava o ganho: valor − inicial. Não desce abaixo do inicial.
                <CampoNumero
                  valor={p.valor}
                  min={p.valorInicial}
                  max={999}
                  rotulo={`Valor de ${p.nome}`}
                  onConfirmar={(v) => alterar(`pericias.${p.nome}.ganho`, v - p.valorInicial)}
                  className="w-10"
                />
              ) : (
                p.valor
              )}
            </span>
            <span
              className="text-center font-mono text-[13px]"
              title={acompanhaAtributo(p.nome) ? "Inicial acompanha o atributo digitado" : undefined}
            >
              <span className="text-wi-steel">({p.valorInicial})</span>
              {acompanhaAtributo(p.nome) && <sup className="text-[9px] text-[var(--ac-p)]">↔</sup>}{" "}
              <b className="text-sm text-[var(--ac-p)]">{p.efetivo}</b>
            </span>
            <span className="text-center font-mono text-[13px]">{metade(p.efetivo)}</span>
            <span className="text-center font-mono text-[13px]">{quinto(p.efetivo)}</span>
            <span
              className={
                "border py-0.5 text-center font-mono text-[9.5px] uppercase " +
                (p.magica
                  ? "border-[var(--ac-p)] bg-[var(--ac-p)] text-wi-bone"
                  : "border-wi-line text-wi-steel")
              }
            >
              {p.magica ? "Sim" : "Não"}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 font-mono text-[10px] text-wi-steel">
        {visiveis.length} de {pericias.length} perícias
      </p>
    </Card>
  );
}