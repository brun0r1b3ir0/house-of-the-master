// Estágios de Sanidade (o estágio é MANUAL: fica guardado na ficha).
// As chaves são as mesmas que o backend devolve em /sistema.
// Sem propagação Mental → Interpessoal: cada estágio lista explicitamente
// as categorias que afeta (decisão 8 do MODELO-FICHA.md).

import { pacote } from "./modificadores";

export const ESTAGIOS_SANIDADE = {
  PLENITUDE: pacote({
    atributos: { POD: +10 },
    pericias: { MENTAL: +10, INTERPESSOAL: +10 },
  }),
  ESTADO_DE_APRECO: pacote({
    atributos: { POD: +10 },
    pericias: { MENTAL: +10, INTERPESSOAL: +10 },
  }),
  MENTE_SA: pacote(),
  ESTRESSE_LEVE: pacote({
    atributos: { DES: -5, POD: -5 },
    pericias: { INTERPESSOAL: -10 },
  }),
  ALERTA_VERMELHO: pacote({
    atributos: { DES: -10, APA: -5, POD: -5 },
    // Combate: todas. Física: só as que exigem precisão (decisão 14).
    pericias: { COMBATE: -10, MENTAL: -15, INTERPESSOAL: -15 },
    periciasPrecisao: { FISICA: -10 },
  }),
  ESTADO_CRITICO: pacote({
    atributos: { CON: -10, DES: -10, APA: -10, POD: -15 },
    pericias: { FISICA: -10, MENTAL: -20, INTERPESSOAL: -20 },
  }),
  COLAPSO_MENTAL: pacote({
    atributos: { CON: -10, DES: -15, APA: -15, POD: -25 },
    pericias: { FISICA: -20, COMBATE: -20, MENTAL: -20, INTERPESSOAL: -20 },
  }),
  INFERNO: pacote({
    atributos: { CON: -10, DES: -15, APA: -15, POD: -25 },
    pericias: { FISICA: -20, COMBATE: -20, MENTAL: -20, INTERPESSOAL: -20 },
  }),
};

/** Pacote do estágio informado. Chave desconhecida ou vazia = sem efeito. */
export function pacoteSanidade(chave) {
  return ESTAGIOS_SANIDADE[chave] ?? ESTAGIOS_SANIDADE.MENTE_SA;
}
