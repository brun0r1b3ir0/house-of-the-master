// Atributos derivados: Corpo, MOV, PV, PE, PM, Conhecimento, Sanidade e Sorte.
// Todos usam os atributos EFETIVOS (já com condições e raça).

import { pmMaximo } from "./raca";
import { MOV_VAMPIRO } from "./vampiro-fixos";

/** Corpo e bônus de dano a partir de FOR + TAM (ou FOR + DES, no Corpo Ativo do Vampiro). */
export function corpoEDano(soma) {
  if (soma <= 64) return { corpo: -2, modificadorDano: "-2" };
  if (soma <= 84) return { corpo: -1, modificadorDano: "-1" };
  if (soma <= 124) return { corpo: 0, modificadorDano: "Nenhum" };
  if (soma <= 164) return { corpo: 1, modificadorDano: "+1D4" };
  if (soma <= 204) return { corpo: 2, modificadorDano: "+1D6" };
  if (soma <= 284) return { corpo: 3, modificadorDano: "+2D6" };
  if (soma <= 364) return { corpo: 4, modificadorDano: "+3D6" };
  if (soma <= 444) return { corpo: 5, modificadorDano: "+4D6" };
  return { corpo: 6, modificadorDano: "+5D6*" };
}

/** MOV base: 9 se FOR e DES > TAM; 7 se FOR e DES < TAM; 8 nos demais casos. */
export function movAutomatico(FOR, DES, TAM) {
  if (FOR > TAM && DES > TAM) return 9;
  if (FOR < TAM && DES < TAM) return 7;
  return 8;
}

/** Distância (metros) que corresponde ao MOV, com uma casa decimal. */
export function distanciaMov(mov) {
  let d;
  if (mov === 7) d = 6;
  else if (mov === 8) d = 9;
  else if (mov === 9) d = 12;
  else if (mov > 9) d = 12 * Math.pow(1.5, mov - 9); // cada MOV acima de 9 multiplica por 1,5
  else d = 6 / Math.pow(2, 7 - mov); // cada MOV abaixo de 7 divide por 2
  return Math.round(d * 10) / 10;
}

/**
 * @param {object} estado       `ficha.estado`
 * @param {string|null} raca
 * @param {object} efeitos      resultado de calcularEfeitos()
 * @param {object} efetivos     atributos efetivos
 */
export function calcularDerivados(estado, raca, efeitos, efetivos) {
  const o = estado?.overrides ?? {};
  const { FOR, DES, TAM, CON, INT, POD, EDU } = efetivos;

  // PV: exceção manual ainda recebe o flat das condições (Debilitantes -1)
  const pvBase = o.PV !== undefined ? o.PV : Math.floor((TAM + CON) / 10) || 1;
  const PV = Math.max(0, pvBase + efeitos.pacote.pvFlat);

  const PE = o.PE !== undefined ? o.PE : Math.floor((INT + CON) / 10) || 1;
  const PM = pmMaximo(POD, raca, o);

  // MOV: a exceção manual ignora raça, condições, Sangria e Verbena
  let MOV;
  if (o.MOV !== undefined) {
    MOV = o.MOV;
  } else {
    MOV = raca === "VAMPIRO" ? MOV_VAMPIRO : movAutomatico(FOR, DES, TAM);
    MOV = Math.max(0, MOV + efeitos.pacote.movFlat);
    MOV = Math.floor(MOV * efeitos.multiplicadores.mov.sangria);
    MOV = Math.floor(MOV * efeitos.multiplicadores.mov.verbena);
  }

  const passivo = corpoEDano(FOR + TAM);
  const resultado = {
    PV,
    PE,
    PM,
    MOV,
    distanciaMov: distanciaMov(MOV),
    Corpo: o.Corpo !== undefined ? o.Corpo : passivo.corpo,
    modificadorDano: passivo.modificadorDano,
    Conhecimento: o.Conhecimento !== undefined ? o.Conhecimento : EDU,
    SAN: 100,
    SRT: 100,
  };

  // O Vampiro mostra dois Corpos (só exibição)
  if (raca === "VAMPIRO") {
    resultado.corpoAtivo = corpoEDano(FOR + DES);
    resultado.corpoPassivo = passivo;
  }
  return resultado;
}
