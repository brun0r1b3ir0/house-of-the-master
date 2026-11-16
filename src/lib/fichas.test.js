import { describe, it, expect } from "vitest";
import { RACAS, rotuloRaca } from "./fichas";
import { acentoDaRaca } from "./ficha-visual";

describe("RACAS (opções de raça)", () => {
  it("não tem opção vazia nem \"Sem raça\"", () => {
    for (const r of RACAS) {
      expect(r.valor.trim()).not.toBe("");
      expect(r.rotulo.toLowerCase()).not.toContain("sem raça");
    }
  });

  it("tem as seis raças do sistema, começando por Humano", () => {
    expect(RACAS.map((r) => r.valor)).toEqual(["HUMANO", "CACADOR", "BRUXO", "VAMPIRO", "LOBISOMEM", "VIAJANTE"]);
  });
});

describe("raça nula na exibição vale como Humano", () => {
  it.each([null, undefined, "", "   "])("rotuloRaca(%j) = Humano", (r) => {
    expect(rotuloRaca(r)).toBe("Humano");
  });

  it("rótulos das demais raças não mudam", () => {
    expect(rotuloRaca("VAMPIRO")).toBe("Vampiro");
    expect(rotuloRaca("CACADOR")).toBe("Caçador");
  });

  it.each([null, undefined, "", "   "])("acentoDaRaca(%j) = cor do Humano", (r) => {
    expect(acentoDaRaca(r)).toEqual(acentoDaRaca("HUMANO"));
  });

  it("raças sobrenaturais mantêm a própria cor", () => {
    expect(acentoDaRaca("VAMPIRO")).not.toEqual(acentoDaRaca("HUMANO"));
  });
});
