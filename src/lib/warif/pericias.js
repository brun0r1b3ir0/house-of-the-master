// Perícias: valor inicial, valor, perícia "mágica" e valor efetivo.
//
//   valor    = valorInicial (do catálogo) + ganho (guardado na ficha)
//   efetivo  = floor( max(0, valor + soma da categoria + bônus por nome) × multiplicador )
//
// Perícia DESCONHECIDA (Primórdios) não recebe modificador de categoria.

import { CATEGORIAS, normalizarNome } from "./modificadores";

/**
 * Valor inicial de uma perícia do catálogo.
 * O catálogo traz um número ou uma fórmula que acompanha o atributo DIGITADO
 * (decisão 18): "DES_METADE" (Esquivar) e "EDU" (Língua Nativa).
 */
export function valorInicialPericia(valorInicial, atributosDigitados) {
  if (typeof valorInicial === "number") return valorInicial;
  if (valorInicial === "DES_METADE") return Math.floor((atributosDigitados?.DES ?? 0) / 2);
  if (valorInicial === "EDU") return atributosDigitados?.EDU ?? 0;
  return 0;
}

/**
 *   Perícia "mágica" = a raça dá bônus nela. Não é guardada, é calculada.
 *   Caçador: todas as categorias (Primórdios, sem categoria, não conta)
 *   Vampiro: Físicas E Combate.
 *   Lobisomem: Físicas, Combate e Lidar com Animais
 */
export function periciaEhMagica(nome, categoria, raca) {
  switch (raca) {
    case "CACADOR":
      return CATEGORIAS.includes(categoria);
    case "VAMPIRO":
      return categoria === "FISICA" || categoria === "COMBATE";
    case "LOBISOMEM":
      return categoria === "FISICA" || categoria === "COMBATE" || normalizarNome(nome) === "lidar com animais";
    default:
      return false;
  }
}

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
