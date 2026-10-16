// Condições clássicas: Exaustão, Fome, Sede, Debilitantes, Frio e a perda
// permanente de TAM. Cada função devolve um pacote de modificadores.

import { pacote, empilharImparPar, somarPacotes } from "./modificadores";
import { pacoteSanidade } from "./sanidade";

export function pacoteExaustao(n) {
  const impar = pacote({ atributos: { CON: -5, DES: -10 }, pericias: { FISICA: -5, MENTAL: -5 } });
  const par = pacote({
    atributos: { FOR: -10, CON: -10, DES: -10, APA: -10 },
    pericias: { FISICA: -5, MENTAL: -5 },
  });
  return empilharImparPar(n, impar, par);
}

export function pacoteFome(n) {
  const impar = pacote({ atributos: { FOR: -5, DES: -5 } });
  const par = pacote({ atributos: { FOR: -5, CON: -5, DES: -5 }, pericias: { FISICA: -5 } });
  return empilharImparPar(n, impar, par);
}

export function pacoteSede(n) {
  const impar = pacote({ atributos: { CON: -5, INT: -5 } });
  const par = pacote({ atributos: { CON: -5, INT: -5 }, pericias: { FISICA: -5, MENTAL: -5 } });
  return empilharImparPar(n, impar, par);
}

/** Linear: -10 FOR por ponto, -10 CON a cada 2 pontos, -1 PV máx se n >= 1. */
export function pacoteDebilitantes(n) {
  const pontos = Math.max(0, Math.floor(n || 0));
  return pacote({
    atributos: { FOR: -10 * pontos, CON: -10 * Math.floor(pontos / 2) },
    pvFlat: pontos >= 1 ? -1 : 0,
  });
}

/**
 * Frio: 4 estágios, NÃO cumulativos (cada um substitui o anterior).
 * O contador pode passar de 4, mas o estágio efetivo é limitado a 4.
 * Moderado e Severo tiram fração da CON efetiva (decisão 13 e 2.6).
 */
export function pacoteFrio(n) {
  const estagio = Math.max(0, Math.min(Math.floor(n || 0), 4));
  switch (estagio) {
    case 1: return pacote({ atributos: { FOR: -5, DES: -5, CON: -10 } });
    case 2: return pacote({ atributos: { FOR: -5, DES: -5 }, fracoes: { CON: -1 / 4 } });
    case 3: return pacote({ atributos: { FOR: -5, DES: -5 }, fracoes: { CON: -1 / 2 } });
    case 4: return pacote({ atributos: { FOR: -10, DES: -10 }, fixos: { CON: 1 } });
    default: return pacote();
  }
}

/**
 * Perda permanente de TAM pela Fome: -5 a cada 5 PF, limitada à metade do TAM
 * digitado, e que NUNCA diminui sozinha. Devolve o valor que a ficha DEVERIA
 * ter; quem grava (PATCH) é a tela, só quando for maior que o atual.
 * Vampiro é imune (a raça decide, quem chama não usa esta função).
 */
export function perdaPermanenteTamDesejada(fome, tamDigitado, perdaAtual = 0) {
  const teto = Math.floor((tamDigitado || 0) / 2);
  const desejada = Math.min(Math.floor((fome || 0) / 5) * 5, teto);
  return Math.max(perdaAtual || 0, desejada);
}

export function pacotePerdaTam(perda) {
  return pacote({ atributos: { TAM: -(perda || 0) } });
}

/**
 * Soma de tudo que vem do estado da ficha, sem a raça:
 * estágio de Sanidade + Exaustão + Fome + Sede + Debilitantes + Frio + perda de TAM.
 * @param {object} estado  `ficha.estado` da API
 * @param {{ imuneFomeSede?: boolean }} [opcoes]
 */
export function pacoteCondicoesClassicas(estado, { imuneFomeSede = false } = {}) {
  const c = estado?.contadores ?? {};
  return somarPacotes(
    pacoteSanidade(estado?.estagioSanidade),
    pacoteExaustao(c.exaustao),
    imuneFomeSede ? pacote() : pacoteFome(c.fome),
    imuneFomeSede ? pacote() : pacoteSede(c.sede),
    pacoteDebilitantes(c.debilitantes),
    pacoteFrio(c.frio),
    imuneFomeSede ? pacote() : pacotePerdaTam(estado?.perdaPermanenteTam),
  );
}
