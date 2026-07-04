"use client";

import { useState } from "react";

export default function LoginPage() {
  // Estados dos campos controlados
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Estado de erro (mensagem de validação)
  const [erro, setErro] = useState("");

  // Estado de carregamento (útil quando conectarmos ao backend depois)
  const [carregando, setCarregando] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    // Validação simples antes de "enviar"
    if (!email || !senha) {
      setErro("Preencha e-mail e senha para continuar.");
      return;
    }

    if (!email.includes("@")) {
      setErro("Digite um e-mail válido.");
      return;
    }

    setCarregando(true);

    // TODO: substituir por chamada real ao NextAuth.js quando configurarmos autenticação
    console.log("Login com:", { email, senha });

    // Simula uma resposta assíncrona (remover quando integrar de verdade)
    setTimeout(() => {
      setCarregando(false);
    }, 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-96 bg-white text-gray-500 rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10 p-6">
        <h2 className="text-2xl font-semibold mb-1 text-center text-gray-800">
          House of the Master
        </h2>
        <p className="text-sm text-center mb-6 text-gray-400">
          Entre para acessar suas fichas e campanhas
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="email" className="text-xs text-gray-500 mb-1 block">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="senha" className="text-xs text-gray-500 mb-1 block">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Mensagem de erro só aparece se existir */}
          {erro && (
            <p className="text-red-500 text-sm text-center -mt-1">{erro}</p>
          )}

          <div className="text-right -mt-1">
            <a href="#" className="text-indigo-600 text-sm underline">
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors py-2.5 rounded-full text-white font-medium mt-2"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Não tem conta?{" "}
          <a href="/registro" className="text-indigo-600 underline">
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}