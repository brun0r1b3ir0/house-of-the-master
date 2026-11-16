import { describe, it, expect } from "vitest";
import { calcularEvolucao } from "./evolucao";

const sistema = {
  pericias: [
    { nome: "Briga", categoria: "COMBATE", valorInicial: 25 },
    { nome: "Furtividade", categoria: "FISICA", valorInicial: 10 },
    { nome: "Esquivar", categoria: "COMBATE", valorInicial: "DES_METADE" },
    { nome: "Psicologia", categoria: "MENTAL", valorInicial: 10 },
  ],
};
const attrs = { FOR: 50, CON: 50, TAM: 50, DES: 40, APA: 50, INT: 50, POD: 50, EDU: 50 };

function ficha(extra = {}) {
  return {
    estado: {
      atributos: { ...attrs },
      criacao: {
        concluida: true,
        snapshot: { atributos: { ...attrs }, ganhos: { profissao: { Briga: 30 }, interesse: { Briga: 5, Furtividade: 10 } } },
      },
    },
    pericias: [
      { nome: "Briga", ganho: 35, ganhoTreino: 0 },
      { nome: "Furtividade", ganho: 10, ganhoTreino: 0 },
      { nome: "Esquivar", ganho: 0, ganhoTreino: 0 },
      { nome: "Psicologia", ganho: 0, ganhoTreino: 0 },
    ],
    ...extra,
  };
}

describe("calcularEvolucao", () => {
  it("sem criação concluída não há evolução", () => {
    expect(calcularEvolucao({ estado: { atributos: attrs } }, sistema)).toBeNull();
    expect(calcularEvolucao({ estado: { atributos: attrs, criacao: { concluida: false } } }, sistema)).toBeNull();
    expect(calcularEvolucao(undefined, sistema)).toBeNull();
  });

  it("recém criada: tudo igual, nenhum ponto ganho", () => {
    const e = calcularEvolucao(ficha(), sistema);
    expect(e.totais).toEqual({ pontosCriacao: 45, pontosGanhos: 0 });
    expect(e.atributos.every((a) => a.diff === 0)).toBe(true);
    expect(e.pericias.map((p) => p.nome).sort()).toEqual(["Briga", "Furtividade"]); // só as que receberam pontos
    expect(e.pericias.find((p) => p.nome === "Briga")).toMatchObject({ criacao: 60, atual: 60, diff: 0 });
  });

  it("mostra o que cresceu depois (ganho, com o treino dentro) e perícias novas", () => {
    const f = ficha();
    f.pericias[0].ganho = 43; // Briga +8, dos quais 3 vieram de treino
    f.pericias[0].ganhoTreino = 3; // só registra a parte do ganho que veio de treino: não soma de novo
    f.pericias[3].ganho = 8; // Psicologia nova
    const e = calcularEvolucao(f, sistema);
    expect(e.pericias[0]).toMatchObject({ nome: "Briga", criacao: 60, atual: 68, diff: 8 });
    expect(e.pericias.find((p) => p.nome === "Psicologia")).toMatchObject({ criacao: 10, atual: 18, diff: 8 });
    expect(e.totais.pontosGanhos).toBe(16);
  });

  it("atributos: compara o valor digitado de hoje com o da criação", () => {
    const f = ficha();
    f.estado.atributos.FOR = 55;
    f.estado.atributos.TAM = 45; // perda por fome aparece como diferença negativa
    const e = calcularEvolucao(f, sistema);
    expect(e.atributos.find((a) => a.chave === "FOR")).toMatchObject({ criacao: 50, atual: 55, diff: 5 });
    expect(e.atributos.find((a) => a.chave === "TAM").diff).toBe(-5);
  });

  it("perícia com fórmula acompanha o atributo (Esquivar = DES/2)", () => {
    const f = ficha();
    f.pericias[2].ganho = 5; // Esquivar passa a ser notada por ter ganho depois
    f.estado.atributos.DES = 50; // inicial sobe de 20 para 25
    const e = calcularEvolucao(f, sistema);
    expect(e.pericias.find((p) => p.nome === "Esquivar")).toMatchObject({ criacao: 20, atual: 30, diff: 10 });
  });
});
