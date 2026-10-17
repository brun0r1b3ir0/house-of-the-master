import { describe, it, expect } from "vitest";
import { calcularEfeitos, atributosEfetivos } from "./efeitos";

// Ficha "tudo 50", Mente Sã, sem condições. Sobrescreve só o que o teste precisa.
function estadoBase(extra = {}) {
  return {
    atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50 },
    atuais: { PV: 10, PE: 10, PM: 10, SAN: 100, SRT: 100 },
    estagioSanidade: "MENTE_SA",
    contadores: { exaustao: 0, fome: 0, sede: 0, debilitantes: 0, frio: 0, sangria: 0 },
    perdaPermanenteTam: 0,
    flags: { verbena: false, colapsoMagico: false },
    alcateia: { ativa: false, membros: 0, papel: "membro", linhagem: "normal" },
    abates: { vampiros: 0, outros: 0 },
    overrides: {},
    ...extra,
  };
}
const com = (base, extra) => ({ ...base, ...extra });

describe("atributos efetivos: sem raça e Humano", () => {
  it("ficha nova: efetivo = digitado", () => {
    for (const raca of [null, "HUMANO"]) {
      expect(atributosEfetivos(estadoBase(), raca)).toEqual({
        FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50,
      });
    }
  });

  it("condições clássicas somam (Estado Crítico + Exaustão 1)", () => {
    const e = estadoBase({ estagioSanidade: "ESTADO_CRITICO", contadores: { exaustao: 1 } });
    const a = atributosEfetivos(e, "HUMANO");
    expect(a.CON).toBe(50 - 10 - 5);
    expect(a.DES).toBe(50 - 10 - 10);
    expect(a.APA).toBe(40);
    expect(a.POD).toBe(35);
    expect(a.FOR).toBe(50);
  });

  it("nunca fica abaixo de 0", () => {
    const e = estadoBase({ contadores: { debilitantes: 20 } });
    expect(atributosEfetivos(e, "HUMANO").FOR).toBe(0);
  });

  it("Frio Moderado tira 1/4 da CON efetiva, depois das somas", () => {
    const e = estadoBase({ contadores: { frio: 2, exaustao: 1 } }); // CON: 50-5=45 -> *0,75
    expect(atributosEfetivos(e, null).CON).toBe(33); // floor(33,75)
  });

  it("Frio Crítico fixa a CON em 1", () => {
    expect(atributosEfetivos(estadoBase({ contadores: { frio: 4 } }), null).CON).toBe(1);
  });

  it("o contador de perda de TAM não desconta do efetivo (a perda está no TAM digitado)", () => {
    const e = estadoBase({ contadores: { fome: 5 }, perdaPermanenteTam: 5 });
    expect(atributosEfetivos(e, "HUMANO").TAM).toBe(50);
  });
});

describe("atributos efetivos: Caçador e Lobisomem", () => {
  it("Caçador: +5 em FOR, DES e POD", () => {
    const a = atributosEfetivos(estadoBase(), "CACADOR");
    expect(a).toMatchObject({ FOR: 55, DES: 55, POD: 55, CON: 50, TAM: 50, INT: 50 });
  });

  it("Lobisomem sem Alcateia: +10 em FOR, DES e CON", () => {
    const a = atributosEfetivos(estadoBase(), "LOBISOMEM");
    expect(a).toMatchObject({ FOR: 60, DES: 60, CON: 60, TAM: 50 });
  });

  it("Lobisomem com Alcateia (membro, 6): +6 além dos 10 da raça", () => {
    const e = estadoBase({ alcateia: { ativa: true, membros: 6, papel: "membro", linhagem: "normal" } });
    expect(atributosEfetivos(e, "LOBISOMEM")).toMatchObject({ FOR: 66, DES: 66, CON: 66 });
  });

  it("Lobisomem Alfa (7): TAM +2", () => {
    const e = estadoBase({ alcateia: { ativa: true, membros: 7, papel: "alfa", linhagem: "normal" } });
    expect(atributosEfetivos(e, "LOBISOMEM").TAM).toBe(52);
  });

  it("o Lobisomem sofre Fome e Sede normalmente", () => {
    const e = estadoBase({ contadores: { sede: 1 } });
    expect(atributosEfetivos(e, "LOBISOMEM")).toMatchObject({ INT: 45, CON: 55 });
  });
});

describe("atributos efetivos: Vampiro", () => {
  it("base: FOR e DES 120, CON 60, o resto 50", () => {
    expect(atributosEfetivos(estadoBase(), "VAMPIRO")).toEqual({
      FOR: 120, CON: 60, TAM: 50, DES: 120, APA: 50, INT: 50, POD: 50, EDU: 50,
    });
  });

  it("é imune a Fome, Sede e à perda de TAM", () => {
    const e = estadoBase({ contadores: { fome: 10, sede: 10 }, perdaPermanenteTam: 10 });
    const a = atributosEfetivos(e, "VAMPIRO");
    expect(a.TAM).toBe(50);
    expect(a.INT).toBe(50);
    expect(a.CON).toBe(60);
  });

  it("o Frio continua valendo: Frio Crítico fixa a CON em 1 (vence o +10 da raça)", () => {
    expect(atributosEfetivos(estadoBase({ contadores: { frio: 4 } }), "VAMPIRO").CON).toBe(1);
  });

  it("Sangria 1: só o POD cai (x3/4)", () => {
    const a = atributosEfetivos(estadoBase({ contadores: { sangria: 1 } }), "VAMPIRO");
    expect(a.POD).toBe(37);
    expect(a.FOR).toBe(120);
  });

  it("Sangria 3: POD x1/4", () => {
    expect(atributosEfetivos(estadoBase({ contadores: { sangria: 3 } }), "VAMPIRO").POD).toBe(12);
  });

  it("Sangria 4: demais atributos x3/4, TAM intacto", () => {
    const a = atributosEfetivos(estadoBase({ contadores: { sangria: 4 } }), "VAMPIRO");
    expect(a).toEqual({ FOR: 90, CON: 45, TAM: 50, DES: 90, APA: 37, INT: 37, POD: 12, EDU: 37 });
  });

  it("Sangria 6: x1/4", () => {
    const a = atributosEfetivos(estadoBase({ contadores: { sangria: 6 } }), "VAMPIRO");
    expect(a).toEqual({ FOR: 30, CON: 15, TAM: 50, DES: 30, APA: 12, INT: 12, POD: 12, EDU: 12 });
  });

  it("Sangria 7: redução adicional x3/4 sobre os atributos (exceto POD e TAM)", () => {
    const a = atributosEfetivos(estadoBase({ contadores: { sangria: 7 } }), "VAMPIRO");
    expect(a).toMatchObject({ FOR: 22, CON: 11, INT: 9, POD: 12, TAM: 50 });
  });

  it("Sangria 10: atributos zerados, menos POD (x1/4) e TAM", () => {
    const a = atributosEfetivos(estadoBase({ contadores: { sangria: 10 } }), "VAMPIRO");
    expect(a).toEqual({ FOR: 0, CON: 0, TAM: 50, DES: 0, APA: 0, INT: 0, POD: 12, EDU: 0 });
  });

  it("Verbena: atributos x1/2, exceto TAM e APA", () => {
    const a = atributosEfetivos(estadoBase({ flags: { verbena: true } }), "VAMPIRO");
    expect(a).toEqual({ FOR: 60, CON: 30, TAM: 50, DES: 60, APA: 50, INT: 25, POD: 25, EDU: 25 });
  });

  it("Verbena + Sangria 1: POD x3/4 x1/2", () => {
    const e = estadoBase({ flags: { verbena: true }, contadores: { sangria: 1 } });
    expect(atributosEfetivos(e, "VAMPIRO").POD).toBe(18); // floor(18,75)
  });

  it("Sangria e Verbena de quem não é Vampiro não têm efeito", () => {
    const e = estadoBase({ flags: { verbena: true }, contadores: { sangria: 8 } });
    expect(atributosEfetivos(e, "HUMANO").FOR).toBe(50);
  });
});

describe("atributos efetivos: Colapso Mágico (Bruxo e Viajante)", () => {
  const bruxo = (pm, extra = {}) =>
    estadoBase({ atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 60, EDU: 50 }, atuais: { PV: 10, PE: 10, PM: pm, SAN: 100, SRT: 100 }, ...extra });

  it("PM cheio: sem Colapso", () => {
    const e = bruxo(20);
    const fx = calcularEfeitos(e, "BRUXO");
    expect(fx.colapso).toMatchObject({ ativo: false, pmMax: 20, alvo: 7, mudou: false });
    expect(atributosEfetivos(e, "BRUXO", fx).FOR).toBe(50);
  });

  it("0 PM entra em Colapso mesmo antes de a flag ser gravada", () => {
    const e = bruxo(0);
    const fx = calcularEfeitos(e, "BRUXO");
    expect(fx.colapso.ativo).toBe(true);
    expect(fx.colapso.mudou).toBe(true); // a tela deve gravar a flag
    const a = atributosEfetivos(e, "BRUXO", fx);
    expect(a.CON).toBe(40);
    expect(a.FOR).toBe(25);
    expect(a.DES).toBe(25);
    expect(a.POD).toBe(60); // POD nunca é afetado
    expect(fx.pacote.pericias.FISICA.soma).toBe(-15);
    expect(fx.pacote.movFlat).toBe(-1);
  });

  it("com a flag ligada, o Colapso continua até o PM chegar ao alvo (7)", () => {
    const flags = { verbena: false, colapsoMagico: true };
    expect(calcularEfeitos(bruxo(6, { flags }), "BRUXO").colapso).toMatchObject({ ativo: true, mudou: false });
    const saiu = calcularEfeitos(bruxo(7, { flags }), "BRUXO").colapso;
    expect(saiu).toMatchObject({ ativo: false, mudou: true });
  });

  it("os efeitos vão sumindo: PM 5 só tem o básico, PM 4 já tem Física -15, PM 2 tem MOV -1", () => {
    const flags = { verbena: false, colapsoMagico: true };
    const f5 = calcularEfeitos(bruxo(5, { flags }), "BRUXO").pacote;
    expect(f5.pericias.FISICA.soma).toBe(0);
    expect(f5.movFlat).toBe(0);
    expect(calcularEfeitos(bruxo(4, { flags }), "BRUXO").pacote.pericias.FISICA.soma).toBe(-15);
    expect(calcularEfeitos(bruxo(2, { flags }), "BRUXO").pacote.movFlat).toBe(-1);
  });

  it("Viajante funciona como Bruxo", () => {
    expect(calcularEfeitos(bruxo(0), "VIAJANTE").colapso.ativo).toBe(true);
  });

  it("o PM máx usa o POD efetivo (Estado de Apreço: POD 70 => PM 23, alvo 8)", () => {
    const fx = calcularEfeitos(bruxo(23, { estagioSanidade: "ESTADO_DE_APRECO" }), "BRUXO");
    expect(fx.colapso).toMatchObject({ pmMax: 23, alvo: 8 });
  });

  it("exceção manual de PM máx vale para o alvo", () => {
    const fx = calcularEfeitos(bruxo(0, { overrides: { PM: 9 } }), "BRUXO");
    expect(fx.colapso).toMatchObject({ pmMax: 9, alvo: 3 });
  });

  it("outras raças ignoram a flag de Colapso", () => {
    const e = estadoBase({ flags: { verbena: false, colapsoMagico: true }, atuais: { PV: 10, PE: 10, PM: 0, SAN: 100, SRT: 100 } });
    expect(atributosEfetivos(e, "HUMANO").FOR).toBe(50);
    expect(calcularEfeitos(e, "HUMANO").colapso.ativo).toBe(false);
  });
});

describe("calcularEfeitos", () => {
  it("expõe imunidade e aviso de Linhagem Verdadeira", () => {
    expect(calcularEfeitos(estadoBase(), "VAMPIRO").imuneFomeSede).toBe(true);
    expect(calcularEfeitos(estadoBase(), "HUMANO").imuneFomeSede).toBe(false);
    const e = estadoBase({ alcateia: { ativa: true, membros: 10, papel: "alfa", linhagem: "true" } });
    expect(calcularEfeitos(e, "LOBISOMEM").linhagemNaoImplementada).toBe(true);
  });

  it("não quebra com estado vazio", () => {
    expect(() => atributosEfetivos({}, null)).not.toThrow();
    expect(atributosEfetivos({}, "BRUXO").FOR).toBe(0);
  });
});
