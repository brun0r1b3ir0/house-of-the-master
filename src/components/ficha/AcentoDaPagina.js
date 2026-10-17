"use client";

import { useEffect } from "react";

// A barra de rolagem da página pertence ao <html>, então a cor da raça
// precisa estar nele enquanto a ficha estiver aberta.
export default function AcentoDaPagina({ t, p }) {
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.acento = "";
    el.style.setProperty("--ac-t", t);
    el.style.setProperty("--ac-p", p);
    return () => {
      delete el.dataset.acento;
      el.style.removeProperty("--ac-t");
      el.style.removeProperty("--ac-p");
    };
  }, [t, p]);

  return null;
}