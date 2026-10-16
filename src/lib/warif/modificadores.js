// Pacotes de modificadores (formato v2 do MODELO-FICHA.md, seção 2.6).
//
// Cada fonte de efeito (estágio de Sanidade, condição, raça...) devolve um
// "pacote". Os pacotes são somados e depois aplicados ao valor digitado.
//
// Ordem de aplicação em um atributo (resolverAtributo):
//   1. soma de todos os `soma`, com piso em 0
//   2. fração sobre esse resultado (fatores de fontes diferentes se multiplicam)
//   3. valor fixo (Vampiro FOR/DES = 120, Frio Crítico CON = 1)
//   4. multiplicador final (Sangria/Verbena do Vampiro)
//   5. arredonda para baixo UMA vez, com piso em 0
//
// Uma fração "-1/4" vira fator 0,75 (tira 1/4 do valor). Duas frações de
// fontes diferentes acumulam em sequência: 0,75 × 0,75.

export const ATRIBUTOS = ["FOR", "CON", "TAM", "DES", "APA", "INT", "POD", "EDU"];
export const CATEGORIAS = ["FISICA", "COMBATE", "MENTAL", "INTERPESSOAL"];

/** Pacote sem nenhum efeito. */
export function pacoteVazio() {
  const atributos = {};
  for (const k of ATRIBUTOS) atributos[k] = { soma: 0, fator: 1 };
  const pericias = {};
  // soma: vale para toda perícia da categoria.
  // somaPrecisao: vale só para perícias com exigePrecisao (Alerta Vermelho).
  for (const c of CATEGORIAS) pericias[c] = { soma: 0, somaPrecisao: 0 };
  return {
    atributos,
    pericias,
    periciasPorNome: {}, // { "lidar com animais": 20 } (chave minúscula, sem espaços nas pontas)
    fixos: {},           // { FOR: 120 } substitui o atributo
    pvFlat: 0,
    movFlat: 0,
  };
}

/**
 * Atalho para montar um pacote.
 * @param {object} def
 * @param {Object<string, number>} [def.atributos]   soma direta: { FOR: -5 }
 * @param {Object<string, number>} [def.fracoes]     fração do valor: { CON: -0.25 } tira 1/4
 * @param {Object<string, number>} [def.pericias]    soma por categoria: { FISICA: -5 }
 * @param {Object<string, number>} [def.periciasPrecisao] soma por categoria, só perícias com precisão
 * @param {Object<string, number>} [def.periciasPorNome]
 * @param {Object<string, number>} [def.fixos]
 * @param {number} [def.pvFlat]
 * @param {number} [def.movFlat]
 */
export function pacote(def = {}) {
  const p = pacoteVazio();
  for (const [k, v] of Object.entries(def.atributos ?? {})) p.atributos[k].soma += v;
  for (const [k, f] of Object.entries(def.fracoes ?? {})) p.atributos[k].fator *= 1 + f;
  for (const [c, v] of Object.entries(def.pericias ?? {})) p.pericias[c].soma += v;
  for (const [c, v] of Object.entries(def.periciasPrecisao ?? {})) p.pericias[c].somaPrecisao += v;
  for (const [n, v] of Object.entries(def.periciasPorNome ?? {})) {
    p.periciasPorNome[normalizarNome(n)] = (p.periciasPorNome[normalizarNome(n)] ?? 0) + v;
  }
  Object.assign(p.fixos, def.fixos ?? {});
  p.pvFlat = def.pvFlat ?? 0;
  p.movFlat = def.movFlat ?? 0;
  return p;
}

/** Soma vários pacotes em um novo. Em `fixos`, o pacote mais à direita vence. */
export function somarPacotes(...pacotes) {
  const total = pacoteVazio();
  for (const p of pacotes) {
    if (!p) continue;
    for (const k of ATRIBUTOS) {
      total.atributos[k].soma += p.atributos[k].soma;
      total.atributos[k].fator *= p.atributos[k].fator;
    }
    for (const c of CATEGORIAS) {
      total.pericias[c].soma += p.pericias[c].soma;
      total.pericias[c].somaPrecisao += p.pericias[c].somaPrecisao;
    }
    for (const [n, v] of Object.entries(p.periciasPorNome)) {
      total.periciasPorNome[n] = (total.periciasPorNome[n] ?? 0) + v;
    }
    Object.assign(total.fixos, p.fixos);
    total.pvFlat += p.pvFlat;
    total.movFlat += p.movFlat;
  }
  return total;
}

/**
 * Empilhamento ímpar/par (Exaustão, Fome, Sede): o 1º, 3º, 5º... ponto aplica
 * o pacote `impar`; o 2º, 4º, 6º... aplica o pacote `par`.
 */
export function empilharImparPar(n, impar, par) {
  const pontos = Math.max(0, Math.floor(n || 0));
  const qtdImpar = Math.ceil(pontos / 2);
  const qtdPar = Math.floor(pontos / 2);
  return somarPacotes(...Array(qtdImpar).fill(impar), ...Array(qtdPar).fill(par));
}

/**
 * Valor final de um atributo a partir do digitado e do pacote total.
 * @param {number} digitado
 * @param {string} chave  "FOR", "CON"...
 * @param {object} pac    pacote já somado
 * @param {number} [multiplicador=1]  multiplicador final (Sangria/Verbena)
 */
export function resolverAtributo(digitado, chave, pac, multiplicador = 1) {
  const { soma, fator } = pac.atributos[chave];
  let v = Math.max(0, (digitado ?? 0) + soma) * fator;
  if (pac.fixos[chave] !== undefined) v = pac.fixos[chave];
  return Math.max(0, Math.floor(v * multiplicador));
}

export function normalizarNome(nome) {
  return String(nome ?? "").trim().toLowerCase();
}
