"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RACAS } from "@/lib/fichas";

const rotulo = "font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel";
const campo =
  "mt-1 w-full border-0 border-b border-wi-ink/40 bg-transparent py-2 text-wi-ink " +
  "placeholder:text-wi-steel outline-none focus:border-wi-accent rounded-none";

const seta =
  "cursor-pointer appearance-none pr-6 bg-no-repeat bg-[length:10px_6px] bg-[position:right_2px_center] " +
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path d=%22M1 1l4 4 4-4%22 fill=%22none%22 stroke=%22%23121110%22 stroke-width=%221.5%22/></svg>')]";

export default function FormNovaFicha({ campanhaId, tipo }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [ocupacao, setOcupacao] = useState("");
  const [raca, setRaca] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Dê um nome ao personagem.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/fichas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nome: nome.trim(),
          ocupacao: ocupacao.trim() || undefined,
          raca: raca || undefined,
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const dados = await res.json().catch(() => null);
        setErro(dados?.mensagem || "Não foi possível criar a ficha.");
        setEnviando(false);
        return;
      }

      // Por enquanto volta para a lista; quando a página da ficha existir, vai direto para ela.
      router.push(`/campanhas/${encodeURIComponent(campanhaId)}/fichas`);
      router.refresh();
    } catch {
      setErro("Não foi possível falar com o servidor. Tente de novo.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="grid max-w-xl gap-5" noValidate>
      <p className="text-sm text-wi-steel">
        Você está criando um <b className="text-wi-ink">{tipo}</b>
        {tipo === "NPC" ? " (personagem do Mestre)." : " (seu personagem)."}
      </p>

      <label className="block">
        <span className={rotulo}>Nome</span>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={120}
          autoFocus
          className={campo}
          placeholder="Como o personagem se chama"
        />
      </label>

      <label className="block">
        <span className={rotulo}>Ocupação (opcional)</span>
        <input
          value={ocupacao}
          onChange={(e) => setOcupacao(e.target.value)}
          maxLength={120}
          className={campo}
          placeholder="Detetive, médico, caçador de recompensas..."
        />
      </label>

      <label className="block">
        <span className={rotulo}>Raça (opcional)</span>
        <select value={raca} onChange={(e) => setRaca(e.target.value)} className={`${campo} ${seta}`}>
          <option value="">Definir depois</option>
          {RACAS.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.rotulo}
            </option>
          ))}
        </select>
      </label>

      {erro && (
        <p role="alert" className="border border-wi-accent px-3 py-2 text-sm text-wi-accent">
          {erro}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={`/campanhas/${campanhaId}/fichas`}
          className="border border-wi-ink px-3.5 py-2 text-center font-mono text-[11px] uppercase tracking-[0.05em] text-wi-ink transition-colors hover:bg-wi-ink hover:text-wi-bone"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={enviando}
          className="border border-wi-blood bg-wi-blood px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.05em] text-wi-bone transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {enviando ? "Criando..." : "Criar ficha"}
        </button>
      </div>
    </form>
  );
}