import { describe, it, expect } from "vitest";
import { NIVEIS_SANGRIA, tempoProximoPsG, origemAtributos, hipnoseFunciona, contarPalavras } from "./vampiro";

describe("vampiro", () => {
  it("há um texto para cada ponto de Sangria", () => {
    expect(NIVEIS_SANGRIA).toHaveLength(10);
  });

  it("tempo até o próximo PsG", () => {
    expect(tempoProximoPsG(0)).toBe("6 h"); // vai para 1
    expect(tempoProximoPsG(3)).toBe("6 h"); // vai para 4
    expect(tempoProximoPsG(4)).toBe("24 h"); // vai para 5
    expect(tempoProximoPsG(5)).toBe("24 h"); // vai para 6
    expect(tempoProximoPsG(6)).toBe("6 h"); // vai para 7
    expect(tempoProximoPsG(10)).toBeNull();
    expect(tempoProximoPsG(undefined)).toBe("6 h");
  });

  describe("origemAtributos", () => {
    it("sem Sangria nem Verbena, só a raça", () => {
      const o = origemAtributos({ contadores: {}, flags: {} });
      expect(o.FOR).toEqual(["fixo 120"]);
      expect(o.DES).toEqual(["fixo 120"]);
      expect(o.CON).toEqual(["+10"]);
      expect(o.TAM).toEqual([]);
      expect(o.POD).toEqual([]);
    });

    it("Sangria 1 só mexe em POD", () => {
      const o = origemAtributos({ contadores: { sangria: 1 }, flags: {} });
      expect(o.POD).toEqual(["Sangria"]);
      expect(o.INT).toEqual([]);
      expect(o.FOR).toEqual(["fixo 120"]);
    });

    it("Sangria 4 alcança atributos, mas nunca TAM", () => {
      const o = origemAtributos({ contadores: { sangria: 4 }, flags: {} });
      expect(o.INT).toEqual(["Sangria"]);
      expect(o.CON).toEqual(["+10", "Sangria"]);
      expect(o.TAM).toEqual([]);
    });

    it("Verbena não afeta TAM nem APA", () => {
      const o = origemAtributos({ contadores: {}, flags: { verbena: true } });
      expect(o.TAM).toEqual([]);
      expect(o.APA).toEqual([]);
      expect(o.INT).toEqual(["Verbena"]);
      expect(o.POD).toEqual(["Verbena"]);
    });

    it("APA sofre Sangria (grupo dos atributos), mas não Verbena", () => {
      const o = origemAtributos({ contadores: { sangria: 5 }, flags: { verbena: true } });
      expect(o.APA).toEqual(["Sangria"]);
    });
  });

  it("hipnose exige vencer por um nível", () => {
    expect(hipnoseFunciona(1, 0)).toBe(true); // Normal vs Falha
    expect(hipnoseFunciona(1, 1)).toBe(false); // empate
    expect(hipnoseFunciona(2, 1)).toBe(true);
    expect(hipnoseFunciona(0, 0)).toBe(false); // falhou na Hipnose
    expect(hipnoseFunciona(4, 3)).toBe(true);
  });

  it("conta palavras do comando", () => {
    expect(contarPalavras("")).toBe(0);
    expect(contarPalavras("  esqueça que me viu  ")).toBe(4);
    expect(contarPalavras(null)).toBe(0);
  });
});
