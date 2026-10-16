// Rótulos e formatação usados nas telas de ficha.

export const RACAS = [
  { valor: "HUMANO", rotulo: "Humano" },
  { valor: "CACADOR", rotulo: "Caçador" },
  { valor: "BRUXO", rotulo: "Bruxo" },
  { valor: "VAMPIRO", rotulo: "Vampiro" },
  { valor: "LOBISOMEM", rotulo: "Lobisomem" },
  { valor: "VIAJANTE", rotulo: "Viajante" },
];

export function rotuloRaca(raca) {
  return RACAS.find((r) => r.valor === raca)?.rotulo ?? null;
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
