// src/app/campanhas/entrar/page.js
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function EntrarCampanhaPage() {
  const [codigo, setCodigo] = useState("");
  const [erroCodigo, setErroCodigo] = useState("");
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);
  const router = useRouter();

  async function handleEntrarComCodigo(e) {
    e.preventDefault();
    setErroCodigo("");

    if (!codigo.trim()) {
      setErroCodigo("Digite um código de convite.");
      return;
    }

    setCarregandoCodigo(true);

    try {
      const res = await fetch("/api/campanhas/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const dados = await res.json();

      if (!res.ok) {
        setErroCodigo(dados.mensagem || "Não foi possível entrar na campanha.");
        return;
      }

      router.push("/campanhas");
      router.refresh();
    } catch {
      setErroCodigo("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setCarregandoCodigo(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 sm:px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Marca */}
        <div className="flex items-center gap-2.5 mb-10">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" stroke="#22221E" strokeWidth="1" />
            <line x1="5" y1="7" x2="17" y2="7" stroke="#7A2E27" strokeWidth="1" />
            <line x1="5" y1="11" x2="14" y2="11" stroke="#C9C0A4" strokeWidth="1" />
            <line x1="5" y1="15" x2="17" y2="15" stroke="#C9C0A4" strokeWidth="1" />
          </svg>
          <span className="font-display font-semibold text-sm tracking-wide text-ink">
            House of the Master
          </span>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-3">
          Entrar em campanha
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-8">
          Digite o código de convite
        </h1>

        {/* Código de convite — único caminho de entrada */}
        <div className="bg-sheet border border-paper-line p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-ink mb-1">
            Com código de convite
          </h2>
          <p className="font-body text-sm text-ink-soft mb-6">
            Peça o código ao mestre da campanha. Ao entrar, você participa como
            jogador.
          </p>

          <form
            onSubmit={handleEntrarComCodigo}
            className="flex flex-col sm:flex-row gap-4 sm:items-end"
          >
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="codigo"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
              >
                Código
              </label>
              <input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: K7X2-9QPM"
                autoComplete="off"
                className="bg-transparent border-b border-paper-line pb-2 font-mono text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={carregandoCodigo}
              className="font-mono text-xs uppercase tracking-wide bg-wax text-sheet px-6 py-3.5 hover:bg-[#611f19] transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {carregandoCodigo ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {erroCodigo && (
            <p className="font-mono text-[12px] text-wax mt-4">
              {erroCodigo}
            </p>
          )}
        </div>

        <Link
          href="/campanhas"
          className="block w-fit mx-auto font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:text-ink transition-colors mt-10"
        >
          Voltar ao feed
        </Link>
      </div>
    </main>
  );
}