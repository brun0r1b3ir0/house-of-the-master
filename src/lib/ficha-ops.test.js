import { describe, it, expect } from "vitest";
import { aplicarOp, aplicarOps, criarFila } from "./ficha-ops";

const ficha = () => ({
  id: "f1",
  nome: "Ana",
  ocupacao: null,
  raca: "HUMANO",
  estado: {
    atributos: { FOR: 50, DES: 50 },
    atuais: { PV: 10 },
    contadores: { fome: 0 },
    flags: { verbena: false },
    condicoes: {},
    overrides: { PV: 12 },
    regenOverrides: {},
  },
  pericias: [
    { nome: "Esquivar", ganho: 0 },
    { nome: "Charme", ganho: 5 },
  ],
});

describe("aplicarOp", () => {
  it("campos da raiz: nome, ocupacao, raca", () => {
    expect(aplicarOp(ficha(), "nome", "Bia").nome).toBe("Bia");
    expect(aplicarOp(ficha(), "ocupacao", "Médica").ocupacao).toBe("Médica");
    expect(aplicarOp(ficha(), "raca", null).raca).toBeNull();
  });

  it("campos do estado, com caminho", () => {
    const f = aplicarOp(ficha(), "atributos.FOR", 70);
    expect(f.estado.atributos).toEqual({ FOR: 70, DES: 50 });
    expect(aplicarOp(ficha(), "atuais.PV", 4).estado.atuais.PV).toBe(4);
    expect(aplicarOp(ficha(), "contadores.fome", 3).estado.contadores.fome).toBe(3);
    expect(aplicarOp(ficha(), "flags.verbena", true).estado.flags.verbena).toBe(true);
    expect(aplicarOp(ficha(), "estagioSanidade", "INFERNO").estado.estagioSanidade).toBe("INFERNO");
    expect(aplicarOp(ficha(), "perdaPermanenteTam", 2).estado.perdaPermanenteTam).toBe(2);
  });

  it("cria o grupo se ele ainda não existir", () => {
    expect(aplicarOp(ficha(), "alcateia.ativa", true).estado.alcateia).toEqual({ ativa: true });
  });

  it("ganho de perícia só mexe na perícia certa", () => {
    const f = aplicarOp(ficha(), "pericias.Charme.ganho", 20);
    expect(f.pericias).toEqual([
      { nome: "Esquivar", ganho: 0 },
      { nome: "Charme", ganho: 20 },
    ]);
  });

  it("overrides: valor define, null remove", () => {
    const comMov = aplicarOp(ficha(), "overrides.MOV", 9);
    expect(comMov.estado.overrides).toEqual({ PV: 12, MOV: 9 });
    const sem = aplicarOp(comMov, "overrides.PV", null);
    expect(sem.estado.overrides).toEqual({ MOV: 9 });
    expect(aplicarOp(ficha(), "regenOverrides.PE", 3).estado.regenOverrides).toEqual({ PE: 3 });
  });

  it("não altera a ficha original", () => {
    const original = ficha();
    aplicarOp(original, "atributos.FOR", 99);
    aplicarOp(original, "pericias.Charme.ganho", 99);
    aplicarOp(original, "nome", "X");
    expect(original.estado.atributos.FOR).toBe(50);
    expect(original.pericias[1].ganho).toBe(5);
    expect(original.nome).toBe("Ana");
  });
});

describe("aplicarOps", () => {
  it("aplica em ordem", () => {
    const f = aplicarOps(ficha(), [
      { campo: "atuais.PV", valor: 3 },
      { campo: "atuais.PV", valor: 7 },
    ]);
    expect(f.estado.atuais.PV).toBe(7);
  });
});

describe("criarFila", () => {
  it("o mesmo campo vira uma operação só, vale a última", () => {
    const fila = criarFila();
    fila.adicionar("atuais.PV", 9);
    fila.adicionar("atuais.PE", 5);
    fila.adicionar("atuais.PV", 8);
    expect(fila.tamanho()).toBe(2);
    expect(fila.ops()).toEqual([
      { campo: "atuais.PE", valor: 5 },
      { campo: "atuais.PV", valor: 8 },
    ]);
  });

  it("tirarLote respeita o limite e deixa o resto", () => {
    const fila = criarFila();
    for (let i = 0; i < 250; i++) fila.adicionar(`contadores.c${i}`, i);
    expect(fila.tirarLote(100)).toHaveLength(100);
    expect(fila.tamanho()).toBe(150);
    expect(fila.tirarLote(100)).toHaveLength(100);
    expect(fila.tirarLote(100)).toHaveLength(50);
    expect(fila.tamanho()).toBe(0);
  });

  it("limpar esvazia", () => {
    const fila = criarFila();
    fila.adicionar("nome", "A");
    fila.limpar();
    expect(fila.tamanho()).toBe(0);
  });
});