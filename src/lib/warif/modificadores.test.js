import { describe, it, expect } from "vitest";
import {
  ATRIBUTOS,
  CATEGORIAS,
  pacote,
  pacoteVazio,
  somarPacotes,
  empilharImparPar,
  resolverAtributo,
} from "./modificadores";

describe("pacoteVazio", () => {
  it("não altera nenhum atributo nem categoria", () => {
    const p = pacoteVazio();
    for (const k of ATRIBUTOS) expect(p.atributos[k]).toEqual({ soma: 0, fator: 1 });
    for (const c of CATEGORIAS) expect(p.pericias[c]).toEqual({ soma: 0, somaPrecisao: 0 });
    expect(p.pvFlat).toBe(0);
    expect(p.movFlat).toBe(0);
    expect(p.fixos).toEqual({});
  });

  it("cada chamada devolve um objeto novo (sem estado compartilhado)", () => {
    const a = pacoteVazio();
    a.atributos.FOR.soma = 99;
    expect(pacoteVazio().atributos.FOR.soma).toBe(0);
  });
});

describe("pacote()", () => {
  it("monta somas, frações e perícias por nome normalizando o nome", () => {
    const p = pacote({
      atributos: { FOR: -5 },
      fracoes: { CON: -0.25 },
      pericias: { FISICA: -5 },
      periciasPrecisao: { FISICA: -10 },
      periciasPorNome: { "  Lidar com Animais ": 20 },
      pvFlat: -1,
      movFlat: -1,
    });
    expect(p.atributos.FOR.soma).toBe(-5);
    expect(p.atributos.CON.fator).toBe(0.75);
    expect(p.pericias.FISICA).toEqual({ soma: -5, somaPrecisao: -10 });
    expect(p.periciasPorNome["lidar com animais"]).toBe(20);
    expect(p.pvFlat).toBe(-1);
    expect(p.movFlat).toBe(-1);
  });
});

describe("somarPacotes", () => {
  it("soma os valores diretos", () => {
    const t = somarPacotes(
      pacote({ atributos: { FOR: -5 }, pericias: { MENTAL: -5 }, pvFlat: -1 }),
      pacote({ atributos: { FOR: -10 }, pericias: { MENTAL: +10 }, movFlat: -1 }),
    );
    expect(t.atributos.FOR.soma).toBe(-15);
    expect(t.pericias.MENTAL.soma).toBe(5);
    expect(t.pvFlat).toBe(-1);
    expect(t.movFlat).toBe(-1);
  });

  it("frações de fontes diferentes se multiplicam em sequência", () => {
    const t = somarPacotes(pacote({ fracoes: { CON: -0.25 } }), pacote({ fracoes: { CON: -0.25 } }));
    expect(t.atributos.CON.fator).toBeCloseTo(0.5625);
    expect(resolverAtributo(100, "CON", t)).toBe(56); // floor(56,25)
  });

  it("em `fixos` o pacote mais à direita vence", () => {
    const t = somarPacotes(pacote({ fixos: { CON: 99 } }), pacote({ fixos: { CON: 1 } }));
    expect(t.fixos.CON).toBe(1);
  });

  it("ignora pacotes nulos e não altera os originais", () => {
    const a = pacote({ atributos: { FOR: -5 } });
    const t = somarPacotes(a, null, undefined);
    expect(t.atributos.FOR.soma).toBe(-5);
    expect(a.atributos.FOR.soma).toBe(-5);
    t.atributos.FOR.soma = 0;
    expect(a.atributos.FOR.soma).toBe(-5);
  });
});

describe("empilharImparPar", () => {
  const impar = pacote({ atributos: { FOR: -1 } });
  const par = pacote({ atributos: { FOR: -10 } });

  it.each([
    [0, 0],
    [1, -1],
    [2, -11],
    [3, -12],
    [4, -22],
    [5, -23],
  ])("%i ponto(s) => FOR %i", (n, esperado) => {
    expect(empilharImparPar(n, impar, par).atributos.FOR.soma).toBe(esperado);
  });

  it("trata valor ausente ou negativo como zero", () => {
    expect(empilharImparPar(undefined, impar, par).atributos.FOR.soma).toBe(0);
    expect(empilharImparPar(-3, impar, par).atributos.FOR.soma).toBe(0);
  });
});

describe("resolverAtributo", () => {
  it("sem pacote devolve o digitado", () => {
    expect(resolverAtributo(50, "FOR", pacoteVazio())).toBe(50);
  });

  it("soma com piso em 0", () => {
    expect(resolverAtributo(5, "FOR", pacote({ atributos: { FOR: -20 } }))).toBe(0);
  });

  it("a fração age sobre o valor já somado", () => {
    const p = pacote({ atributos: { CON: -10 }, fracoes: { CON: -0.25 } });
    expect(resolverAtributo(50, "CON", p)).toBe(30); // (50-10) * 0,75
  });

  it("valor fixo substitui o atributo, mesmo com penalidades", () => {
    const p = pacote({ atributos: { FOR: -30 }, fixos: { FOR: 120 } });
    expect(resolverAtributo(50, "FOR", p)).toBe(120);
  });

  it("multiplicador final age depois do valor fixo", () => {
    const p = pacote({ fixos: { FOR: 120 } });
    expect(resolverAtributo(50, "FOR", p, 0.25)).toBe(30);
  });

  it("arredonda para baixo uma vez, só no fim", () => {
    // 33 * 0,75 = 24,75 -> 24; com multiplicador 0,5 -> 12,375 -> 12 (não floor(24)*0,5)
    const p = pacote({ fracoes: { CON: -0.25 } });
    expect(resolverAtributo(33, "CON", p, 0.5)).toBe(12);
  });
});
