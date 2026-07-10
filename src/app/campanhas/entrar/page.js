// src/app/campanhas/entrar/page.js
"use client";

import { useState } from "react";
import Link from "next/link";

// Mock de campanhas públicas — futuramente vem de GET /campanhas/publicas?busca=...
const campanhasPublicasMock = [
  {
    id: "3",
    titulo: "Ecos de Arkham",
    mestre: "Marina S.",
    jogadores: 4,
    maxJogadores: 6,
    sistema: "CoC homebrew",
  },
  {
    id: "4",
    titulo: "O Farol de Kingsport",
    mestre: "Diego A.",
    jogadores: 2,
    maxJogadores: 5,
    sistema: "Call of Cthulhu (padrão)",
  },
];

export default function EntrarCampanhaPage() {
  const [codigo, setCodigo] = useState("");
  const [erroCodigo, setErroCodigo] = useState("");
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);

  const [busca, setBusca] = useState("");

  function handleEntrarComCodigo(e) {
    e.preventDefault();
    setErroCodigo("");

    if (!codigo.trim()) {
      setErroCodigo("Digite um código de convite.");
      return;
    }

    setCarregandoCodigo(true);

    // Aqui depois entra: POST /campanhas/entrar { codigo }
    // O backend valida o código e cria a Participacao como JOGADOR.
    setTimeout(() => {
      setCarregandoCodigo(false);
    }, 1200);
  }

  const resultadosFiltrados = campanhasPublicasMock.filter((c) =>
    c.titulo.toLowerCase().includes(busca.toLowerCase())
  );

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
          Como você quer entrar?
        </h1>

        {/* Bloco 1: código de convite — o caminho pra campanhas privadas */}
        <div className="bg-sheet border border-paper-line p-6 sm:p-8 mb-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-1">
            Com código de convite
          </h2>
          <p className="font-body text-sm text-ink-soft mb-6">
            Use quando o mestre te passou um código diretamente. Funciona para
            campanhas privadas e públicas.
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
                placeholder="Ex: INNSMOUTH-7X2"
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

        {/* Divisor com texto — separa os dois caminhos */}
        <div className="flex items-center gap-4 my-8">
          <div className="h-px bg-paper-line flex-1" />
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            ou
          </span>
          <div className="h-px bg-paper-line flex-1" />
        </div>

        {/* Bloco 2: buscar campanhas públicas */}
        <div>
          <h2 className="font-display text-lg font-semibold text-ink mb-1">
            Buscar campanhas públicas
          </h2>
          <p className="font-body text-sm text-ink-soft mb-6">
            Campanhas abertas à comunidade, sem precisar de convite.
          </p>

          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full bg-transparent border-b border-paper-line pb-2 mb-6 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
          />

          {resultadosFiltrados.length > 0 ? (
            <div className="flex flex-col gap-4">
              {resultadosFiltrados.map((campanha) => (
                <CampanhaPublicaCard key={campanha.id} campanha={campanha} />
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-ink-faint text-center py-10">
              Nenhuma campanha pública encontrada com esse nome.
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

// Card de resultado de busca — mais horizontal que o do Feed,
// porque aqui a ação principal é "Entrar", não navegar pra dentro.
function CampanhaPublicaCard({ campanha }) {
  return (
    <div className="bg-sheet border border-paper-line p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="flex-1">
        <h3 className="font-display text-base font-semibold text-ink mb-2">
          {campanha.titulo}
        </h3>
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-ink-faint uppercase tracking-[0.04em]">
          <span>mestre: <span className="text-ink-soft normal-case">{campanha.mestre}</span></span>
          <span>{campanha.jogadores}/{campanha.maxJogadores} jogadores</span>
          <span>{campanha.sistema}</span>
        </div>
      </div>
      <button className="font-mono text-xs uppercase tracking-wide border border-ink text-ink px-5 py-2.5 hover:bg-ink hover:text-sheet transition-colors whitespace-nowrap">
        Entrar
      </button>
    </div>
  );
}