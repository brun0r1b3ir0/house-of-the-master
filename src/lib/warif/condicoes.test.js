import { describe, it, expect } from "vitest";
import {
  pacoteExaustao,
  pacoteFome,
  pacoteSede,
  pacoteDebilitantes,
  pacoteFrio,
  perdaPermanenteTamDesejada,
  pacoteCondicoesClassicas,
} from "./condicoes";
import { pacoteVazio, resolverAtributo } from "./modificadores";

const attrs = (p) => Object.fromEntries(Object.entries(p.atributos).map(([k, v]) => [k, v.soma]));
const per = (p) => Object.fromEntries(Object.entries(p.pericias).map(([k, v]) => [k, v.soma]));

describe("Exaustão", () => {
  it("0 pontos: sem efeito", () => {
    expect(pacoteExaustao(0)).toEqual(pacoteVazio());
  });

  it("1 ponto (ímpar): CON -5, DES -10, Física -5, Mental -5", () => {
    const p = pacoteExaustao(1);
    expect(attrs(p)).toMatchObject({ FOR: 0, CON: -5, DES: -10, APA: 0 });
    expect(per(p)).toEqual({ FISICA: -5, COMBATE: 0, MENTAL: -5, INTERPESSOAL: 0 });
  });

  it("2 pontos: soma ímpar + par", () => {
    expect(attrs(pacoteExaustao(2))).toMatchObject({ FOR: -10, CON: -15, DES: -20, APA: -10 });
  });

  it("3 pontos (2 ímpares + 1 par): Interpessoal NÃO é afetada", () => {
    const p = pacoteExaustao(3);
    expect(attrs(p)).toMatchObject({ FOR: -10, CON: -20, DES: -30, APA: -10 });
    expect(per(p)).toEqual({ FISICA: -15, COMBATE: 0, MENTAL: -15, INTERPESSOAL: 0 });
  });
});

describe("Fome", () => {
  it("3 pontos: FOR -15, DES -15, CON -5, Física -5", () => {
    const p = pacoteFome(3);
    expect(attrs(p)).toMatchObject({ FOR: -15, CON: -5, DES: -15 });
    expect(per(p).FISICA).toBe(-5);
  });
});

describe("Sede", () => {
  it("1 ponto: só atributos", () => {
    const p = pacoteSede(1);
    expect(attrs(p)).toMatchObject({ CON: -5, INT: -5 });
    expect(per(p)).toEqual({ FISICA: 0, COMBATE: 0, MENTAL: 0, INTERPESSOAL: 0 });
  });

  it("2 pontos: CON -10, INT -10, Física -5, Mental -5, Interpessoal intacta", () => {
    const p = pacoteSede(2);
    expect(attrs(p)).toMatchObject({ CON: -10, INT: -10 });
    expect(per(p)).toEqual({ FISICA: -5, COMBATE: 0, MENTAL: -5, INTERPESSOAL: 0 });
  });
});

describe("Debilitantes", () => {
  it("0 pontos: sem efeito", () => {
    expect(pacoteDebilitantes(0)).toEqual(pacoteVazio());
  });

  it.each([
    [1, -10, 0, -1],
    [2, -20, -10, -1],
    [3, -30, -10, -1],
    [4, -40, -20, -1],
  ])("%i ponto(s): FOR %i, CON %i, PV máx %i", (n, forca, con, pv) => {
    const p = pacoteDebilitantes(n);
    expect(p.atributos.FOR.soma).toBe(forca);
    expect(p.atributos.CON.soma).toBe(con);
    expect(p.pvFlat).toBe(pv);
  });
});

describe("Frio", () => {
  it("0 pontos: sem efeito", () => {
    expect(pacoteFrio(0)).toEqual(pacoteVazio());
  });

  it("Leve: FOR -5, DES -5, CON -10", () => {
    const p = pacoteFrio(1);
    expect(attrs(p)).toMatchObject({ FOR: -5, DES: -5, CON: -10 });
    expect(resolverAtributo(50, "CON", p)).toBe(40);
  });

  it("Moderado: CON -1/4 do valor efetivo", () => {
    const p = pacoteFrio(2);
    expect(attrs(p)).toMatchObject({ FOR: -5, DES: -5, CON: 0 });
    expect(resolverAtributo(50, "CON", p)).toBe(37); // floor(50 * 0,75)
  });

  it("Severo: CON -1/2 do valor efetivo", () => {
    expect(resolverAtributo(50, "CON", pacoteFrio(3))).toBe(25);
  });

  it("Crítico: FOR -10, DES -10, CON fixada em 1", () => {
    const p = pacoteFrio(4);
    expect(attrs(p)).toMatchObject({ FOR: -10, DES: -10 });
    expect(resolverAtributo(50, "CON", p)).toBe(1);
  });

  it("não é cumulativo: contador acima de 4 equivale a 4", () => {
    expect(pacoteFrio(7)).toEqual(pacoteFrio(4));
  });
});

describe("perda permanente de TAM", () => {
  it.each([
    // [fome, TAM, perda atual, esperado]
    [0, 50, 0, 0],
    [4, 50, 0, 0],
    [5, 50, 0, 5],
    [9, 50, 0, 5],
    [12, 50, 0, 10],
    [100, 50, 0, 25], // teto = metade do TAM original
    [0, 50, 10, 10], // nunca diminui sozinha (TAM 50 já com 10 tirados: original 60)
    [5, 50, 15, 15],
    [100, 25, 25, 25], // TAM digitado 25 + 25 já tirados = original 50: teto 25, nada novo
    [100, 40, 10, 25], // original 50: ainda dá para tirar mais 15
    [30, 40, 10, 25], // original 50: teto 25 limita os 30 pedidos pela fome
  ])("fome %i, TAM digitado %i, perda aplicada %i => %i", (fome, tam, atual, esperado) => {
    expect(perdaPermanenteTamDesejada(fome, tam, atual)).toBe(esperado);
  });
});

describe("pacoteCondicoesClassicas", () => {
  it("ficha nova (tudo zero, Mente Sã) não tem efeito", () => {
    const estado = {
      estagioSanidade: "MENTE_SA",
      contadores: { exaustao: 0, fome: 0, sede: 0, debilitantes: 0, frio: 0, sangria: 0 },
      perdaPermanenteTam: 0,
    };
    expect(pacoteCondicoesClassicas(estado)).toEqual(pacoteVazio());
  });

  it("não quebra com estado ausente ou incompleto", () => {
    expect(pacoteCondicoesClassicas(undefined)).toEqual(pacoteVazio());
    expect(pacoteCondicoesClassicas({})).toEqual(pacoteVazio());
  });

  it("soma estágio de Sanidade + Exaustão (sem propagação)", () => {
    const p = pacoteCondicoesClassicas({
      estagioSanidade: "ALERTA_VERMELHO",
      contadores: { exaustao: 1 },
    });
    expect(attrs(p)).toMatchObject({ DES: -20, CON: -5, APA: -5, POD: -5 });
    expect(per(p).MENTAL).toBe(-20); // -15 do estágio + -5 da exaustão
    expect(per(p).INTERPESSOAL).toBe(-15); // só o estágio
  });

  it("a perda permanente de TAM NÃO desconta do efetivo: ela já está no valor digitado", () => {
    const p = pacoteCondicoesClassicas({ perdaPermanenteTam: 5 });
    expect(p.atributos.TAM.soma).toBe(0);
  });

  it("imune a Fome e Sede: ignora esses contadores e a perda de TAM, mas o resto vale", () => {
    const estado = {
      contadores: { fome: 10, sede: 10, exaustao: 1, frio: 1 },
      perdaPermanenteTam: 10,
    };
    const p = pacoteCondicoesClassicas(estado, { imuneFomeSede: true });
    expect(p.atributos.TAM.soma).toBe(0);
    expect(p.atributos.INT.soma).toBe(0); // Sede ignorada
    expect(p.atributos.FOR.soma).toBe(-5); // só o Frio Leve
    expect(p.atributos.CON.soma).toBe(-15); // Exaustão -5 + Frio -10
  });
});