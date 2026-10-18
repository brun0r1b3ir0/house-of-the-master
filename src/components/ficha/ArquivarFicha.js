"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mensagemDeErro } from "@/lib/ficha-motor";

// Botão + telinha de confirmação para arquivar a ficha (DELETE no backend: a ficha
// some das listas, mas o registro não é apagado do banco).
export default function ArquivarFicha({ campanhaId, fichaId, nome, rotulo = "Arquivar ficha", className = "" }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function fechar() {
    if (enviando) return;
    setAberto(false);
    setErro("");
  }

  async function confirmar() {
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch(
        `/api/campanhas/${encodeURIComponent(campanhaId)}/fichas/${encodeURIComponent(fichaId)}`,
        { method: "DELETE" },
      );
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const dados = await res.json().catch(() => null);
        setErro(mensagemDeErro({ status: res.status, dados }));
        setEnviando(false);
        return;
      }
      router.push(`/campanhas/${encodeURIComponent(campanhaId)}/fichas`);
      router.refresh();
    } catch {
      setErro(mensagemDeErro({ status: 0 }));
      setEnviando(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={className}>
        {rotulo}
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onKeyDown={(e) => e.key === "Escape" && fechar()}
          onClick={fechar}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-arquivar"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm border border-black bg-wi-paper p-5 text-wi-ink"
          >
            <h2 id="titulo-arquivar" className="font-wi-display text-lg">
              Arquivar esta ficha?
            </h2>
            <p className="mt-2 text-sm">
              <b>{nome || "Esta ficha"}</b> sai da sua lista de fichas. O registro não é apagado do sistema, mas você
              não poderá mais abri-la por aqui.
            </p>

            {erro && (
              <p role="alert" className="mt-3 border border-wi-accent px-3 py-2 text-sm text-wi-accent">
                {erro}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={fechar}
                disabled={enviando}
                className="border border-wi-ink px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors hover:bg-wi-ink hover:text-wi-bone disabled:opacity-55"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmar}
                disabled={enviando}
                className="border border-wi-blood bg-wi-blood px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.05em] text-wi-bone transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {enviando ? "Arquivando..." : "Arquivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
