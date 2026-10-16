// Efeitos de raça: bônus fixos, Alcateia (Lobisomem), Sangria e Verbena
// (Vampiro) e Colapso Mágico (Bruxo/Viajante).
//
// Chaves de raça iguais às do backend:
//   HUMANO, CACADOR, BRUXO, VAMPIRO, LOBISOMEM, VIAJANTE

import { ATRIBUTOS, pacote, pacoteVazio, somarPacotes } from "./modificadores";

export const ehConjurador = (raca) => raca === "BRUXO" || raca === "VIAJANTE";

/** Vampiro é isento de Fome e Sede (e de Sono; o Frio continua valendo). */
export const imuneFomeSede = (raca) => raca === "VAMPIRO";

/** PM máx = POD ÷ 3 para Bruxo e Viajante; POD ÷ 5 para as demais. */
export const divisorPM = (raca) => (ehConjurador(raca) ? 3 : 5);

/** PM máximo. Uma exceção manual (`overrides.PM`) vence a fórmula. */
export function pmMaximo(podEfetivo, raca, overrides) {
  if (overrides && overrides.PM !== undefined) return overrides.PM;
  return Math.floor((podEfetivo || 0) / divisorPM(raca));
}

// ---------------------------------------------------------------------------
// Bônus fixos por raça
// ---------------------------------------------------------------------------

export function pacoteRacaFixo(raca) {
  switch (raca) {
    case "CACADOR":
      // O +5 em Mental inclui Interpessoal (decisão 11), listado explicitamente.
      return pacote({
        atributos: { FOR: 5, DES: 5, POD: 5 },
        pericias: { FISICA: 5, COMBATE: 5, MENTAL: 5, INTERPESSOAL: 5 },
      });
    case "LOBISOMEM":
      return pacote({
        atributos: { FOR: 10, DES: 10, CON: 10 },
        pericias: { FISICA: 10, COMBATE: 10 },
        periciasPorNome: { "lidar com animais": 20 },
      });
    case "VAMPIRO":
      return pacote({
        atributos: { CON: 10 },
        fixos: { FOR: 120, DES: 120 },
        pericias: { FISICA: 20 },
      });
    default:
      return pacoteVazio(); // Humano, Bruxo, Viajante, sem raça
  }
}

// ---------------------------------------------------------------------------
// Alcateia (Lobisomem). Só a linhagem normal está implementada (decisão 13).
// n = integrantes; pares = ⌊n/2⌋. Os "%" das regras são somados direto.
// ---------------------------------------------------------------------------

/**
 * @param {{ ativa?: boolean, membros?: number, papel?: string, linhagem?: string }} alcateia
 * @returns {{ pacote: object, linhagemNaoImplementada: boolean }}
 */
export function pacoteAlcateia(alcateia) {
  if (!alcateia || !alcateia.ativa) return { pacote: pacoteVazio(), linhagemNaoImplementada: false };
  if (alcateia.linhagem && alcateia.linhagem !== "normal") {
    return { pacote: pacoteVazio(), linhagemNaoImplementada: true };
  }

  const n = Math.max(0, Math.floor(alcateia.membros || 0));
  const pares = Math.floor(n / 2);
  const papel = alcateia.papel || "membro";
  const atributos = (v) => ({ FOR: v, DES: v, CON: v });

  if (papel === "alfa") {
    return {
      pacote: pacote({
        atributos: { ...atributos(3 * pares), TAM: Math.floor(n / 3) },
        pericias: { FISICA: 3 * pares, COMBATE: 3 * pares },
      }),
      linhagemNaoImplementada: false,
    };
  }
  if (papel === "alfa-secundario") {
    return {
      pacote: pacote({
        atributos: atributos(2 * pares),
        pericias: { FISICA: 3 * pares, COMBATE: 3 * pares },
      }),
      linhagemNaoImplementada: false,
    };
  }
  // membro
  return {
    pacote: pacote({
      atributos: atributos(2 * pares),
      pericias: { FISICA: 2 * pares },
    }),
    linhagemNaoImplementada: false,
  };
}

/** Bônus fixos da raça + Alcateia (se Lobisomem). */
export function pacoteRaca(estado, raca) {
  const fixo = pacoteRacaFixo(raca);
  if (raca !== "LOBISOMEM") return { pacote: fixo, linhagemNaoImplementada: false };
  const alc = pacoteAlcateia(estado?.alcateia);
  return { pacote: somarPacotes(fixo, alc.pacote), linhagemNaoImplementada: alc.linhagemNaoImplementada };
}

// ---------------------------------------------------------------------------
// Vampiro: Sangria (0 a 10) e Verbena. Efeitos MULTIPLICATIVOS, aplicados por
// último sobre o valor final de atributos, perícias e MOV.
// ---------------------------------------------------------------------------

/** Multiplicadores da Sangria (PsG). */
export function multiplicadoresSangria(pontos) {
  const n = Math.max(0, Math.min(10, Math.floor(pontos || 0)));

  // Grupo POD (PsG 1-3): 3/4, 2/4, 1/4
  const pod = n >= 3 ? 1 / 4 : n === 2 ? 2 / 4 : n === 1 ? 3 / 4 : 1;
  // Grupo atributos (exceto POD e TAM) + perícias + MOV (PsG 4-6): 3/4, 2/4, 1/4
  const grupoAB = n >= 6 ? 1 / 4 : n === 5 ? 2 / 4 : n === 4 ? 3 / 4 : 1;
  // Só atributos (PsG 7-10): redução ADICIONAL sobre o valor já reduzido
  const grupo7a10 = n >= 10 ? 0 : n === 9 ? 1 / 4 : n === 8 ? 2 / 4 : n === 7 ? 3 / 4 : 1;

  return {
    pod,
    atributos: grupoAB * grupo7a10, // nunca vale para POD nem TAM
    pericias: grupoAB,
    mov: grupoAB,
    mumificado: n >= 10,
  };
}

const MULT_NEUTRO = () => ({
  atributos: Object.fromEntries(ATRIBUTOS.map((k) => [k, 1])),
  pericias: 1,
  mov: { sangria: 1, verbena: 1 },
  mumificado: false,
});

/**
 * Multiplicadores finais da raça. Só o Vampiro tem; as demais devolvem 1.
 * Verbena: atributos (exceto TAM e APA) ×0,5 · perícias ×0,5 · MOV ×0,75.
 */
export function multiplicadoresRaca(estado, raca) {
  const m = MULT_NEUTRO();
  if (raca !== "VAMPIRO") return m;

  const sangria = multiplicadoresSangria(estado?.contadores?.sangria);
  const verbena = !!estado?.flags?.verbena;
  const vAttr = verbena ? 0.5 : 1;

  for (const k of ATRIBUTOS) {
    if (k === "TAM") m.atributos[k] = 1; // TAM nunca é afetado
    else if (k === "POD") m.atributos[k] = sangria.pod * vAttr;
    else if (k === "APA") m.atributos[k] = sangria.atributos; // Verbena não afeta APA
    else m.atributos[k] = sangria.atributos * vAttr;
  }
  m.pericias = sangria.pericias * (verbena ? 0.5 : 1);
  m.mov = { sangria: sangria.mov, verbena: verbena ? 0.75 : 1 };
  m.mumificado = sangria.mumificado;
  return m;
}

// ---------------------------------------------------------------------------
// Colapso Mágico (Bruxo e Viajante)
// Entra ao chegar a 0 PM e sai ao recuperar 1/3 do PM máximo (o "alvo").
// O estado é guardado (flags.colapsoMagico); a tela grava quando
// proximoColapso() devolver algo diferente do que está salvo.
// ---------------------------------------------------------------------------

export const alvoColapso = (pmMax) => Math.max(1, Math.ceil((pmMax || 0) / 3));

export function proximoColapso(ativoAtual, pmAtual, pmMax) {
  if (pmAtual <= 0) return true;
  if (ativoAtual && pmAtual >= alvoColapso(pmMax)) return false;
  return !!ativoAtual;
}

/** Efeitos enquanto o Colapso está ativo; vão sumindo conforme o PM volta. */
export function pacoteColapso(pmAtual, pmMax) {
  const alvo = alvoColapso(pmMax);
  return pacote({
    atributos: { CON: -10 },
    fracoes: { FOR: -1 / 2, DES: -1 / 2 }, // FOR e DES pela metade
    pericias: pmAtual < (2 * alvo) / 3 ? { FISICA: -15 } : {},
    movFlat: pmAtual < alvo / 3 ? -1 : 0,
  });
}
