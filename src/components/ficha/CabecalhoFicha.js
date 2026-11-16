"use client";

import { useEffect, useRef, useState } from "react";
import { RACAS, rotuloRaca } from "@/lib/fichas";
import { acentoDaRaca } from "@/lib/ficha-visual";
import { normalizarRaca } from "@/lib/warif/raca";
import { CampoTexto } from "./controles";

// `aba-raca:` (variante definida no globals.css) clareia o rótulo quando a aba da raça está aberta.
const rotulo = "font-mono text-[10px] uppercase tracking-[0.08em] text-wi-steel aba-raca:text-wi-fog";
const linha = "border-0 border-b border-wi-deep bg-transparent py-0.5 font-wi-body text-base text-wi-bone outline-none focus:border-[var(--ac-t)] placeholder:text-wi-steel";

// Opções do seletor: as raças do sistema, cada uma com a sua cor. Não existe "sem raça".
const OPCOES = RACAS;

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

// Quadradinho com a cor da raça (tom de painel por dentro, tom de texto na borda).
function Marca({ valor }) {
  const c = acentoDaRaca(valor);
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 shrink-0 border"
      style={{ borderColor: c.t, backgroundColor: c.p }}
    />
  );
}

// Seletor de raça no tema War If, no lugar do <select> nativo (que não aceita estilo).
// Teclado: ↑/↓ ou Enter/Espaço abrem; ↑/↓, Home e End navegam; Enter escolhe; Esc fecha.
function SeletorRaca({ valor, onEscolher }) {
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(0);
  const caixaRef = useRef(null);
  const botaoRef = useRef(null);
  const listaRef = useRef(null);

  const indiceAtual = Math.max(0, OPCOES.findIndex((o) => o.valor === valor));
  const atual = OPCOES[indiceAtual];

  function abrir() {
    setDestaque(indiceAtual);
    setAberto(true);
  }

  function fechar(devolverFoco = true) {
    setAberto(false);
    if (devolverFoco) botaoRef.current?.focus();
  }

  function escolher(i) {
    const opcao = OPCOES[i];
    fechar();
    if (opcao.valor !== valor) onEscolher(opcao.valor);
  }

  // Ao abrir, o foco vai para a lista (para as setas funcionarem).
  useEffect(() => {
    if (aberto) listaRef.current?.focus();
  }, [aberto]);

  // Clicar fora fecha.
  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e) {
      if (!caixaRef.current?.contains(e.target)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  function teclaNoBotao(e) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      abrir();
    }
  }

  function teclaNaLista(e) {
    const ultimo = OPCOES.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDestaque((i) => Math.min(ultimo, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDestaque((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setDestaque(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setDestaque(ultimo);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      escolher(destaque);
    } else if (e.key === "Escape") {
      e.preventDefault();
      fechar();
    } else if (e.key === "Tab") {
      fechar(false);
    }
  }

  return (
    <div ref={caixaRef} className="relative">
      <button
        ref={botaoRef}
        type="button"
        id="seletor-raca"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-labelledby="rotulo-raca seletor-raca"
        onClick={() => (aberto ? fechar() : abrir())}
        onKeyDown={teclaNoBotao}
        className={`${linha} flex w-full items-center gap-2 text-left ${aberto ? "border-[var(--ac-t)]" : ""}`}
      >
        <Marca valor={atual.valor} />
        <span className="flex-1">{atual.rotulo}</span>
        <svg
          aria-hidden="true"
          width="10"
          height="6"
          viewBox="0 0 10 6"
          className={`shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {aberto && (
        <ul
          ref={listaRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby="rotulo-raca"
          aria-activedescendant={`raca-opcao-${destaque}`}
          onKeyDown={teclaNaLista}
          className="absolute left-0 top-full z-40 mt-1 w-full min-w-[200px] border border-wi-deep border-t-2 border-t-[var(--ac-t)] bg-wi-ink py-1 outline-none"
        >
          {OPCOES.map((o, i) => {
            const selecionada = i === indiceAtual;
            const emDestaque = i === destaque;
            return (
              <li
                key={o.valor}
                id={`raca-opcao-${i}`}
                role="option"
                aria-selected={selecionada}
                onMouseEnter={() => setDestaque(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(i)}
                className={
                  "flex cursor-pointer items-center gap-2.5 px-3 py-2 font-wi-body text-[15px] " +
                  (emDestaque ? "bg-wi-deep text-wi-bone" : "text-wi-fog")
                }
                style={emDestaque ? { boxShadow: `inset 2px 0 0 ${acentoDaRaca(o.valor).t}` } : undefined}
              >
                <Marca valor={o.valor} />
                <span className="flex-1">{o.rotulo}</span>
                {selecionada && (
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-wi-ash">atual</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Raça permanente: vampiro não volta a ser outra coisa (o backend também recusa a troca).
const RACA_PERMANENTE = "VAMPIRO";

// Campo de raça travado, para quem já é vampiro.
function RacaTravada({ valor }) {
  return (
    <div className="min-w-[150px]">
      <div className={rotulo}>Raça</div>
      <div className="flex items-center gap-2 border-b border-wi-deep py-0.5 font-wi-body text-base text-wi-bone">
        <Marca valor={valor} />
        <span className="flex-1">{rotuloRaca(valor)}</span>
        <span
          title="A transformação em vampiro é permanente"
          className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-wi-ash"
        >
          permanente
        </span>
      </div>
    </div>
  );
}

// Janela de confirmação da troca de raça. Esc ou clicar fora cancelam.
// `transformacao`: a escolha é Vampiro, então a janela avisa que não tem volta.
function ConfirmarTrocaDeRaca({ de, para, transformacao, aoConfirmar, aoCancelar }) {
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
          {transformacao ? "Transformar em vampiro?" : "Trocar de raça?"}
        </h2>
        <p className="mt-2 text-[15px]">
          O personagem deixa de ser <b>{de}</b> e passa a ser <b>{para}</b>.
        </p>
        {transformacao ? (
          <div role="alert" className="mt-3 border border-wi-blood bg-wi-blood/10 px-3 py-2 text-[14px]">
            <b className="font-mono text-[11px] uppercase tracking-[0.05em] text-wi-blood">Não existe volta</b>
            <p className="mt-1">
              Ninguém deixa de ser vampiro. Depois de confirmar, o {de.toLowerCase()} que
              você conhecia morre, e a raça desta ficha nunca mais poderá ser trocada.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-wi-steel">
            Os bônus e as regras da raça atual deixam de valer, e os da nova valem na hora. A perícia Olfato só
            aparece para Lobisomem.
          </p>
        )}
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
            {transformacao ? "Transformar em vampiro" : "Trocar raça"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CabecalhoFicha({ ficha, editavel, alterar }) {
  // Raça nula (ficha antiga) vale como Humano.
  const raca = normalizarRaca(ficha.raca);
  // Raça escolhida no seletor, esperando a confirmação.
  const [pendente, setPendente] = useState(null);

  function confirmar() {
    alterar("raca", pendente);
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
            {raca === RACA_PERMANENTE ? (
              <RacaTravada valor={raca} />
            ) : (
              // div, não label: o seletor é um botão + lista, e o rótulo é ligado por aria-labelledby
              <div className="block min-w-[150px]">
                <span id="rotulo-raca" className={rotulo}>
                  Raça
                </span>
                <SeletorRaca valor={raca} onEscolher={setPendente} />
              </div>
            )}
          </>
        ) : (
          <>
            <Fixo rotuloCampo="Ocupação" valor={ficha.ocupacao} />
            <Fixo rotuloCampo="Raça" valor={rotuloRaca(raca)} />
          </>
        )}
      </div>

      {pendente !== null && (
        <ConfirmarTrocaDeRaca
          de={rotuloRaca(raca)}
          para={rotuloRaca(pendente)}
          transformacao={pendente === RACA_PERMANENTE}
          aoConfirmar={confirmar}
          aoCancelar={() => setPendente(null)}
        />
      )}
    </header>
  );
}