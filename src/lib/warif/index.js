// Ponto de entrada do módulo de cálculo da ficha War If.
//
//   import { calcularFicha } from "@/lib/warif";
//
// Para a tela, quase tudo se resume a calcularFicha(ficha, sistema).

export { calcularFicha } from "./calcular";
export { calcularEfeitos, atributosEfetivos } from "./efeitos";
export { calcularDerivados, corpoEDano, movAutomatico, distanciaMov } from "./derivados";
export { periciaEfetiva, periciaEhMagica, valorInicialPericia, metade, quinto } from "./pericias";
export { perdaPermanenteTamDesejada } from "./condicoes";
export {
  calcularHabilidades,
  calcularEH,
  classeHumana,
  proximaClasse,
  CLASSES,
  HUMANO_COMUM,
  PRIMORDIOS_MAGICA,
} from "./habilidades";
export { proximoColapso, normalizarRaca, RACA_PADRAO } from "./raca";
