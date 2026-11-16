// Rótulos e formatação usados nas telas de ficha.

import { normalizarRaca } from "./warif/raca";

export const RACAS = [
  { valor: "HUMANO", rotulo: "Humano" },
  { valor: "CACADOR", rotulo: "Caçador" },
  { valor: "BRUXO", rotulo: "Bruxo" },
  { valor: "VAMPIRO", rotulo: "Vampiro" },
  { valor: "LOBISOMEM", rotulo: "Lobisomem" },
  { valor: "VIAJANTE", rotulo: "Viajante" },
];

/** Rótulo da raça. Raça nula ou vazia (dados antigos) aparece como "Humano". */
export function rotuloRaca(raca) {
  const valor = normalizarRaca(raca);
  return RACAS.find((r) => r.valor === valor)?.rotulo ?? null;
}

// Data/hora no fuso de Brasília, igual no servidor e no navegador.
export function formatarData(instante) {
  if (!instante) return "";
  return new Date(instante).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
