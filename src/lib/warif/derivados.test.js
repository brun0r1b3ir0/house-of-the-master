import { describe, it, expect } from "vitest";
import { corpoEDano, movAutomatico, distanciaMov, calcularDerivados } from "./derivados";
import { calcularEfeitos, atributosEfetivos } from "./efeitos";

function estadoBase(extra = {}) {
  return {
    atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50 },
    atuais: { PV: 10, PE: 10, PM: 10, SAN: 100, SRT: 100 },
    estagioSanidade: "MENTE_SA",
    contadores: { exaustao: 0, fome: 0, sede: 0, debilitantes: 0, frio: 0, sangria: 0 },
    perdaPermanenteTam: 0,
    flags: { verbena: false, colapsoMagico: false },
    alcateia: { ativa: false, membros: 0, papel: "membro", linhagem: "normal" },
    overrides: {},
    ...extra,
  };
}
function derivados(estado, raca) {
  const efeitos = calcularEfeitos(estado, raca);
  const efetivos = atributosEfetivos(estado, raca, efeitos);
  return calcularDerivados(estado, raca, efeitos, efetivos);
}

describe("corpoEDano", () => {
  it.each([
    [0, -2, "-2"],
    [64, -2, "-2"],
    [65, -1, "-1"],
    [84, -1, "-1"],
    [85, 0, "Nenhum"],
    [124, 0, "Nenhum"],
    [125, 1, "+1D4"],
    [164, 1, "+1D4"],
    [165, 2, "+1D6"],
    [204, 2, "+1D6"],
    [205, 3, "+2D6"],
    [284, 3, "+2D6"],
    [285, 4, "+3D6"],
    [364, 4, "+3D6"],
    [365, 5, "+4D6"],
    [444, 5, "+4D6"],
    [445, 6, "+5D6*"],
  ])("FOR+TAM %i => Corpo %i, dano %s", (soma, corpo, dano) => {
    expect(corpoEDano(soma)).toEqual({ corpo, modificadorDano: dano });
  });
});

describe("MOV", () => {
  it.each([
    [60, 60, 50, 9],
    [40, 40, 50, 7],
    [60, 40, 50, 8],
    [50, 50, 50, 8],
    [50, 60, 50, 8],
  ])("FOR %i, DES %i, TAM %i => MOV %i", (f, d, t, mov) => {
    expect(movAutomatico(f, d, t)).toBe(mov);
  });

  it.each([
    [9, 12],
    [8, 9],
    [7, 6],
    [10, 18],
    [11, 27],
    [12, 40.5],
    [6, 3],
    [5, 1.5],
    [4, 0.8], // 0,75 arredondado
  ])("MOV %i => %f m", (mov, metros) => {
    expect(distanciaMov(mov)).toBe(metros);
  });
});

describe("derivados: ficha 'tudo 50'", () => {
  it("Humano", () => {
    expect(derivados(estadoBase(), "HUMANO")).toMatchObject({
      PV: 10, PE: 10, PM: 10, MOV: 8, distanciaMov: 9, Corpo: 0, modificadorDano: "Nenhum",
      Conhecimento: 50, SAN: 100, SRT: 100,
    });
  });

  it("PV e PE têm mínimo 1", () => {
    const e = estadoBase({ atributos: { FOR: 50, CON: 0, TAM: 5, DES: 50, APA: 50, INT: 2, POD: 50, EDU: 50 } });
    const d = derivados(e, null);
    expect(d.PV).toBe(1);
    expect(d.PE).toBe(1);
  });

  it("Debilitantes tiram 1 de PV máx e reduzem a CON", () => {
    const d = derivados(estadoBase({ contadores: { debilitantes: 1 } }), "HUMANO");
    expect(d.PV).toBe(9); // CON não muda (só a cada 2 pontos); PV máx 10 - 1
  });

  it("Debilitantes 2: CON 40 => PV floor(90/10) - 1 = 8, PE floor(90/10) = 9", () => {
    const d = derivados(estadoBase({ contadores: { debilitantes: 2 } }), "HUMANO");
    expect(d.PV).toBe(8);
    expect(d.PE).toBe(9);
  });
});

describe("derivados: PM", () => {
  it("Humano POD/5, Bruxo e Viajante POD/3", () => {
    const e = estadoBase({ atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 60, EDU: 50 } });
    expect(derivados(e, "HUMANO").PM).toBe(12);
    expect(derivados(e, "BRUXO").PM).toBe(20);
    expect(derivados(e, "VIAJANTE").PM).toBe(20);
  });
});

describe("derivados: exceções manuais", () => {
  it("PV com exceção ainda recebe o flat das condições", () => {
    const e = estadoBase({ overrides: { PV: 20 }, contadores: { debilitantes: 1 } });
    expect(derivados(e, "HUMANO").PV).toBe(19);
  });

  it("PE, PM, Corpo e Conhecimento com exceção", () => {
    const e = estadoBase({ overrides: { PE: 7, PM: 4, Corpo: 3, Conhecimento: 99 } });
    expect(derivados(e, "HUMANO")).toMatchObject({ PE: 7, PM: 4, Corpo: 3, Conhecimento: 99 });
  });

  it("MOV com exceção ignora raça, condições, Sangria e Verbena", () => {
    const e = estadoBase({ overrides: { MOV: 5 }, contadores: { sangria: 6 }, flags: { verbena: true } });
    expect(derivados(e, "VAMPIRO").MOV).toBe(5);
  });
});

describe("derivados: Vampiro", () => {
  it("MOV fixo em 12", () => {
    expect(derivados(estadoBase(), "VAMPIRO").MOV).toBe(12);
  });

  it("Sangria 4 => floor(12 x 3/4) = 9; com Verbena => floor(9 x 3/4) = 6", () => {
    expect(derivados(estadoBase({ contadores: { sangria: 4 } }), "VAMPIRO").MOV).toBe(9);
    const e = estadoBase({ contadores: { sangria: 4 }, flags: { verbena: true } });
    expect(derivados(e, "VAMPIRO").MOV).toBe(6);
  });

  it("dois Corpos: Ativo (FOR+DES = 240) e Passivo (FOR+TAM = 170)", () => {
    const d = derivados(estadoBase(), "VAMPIRO");
    expect(d.corpoAtivo).toEqual({ corpo: 3, modificadorDano: "+2D6" });
    expect(d.corpoPassivo).toEqual({ corpo: 2, modificadorDano: "+1D6" });
    expect(d.Corpo).toBe(2);
    expect(d.modificadorDano).toBe("+1D6");
  });

  it("outras raças não têm Corpo Ativo/Passivo", () => {
    expect(derivados(estadoBase(), "HUMANO").corpoAtivo).toBeUndefined();
  });

  it("Conhecimento = EDU efetiva (Sangria 4 => 37)", () => {
    expect(derivados(estadoBase({ contadores: { sangria: 4 } }), "VAMPIRO").Conhecimento).toBe(37);
  });
});

describe("derivados: Colapso Mágico", () => {
  it("FOR e DES pela metade e MOV -1: MOV 7 - 1 = 6; CON 40 => PV 9", () => {
    const e = estadoBase({
      atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 60, EDU: 50 },
      atuais: { PV: 10, PE: 10, PM: 0, SAN: 100, SRT: 100 },
    });
    const d = derivados(e, "BRUXO");
    expect(d.MOV).toBe(6);
    expect(d.PV).toBe(9);
    expect(d.PM).toBe(20);
  });
});
