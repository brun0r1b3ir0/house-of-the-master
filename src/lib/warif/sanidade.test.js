import { describe, it, expect } from "vitest";
import { ESTAGIOS_SANIDADE, pacoteSanidade } from "./sanidade";
import { pacoteVazio } from "./modificadores";

describe("estágios de Sanidade", () => {
  it("tem os 8 estágios com as mesmas chaves do backend", () => {
    expect(Object.keys(ESTAGIOS_SANIDADE)).toEqual([
      "PLENITUDE",
      "ESTADO_DE_APRECO",
      "MENTE_SA",
      "ESTRESSE_LEVE",
      "ALERTA_VERMELHO",
      "ESTADO_CRITICO",
      "COLAPSO_MENTAL",
      "INFERNO",
    ]);
  });

  it("Mente Sã não tem efeito", () => {
    expect(pacoteSanidade("MENTE_SA")).toEqual(pacoteVazio());
  });

  it("chave desconhecida ou ausente não tem efeito", () => {
    expect(pacoteSanidade("XYZ")).toEqual(pacoteVazio());
    expect(pacoteSanidade(undefined)).toEqual(pacoteVazio());
  });

  it("Plenitude e Estado de Apreço: POD +10, Mental +10, Interpessoal +10 (sem duplicar)", () => {
    for (const chave of ["PLENITUDE", "ESTADO_DE_APRECO"]) {
      const p = pacoteSanidade(chave);
      expect(p.atributos.POD.soma).toBe(10);
      expect(p.pericias.MENTAL.soma).toBe(10);
      expect(p.pericias.INTERPESSOAL.soma).toBe(10);
      expect(p.pericias.FISICA.soma).toBe(0);
    }
  });

  it("Estresse Leve: DES -5, POD -5, só Interpessoal -10", () => {
    const p = pacoteSanidade("ESTRESSE_LEVE");
    expect(p.atributos.DES.soma).toBe(-5);
    expect(p.atributos.POD.soma).toBe(-5);
    expect(p.pericias.INTERPESSOAL.soma).toBe(-10);
    expect(p.pericias.MENTAL.soma).toBe(0);
  });

  it("Alerta Vermelho: Interpessoal -15 (não -30), Combate -10 e Física -10 só com precisão", () => {
    const p = pacoteSanidade("ALERTA_VERMELHO");
    expect(p.atributos.DES.soma).toBe(-10);
    expect(p.atributos.APA.soma).toBe(-5);
    expect(p.atributos.POD.soma).toBe(-5);
    expect(p.pericias.INTERPESSOAL.soma).toBe(-15);
    expect(p.pericias.MENTAL.soma).toBe(-15);
    expect(p.pericias.COMBATE.soma).toBe(-10);
    expect(p.pericias.FISICA.soma).toBe(0);
    expect(p.pericias.FISICA.somaPrecisao).toBe(-10);
  });

  it("Estado Crítico: Física -10, Mental -20, Interpessoal -20, Combate intacto", () => {
    const p = pacoteSanidade("ESTADO_CRITICO");
    expect(p.atributos.CON.soma).toBe(-10);
    expect(p.atributos.DES.soma).toBe(-10);
    expect(p.atributos.APA.soma).toBe(-10);
    expect(p.atributos.POD.soma).toBe(-15);
    expect(p.pericias.FISICA.soma).toBe(-10);
    expect(p.pericias.MENTAL.soma).toBe(-20);
    expect(p.pericias.INTERPESSOAL.soma).toBe(-20);
    expect(p.pericias.COMBATE.soma).toBe(0);
  });

  it("Colapso Mental e Inferno são iguais: todas as categorias -20", () => {
    expect(pacoteSanidade("INFERNO")).toEqual(pacoteSanidade("COLAPSO_MENTAL"));
    const p = pacoteSanidade("COLAPSO_MENTAL");
    expect(p.atributos.CON.soma).toBe(-10);
    expect(p.atributos.DES.soma).toBe(-15);
    expect(p.atributos.APA.soma).toBe(-15);
    expect(p.atributos.POD.soma).toBe(-25);
    for (const c of ["FISICA", "COMBATE", "MENTAL", "INTERPESSOAL"]) {
      expect(p.pericias[c].soma).toBe(-20);
    }
  });
});
