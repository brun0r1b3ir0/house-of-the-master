// Valores fixos do Vampiro. Ficam separados porque FOR/DES do vampiro vão subir com a
// idade no futuro, e o que depende deles na criação (Esquivar, orçamento) não pode subir junto.

/** MOV do vampiro: fixo, não usa a fórmula FOR/DES/TAM. */
export const MOV_VAMPIRO = 12;

/** FOR e DES do vampiro na criação e na ficha: sempre 120, sem edição. */
export const ATRIBUTO_FIXO_VAMPIRO = 120;
export const ATRIBUTOS_FIXOS_VAMPIRO = ["FOR", "DES"];

/** Valor inicial da Esquivar do vampiro (= 120 / 2), cravado: não acompanha a DES. */
export const ESQUIVA_VAMPIRO = 60;

/**
 * Quanto FOR e DES valem no orçamento de PROFISSÃO do vampiro (seletor × 2).
 * É a média que gerou os 345 pontos dos outros seis atributos: 460 − 2 × 57,5 = 345.
 * Assim, principal FOR ou DES rende 57,5 × 2 = 115 pontos (e não 240).
 */
export const FOR_DES_VAMPIRO_ORCAMENTO = 57.5;

/** Total distribuído nos seis atributos livres do vampiro (CON, TAM, APA, INT, POD, EDU). */
export const TOTAL_ATRIBUTOS_VAMPIRO = 460 - 2 * FOR_DES_VAMPIRO_ORCAMENTO;
