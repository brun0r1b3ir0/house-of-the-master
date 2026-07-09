// src/app/registro/page.js
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos para continuar.");
      return;
    }

    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    // Aqui depois entra a chamada real (API de registro).
    setTimeout(() => {
      setCarregando(false);
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* Marca — mesmo padrão do login */}
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

        <div className="bg-sheet border border-paper-line p-8 sm:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-3">
            Nova conta
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink mb-2">
            Criar conta
          </h1>
          <p className="font-body text-sm text-ink-soft mb-8">
            Sua conta é única — o papel de Mestre ou Jogador é definido depois, dentro de cada campanha.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

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
                placeholder="Seu nome"
                className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
              />
            </div>

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
                placeholder="mínimo 8 caracteres"
                className="bg-transparent border-b border-paper-line pb-2 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-wax transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmarSenha"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint"
              >
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="font-body text-sm text-ink-soft text-center mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-wax hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}