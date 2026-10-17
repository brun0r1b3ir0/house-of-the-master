"use client";

import { useMemo } from "react";
import Link from "next/link";
import { acentoDaRaca } from "@/lib/ficha-visual";
import AcentoDaPagina from "./AcentoDaPagina";
import CabecalhoFicha from "./CabecalhoFicha";
import CardAtributos from "./CardAtributos";
import CardEstado from "./CardEstado";
import CardPericias from "./CardPericias";
import CardCondicoes from "./CardCondicoes";
import LayoutFicha from "./LayoutFicha";
import { useFichaAutosave } from "./useFichaAutosave";

const TEXTO_STATUS = {
  salvo: "Salvo",
  pendente: "Alterações pendentes…",
  salvando: "Salvando…",
  erro: "Não salvo",
};

export default function FichaEditavel({ campanhaId, fichaInicial, sistema, editavel, avisoMestre }) {
  const { ficha, calc, status, erro, alterar } = useFichaAutosave({
    campanhaId,
    fichaId: fichaInicial.id,
    fichaInicial,
    sistema,
    editavel,
  });

  const acento = acentoDaRaca(ficha.raca);

  // Olfato é exclusivo de Lobisomem: para as outras raças a perícia não aparece.
  const pericias = useMemo(
    () => calc.pericias.filter((p) => p.nome !== "Olfato" || ficha.raca === "LOBISOMEM"),
    [calc.pericias, ficha.raca],
  );

  return (
    <div className="grid gap-4" style={{ "--ac-t": acento.t, "--ac-p": acento.p }}>
      <AcentoDaPagina t={acento.t} p={acento.p} />

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/campanhas/${campanhaId}/fichas`}
          className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel hover:text-wi-bone"
        >
          ← Fichas
        </Link>
        {editavel && (
          <span
            role="status"
            aria-live="polite"
            className={
              "font-mono text-[10.5px] uppercase tracking-[0.07em] " +
              (status === "erro" ? "text-wi-accent" : "text-wi-steel")
            }
          >
            {TEXTO_STATUS[status]}
          </span>
        )}
      </div>

      {avisoMestre && (
        <div className="bg-wi-blood px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.05em] text-wi-bone">
          Visão de Mestre · somente leitura · alterações devem ser combinadas com o jogador
        </div>
      )}

      {erro && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 border border-wi-accent px-3 py-2 text-sm text-wi-accent">
          <span>{erro.mensagem} A ficha voltou ao último estado salvo.</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-wi-accent px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.05em] hover:bg-wi-accent hover:text-wi-bone"
          >
            Recarregar
          </button>
        </div>
      )}

      <CabecalhoFicha ficha={ficha} editavel={editavel} alterar={alterar} />

      {(calc.colapso?.ativo || calc.mumificado || calc.linhagemNaoImplementada) && (
        <div className="border border-wi-accent px-3 py-2 text-sm text-wi-accent">
          {calc.colapso?.ativo && <p>Colapso Mágico ativo.</p>}
          {calc.mumificado && <p>Mumificado: efeitos de Sangria aplicados.</p>}
          {calc.linhagemNaoImplementada && (
            <p>Linhagem Verdadeira ainda não tem efeito calculado nesta versão.</p>
          )}
        </div>
      )}

      <LayoutFicha
        principal={
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <CardAtributos
                base={ficha.estado.atributos}
                efetivos={calc.atributos}
                editavel={editavel}
                alterar={alterar}
              />
              <CardEstado
                atuais={ficha.estado.atuais}
                derivados={calc.derivados}
                editavel={editavel}
                alterar={alterar}
              />
            </div>
            <CardPericias pericias={pericias} editavel={editavel} alterar={alterar} />
          </>
        }
        condicoes={
          <CardCondicoes
            estado={ficha.estado}
            raca={ficha.raca}
            estagios={sistema.estagiosSanidade}
            colapsoAtivo={calc.colapso?.ativo ?? !!ficha.estado.flags?.colapsoMagico}
            editavel={editavel}
            alterar={alterar}
          />
        }
      />
    </div>
  );
}