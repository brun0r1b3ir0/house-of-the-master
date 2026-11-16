"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mensagemDeErro } from "@/lib/ficha-motor";
import {
  SEM_GANHOS,
  ajustarGanho,
  atributosAoTrocarRaca,
  atributosIniciais,
  montarEnvio,
  normalizarGanhos,
  periciaPermitida,
  periciasDaRaca,
  validarAtributos,
  validarPericias,
  validarProfissao,
} from "@/lib/warif/criacao";
import PassoIdentidade from "./PassoIdentidade";
import PassoAtributos from "./PassoAtributos";
import PassoProfissao from "./PassoProfissao";
import PassoPericias from "./PassoPericias";
import PassoRevisao from "./PassoRevisao";

// Passos do assistente. O último é a Revisão, que envia tudo de uma vez ("Concluir criação").
const PASSOS = [
  { id: "identidade", nome: "Identidade" },
  { id: "atributos", nome: "Atributos" },
  { id: "profissao", nome: "Profissão" },
  { id: "pericias", nome: "Perícias" },
  { id: "revisao", nome: "Revisão" },
];

export default function AssistenteCriacao({ ficha, campanhaId, sistema, voltarPara }) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const inicial = { nome: ficha.nome ?? "", ocupacao: ficha.ocupacao ?? "", raca: ficha.raca ?? "" };
  const [identidade, setIdentidade] = useState(inicial);
  const [salva, setSalva] = useState(inicial); // o que o servidor já tem
  // Os atributos, a profissão e as perícias ficam só na memória até "Concluir criação".
  const [atributos, setAtributos] = useState(() => atributosIniciais(inicial.raca));
  const [profissao, setProfissao] = useState({ principal: "", secundario: "", pericias: [] });
  const [ganhosBrutos, setGanhosBrutos] = useState(SEM_GANHOS);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const catalogo = useMemo(() => sistema?.pericias ?? [], [sistema]);

  // Tudo o que as contas de pontos precisam. Quando atributos, profissão ou raça mudam,
  // os ganhos são "normalizados" (o que deixou de valer sai e o orçamento é reaplicado).
  const ctx = useMemo(
    () => ({
      attrs: atributos,
      principal: profissao.principal,
      secundario: profissao.secundario,
      pericias: profissao.pericias,
      catalogo,
      raca: identidade.raca,
    }),
    [atributos, profissao, catalogo, identidade.raca],
  );
  const ganhos = useMemo(() => normalizarGanhos(ganhosBrutos, ctx), [ganhosBrutos, ctx]);

  function mudarGanho(bolso, nome, valor) {
    setGanhosBrutos(ajustarGanho(ganhos, bolso, nome, valor, ctx));
  }

  function mudarIdentidade(nova) {
    setIdentidade(nova);
    // Trocou de raça: perícias que ela não permite (Olfato) saem da profissão.
    // Os atributos só reiniciam se o tipo de distribuição mudar (entrar/sair de Vampiro).
    if (nova.raca !== identidade.raca) {
      setAtributos((a) => atributosAoTrocarRaca(a, identidade.raca, nova.raca));
      setProfissao((p) => ({ ...p, pericias: p.pericias.filter((n) => periciaPermitida(n, nova.raca)) }));
    }
  }

  const identidadeOk = identidade.nome.trim() !== "" && identidade.raca !== "";
  const valido =
    passo === 0
      ? identidadeOk
      : passo === 1
        ? validarAtributos(atributos, identidade.raca).ok
        : passo === 2
          ? validarProfissao(profissao, periciasDaRaca(catalogo, identidade.raca), identidade.raca).ok
          : passo === 3
            ? validarPericias(ganhos, ctx).ok
            : false;
  const ultimo = passo === PASSOS.length - 1;

  // A raça precisa estar salva antes das perícias: o backend confere o Olfato com a raça da ficha.
  async function salvarIdentidade() {
    const nome = identidade.nome.trim();
    const ocupacao = identidade.ocupacao.trim();
    const ops = [];
    if (nome !== salva.nome) ops.push({ campo: "nome", valor: nome });
    if (ocupacao !== salva.ocupacao) ops.push({ campo: "ocupacao", valor: ocupacao || null });
    if (identidade.raca !== salva.raca) ops.push({ campo: "raca", valor: identidade.raca });
    if (ops.length === 0) return true;

    setSalvando(true);
    setErro("");
    try {
      const res = await fetch(
        `/api/campanhas/${encodeURIComponent(campanhaId)}/fichas/${encodeURIComponent(ficha.id)}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ops }) },
      );
      const dados = await res.json().catch(() => null);
      if (!res.ok) {
        setErro(mensagemDeErro({ status: res.status, dados }));
        return false;
      }
      setSalva({ nome, ocupacao, raca: identidade.raca });
      return true;
    } catch {
      setErro(mensagemDeErro({ status: 0 }));
      return false;
    } finally {
      setSalvando(false);
    }
  }

  // Envio final: o backend confere tudo de novo e grava atributos, ganhos e o fim da criação.
  async function concluir() {
    setSalvando(true);
    setErro("");
    try {
      const res = await fetch(
        `/api/campanhas/${encodeURIComponent(campanhaId)}/fichas/${encodeURIComponent(ficha.id)}/criacao/concluir`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(montarEnvio({ atributos, profissao, ganhos, raca: identidade.raca })),
        },
      );
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const dados = await res.json().catch(() => null);
      if (!res.ok) {
        setErro(mensagemDeErro({ status: res.status, dados }));
        setSalvando(false);
        return;
      }
      router.push(voltarPara);
      router.refresh();
    } catch {
      setErro(mensagemDeErro({ status: 0 }));
      setSalvando(false);
    }
  }

  async function avancar() {
    if (passo === 0 && !(await salvarIdentidade())) return;
    setErro("");
    setPasso(passo + 1);
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4 text-wi-bone">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-wi-steel">Criação de personagem</p>
        <h1 className="font-wi-display text-2xl">{salva.nome || "Novo personagem"}</h1>
      </header>

      <ol className="flex gap-1 font-mono text-[10px] uppercase tracking-[0.04em] sm:text-[11px]">
        {PASSOS.map((p, i) => (
          <li
            key={p.id}
            aria-current={i === passo ? "step" : undefined}
            className={`flex-1 border-t-2 pt-1 ${
              i === passo ? "border-[var(--ac-t)] text-wi-bone" : i < passo ? "border-wi-steel text-wi-steel" : "border-wi-deep text-wi-steel"
            }`}
          >
            {i + 1}. {p.nome}
          </li>
        ))}
      </ol>

      {passo === 0 && <PassoIdentidade identidade={identidade} onChange={mudarIdentidade} />}
      {passo === 1 && <PassoAtributos atributos={atributos} onChange={setAtributos} raca={identidade.raca} />}
      {passo === 2 && (
        <PassoProfissao
          profissao={profissao}
          onChange={setProfissao}
          atributos={atributos}
          catalogo={catalogo}
          raca={identidade.raca}
        />
      )}
      {passo === 3 && <PassoPericias ganhos={ganhos} onChange={mudarGanho} ctx={ctx} />}
      {passo === 4 && (
        <PassoRevisao identidade={identidade} atributos={atributos} profissao={profissao} ganhos={ganhos} ctx={ctx} />
      )}

      {erro && (
        <p role="alert" className="border border-wi-accent px-3 py-2 text-sm text-wi-accent">
          {erro}
        </p>
      )}

      <footer className="flex items-center justify-between">
        {passo === 0 ? (
          <Link href={voltarPara} className="font-mono text-xs uppercase text-wi-steel hover:text-wi-bone">
            Cancelar
          </Link>
        ) : (
          <button type="button" onClick={() => setPasso(passo - 1)} className="font-mono text-xs uppercase text-wi-steel hover:text-wi-bone">
            Voltar
          </button>
        )}
        {ultimo ? (
          <button
            type="button"
            disabled={salvando}
            onClick={concluir}
            className="border border-wi-blood bg-wi-blood px-4 py-2 font-mono text-xs uppercase text-wi-bone transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {salvando ? "Concluindo..." : "Concluir criação"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!valido || salvando}
            onClick={avancar}
            className="border border-wi-bone px-4 py-2 font-mono text-xs uppercase text-wi-bone transition-colors hover:bg-wi-bone hover:text-wi-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-wi-bone"
          >
            {salvando ? "Salvando..." : "Próximo"}
          </button>
        )}
      </footer>
    </div>
  );
}