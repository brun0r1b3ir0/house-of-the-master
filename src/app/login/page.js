"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha email e senha para continuar.");
      return;
    }

    setCarregando(true);

    // Aqui depois entra a chamada real (NextAuth / API).
    // Por enquanto, só simula o tempo de resposta.
    setTimeout(() => {
      setCarregando(false);
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* Marca, igual ao header da landing */}
        <div className="flex items-center gap-2.5 justify-center mb-10">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" stroke="#22221E" strokeWidth="1" />
            <line x1="5" y1="7" x2="17" y2="7" stroke="#7A2E27" strokeWidth="1" />
            <line x1="5" y1="11" x2="14" y2="11" stroke="#C9C0A4" strokeWidth="1" />
            <line x1="5" y1="15" x2="17" y2="15" stroke="#C9C0A4" strokeWidth="1" />
          </svg>
          <span className="font-display font-semibold text-sm tracking-wide text-ink">
            House of the Master
          </span>
        </div>

        {/* O card em si é a "ficha" — mesmo padrão dos sheet-card do guia visual */}
        <div className="bg-sheet border border-paper-line p-8 sm:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-3">
            Acesso ao sistema
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink mb-8">
            Entrar
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Campo email — estilo "field-line": label mono em cima, linha embaixo, sem caixa fechada */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
              />
            </div>

            {/* Campo senha — mesmo padrão */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="senha"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
              >
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
              />
            </div>

            {/* Erro — só aparece se existir, e usa o mesmo tom de "acento" que o wax do sistema */}
            {erro && (
              <p className="font-mono text-[12px] text-wax">
                {erro}
              </p>
            )}

            {/* Botão primário — igual ao .btn.primary do guia visual */}
            <button
              type="submit"
              disabled={carregando}
              className="font-mono text-xs uppercase tracking-wide bg-wax text-sheet px-6 py-3.5 mt-2 hover:bg-[#611f19] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Link pra registro, fora do card — mais leve, texto corrido */}
        <p className="font-body text-sm text-ink-soft text-center mt-6">
          Ainda não tem conta?{" "}
          <Link href="/registro" className="text-wax hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
