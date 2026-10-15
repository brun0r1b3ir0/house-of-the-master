// src/app/login/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha email e senha para continuar.");
      return;
    }

    setCarregando(true);

    try {
      const resultado = await signIn("credentials", {
        email,
        senha,
        redirect: false,
      });

      if (resultado?.error) {
        setErro("Email ou senha inválidos.");
        return;
      }

      router.push("/campanhas");
      router.refresh();
    } catch {
      setErro("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* Marca — agora é link para a landing */}
        <Link
          href="/"
          aria-label="Voltar à página inicial"
          className="flex items-center gap-2.5 justify-center mb-10 w-fit mx-auto"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" stroke="#22221E" strokeWidth="1" />
            <line x1="5" y1="7" x2="17" y2="7" stroke="#7A2E27" strokeWidth="1" />
            <line x1="5" y1="11" x2="14" y2="11" stroke="#C9C0A4" strokeWidth="1" />
            <line x1="5" y1="15" x2="17" y2="15" stroke="#C9C0A4" strokeWidth="1" />
          </svg>
          <span className="font-display font-semibold text-sm tracking-wide text-ink">
            House of the Master
          </span>
        </Link>

        {/* O card em si é a "ficha" — mesmo padrão dos sheet-card do guia visual */}
        <div className="bg-sheet border border-paper-line p-8 sm:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-3">
            Acesso ao sistema
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink mb-8">
            Entrar
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

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

            {erro && (
              <p className="font-mono text-[12px] text-wax">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="font-mono text-xs uppercase tracking-wide bg-wax text-sheet px-6 py-3.5 mt-2 hover:bg-[#611f19] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="font-body text-sm text-ink-soft text-center mt-6">
          Ainda não tem conta?{" "}
          <Link href="/registro" className="text-wax hover:underline">
            Criar conta
          </Link>
        </p>

        <Link
          href="/"
          className="block w-fit mx-auto font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:text-ink transition-colors mt-8"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}