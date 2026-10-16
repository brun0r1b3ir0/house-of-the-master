// Junta tudo que afeta uma ficha (estado + raça) e calcula os atributos efetivos.
//
//   calcularEfeitos(estado, raca)   -> pacote total + multiplicadores + colapso
//   atributosEfetivos(estado, raca) -> { FOR, CON, TAM, DES, APA, INT, POD, EDU }
//
// `estado` é o `ficha.estado` da API e `raca` é `ficha.raca` (ou null).

import { ATRIBUTOS, resolverAtributo, somarPacotes } from "./modificadores";
import { pacoteCondicoesClassicas } from "./condicoes";
import {
  ehConjurador,
  imuneFomeSede,
  multiplicadoresRaca,
  pacoteColapso,
  pacoteRaca,
  alvoColapso,
  pmMaximo,
  proximoColapso,
} from "./raca";

/**
 * @returns {{
 *   pacote: object,            soma de tudo (inclui o Colapso Mágico, se ativo)
 *   multiplicadores: object,   Sangria/Verbena do Vampiro (1 para as demais raças)
 *   imuneFomeSede: boolean,
 *   linhagemNaoImplementada: boolean,
 *   colapso: { ativo: boolean, alvo: number|null, pmMax: number|null, mudou: boolean },
 * }}
 */
export function calcularEfeitos(estado, raca) {
  const imune = imuneFomeSede(raca);
  const condicoes = pacoteCondicoesClassicas(estado, { imuneFomeSede: imune });
  const racial = pacoteRaca(estado, raca);
  const multiplicadores = multiplicadoresRaca(estado, raca);

  // Em `fixos` o último vence: condições (Frio Crítico) valem mais que a raça.
  let pacoteTotal = somarPacotes(racial.pacote, condicoes);
  let colapso = { ativo: false, alvo: null, pmMax: null, mudou: false };

  if (ehConjurador(raca)) {
    // O Colapso não mexe em POD, então o PM máx pode ser calculado antes dele.
    const pod = resolverAtributo(estado?.atributos?.POD, "POD", pacoteTotal, multiplicadores.atributos.POD);
    const pmMax = pmMaximo(pod, raca, estado?.overrides);
    const pmAtual = estado?.atuais?.PM ?? pmMax;
    const salvo = !!estado?.flags?.colapsoMagico;
    const ativo = proximoColapso(salvo, pmAtual, pmMax);
    colapso = { ativo, alvo: alvoColapso(pmMax), pmMax, mudou: ativo !== salvo };
    if (ativo) pacoteTotal = somarPacotes(racial.pacote, pacoteColapso(pmAtual, pmMax), condicoes);
  }

  return {
    pacote: pacoteTotal,
    multiplicadores,
    imuneFomeSede: imune,
    linhagemNaoImplementada: racial.linhagemNaoImplementada,
    colapso,
  };
}

/** Atributos efetivos (inteiros, nunca abaixo de 0). */
export function atributosEfetivos(estado, raca, efeitos = calcularEfeitos(estado, raca)) {
  const out = {};
  for (const k of ATRIBUTOS) {
    out[k] = resolverAtributo(estado?.atributos?.[k], k, efeitos.pacote, efeitos.multiplicadores.atributos[k]);
  }
  return out;
}
