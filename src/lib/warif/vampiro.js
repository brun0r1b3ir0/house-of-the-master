// Regras de exibição da aba de Vampirismo. Os números de verdade (multiplicadores
// da Sangria e da Verbena) vivem em raca.js; aqui ficam só textos e pequenas contas.

import { multiplicadoresSangria } from "./raca";

export const ORDEM_ATRIBUTOS = ["FOR", "DES", "CON", "TAM", "APA", "INT", "POD", "EDU"];

/** Efeito de cada ponto de Sangria (PsG 1 a 10), escrito para o jogador. */
export const NIVEIS_SANGRIA = [
  "Seu POD cai em ¼.",
  "Seu POD cai pela metade. Substitui o nível 1.",
  "Seu POD cai em ¾. Substitui o nível 2.",
  "Todos os atributos (menos POD e TAM), todas as perícias e o MOV caem em ¼.",
  "Atributos (menos POD e TAM), perícias e MOV caem pela metade. Substitui o nível 4.",
  "Atributos (menos POD e TAM), perícias e MOV caem em ¾. Substitui o nível 5.",
  "Os atributos (menos POD e TAM) perdem mais ¼ do valor que já têm. Perícias e MOV ficam como no nível 6.",
  "Os atributos (menos POD e TAM) perdem metade do valor que já têm. Substitui o nível 7.",
  "Os atributos (menos POD e TAM) perdem ¾ do valor que já têm. Substitui o nível 8.",
  "Todos os atributos (menos POD e TAM) vão a 0 e você entra em mumificação.",
];

/** Tempo até o próximo ponto de Sangria sem beber sangue. null se já mumificado. */
export function tempoProximoPsG(psg) {
  const n = Math.max(0, Math.min(10, Math.floor(psg || 0)));
  if (n >= 10) return null;
  const proximo = n + 1;
  return proximo <= 4 ? "6 h" : proximo <= 6 ? "24 h" : "6 h";
}

/**
 * De onde vem a diferença entre o valor digitado e o efetivo de cada atributo.
 * @returns {Record<string, string[]>}
 */
export function origemAtributos(estado) {
  const sangria = multiplicadoresSangria(estado?.contadores?.sangria);
  const verbena = !!estado?.flags?.verbena;
  const out = {};
  for (const k of ORDEM_ATRIBUTOS) {
    const o = [];
    if (k === "FOR" || k === "DES") o.push("fixo 120");
    if (k === "CON") o.push("+10");
    const reduzSangria = k === "POD" ? sangria.pod < 1 : k !== "TAM" && sangria.atributos < 1;
    if (reduzSangria) o.push("Sangria");
    if (verbena && k !== "TAM" && k !== "APA") o.push("Verbena");
    out[k] = o;
  }
  return out;
}

export const GRAUS_TESTE = ["Falha", "Normal", "Bom", "Extremo", "Crítico"];

/** Hipnose: o vampiro precisa vencer o POD do alvo por pelo menos um nível. */
export function hipnoseFunciona(grauVampiro, grauAlvo) {
  return grauVampiro > 0 && grauVampiro >= grauAlvo + 1;
}

export const contarPalavras = (texto) => {
  const t = (texto ?? "").trim();
  return t ? t.split(/\s+/).length : 0;
};