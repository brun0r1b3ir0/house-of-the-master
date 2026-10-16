"use client";

import { useState } from "react";

export default function CopiarCodigo({ codigo }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="border border-wi-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-wi-ink transition-colors hover:bg-wi-ink hover:text-wi-bone"
    >
      {copiado ? "Copiado" : "Copiar"}
    </button>
  );
}