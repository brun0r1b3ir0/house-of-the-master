// Cores de destaque por raça (vêm do mock da ficha).
// t = cor sobre fundo escuro (títulos), p = cor sobre o papel (números, botões marcados).
const PADRAO = { t: "#D8D4C6", p: "#2A2A27" };

const ACENTOS = {
  CACADOR: { t: "#9A9DA0", p: "#5E6164" },
  BRUXO: { t: "#9468CC", p: "#6E3FA3" },
  VAMPIRO: { t: "#B8302A", p: "#9C1E1E" },
  LOBISOMEM: { t: "#D4A63A", p: "#8A6410" },
  VIAJANTE: { t: "#7FA07B", p: "#4F6B4C" },
};

export function acentoDaRaca(raca) {
  return ACENTOS[raca] ?? PADRAO;
}

export const NOMES_ATRIBUTOS = {
  FOR: "Força",
  CON: "Constituição",
  TAM: "Tamanho",
  DES: "Destreza",
  APA: "Aparência",
  INT: "Inteligência",
  POD: "Poder",
  EDU: "Educação",
};

export const EFEITOS_SANIDADE = {
  PLENITUDE: "POD +10 · Mentais e Interpessoais +10%",
  ESTADO_DE_APRECO: "POD +10 · Mentais e Interpessoais +10%",
  MENTE_SA: "sem efeitos",
  ESTRESSE_LEVE: "DES −5 · POD −5 · Interpessoais −10%",
  ALERTA_VERMELHO:
    "DES −10 · APA −5 · POD −5 · Mentais e Interpessoais −15% · Combate e Físicas de precisão −10%",
  ESTADO_CRITICO:
    "CON −10 · DES −10 · APA −10 · POD −15 · Mentais e Interpessoais −20% · Físicas −10%",
  COLAPSO_MENTAL: "CON −10 · DES −15 · APA −15 · POD −25 · todas as perícias −20%",
  INFERNO: "igual a Colapso Mental",
};

export function formatarMetros(m) {
  return `${String(m).replace(".", ",")} m`;
}