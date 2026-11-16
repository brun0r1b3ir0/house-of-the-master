// Perícias: valor inicial, valor, perícia "mágica" e valor efetivo.
//
//   valor    = valorInicial (do catálogo) + ganho (guardado na ficha)
//   efetivo  = floor( max(0, valor + soma da categoria + bônus por nome) × multiplicador )
//
// Perícia DESCONHECIDA (Primórdios) não recebe modificador de categoria.

import { normalizarNome } from "./modificadores";
import { ESQUIVA_VAMPIRO } from "./vampiro-fixos";

/**
 * Valor inicial de uma perícia do catálogo.
 * O catálogo traz um número ou uma fórmula que acompanha o atributo DIGITADO
 * (decisão 18): "DES_METADE" (Esquivar) e "EDU" (Língua Nativa).
 * Exceção: para o VAMPIRO a Esquivar começa sempre em ESQUIVA_VAMPIRO (60),
 * sem depender da DES (que vai subir com a idade).
 */
export function valorInicialPericia(valorInicial, atributosDigitados, raca) {
  if (typeof valorInicial === "number") return valorInicial;
  if (valorInicial === "DES_METADE") {
    if (raca === "VAMPIRO") return ESQUIVA_VAMPIRO;
    return Math.floor((atributosDigitados?.DES ?? 0) / 2);
  }
  if (valorInicial === "EDU") return atributosDigitados?.EDU ?? 0;
  return 0;
}

// Perícia "mágica" (a raça dá bônus nela): derivada dos bônus fixos da raça, em habilidades.js.
export { periciaEhMagica } from "./habilidades";

/**
 * Valor efetivo de uma perícia.
 * @param {{ nome: string, categoria: string, valor: number, exigePrecisao?: boolean }} pericia
 * @param {object} pacote  pacote total de modificadores (efeitos.pacote)
 * @param {number} [multiplicador=1]  multiplicador final (Sangria/Verbena do Vampiro)
 */
export function periciaEfetiva(pericia, pacote, multiplicador = 1) {
  const cat = pacote.pericias[pericia.categoria]; // DESCONHECIDA: undefined
  const doCategoria = cat ? cat.soma + (pericia.exigePrecisao ? cat.somaPrecisao : 0) : 0;
  const porNome = pacote.periciasPorNome[normalizarNome(pericia.nome)] ?? 0;
  return Math.max(0, Math.floor((pericia.valor + doCategoria + porNome) * multiplicador));
}

export const metade = (v) => Math.floor(v / 2);
export const quinto = (v) => Math.floor(v / 5);
