// src/app/campanhas/nova/page.js
"use client";

import { useState } from "react";
import Link from "next/link";

const sistemasDisponiveis = [
  "Call of Cthulhu (padrão)",
  "Call of Cthulhu (War If — homebrew)",
  "Outro / homebrew personalizado",
];

export default function NovaCampanhaPage() {
  const [nome, setNome] = useState("");
  const [sistema, setSistema] = useState(sistemasDisponiveis[0]);
  const [descricao, setDescricao] = useState("");
  const [maxJogadores, setMaxJogadores] = useState("");
  const [privacidade, setPrivacidade] = useState("privada");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Dê um nome para a campanha antes de continuar.");
      return;
    }

    setCarregando(true);

    // Aqui depois entra a chamada real: POST /campanhas
    // O backend cria a Campanha e já gera a Participacao do usuário como MESTRE.
    setTimeout(() => {
      setCarregando(false);
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-paper px-4 sm:px-6 py-10">
      <div className="max-w-xl mx-auto">

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

        <div className="bg-sheet border border-paper-line p-6 sm:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-3">
            Nova campanha
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">
            Criar campanha
          </h1>
          <p className="font-body text-sm text-ink-soft mb-8">
            Ao criar, você se torna automaticamente o Mestre desta campanha.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Nome */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="nome"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
              >
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: A Sombra Sobre Innsmouth"
                className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
              />
            </div>

            {/* Sistema — select, mas com a mesma cara de field-line */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="sistema"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
              >
                Sistema
              </label>
              <select
                id="sistema"
                value={sistema}
                onChange={(e) => setSistema(e.target.value)}
                className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink outline-none focus:border-wax transition-colors appearance-none cursor-pointer"
              >
                {sistemasDisponiveis.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            {/* Descrição — opcional, campo maior */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="descricao"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
              >
                Descrição <span className="normal-case text-ink-faint/70">(opcional)</span>
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Do que se trata essa campanha? O que os jogadores devem esperar?"
                rows={3}
                className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors resize-none"
              />
            </div>

            {/* Linha com dois campos lado a lado no desktop, empilhados no mobile */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-2 flex-1">
                <label
                  htmlFor="maxJogadores"
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
                >
                  Máx. de jogadores <span className="normal-case text-ink-faint/70">(opcional)</span>
                </label>
                <input
                  id="maxJogadores"
                  type="number"
                  min="1"
                  value={maxJogadores}
                  onChange={(e) => setMaxJogadores(e.target.value)}
                  placeholder="Ex: 6"
                  className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label
                  htmlFor="privacidade"
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
                >
                  Privacidade
                </label>
                <select
                  id="privacidade"
                  value={privacidade}
                  onChange={(e) => setPrivacidade(e.target.value)}
                  className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink outline-none focus:border-wax transition-colors appearance-none cursor-pointer"
                >
                  <option value="privada">Privada (só por convite)</option>
                  <option value="publica">Pública (aparece na busca)</option>
                </select>
              </div>
            </div>

            {erro && (
              <p className="font-mono text-[12px] text-wax">
                {erro}
              </p>
            )}

            {/* Ações — empilham no mobile, lado a lado no desktop */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-2">
              <Link
                href="/campanhas"
                className="font-mono text-xs uppercase tracking-wide border border-paper-line text-ink-soft px-6 py-3.5 text-center hover:border-ink hover:text-ink transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={carregando}
                className="font-mono text-xs uppercase tracking-wide bg-wax text-sheet px-6 py-3.5 flex-1 hover:bg-[#611f19] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {carregando ? "Criando..." : "Criar campanha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}