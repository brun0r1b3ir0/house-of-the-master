"use client";

import { useSyncExternalStore } from "react";

const CHAVE = "hotm:ficha:condicoes-recolhidas";

// Preferência do painel de Condições: vem do navegador, e não do servidor.
// Se localStorage falhar, `memoria` mantém o botão funcionando na sessão.
let memoria = null;
const ouvintes = new Set();

function assinar(aviso) {
  ouvintes.add(aviso);
  return () => ouvintes.delete(aviso);
}

function lerRecolhido() {
  if (memoria !== null) return memoria;
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo !== null) return salvo === "1";
  } catch {}
  return window.innerWidth < 1024; // sem preferência: começa recolhido no celular
}

function gravarRecolhido(valor) {
  memoria = valor;
  try {
    localStorage.setItem(CHAVE, valor ? "1" : "0");
  } catch {}
  ouvintes.forEach((aviso) => aviso());
}

export default function LayoutFicha({ principal, condicoes }) {
  // No servidor, e na hidratação, o painel começa expandido.
  const recolhido = useSyncExternalStore(assinar, lerRecolhido, () => false);

  return (
    <div
      className={
        "grid items-start gap-4 " +
        (recolhido ? "lg:grid-cols-[minmax(0,1fr)_54px]" : "lg:grid-cols-[minmax(0,1fr)_300px]")
      }
    >
      <div className="grid min-w-0 gap-4">{principal}</div>

      <aside
        className={
          "order-first border border-black bg-wi-paper text-wi-ink " +
          "[scrollbar-color:var(--ac-p)_transparent] [scrollbar-width:thin] " +
          "lg:order-none lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto " +
          (recolhido ? "p-4 lg:overflow-hidden lg:px-0 lg:py-2.5" : "p-4")
        }
      >
        <div
          className={
            "flex items-center justify-between gap-2 " +
            (recolhido ? "lg:justify-center" : "mb-2.5")
          }
        >
          <h3 className={"font-wi-display text-[21px] font-normal tracking-wide " + (recolhido ? "lg:hidden" : "")}>
            Condições
          </h3>
          <button
            type="button"
            onClick={() => gravarRecolhido(!recolhido)}
            aria-expanded={!recolhido}
            aria-controls="painel-condicoes"
            title={recolhido ? "Expandir condições" : "Recolher condições"}
            className="h-[26px] w-[26px] shrink-0 border border-wi-ink font-mono text-[15px] leading-none transition-colors hover:bg-wi-ink hover:text-wi-bone"
          >
            {recolhido ? "+" : "−"}
          </button>
        </div>

        {recolhido && (
          <div
            aria-hidden="true"
            className="mx-auto mt-1.5 hidden font-wi-display text-[21px] tracking-[0.08em] [writing-mode:vertical-rl] lg:block"
          >
            Condições
          </div>
        )}

        <div id="painel-condicoes" hidden={recolhido}>
          {condicoes}
        </div>
      </aside>
    </div>
  );
}