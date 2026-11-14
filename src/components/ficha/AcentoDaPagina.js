"use client";

import { useEffect } from "react";

// A barra de rolagem da página pertence ao <html>, então a cor da raça
// precisa estar nele enquanto a ficha estiver aberta.
// `abaNome`: na aba da raça, o fundo da página inteira ganha o tom da raça e o nome da
// aba aparece gigante e esmaecido ao fundo (regras em globals.css, `html[data-aba-raca]`).
export default function AcentoDaPagina({ t, p, abaNome = null }) {
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.acento = "";
    el.style.setProperty("--ac-t", t);
    el.style.setProperty("--ac-p", p);
    if (abaNome) {
      el.dataset.abaRaca = "";
      el.style.setProperty("--aba-nome", JSON.stringify(abaNome));
    }
    return () => {
      delete el.dataset.acento;
      delete el.dataset.abaRaca;
      el.style.removeProperty("--aba-nome");
      el.style.removeProperty("--ac-t");
      el.style.removeProperty("--ac-p");
    };
  }, [t, p, abaNome]);

  return null;
}