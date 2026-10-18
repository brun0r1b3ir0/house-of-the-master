"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Botão "+ Nova ficha" do jogador: cria o PJ com um nome provisório e abre direto o
// assistente de criação (nome, ocupação e raça são o 1º passo dele).
export default function BotaoNovoPJ({ campanhaId, className }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function criar() {
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/fichas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "PJ", nome: "Novo personagem" }),
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
      const criada = await res.json();
      router.push(`/campanhas/${encodeURIComponent(campanhaId)}/fichas/${criada.id}/criar`);
      router.refresh();
    } catch {
      setErro("Não foi possível falar com o servidor. Tente de novo.");
      setEnviando(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {erro && (
        <span role="alert" className="text-xs text-wi-accent">
          {erro}
        </span>
      )}
      <button type="button" onClick={criar} disabled={enviando} className={`${className} disabled:cursor-not-allowed disabled:opacity-55`}>
        {enviando ? "Criando..." : "+ Nova ficha"}
      </button>
    </span>
  );
}
