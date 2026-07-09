// src/app/campanhas/page.js
"use client";

import { useState } from "react";
import Link from "next/link";

// Mock temporário — isso vai virar uma chamada pra API do Spring Boot
// (GET /campanhas do usuário logado, já vindo com o papel de cada uma
// resolvido via Participacao). Por enquanto simula os dois cenários.
const campanhasMock = [
  {
    id: "1",
    titulo: "A Sombra Sobre Innsmouth",
    papel: "mestre",
    jogadores: 4,
    sistema: "CoC homebrew",
  },
  {
    id: "2",
    titulo: "Ecos de Arkham",
    papel: "jogador",
    jogadores: 5,
    sistema: "CoC homebrew",
  },
];

export default function FeedCampanhasPage() {
  const [campanhas] = useState(campanhasMock);
  // Pra testar o estado de onboarding, troque campanhasMock por [] ali em cima.

  const temCampanhas = campanhas.length > 0;

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header simples — marca à esquerda, ação de conta à direita */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2.5">
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
          <button className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:text-ink transition-colors">
            Sair
          </button>
        </header>

        {temCampanhas ? (
          <FeedComCampanhas campanhas={campanhas} />
        ) : (
          <FeedOnboarding />
        )}
      </div>
    </main>
  );
}

// Estado 1: usuário já tem pelo menos uma campanha.
function FeedComCampanhas({ campanhas }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-2">
            Feed de campanhas
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Suas campanhas
          </h1>
        </div>
        <Link
          href="/campanhas/entrar"
          className="font-mono text-xs uppercase tracking-wide border border-ink text-ink px-5 py-2.5 hover:bg-ink hover:text-sheet transition-colors"
        >
          Entrar em campanha
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {campanhas.map((campanha) => (
          <CampanhaCard key={campanha.id} campanha={campanha} />
        ))}

        {/* Card de "adicionar" — segue o padrão dashed das fichas vazias do guia visual */}
        <Link
          href="/campanhas/nova"
          className="bg-sheet border border-dashed border-paper-line p-6 flex flex-col items-center justify-center gap-2 text-center hover:border-wax transition-colors min-h-[160px]"
        >
          <span className="font-display text-2xl text-ink-faint">+</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Criar nova campanha
          </span>
        </Link>
      </div>
    </div>
  );
}

// Card individual de campanha — mesmo esqueleto do .sheet-card do guia visual
function CampanhaCard({ campanha }) {
  const rotaPapel = campanha.papel === "mestre" ? "mestre" : "jogador";

  return (
    <Link
      href={`/campanhas/${campanha.id}/${rotaPapel}`}
      className="bg-sheet border border-paper-line p-6 hover:border-wax transition-colors"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint mb-2">
        Campanha
      </p>
      <h3 className="font-display text-lg font-semibold text-ink mb-4">
        {campanha.titulo}
      </h3>

      <div className="flex justify-between items-end border-b border-paper-line py-2 font-mono text-xs text-ink-faint">
        <span>seu papel</span>
        <span className="font-body text-[15px] text-ink capitalize">
          {campanha.papel}
        </span>
      </div>
      <div className="flex justify-between items-end border-b border-paper-line py-2 font-mono text-xs text-ink-faint">
        <span>jogadores</span>
        <span className="font-body text-[15px] text-ink">
          {campanha.jogadores}
        </span>
      </div>
      <div className="flex justify-between items-end py-2 font-mono text-xs text-ink-faint">
        <span>sistema</span>
        <span className="font-body text-[15px] text-ink">
          {campanha.sistema}
        </span>
      </div>
    </Link>
  );
}

// Estado 2: usuário novo, sem campanha nenhuma ainda — onboarding.
function FeedOnboarding() {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <svg width="70" height="90" viewBox="0 0 70 90" fill="none" className="mb-8">
        <rect x="1" y="1" width="68" height="88" stroke="#8E8974" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="12" y1="20" x2="58" y2="20" stroke="#C9C0A4" strokeWidth="1" />
        <line x1="12" y1="32" x2="58" y2="32" stroke="#C9C0A4" strokeWidth="1" />
        <line x1="12" y1="44" x2="46" y2="44" stroke="#C9C0A4" strokeWidth="1" />
        <line x1="12" y1="62" x2="58" y2="62" stroke="#C9C0A4" strokeWidth="1" />
        <line x1="12" y1="74" x2="58" y2="74" stroke="#C9C0A4" strokeWidth="1" />
      </svg>

      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-3">
        Primeiro acesso
      </p>
      <h1 className="font-display text-3xl font-semibold text-ink mb-3">
        Nenhuma campanha ainda
      </h1>
      <p className="font-body text-ink-soft max-w-sm mb-10">
        Crie sua própria campanha para se tornar Mestre dela, ou entre em uma
        campanha existente como jogador.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/campanhas/nova"
          className="font-mono text-xs uppercase tracking-wide bg-wax text-sheet px-6 py-3.5 hover:bg-[#611f19] transition-colors"
        >
          Criar campanha
        </Link>
        <Link
          href="/campanhas/entrar"
          className="font-mono text-xs uppercase tracking-wide border border-ink text-ink px-6 py-3.5 hover:bg-ink hover:text-sheet transition-colors"
        >
          Entrar em campanha
        </Link>
      </div>
    </div>
  );
}