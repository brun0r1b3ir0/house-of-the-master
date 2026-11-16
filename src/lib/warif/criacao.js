// Regras da CRIAÇÃO de personagem (funções puras, sem React).
// Os atributos são distribuídos como "point buy": 460 pontos no total entre os 8
// atributos, cada um com no mínimo 15 e no máximo 90 na criação.
//
// VAMPIRO: FOR e DES ficam fixos em 120 (fora da conta) e os outros seis somam 345.
// As funções de atributos recebem `raca` opcional; sem ela, vale a regra geral.

import { ATRIBUTOS, normalizarNome } from "./modificadores";
import { valorInicialPericia } from "./pericias";
import {
  ATRIBUTO_FIXO_VAMPIRO,
  ATRIBUTOS_FIXOS_VAMPIRO,
  FOR_DES_VAMPIRO_ORCAMENTO,
  TOTAL_ATRIBUTOS_VAMPIRO,
} from "./vampiro-fixos";

export const CRIACAO = {
  TOTAL_ATRIBUTOS: 460,
  MIN_ATRIBUTO: 15,
  MAX_ATRIBUTO_INICIAL: 90,
  TETO_PERICIA: 80,
};

/**
 * Como a raça distribui os atributos:
 *   fixos  -> { chave: valor } que não entram na conta nem podem ser alterados
 *   livres -> chaves distribuídas entre 15 e 90
 *   total  -> soma exigida dos livres
 */
export function regrasAtributos(raca) {
  if (raca === "VAMPIRO") {
    const fixos = Object.fromEntries(ATRIBUTOS_FIXOS_VAMPIRO.map((k) => [k, ATRIBUTO_FIXO_VAMPIRO]));
    return { fixos, livres: ATRIBUTOS.filter((k) => !(k in fixos)), total: TOTAL_ATRIBUTOS_VAMPIRO };
  }
  return { fixos: {}, livres: [...ATRIBUTOS], total: CRIACAO.TOTAL_ATRIBUTOS };
}

/** O atributo é fixo para esta raça (não pode ser alterado)? */
export function atributoFixo(raca, chave) {
  return chave in regrasAtributos(raca).fixos;
}

/** Livres no mínimo (15) e fixos no seu valor: sobram 340 pontos (255 no vampiro). */
export function atributosIniciais(raca) {
  const { fixos } = regrasAtributos(raca);
  return Object.fromEntries(ATRIBUTOS.map((k) => [k, fixos[k] ?? CRIACAO.MIN_ATRIBUTO]));
}

/** Soma dos atributos que entram na conta da raça (no vampiro, só os seis livres). */
export function somaAtributos(attrs, raca) {
  return regrasAtributos(raca).livres.reduce((s, k) => s + (Number(attrs?.[k]) || 0), 0);
}

export function pontosRestantes(attrs, raca) {
  return regrasAtributos(raca).total - somaAtributos(attrs, raca);
}

/** Maior valor que o atributo pode ter agora: limitado pelo máximo e pelos pontos que sobram. */
export function maximoAtual(attrs, chave, raca) {
  const { fixos } = regrasAtributos(raca);
  if (chave in fixos) return fixos[chave];
  const atual = Number(attrs?.[chave]) || 0;
  const folga = Math.max(0, pontosRestantes(attrs, raca));
  return Math.min(CRIACAO.MAX_ATRIBUTO_INICIAL, atual + folga);
}

/** Devolve novos atributos com `chave` ajustado para dentro dos limites (nunca estoura o total). Fixos não mudam. */
export function ajustarAtributo(attrs, chave, valor, raca) {
  if (!regrasAtributos(raca).livres.includes(chave)) return attrs;
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n)) return attrs;
  const final = Math.min(maximoAtual(attrs, chave, raca), Math.max(CRIACAO.MIN_ATRIBUTO, n));
  return final === attrs[chave] ? attrs : { ...attrs, [chave]: final };
}

/** Confere se a distribuição está completa e válida. */
export function validarAtributos(attrs, raca) {
  const { fixos, livres, total } = regrasAtributos(raca);
  const erros = [];
  for (const [k, v] of Object.entries(fixos))
    if (attrs?.[k] !== v) erros.push(`${k} é fixo em ${v} para esta raça.`);
  for (const k of livres) {
    const v = attrs?.[k];
    if (!Number.isInteger(v)) erros.push(`${k} precisa ser um número inteiro.`);
    else if (v < CRIACAO.MIN_ATRIBUTO) erros.push(`${k} não pode ser menor que ${CRIACAO.MIN_ATRIBUTO}.`);
    else if (v > CRIACAO.MAX_ATRIBUTO_INICIAL)
      erros.push(`${k} não pode passar de ${CRIACAO.MAX_ATRIBUTO_INICIAL} na criação.`);
  }
  const restante = pontosRestantes(attrs, raca);
  if (restante > 0) erros.push(`Ainda restam ${restante} pontos para distribuir.`);
  if (restante < 0) erros.push(`Você passou ${-restante} pontos do total de ${total}.`);
  return { ok: erros.length === 0, restante, erros };
}

/**
 * Troca de raça: os atributos só reiniciam quando o tipo de distribuição muda
 * (entrar ou sair de VAMPIRO). Entre raças comuns, o que foi distribuído fica.
 */
export function atributosAoTrocarRaca(attrs, racaAntiga, racaNova) {
  const tipo = (r) => (r === "VAMPIRO" ? "VAMPIRO" : "COMUM");
  return tipo(racaAntiga) === tipo(racaNova) ? attrs : atributosIniciais(racaNova);
}

// ---------------------------------------------------------------------------
// Profissão e perícias
// ---------------------------------------------------------------------------

/** Atributos que definem a profissão: o 1º seletor aceita estes cinco, o 2º só EDU ou INT. */
export const SELETOR_PRINCIPAL = ["FOR", "DES", "APA", "EDU", "INT"];
export const SELETOR_SECUNDARIO = ["EDU", "INT"];
export const QTD_PERICIAS_PROFISSAO = 7;

/** Perícias que só algumas raças podem ter. Hoje só o Olfato (Lobisomem). */
const PERICIAS_EXCLUSIVAS = { olfato: "LOBISOMEM" };

/** Perícias que nunca aparecem na criação, para nenhuma raça (Primórdios). */
const PERICIAS_FORA_DA_CRIACAO = ["primordios"];

const chave = (nome) =>
  normalizarNome(nome)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function periciaPermitida(nome, raca) {
  const k = chave(nome);
  if (PERICIAS_FORA_DA_CRIACAO.includes(k)) return false;
  const exigida = PERICIAS_EXCLUSIVAS[k];
  return !exigida || exigida === raca;
}

/** Catálogo filtrado pela raça: sem raça escolhida, nenhuma perícia exclusiva aparece. */
export function periciasDaRaca(catalogo, raca) {
  return (catalogo ?? []).filter((p) => periciaPermitida(p.nome, raca));
}

/**
 * Quanto um atributo vale no orçamento de profissão. É o valor DIGITADO, exceto
 * FOR/DES do vampiro, que contam como FOR_DES_VAMPIRO_ORCAMENTO (57,5) e não 120.
 */
export function valorParaProfissao(attrs, chave, raca) {
  if (raca === "VAMPIRO" && ATRIBUTOS_FIXOS_VAMPIRO.includes(chave)) return FOR_DES_VAMPIRO_ORCAMENTO;
  return attrs?.[chave] ?? 0;
}

/** (seletor 1 × 2) + (seletor 2 × 2), com os valores DIGITADOS. EDU+EDU = EDU×4, INT+INT = INT×4. */
export function pontosProfissao(attrs, principal, secundario, raca) {
  if (!SELETOR_PRINCIPAL.includes(principal) || !SELETOR_SECUNDARIO.includes(secundario)) return 0;
  return valorParaProfissao(attrs, principal, raca) * 2 + valorParaProfissao(attrs, secundario, raca) * 2;
}

/** Pontos de interesse pessoal: INT × 2. Podem ir para qualquer perícia (inclusive as de raça). */
export function pontosInteresse(attrs) {
  return (attrs?.INT ?? 0) * 2;
}

/** Confere a escolha da profissão: 2 seletores válidos e 7 perícias (ao menos 1 Interpessoal). */
export function validarProfissao({ principal, secundario, pericias }, catalogo, raca) {
  const erros = [];
  if (!SELETOR_PRINCIPAL.includes(principal)) erros.push("Escolha o primeiro atributo da profissão.");
  if (!SELETOR_SECUNDARIO.includes(secundario)) erros.push("Escolha o segundo atributo da profissão (EDU ou INT).");

  const escolhidas = pericias ?? [];
  if (new Set(escolhidas).size !== escolhidas.length) erros.push("Há perícias repetidas.");
  if (escolhidas.length !== QTD_PERICIAS_PROFISSAO)
    erros.push(`Escolha ${QTD_PERICIAS_PROFISSAO} perícias de profissão (faltam ${Math.max(0, QTD_PERICIAS_PROFISSAO - escolhidas.length)}).`);

  const disponiveis = new Map(periciasDaRaca(catalogo, raca).map((p) => [p.nome, p]));
  const invalidas = escolhidas.filter((n) => !disponiveis.has(n));
  if (invalidas.length) erros.push(`Perícia não disponível para esta raça: ${invalidas.join(", ")}.`);

  if (!escolhidas.some((n) => disponiveis.get(n)?.categoria === "INTERPESSOAL"))
    erros.push("Inclua ao menos uma perícia Interpessoal.");

  return { ok: erros.length === 0, erros };
}

// ---------------------------------------------------------------------------
// Distribuição de pontos nas perícias
// ---------------------------------------------------------------------------
//
// Dois "bolsos" de pontos:
//   profissao  -> só as 7 perícias da profissão. Orçamento = seletor 1 × 2 + seletor 2 × 2
//   interesse  -> qualquer perícia da raça.      Orçamento = INT × 2
// O valor final de cada perícia (inicial do catálogo + profissão + interesse) vai até 80.
//
// `ganhos` tem a forma { profissao: { nome: pontos }, interesse: { nome: pontos } }.
// `ctx` tem { attrs, principal, secundario, pericias (as 7), catalogo, raca }.

export const SEM_GANHOS = Object.freeze({ profissao: {}, interesse: {} });
const BOLSOS = ["profissao", "interesse"];

export function orcamentos(attrs, principal, secundario, raca) {
  return { profissao: pontosProfissao(attrs, principal, secundario, raca), interesse: pontosInteresse(attrs) };
}

/** Valor inicial (do catálogo, com os atributos digitados) de cada perícia que a raça pode ter. */
export function iniciaisPermitidas(catalogo, raca, attrs) {
  return new Map(periciasDaRaca(catalogo, raca).map((p) => [p.nome, valorInicialPericia(p.valorInicial, attrs, raca)]));
}

const soma = (mapa) => Object.values(mapa ?? {}).reduce((s, v) => s + v, 0);

function cortarExcesso(mapa, limite) {
  const novo = { ...mapa };
  let total = soma(novo);
  for (const nome of Object.keys(novo).reverse()) {
    if (total <= limite) break;
    const tirar = Math.min(novo[nome], total - limite);
    novo[nome] -= tirar;
    total -= tirar;
    if (novo[nome] === 0) delete novo[nome];
  }
  return novo;
}

/**
 * Deixa os ganhos coerentes com o estado atual: tira o que saiu da profissão ou da raça,
 * respeita o teto de 80 por perícia (o interesse cede primeiro) e o orçamento de cada bolso.
 * Chamada sempre que atributos, profissão ou raça mudam.
 */
export function normalizarGanhos(ganhos, ctx) {
  const iniciais = iniciaisPermitidas(ctx.catalogo, ctx.raca, ctx.attrs);
  const orc = orcamentos(ctx.attrs, ctx.principal, ctx.secundario, ctx.raca);
  const sete = new Set(ctx.pericias ?? []);

  const limpar = (mapa, permitido) =>
    Object.fromEntries(
      Object.entries(mapa ?? {})
        .map(([nome, v]) => [nome, Math.max(0, Math.floor(Number(v) || 0))])
        .filter(([nome, v]) => v > 0 && iniciais.has(nome) && permitido(nome)),
    );

  const profissao = limpar(ganhos?.profissao, (n) => sete.has(n));
  const interesse = limpar(ganhos?.interesse, () => true);

  for (const nome of new Set([...Object.keys(profissao), ...Object.keys(interesse)])) {
    const espaco = Math.max(0, CRIACAO.TETO_PERICIA - iniciais.get(nome));
    const p = Math.min(profissao[nome] ?? 0, espaco);
    const i = Math.min(interesse[nome] ?? 0, espaco - p);
    p > 0 ? (profissao[nome] = p) : delete profissao[nome];
    i > 0 ? (interesse[nome] = i) : delete interesse[nome];
  }

  return {
    profissao: cortarExcesso(profissao, orc.profissao),
    interesse: cortarExcesso(interesse, orc.interesse),
  };
}

/** Pontos que ainda faltam distribuir em cada bolso. */
export function pontosRestantesPericias(ganhos, ctx) {
  const orc = orcamentos(ctx.attrs, ctx.principal, ctx.secundario, ctx.raca);
  return { profissao: orc.profissao - soma(ganhos.profissao), interesse: orc.interesse - soma(ganhos.interesse) };
}

/** Maior valor que `nome` pode ter hoje em um bolso (teto de 80 e pontos que sobram). */
export function maximoGanho(ganhos, bolso, nome, ctx) {
  const iniciais = iniciaisPermitidas(ctx.catalogo, ctx.raca, ctx.attrs);
  if (!iniciais.has(nome)) return 0;
  if (bolso === "profissao" && !(ctx.pericias ?? []).includes(nome)) return 0;
  const outro = bolso === "profissao" ? "interesse" : "profissao";
  const orc = orcamentos(ctx.attrs, ctx.principal, ctx.secundario, ctx.raca)[bolso];
  const atual = ganhos[bolso][nome] ?? 0;
  const porBolso = orc - (soma(ganhos[bolso]) - atual);
  const porTeto = CRIACAO.TETO_PERICIA - iniciais.get(nome) - (ganhos[outro][nome] ?? 0);
  return Math.max(0, Math.min(porBolso, porTeto));
}

/** Devolve novos ganhos com `nome` ajustado para dentro dos limites. */
export function ajustarGanho(ganhos, bolso, nome, valor, ctx) {
  const n = Math.floor(Number(valor));
  if (!Number.isFinite(n)) return ganhos;
  const max = maximoGanho(ganhos, bolso, nome, ctx);
  const final = Math.min(max, Math.max(0, n));
  const mapa = { ...ganhos[bolso] };
  if (final > 0) mapa[nome] = final;
  else delete mapa[nome];
  return { ...ganhos, [bolso]: mapa };
}

/** Valor final de uma perícia na criação: inicial + profissão + interesse. */
export function valorFinalPericia(nome, ganhos, ctx) {
  const inicial = iniciaisPermitidas(ctx.catalogo, ctx.raca, ctx.attrs).get(nome) ?? 0;
  return inicial + (ganhos.profissao[nome] ?? 0) + (ganhos.interesse[nome] ?? 0);
}

/** Quanto ainda cabe em cada bolso (por causa do teto de 80), para saber se dá mesmo para gastar tudo. */
function espacoDisponivel(ganhos, bolso, ctx) {
  const iniciais = iniciaisPermitidas(ctx.catalogo, ctx.raca, ctx.attrs);
  const alvo = bolso === "profissao" ? (ctx.pericias ?? []) : [...iniciais.keys()];
  return alvo.reduce((s, nome) => {
    if (!iniciais.has(nome)) return s;
    return s + Math.max(0, CRIACAO.TETO_PERICIA - valorFinalPericia(nome, ganhos, ctx));
  }, 0);
}

/**
 * A distribuição está completa quando nenhum ponto sobra em nenhum dos dois bolsos.
 * Exceção rara: se sobrou ponto mas o teto de 80 impede de colocar em qualquer perícia, vale como completa.
 */
export function validarPericias(ganhos, ctx) {
  const erros = [];
  const falta = pontosRestantesPericias(ganhos, ctx);
  for (const bolso of BOLSOS) {
    if (falta[bolso] < 0) erros.push(`Pontos de ${bolso === "profissao" ? "profissão" : "interesse"} acima do orçamento.`);
    if (falta[bolso] > 0 && espacoDisponivel(ganhos, bolso, ctx) > 0)
      erros.push(`Faltam ${falta[bolso]} pontos de ${bolso === "profissao" ? "profissão" : "interesse"}.`);
  }
  return { ok: erros.length === 0, erros, restante: falta };
}

/** Une os dois bolsos em { nome: pontos } — é o que o backend recebe como `ganhos`. */
export function ganhosParaEnvio(ganhos) {
  const total = {};
  for (const bolso of BOLSOS)
    for (const [nome, v] of Object.entries(ganhos[bolso] ?? {})) total[nome] = (total[nome] ?? 0) + v;
  return total;
}

/** Corpo do POST /criacao/concluir (o contrato combinado com o backend). Fixos da raça (FOR/DES = 120 no vampiro) vão com o valor fixo. */
export function montarEnvio({ atributos, profissao, ganhos, raca }) {
  const { fixos } = regrasAtributos(raca);
  return {
    atributos: Object.fromEntries(ATRIBUTOS.map((k) => [k, fixos[k] ?? atributos[k]])),
    profissao: { principal: profissao.principal, secundario: profissao.secundario, pericias: [...profissao.pericias] },
    ganhos: { profissao: { ...ganhos.profissao }, interesse: { ...ganhos.interesse } },
  };
}