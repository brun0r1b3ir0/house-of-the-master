import { describe, it, expect } from "vitest";
import {
  pacoteRacaFixo,
  pacoteAlcateia,
  pacoteRaca,
  multiplicadoresSangria,
  multiplicadoresRaca,
  alvoColapso,
  proximoColapso,
  pacoteColapso,
  pmMaximo,
  divisorPM,
  ehConjurador,
  imuneFomeSede,
  normalizarRaca,
  RACA_PADRAO,
} from "./raca";
import { pacoteVazio } from "./modificadores";

const attrs = (p) => Object.fromEntries(Object.entries(p.atributos).map(([k, v]) => [k, v.soma]));
const per = (p) => Object.fromEntries(Object.entries(p.pericias).map(([k, v]) => [k, v.soma]));

describe("normalizarRaca", () => {
  it.each([null, undefined, "", "   ", "\t"])("raça ausente (%j) vale como HUMANO", (r) => {
    expect(normalizarRaca(r)).toBe("HUMANO");
    expect(RACA_PADRAO).toBe("HUMANO");
  });

  it.each(["HUMANO", "CACADOR", "BRUXO", "VAMPIRO", "LOBISOMEM", "VIAJANTE"])("%s continua igual", (r) => {
    expect(normalizarRaca(r)).toBe(r);
  });

  it("tira espaços em volta", () => {
    expect(normalizarRaca(" VAMPIRO ")).toBe("VAMPIRO");
  });
});

describe("helpers de raça", () => {
  it("conjuradores e imunidade", () => {
    expect(ehConjurador("BRUXO")).toBe(true);
    expect(ehConjurador("VIAJANTE")).toBe(true);
    expect(ehConjurador("HUMANO")).toBe(false);
    expect(imuneFomeSede("VAMPIRO")).toBe(true);
    expect(imuneFomeSede("LOBISOMEM")).toBe(false);
  });

  it("PM máx: POD/3 para Bruxo e Viajante, POD/5 para as demais", () => {
    expect(divisorPM("BRUXO")).toBe(3);
    expect(divisorPM("VIAJANTE")).toBe(3);
    expect(divisorPM("HUMANO")).toBe(5);
    expect(divisorPM(null)).toBe(5);
    expect(pmMaximo(50, "HUMANO")).toBe(10);
    expect(pmMaximo(50, "BRUXO")).toBe(16); // floor(50/3)
    expect(pmMaximo(50, "BRUXO", { PM: 9 })).toBe(9); // exceção manual vence
  });
});

describe("bônus fixos por raça", () => {
  it("Humano, Bruxo, Viajante (e raça nula, que vale como Humano): nenhum bônus", () => {
    for (const r of ["HUMANO", "BRUXO", "VIAJANTE", null, undefined]) {
      expect(pacoteRacaFixo(r)).toEqual(pacoteVazio());
    }
  });

  it("Caçador: +5 FOR/DES/POD e +5 em todas as categorias (Interpessoal inclusa)", () => {
    const p = pacoteRacaFixo("CACADOR");
    expect(attrs(p)).toMatchObject({ FOR: 5, DES: 5, POD: 5, CON: 0 });
    expect(per(p)).toEqual({ FISICA: 5, COMBATE: 5, MENTAL: 5, INTERPESSOAL: 5 });
  });

  it("Lobisomem: +10 FOR/DES/CON, +10 Física e Combate, +20 em Lidar com Animais", () => {
    const p = pacoteRacaFixo("LOBISOMEM");
    expect(attrs(p)).toMatchObject({ FOR: 10, DES: 10, CON: 10 });
    expect(per(p)).toEqual({ FISICA: 10, COMBATE: 10, MENTAL: 0, INTERPESSOAL: 0 });
    expect(p.periciasPorNome["lidar com animais"]).toBe(20);
  });

  it("Vampiro: FOR e DES fixas em 120, CON +10, Física e Combate +20", () => {
    const p = pacoteRacaFixo("VAMPIRO");
    expect(p.fixos).toEqual({ FOR: 120, DES: 120 });
    expect(p.atributos.CON.soma).toBe(10);
    expect(per(p).FISICA).toBe(20);
    expect(per(p).COMBATE).toBe(20);
    expect(per(p).MENTAL).toBe(0);
  });
});

describe("Alcateia (linhagem normal)", () => {
  const alc = (papel, membros, extra = {}) =>
    pacoteAlcateia({ ativa: true, membros, papel, linhagem: "normal", ...extra }).pacote;

  it("inativa ou ausente: sem efeito", () => {
    expect(pacoteAlcateia(undefined).pacote).toEqual(pacoteVazio());
    expect(pacoteAlcateia({ ativa: false, membros: 10, papel: "alfa" }).pacote).toEqual(pacoteVazio());
  });

  it("Membro, 6 integrantes (3 pares): FOR/DES/CON +6, Física +6, Combate intacto", () => {
    const p = alc("membro", 6);
    expect(attrs(p)).toMatchObject({ FOR: 6, DES: 6, CON: 6, TAM: 0 });
    expect(per(p)).toEqual({ FISICA: 6, COMBATE: 0, MENTAL: 0, INTERPESSOAL: 0 });
  });

  it("os pares arredondam para baixo (7 integrantes = 3 pares)", () => {
    expect(attrs(alc("membro", 7)).FOR).toBe(6);
  });

  it("Alfa, 7 integrantes: atributos +9, Física/Combate +9, TAM +2", () => {
    const p = alc("alfa", 7);
    expect(attrs(p)).toMatchObject({ FOR: 9, DES: 9, CON: 9, TAM: 2 });
    expect(per(p)).toEqual({ FISICA: 9, COMBATE: 9, MENTAL: 0, INTERPESSOAL: 0 });
  });

  it("Alfa Secundário, 5 integrantes (2 pares): atributos +4, Física/Combate +6, sem TAM", () => {
    const p = alc("alfa-secundario", 5);
    expect(attrs(p)).toMatchObject({ FOR: 4, DES: 4, CON: 4, TAM: 0 });
    expect(per(p)).toEqual({ FISICA: 6, COMBATE: 6, MENTAL: 0, INTERPESSOAL: 0 });
  });

  it("papel ausente vale como membro", () => {
    const p = pacoteAlcateia({ ativa: true, membros: 4, linhagem: "normal" }).pacote;
    expect(attrs(p).FOR).toBe(4);
  });

  it("Linhagem Verdadeira não está implementada: sem efeito e com aviso", () => {
    const r = pacoteAlcateia({ ativa: true, membros: 10, papel: "alfa", linhagem: "true" });
    expect(r.pacote).toEqual(pacoteVazio());
    expect(r.linhagemNaoImplementada).toBe(true);
  });

  it("só o Lobisomem recebe a Alcateia", () => {
    const estado = { alcateia: { ativa: true, membros: 6, papel: "membro", linhagem: "normal" } };
    expect(attrs(pacoteRaca(estado, "LOBISOMEM").pacote).FOR).toBe(16); // 10 da raça + 6
    expect(pacoteRaca(estado, "HUMANO").pacote).toEqual(pacoteVazio());
  });
});

describe("Sangria do Vampiro", () => {
  it.each([
    // pontos, pod, atributos, pericias/mov
    [0, 1, 1, 1],
    [1, 3 / 4, 1, 1],
    [2, 2 / 4, 1, 1],
    [3, 1 / 4, 1, 1],
    [4, 1 / 4, 3 / 4, 3 / 4],
    [5, 1 / 4, 2 / 4, 2 / 4],
    [6, 1 / 4, 1 / 4, 1 / 4],
    [7, 1 / 4, (1 / 4) * (3 / 4), 1 / 4],
    [8, 1 / 4, (1 / 4) * (2 / 4), 1 / 4],
    [9, 1 / 4, (1 / 4) * (1 / 4), 1 / 4],
    [10, 1 / 4, 0, 1 / 4],
  ])("%i PsG", (n, pod, atributos, periciasEMov) => {
    const m = multiplicadoresSangria(n);
    expect(m.pod).toBeCloseTo(pod);
    expect(m.atributos).toBeCloseTo(atributos);
    expect(m.pericias).toBeCloseTo(periciasEMov);
    expect(m.mov).toBeCloseTo(periciasEMov);
    expect(m.mumificado).toBe(n >= 10);
  });

  it("limita o contador entre 0 e 10", () => {
    expect(multiplicadoresSangria(25)).toEqual(multiplicadoresSangria(10));
    expect(multiplicadoresSangria(-3)).toEqual(multiplicadoresSangria(0));
    expect(multiplicadoresSangria(undefined)).toEqual(multiplicadoresSangria(0));
  });
});

describe("multiplicadoresRaca", () => {
  it("raças sem multiplicador: tudo 1, mesmo com sangria no estado", () => {
    const m = multiplicadoresRaca({ contadores: { sangria: 8 }, flags: { verbena: true } }, "HUMANO");
    expect(Object.values(m.atributos).every((v) => v === 1)).toBe(true);
    expect(m.pericias).toBe(1);
    expect(m.mov).toEqual({ sangria: 1, verbena: 1 });
    expect(m.mumificado).toBe(false);
  });

  it("Vampiro sem Sangria nem Verbena: tudo 1", () => {
    const m = multiplicadoresRaca({}, "VAMPIRO");
    expect(Object.values(m.atributos).every((v) => v === 1)).toBe(true);
  });

  it("Verbena: atributos x0,5 exceto TAM e APA; perícias x0,5; MOV x0,75", () => {
    const m = multiplicadoresRaca({ flags: { verbena: true } }, "VAMPIRO");
    expect(m.atributos).toMatchObject({ FOR: 0.5, CON: 0.5, DES: 0.5, INT: 0.5, EDU: 0.5, POD: 0.5, TAM: 1, APA: 1 });
    expect(m.pericias).toBe(0.5);
    expect(m.mov.verbena).toBe(0.75);
  });

  it("Sangria 4 + Verbena: combina multiplicando", () => {
    const m = multiplicadoresRaca({ contadores: { sangria: 4 }, flags: { verbena: true } }, "VAMPIRO");
    expect(m.atributos.FOR).toBeCloseTo(0.375); // 3/4 * 1/2
    expect(m.atributos.APA).toBeCloseTo(0.75); // Verbena não afeta APA
    expect(m.atributos.TAM).toBe(1);
    expect(m.atributos.POD).toBeCloseTo(0.125); // 1/4 * 1/2
    expect(m.pericias).toBeCloseTo(0.375);
    expect(m.mov.sangria).toBeCloseTo(0.75);
  });

  it("10 PsG: mumificado", () => {
    expect(multiplicadoresRaca({ contadores: { sangria: 10 } }, "VAMPIRO").mumificado).toBe(true);
  });
});

describe("Colapso Mágico", () => {
  it("alvo = 1/3 do PM máximo, arredondado para cima, no mínimo 1", () => {
    expect(alvoColapso(20)).toBe(7);
    expect(alvoColapso(9)).toBe(3);
    expect(alvoColapso(1)).toBe(1);
    expect(alvoColapso(0)).toBe(1);
  });

  it.each([
    // ativo salvo, PM atual, PM máx, próximo
    [false, 20, 20, false],
    [false, 5, 20, false], // abaixo do alvo mas nunca chegou a 0: não entra
    [false, 0, 20, true], // 0 PM: entra
    [true, 6, 20, true], // ainda abaixo do alvo (7): continua
    [true, 7, 20, false], // chegou ao alvo: sai
    [true, 0, 20, true],
    [false, 0, 0, true],
  ])("ativo=%s, PM %i/%i => %s", (ativo, atual, max, esperado) => {
    expect(proximoColapso(ativo, atual, max)).toBe(esperado);
  });

  it("efeito base: CON -10, FOR e DES pela metade", () => {
    const p = pacoteColapso(6, 20); // alvo 7; 6 não é < 4,67 nem < 2,33
    expect(p.atributos.CON.soma).toBe(-10);
    expect(p.atributos.FOR.fator).toBe(0.5);
    expect(p.atributos.DES.fator).toBe(0.5);
    expect(per(p).FISICA).toBe(0);
    expect(p.movFlat).toBe(0);
  });

  it("Física -15 enquanto o PM está abaixo de 2/3 do alvo", () => {
    expect(per(pacoteColapso(4, 20)).FISICA).toBe(-15); // 4 < 4,67
    expect(per(pacoteColapso(5, 20)).FISICA).toBe(0); // 5 >= 4,67
  });

  it("MOV -1 enquanto o PM está abaixo de 1/3 do alvo", () => {
    expect(pacoteColapso(2, 20).movFlat).toBe(-1); // 2 < 2,33
    expect(pacoteColapso(3, 20).movFlat).toBe(0);
  });
});
