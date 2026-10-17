"use client";

import { useState } from "react";
import { RACAS, rotuloRaca } from "@/lib/fichas";
import { CampoTexto } from "./controles";

const rotulo = "font-mono text-[10px] uppercase tracking-[0.08em] text-wi-steel";
const linha = "border-0 border-b border-wi-deep bg-transparent py-0.5 font-wi-body text-base text-wi-bone outline-none focus:border-[var(--ac-t)] placeholder:text-wi-steel";

const seta =
  "cursor-pointer appearance-none pr-6 bg-no-repeat bg-[length:10px_6px] bg-[position:right_2px_center] [&>option]:text-black " +
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path d=%22M1 1l4 4 4-4%22 fill=%22none%22 stroke=%22%23F2EFE6%22 stroke-width=%221.5%22/></svg>')]";

function Fixo({ rotuloCampo, valor }) {
  return (
    <div className="min-w-[150px]">
      <div className={rotulo}>{rotuloCampo}</div>
      <div className="border-b border-wi-deep py-0.5 font-wi-body text-base text-wi-bone">
        {valor || <span className="text-wi-steel">—</span>}
      </div>
    </div>
  );
}

// Janela de confirmação da troca de raça. Esc ou clicar fora cancelam.
function ConfirmarTrocaDeRaca({ de, para, aoConfirmar, aoCancelar }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={aoCancelar}
      onKeyDown={(e) => e.key === "Escape" && aoCancelar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-troca-raca"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-black bg-wi-paper p-5 text-wi-ink"
      >
        <h2 id="titulo-troca-raca" className="font-wi-display text-[26px] font-normal tracking-wide">
          Trocar de raça?
        </h2>
        <p className="mt-2 text-[15px]">
          O personagem deixa de ser <b>{de}</b> e passa a ser <b>{para}</b>.
        </p>
        <p className="mt-2 text-sm text-wi-steel">
          Os bônus e as regras da raça atual deixam de valer, e os da nova valem na hora. A perícia Olfato só
          aparece para Lobisomem.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            onClick={aoCancelar}
            className="border border-wi-ink px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors hover:bg-wi-ink hover:text-wi-bone"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            className="border border-wi-blood bg-wi-blood px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.05em] text-wi-bone transition-opacity hover:opacity-85"
          >
            Trocar raça
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CabecalhoFicha({ ficha, editavel, alterar }) {
  // Raça escolhida no select, esperando a confirmação (valor "" = sem raça).
  const [pendente, setPendente] = useState(null);

  function confirmar() {
    alterar("raca", pendente || null);
    setPendente(null);
  }

  return (
    <header className="relative py-3">
      {editavel ? (
        <CampoTexto
          valor={ficha.nome}
          obrigatorio
          rotulo="Nome do personagem"
          onConfirmar={(v) => alterar("nome", v)}
          className="block w-full max-w-3xl border-0 border-b border-dashed border-wi-deep bg-transparent font-wi-display text-[clamp(44px,8vw,76px)] leading-none tracking-[0.01em] text-wi-bone outline-none focus:border-[var(--ac-t)]"
        />
      ) : (
        <h1 className="max-w-3xl border-b border-dashed border-wi-deep font-wi-display text-[clamp(44px,8vw,76px)] leading-none tracking-[0.01em] text-wi-bone">
          {ficha.nome}
        </h1>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-3">
        <Fixo rotuloCampo="Jogador" valor={ficha.tipo === "NPC" ? "NPC do Mestre" : ficha.donoNome} />

        {editavel ? (
          <>
            <label className="block min-w-[150px]">
              <span className={rotulo}>Ocupação</span>
              <CampoTexto
                valor={ficha.ocupacao}
                rotulo="Ocupação"
                placeholder="—"
                onConfirmar={(v) => alterar("ocupacao", v)}
                className={`${linha} block w-full`}
              />
            </label>
            <label className="block min-w-[150px]">
              <span className={rotulo}>Raça</span>
              <select
                value={ficha.raca ?? ""}
                onChange={(e) => setPendente(e.target.value)}
                className={`${linha} ${seta} block w-full`}
              >
                <option value="">Sem raça</option>
                {RACAS.map((r) => (
                  <option key={r.valor} value={r.valor}>
                    {r.rotulo}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <Fixo rotuloCampo="Ocupação" valor={ficha.ocupacao} />
            <Fixo rotuloCampo="Raça" valor={rotuloRaca(ficha.raca)} />
          </>
        )}
      </div>

      {pendente !== null && (
        <ConfirmarTrocaDeRaca
          de={rotuloRaca(ficha.raca) || "sem raça"}
          para={rotuloRaca(pendente) || "sem raça"}
          aoConfirmar={confirmar}
          aoCancelar={() => setPendente(null)}
        />
      )}

      <svg
        className="absolute right-0 top-4 hidden text-[var(--ac-t)] opacity-90 sm:block"
        width="104"
        height="104"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="2" />
        <circle cx="60" cy="60" r="44" stroke="currentColor" />
        <text x="60" y="56" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="currentColor" letterSpacing="2">
          WAR IF
        </text>
        <text x="60" y="70" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="currentColor" letterSpacing="3">
          CLASSIFICADO
        </text>
      </svg>
    </header>
  );
}