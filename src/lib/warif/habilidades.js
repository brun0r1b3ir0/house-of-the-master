// EH (Espaços de Habilidade), Melhor do Mundo e Classes humanas.
// Só cálculo: nada aqui grava na ficha. A futura aba Habilidades lê calcularHabilidades().
//
// Valor base de uma perícia = valorInicial + ganho (o `valor` do calcularFicha), sem
// nenhum modificador (raça, condições, Sanidade, Sangria, Verbena...). O ganhoTreino
// já está dentro do ganho.

import { CATEGORIAS, normalizarNome } from "./modificadores";
import { normalizarRaca, pacoteRacaFixo } from "./raca";

// ---------------------------------------------------------------------------
// Perícia mágica
// ---------------------------------------------------------------------------

/**
 * Primórdios (categoria DESCONHECIDA) é mágica para TODAS as raças, inclusive Humano:
 * nunca dá EH e nunca é Melhor do Mundo. Também aparece como "Mágico" na ficha.
 */
export const PRIMORDIOS_MAGICA = true;

/**
 * Perícia "mágica" = a raça dá bônus nela só por ser daquela raça.
 * Derivado dos bônus FIXOS da raça (pacoteRacaFixo), não do estado do momento:
 * Alcateia inativa, Colapso Mágico etc. não mudam a resposta.
 *   Vampiro   -> Físicas e Combate
 *   Lobisomem -> Físicas, Combate e Lidar com Animais (o Olfato é Física)
 *   Caçador   -> Físicas, Combate, Mentais e Interpessoais
 *   Humano, Bruxo, Viajante -> nenhuma
 *   Primórdios (sem categoria) -> mágica para qualquer raça (PRIMORDIOS_MAGICA)
 */
export function periciaEhMagica(nome, categoria, raca) {
  // Vale antes da raça: Primórdios é mágica para todas, mesmo as que não dão bônus nenhum.
  if (!CATEGORIAS.includes(categoria)) return PRIMORDIOS_MAGICA;
  const p = pacoteRacaFixo(normalizarRaca(raca));
  const cat = p.pericias[categoria];
  if (cat.soma > 0 || cat.somaPrecisao > 0) return true;
  return (p.periciasPorNome[normalizarNome(nome)] ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// EH
// ---------------------------------------------------------------------------

/** Valor base mínimo para a perícia contar como "50+" (classes) e dar EH. */
export const LIMIAR_PERICIA = 50;
/** Valor base mínimo para Melhor do Mundo. */
export const LIMIAR_MELHOR_DO_MUNDO = 90;

/** EH de UMA perícia não mágica pelo valor base: 75+ → 3, 60+ → 2, 50+ → 1 (vale a maior faixa). */
export function ehDaPericia(valorBase) {
  if (valorBase >= 75) return 3;
  if (valorBase >= 60) return 2;
  if (valorBase >= LIMIAR_PERICIA) return 1;
  return 0;
}

/** EH que cada Falha DÁ, por grau. */
export const EH_POR_FALHA = { GRAU_3: 1, GRAU_2: 2, GRAU_1: 3, ESPECIAL: 5 };
/** EH que cada Habilidade OCUPA, por grau. */
export const EH_POR_HABILIDADE = { GRAU_3: 3, GRAU_2: 4, GRAU_1: 5, ESPECIAL: 7 };

const somaPorGrau = (lista, tabela) => (lista ?? []).reduce((s, item) => s + (tabela[item?.grau] ?? 0), 0);

/**
 * @param {{ valor: number, magica: boolean }[]} pericias  perícias já calculadas (valor = base)
 * @param {{ grau: string }[]} [falhas]        ainda não existem na ficha: vazio por padrão
 * @param {{ grau: string }[]} [habilidades]   idem
 */
export function calcularEH(pericias, falhas = [], habilidades = []) {
  const dasPericias = (pericias ?? []).reduce((s, p) => s + (p.magica ? 0 : ehDaPericia(p.valor)), 0);
  const dasFalhas = somaPorGrau(falhas, EH_POR_FALHA);
  const total = dasPericias + dasFalhas;
  const ocupado = somaPorGrau(habilidades, EH_POR_HABILIDADE);
  return { pericias: dasPericias, falhas: dasFalhas, total, ocupado, livre: total - ocupado };
}

/** Melhor do Mundo: perícia NÃO mágica com valor base 90+. Efeito (só informação): Privilegiado sempre nela. */
export function ehMelhorDoMundo(pericia) {
  return !pericia.magica && pericia.valor >= LIMIAR_MELHOR_DO_MUNDO;
}

// ---------------------------------------------------------------------------
// Classes humanas
// ---------------------------------------------------------------------------

// Recuperação de PE: SUBSTITUI a anterior (só informação: a ficha não tem relógio).
// PE máximo: o bônus de cada classe ACUMULA com o das classes abaixo dela.
// incrementoPE é o que a própria classe acrescenta (+1, +1, +1, +2);
// bonusPE é o total até ela (Profissional +1, Perito +2, Especialista +3, Extraordinário +5).
const TABELA = [
  {
    chave: "HABILIDOSO",
    nome: "Habilidoso",
    requisitos: { melhorDoMundo: 0, periciasAcima50: 10, eh: 14 },
    recuperacaoPE: "1 PE a cada 30 minutos",
    incrementoPE: 0,
    grauUnico: false,
    acoesBonus: 0,
  },
  {
    chave: "PROFISSIONAL",
    nome: "Profissional",
    requisitos: { melhorDoMundo: 0, periciasAcima50: 12, eh: 21 },
    recuperacaoPE: "3 PE por hora",
    incrementoPE: 1,
    grauUnico: false,
    acoesBonus: 0,
  },
  {
    chave: "PERITO",
    nome: "Perito",
    requisitos: { melhorDoMundo: 0, periciasAcima50: 14, eh: 28 },
    recuperacaoPE: "4 PE por hora",
    incrementoPE: 1,
    grauUnico: false,
    acoesBonus: 0,
  },
  {
    chave: "ESPECIALISTA",
    nome: "Especialista",
    requisitos: { melhorDoMundo: 1, periciasAcima50: 14, eh: 28 },
    recuperacaoPE: "6 PE por hora",
    incrementoPE: 1,
    grauUnico: true,
    acoesBonus: 0,
  },
  {
    chave: "EXTRAORDINARIO",
    nome: "Extraordinário",
    requisitos: { melhorDoMundo: 2, periciasAcima50: 17, eh: 35 },
    recuperacaoPE: "1 PE por turno",
    incrementoPE: 2,
    grauUnico: true,
    acoesBonus: 1,
  },
];

/** Classes em ordem crescente, com o bônus de PE máximo já acumulado (0, 0, 1, 2, 3, 5). */
export const CLASSES = TABELA.reduce((lista, c) => {
  const anterior = lista.at(-1)?.bonusPE ?? 0;
  lista.push(Object.freeze({ ...c, bonusPE: anterior + c.incrementoPE }));
  return lista;
}, []);

/** Humano sem classe. */
export const HUMANO_COMUM = Object.freeze({
  chave: "COMUM",
  nome: "Humano comum",
  requisitos: null,
  recuperacaoPE: "2 PE por hora",
  incrementoPE: 0,
  bonusPE: 0,
  grauUnico: false,
  acoesBonus: 0,
});

const NOMES_REQUISITO = { melhorDoMundo: "Melhor do Mundo", periciasAcima50: "Perícias 50+", eh: "EH total" };

const atende = (classe, contagem) =>
  Object.entries(classe.requisitos).every(([req, minimo]) => contagem[req] >= minimo);

/**
 * Classe de um humano: a mais alta cujos requisitos são todos atendidos, ou HUMANO_COMUM.
 * Outras raças: null.
 * @param {{ periciasAcima50: number, eh: number, melhorDoMundo: number }} contagem  eh = EH TOTAL
 */
export function classeHumana(raca, contagem) {
  if (normalizarRaca(raca) !== "HUMANO") return null;
  return CLASSES.findLast((c) => atende(c, contagem)) ?? HUMANO_COMUM;
}

/**
 * A classe seguinte à atual e quanto falta em cada requisito (atual / necessário).
 * null para outras raças ou para quem já é Extraordinário.
 */
export function proximaClasse(raca, contagem) {
  const atual = classeHumana(raca, contagem);
  if (!atual) return null;
  const proxima = CLASSES[CLASSES.indexOf(atual) + 1]; // COMUM: indexOf = -1 → Habilidoso
  if (!proxima) return null;
  return {
    classe: proxima,
    requisitos: Object.entries(proxima.requisitos)
      .filter(([, necessario]) => necessario > 0)
      .map(([chave, necessario]) => ({
        chave,
        nome: NOMES_REQUISITO[chave],
        atual: contagem[chave],
        necessario,
        falta: Math.max(0, necessario - contagem[chave]),
        ok: contagem[chave] >= necessario,
      })),
  };
}

/** Benefícios efetivos da classe (null para outras raças). */
function beneficiosDa(classe) {
  if (!classe) return null;
  const { recuperacaoPE, bonusPE, grauUnico, acoesBonus } = classe;
  return { recuperacaoPE, bonusPE, grauUnico, acoesBonus };
}

/**
 * Tudo que a futura aba Habilidades precisa.
 * @param {{ nome: string, valor: number, magica: boolean }[]} pericias  perícias do calcularFicha
 * @param {string|null} raca
 * @param {{ falhas?: { grau: string }[], habilidades?: { grau: string }[] }} [extras]
 */
export function calcularHabilidades(pericias, raca, { falhas = [], habilidades = [] } = {}) {
  const lista = pericias ?? [];
  const eh = calcularEH(lista, falhas, habilidades);
  const melhoresDoMundo = lista.filter(ehMelhorDoMundo).map((p) => p.nome);
  const periciasAcima50 = lista.filter((p) => !p.magica && p.valor >= LIMIAR_PERICIA).length;
  const contagem = { periciasAcima50, eh: eh.total, melhorDoMundo: melhoresDoMundo.length };
  const classe = classeHumana(raca, contagem);

  return {
    eh,
    melhoresDoMundo,
    periciasAcima50,
    classe,
    beneficios: beneficiosDa(classe),
    proxima: proximaClasse(raca, contagem),
  };
}
