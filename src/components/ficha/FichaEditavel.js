"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { acentoDaRaca } from "@/lib/ficha-visual";
import AcentoDaPagina from "./AcentoDaPagina";
import AbaVampirismo from "./AbaVampirismo";
import AbasFicha, { NOMES_RACA, RACAS_COM_ABA } from "./AbasFicha";
import ArquivarFicha from "./ArquivarFicha";
import CabecalhoFicha from "./CabecalhoFicha";
import CardAtributos from "./CardAtributos";
import CardEstado from "./CardEstado";
import CardEvolucao from "./CardEvolucao";
import CardPericias from "./CardPericias";
import CardCondicoes from "./CardCondicoes";
import LayoutFicha from "./LayoutFicha";
import TransicaoSangue from "./TransicaoSangue";
import { useFichaAutosave } from "./useFichaAutosave";

// Texto secundário da barra de cima: cinza normal, mais claro na aba da raça (fundo tingido).
const textoSecundario = "font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel aba-raca:text-wi-fog";

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

  // Aba aberta. Se a raça mudar e a aba da raça deixar de existir, volta para a Ficha Geral.
  const [aba, setAba] = useState("geral");
  const abaAtual = aba === "raca" && RACAS_COM_ABA.includes(ficha.raca) ? "raca" : "geral";

  // Transição de sangue ao entrar na aba da raça: { x, y } = ponto da tela onde ela nasce.
  const [transicao, setTransicao] = useState(null);

  function trocarAba(destino, evento) {
    if (transicao) return; // ignora cliques enquanto o sangue ainda cobre a tela
    if (destino !== "raca" || abaAtual === "raca") {
      setAba(destino);
      return;
    }
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento || !evento) {
      setAba(destino);
      return;
    }
    let x = evento.clientX;
    let y = evento.clientY;
    // Ativada pelo teclado (Enter/Espaço) não tem posição de mouse: usa o centro do botão.
    if (!x && !y) {
      const r = evento.currentTarget.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    setTransicao({ x, y });
  }

  // Olfato é exclusivo de Lobisomem: para as outras raças a perícia não aparece.
  const pericias = useMemo(
    () => calc.pericias.filter((p) => p.nome !== "Olfato" || ficha.raca === "LOBISOMEM"),
    [calc.pericias, ficha.raca],
  );

  return (
    <div className="grid gap-4" style={{ "--ac-t": acento.t, "--ac-p": acento.p }}>
      <AcentoDaPagina t={acento.t} p={acento.p} abaNome={abaAtual === "raca" ? NOMES_RACA[ficha.raca] : null} />

      {transicao && (
        <TransicaoSangue
          x={transicao.x}
          y={transicao.y}
          onCobrir={() => setAba("raca")}
          onFim={() => setTransicao(null)}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/campanhas/${campanhaId}/fichas`}
          className={`${textoSecundario} hover:text-wi-bone aba-raca:hover:text-wi-bone`}
        >
          ← Fichas
        </Link>
        {editavel && (
          <div className="flex items-center gap-3">
            <span
              role="status"
              aria-live="polite"
              className={
                status === "erro"
                  ? "font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-accent"
                  : textoSecundario
              }
            >
              {TEXTO_STATUS[status]}
            </span>
            <ArquivarFicha
              campanhaId={campanhaId}
              fichaId={ficha.id}
              nome={ficha.nome}
              className={`${textoSecundario} hover:text-wi-accent aba-raca:hover:text-wi-accent`}
            />
          </div>
        )}
      </div>

      {avisoMestre && (
        <div className="bg-wi-blood px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.05em] text-wi-bone">
          Visão de Mestre · somente leitura · alterações devem ser combinadas com o jogador
        </div>
      )}

      {editavel && ficha.estado.criacao && !ficha.estado.criacao.concluida && (
        <div className="flex flex-wrap items-center justify-between gap-2 border border-wi-accent px-3 py-2 text-sm text-wi-bone">
          <span>Criação não concluída: atributos e perícias ainda não foram distribuídos.</span>
          <Link
            href={`/campanhas/${campanhaId}/fichas/${ficha.id}/criar`}
            className="border border-wi-bone px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.05em] hover:bg-wi-bone hover:text-wi-ink"
          >
            Continuar criação
          </Link>
          <ArquivarFicha
            campanhaId={campanhaId}
            fichaId={ficha.id}
            nome={ficha.nome}
            rotulo="Descartar"
            className="border border-wi-steel px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.05em] text-wi-steel hover:border-wi-accent hover:text-wi-accent"
          />
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

      <AbasFicha raca={ficha.raca} ativa={abaAtual} onTrocar={trocarAba} />

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

      {abaAtual === "raca" ? (
        <AbaVampirismo ficha={ficha} calc={calc} editavel={editavel} alterar={alterar} />
      ) : (
        <LayoutFicha
          principal={
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <CardAtributos
                  base={ficha.estado.atributos}
                  efetivos={calc.atributos}
                  raca={ficha.raca}
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
              <CardEvolucao ficha={ficha} sistema={sistema} />
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
      )}
    </div>
  );
}