import { describe, it, expect } from "vitest";
import { valorInicialPericia, periciaEhMagica, periciaEfetiva, metade, quinto } from "./pericias";
import { pacote, somarPacotes } from "./modificadores";
import { pacoteSanidade } from "./sanidade";
import { pacoteRacaFixo } from "./raca";

describe("valorInicialPericia", () => {
  it("número fixo", () => {
    expect(valorInicialPericia(15, { DES: 90 })).toBe(15);
    expect(valorInicialPericia(0, {})).toBe(0);
  });

  it("DES_METADE acompanha a DES digitada, arredondando para baixo", () => {
    expect(valorInicialPericia("DES_METADE", { DES: 50 })).toBe(25);
    expect(valorInicialPericia("DES_METADE", { DES: 51 })).toBe(25);
  });

  it("EDU acompanha a EDU digitada", () => {
    expect(valorInicialPericia("EDU", { EDU: 60 })).toBe(60);
  });

  it("fórmula desconhecida ou atributos ausentes valem 0", () => {
    expect(valorInicialPericia("XYZ", {})).toBe(0);
    expect(valorInicialPericia("EDU", undefined)).toBe(0);
  });
});

describe("periciaEhMagica", () => {
  it.each([
    ["CACADOR", "Furtividade", "FISICA", true],
    ["CACADOR", "Lutar (Espada)", "COMBATE", true],
    ["CACADOR", "Ocultismo", "MENTAL", true],
    ["CACADOR", "Charme", "INTERPESSOAL", true],
    ["CACADOR", "Primórdios", "DESCONHECIDA", false],
    ["VAMPIRO", "Furtividade", "FISICA", true],
    ["VAMPIRO", "Lutar (Espada)", "COMBATE", false],
    ["LOBISOMEM", "Escalar", "FISICA", true],
    ["LOBISOMEM", "Lutar (Espada)", "COMBATE", true],
    ["LOBISOMEM", "Lidar com Animais", "MENTAL", true],
    ["LOBISOMEM", "Ocultismo", "MENTAL", false],
    ["HUMANO", "Furtividade", "FISICA", false],
    ["BRUXO", "Ocultismo", "MENTAL", false],
    ["VIAJANTE", "Ocultismo", "MENTAL", false],
    [null, "Furtividade", "FISICA", false],
  ])("%s / %s (%s) => %s", (raca, nome, categoria, esperado) => {
    expect(periciaEhMagica(nome, categoria, raca)).toBe(esperado);
  });
});

describe("periciaEfetiva", () => {
  const sem = pacote();
  const furtividade = { nome: "Furtividade", categoria: "FISICA", valor: 40, exigePrecisao: true };
  const escalar = { nome: "Escalar", categoria: "FISICA", valor: 40, exigePrecisao: false };
  const briga = { nome: "Lutar (Briga)", categoria: "COMBATE", valor: 40, exigePrecisao: true };
  const primordios = { nome: "Primórdios", categoria: "DESCONHECIDA", valor: 10, exigePrecisao: false };

  it("sem modificadores devolve o valor", () => {
    expect(periciaEfetiva(furtividade, sem)).toBe(40);
  });

  it("soma da categoria", () => {
    expect(periciaEfetiva(escalar, pacote({ pericias: { FISICA: -5 } }))).toBe(35);
  });

  it("Alerta Vermelho: Física só com precisão, Combate sempre", () => {
    const p = pacoteSanidade("ALERTA_VERMELHO");
    expect(periciaEfetiva(furtividade, p)).toBe(30);
    expect(periciaEfetiva(escalar, p)).toBe(40);
    expect(periciaEfetiva(briga, p)).toBe(30);
  });

  it("Primórdios (sem categoria) não recebe modificador de categoria", () => {
    expect(periciaEfetiva(primordios, pacoteSanidade("COLAPSO_MENTAL"))).toBe(10);
    expect(periciaEfetiva(primordios, pacoteRacaFixo("CACADOR"))).toBe(10);
  });

  it("bônus por nome (Lidar com Animais do Lobisomem)", () => {
    const animais = { nome: "Lidar com Animais", categoria: "MENTAL", valor: 5, exigePrecisao: false };
    expect(periciaEfetiva(animais, pacoteRacaFixo("LOBISOMEM"))).toBe(25);
  });

  it("nunca fica abaixo de 0", () => {
    expect(periciaEfetiva({ ...escalar, valor: 5 }, pacote({ pericias: { FISICA: -20 } }))).toBe(0);
  });

  it("multiplicador (Vampiro): aplicado depois da soma, arredondando para baixo uma vez", () => {
    const p = somarPacotes(pacoteRacaFixo("VAMPIRO")); // Física +20
    expect(periciaEfetiva({ ...escalar, valor: 20 }, p)).toBe(40);
    expect(periciaEfetiva({ ...escalar, valor: 20 }, p, 0.75)).toBe(30);
    expect(periciaEfetiva({ ...escalar, valor: 20 }, p, 0.5)).toBe(20);
    expect(periciaEfetiva({ ...escalar, valor: 20 }, p, 0.375)).toBe(15);
    expect(periciaEfetiva({ ...escalar, valor: 21 }, p, 0.375)).toBe(15); // floor(15,375)
  });
});

describe("metade e quinto", () => {
  it("arredondam para baixo", () => {
    expect(metade(51)).toBe(25);
    expect(quinto(49)).toBe(9);
    expect(quinto(0)).toBe(0);
  });
});
