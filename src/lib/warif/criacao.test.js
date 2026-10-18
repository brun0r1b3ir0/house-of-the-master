import { describe, it, expect } from "vitest";
import {
  CRIACAO,
  atributosIniciais,
  somaAtributos,
  pontosRestantes,
  maximoAtual,
  ajustarAtributo,
  validarAtributos,
  periciaPermitida,
  periciasDaRaca,
  pontosProfissao,
  pontosInteresse,
  validarProfissao,
  SEM_GANHOS,
  orcamentos,
  normalizarGanhos,
  pontosRestantesPericias,
  maximoGanho,
  ajustarGanho,
  valorFinalPericia,
  validarPericias,
  ganhosParaEnvio,
  montarEnvio,
} from "./criacao";

describe("criação: atributos", () => {
  it("começa com 15 em tudo e 340 pontos sobrando", () => {
    const a = atributosIniciais();
    expect(Object.keys(a)).toHaveLength(8);
    expect(somaAtributos(a)).toBe(120);
    expect(pontosRestantes(a)).toBe(340);
  });

  it("sobe um atributo até o máximo de 90", () => {
    const a = ajustarAtributo(atributosIniciais(), "FOR", 200);
    expect(a.FOR).toBe(90);
    expect(pontosRestantes(a)).toBe(265);
  });

  it("não deixa baixar de 15", () => {
    expect(ajustarAtributo(atributosIniciais(), "FOR", 3).FOR).toBe(15);
  });

  it("não deixa passar dos 460 no total", () => {
    let a = atributosIniciais();
    for (const k of ["FOR", "CON", "TAM", "DES"]) a = ajustarAtributo(a, k, 90); // +300
    expect(pontosRestantes(a)).toBe(40);
    a = ajustarAtributo(a, "APA", 90);
    expect(a.APA).toBe(55); // 15 + 40 que sobravam
    expect(pontosRestantes(a)).toBe(0);
    expect(ajustarAtributo(a, "INT", 60).INT).toBe(15); // sem folga
  });

  it("baixar um atributo devolve os pontos", () => {
    let a = ajustarAtributo(atributosIniciais(), "FOR", 60);
    a = ajustarAtributo(a, "FOR", 30);
    expect(pontosRestantes(a)).toBe(340 - 15);
  });

  it("maximoAtual considera a folga", () => {
    const a = ajustarAtributo(atributosIniciais(), "FOR", 50);
    expect(maximoAtual(a, "FOR")).toBe(90);
    expect(maximoAtual(a, "CON")).toBe(90); // folga 305, limite 90
  });

  it("ignora chave inválida e valor não numérico", () => {
    const a = atributosIniciais();
    expect(ajustarAtributo(a, "XXX", 50)).toBe(a);
    expect(ajustarAtributo(a, "FOR", "abc")).toBe(a);
  });

  it("devolve o mesmo objeto quando nada muda", () => {
    const a = atributosIniciais();
    expect(ajustarAtributo(a, "FOR", 15)).toBe(a);
  });

  it("validar: incompleto acusa os pontos restantes", () => {
    const v = validarAtributos(atributosIniciais());
    expect(v.ok).toBe(false);
    expect(v.restante).toBe(340);
  });

  it("validar: 460 exatos e dentro dos limites está ok", () => {
    // 90*4 = 360 + 100 nos outros 4 (25 cada)
    const a = { FOR: 90, CON: 90, TAM: 90, DES: 90, APA: 25, INT: 25, POD: 25, EDU: 25 };
    expect(somaAtributos(a)).toBe(460);
    expect(validarAtributos(a)).toEqual({ ok: true, restante: 0, erros: [] });
  });

  it("validar: acusa valor fora dos limites e excesso", () => {
    const a = { FOR: 95, CON: 10, TAM: 90, DES: 90, APA: 90, INT: 90, POD: 15, EDU: 15 };
    const v = validarAtributos(a);
    expect(v.ok).toBe(false);
    expect(v.erros.join(" ")).toMatch(/FOR não pode passar de 90/);
    expect(v.erros.join(" ")).toMatch(/CON não pode ser menor que 15/);
  });

  it("constantes da criação", () => {
    expect(CRIACAO).toMatchObject({ TOTAL_ATRIBUTOS: 460, MIN_ATRIBUTO: 15, MAX_ATRIBUTO_INICIAL: 90, TETO_PERICIA: 80 });
  });
});

const catalogo = [
  { nome: "Furtividade", categoria: "FISICA" },
  { nome: "Olfato", categoria: "FISICA" },
  { nome: "Investigar", categoria: "MENTAL" },
  { nome: "Psicologia", categoria: "MENTAL" },
  { nome: "Ocultismo", categoria: "MENTAL" },
  { nome: "Persuasão", categoria: "INTERPESSOAL" },
  { nome: "Intimidação", categoria: "INTERPESSOAL" },
  { nome: "Armas de Fogo", categoria: "COMBATE" },
  { nome: "Briga", categoria: "COMBATE" },
];
const sete = ["Furtividade", "Investigar", "Psicologia", "Ocultismo", "Persuasão", "Armas de Fogo", "Briga"];

describe("criação: perícias por raça", () => {
  it("Olfato só para Lobisomem", () => {
    expect(periciaPermitida("Olfato", "LOBISOMEM")).toBe(true);
    expect(periciaPermitida("olfato", "HUMANO")).toBe(false);
    expect(periciaPermitida("Olfato", null)).toBe(false);
    expect(periciaPermitida("Briga", null)).toBe(true);
  });

  it("Primórdios nunca aparece na criação, para nenhuma raça", () => {
    for (const raca of ["HUMANO", "CACADOR", "BRUXO", "VAMPIRO", "LOBISOMEM", "VIAJANTE", null]) {
      expect(periciaPermitida("Primórdios", raca)).toBe(false);
    }
    expect(periciaPermitida("primordios", "BRUXO")).toBe(false);
    const cat = [{ nome: "Primórdios", categoria: "DESCONHECIDA" }, { nome: "Briga", categoria: "COMBATE" }];
    expect(periciasDaRaca(cat, "BRUXO").map((p) => p.nome)).toEqual(["Briga"]);
  });

  it("filtra o catálogo pela raça", () => {
    expect(periciasDaRaca(catalogo, "HUMANO").map((p) => p.nome)).not.toContain("Olfato");
    expect(periciasDaRaca(catalogo, "LOBISOMEM").map((p) => p.nome)).toContain("Olfato");
    expect(periciasDaRaca(undefined, "HUMANO")).toEqual([]);
  });
});

describe("criação: pontos", () => {
  const a = { FOR: 40, CON: 30, TAM: 30, DES: 62, APA: 50, INT: 70, POD: 40, EDU: 55 };

  it("profissão = seletor 1 × 2 + seletor 2 × 2", () => {
    expect(pontosProfissao(a, "DES", "EDU")).toBe(62 * 2 + 55 * 2);
    expect(pontosProfissao(a, "FOR", "INT")).toBe(40 * 2 + 70 * 2);
  });

  it("EDU×4 e INT×4 saem de repetir o atributo nos dois seletores", () => {
    expect(pontosProfissao(a, "EDU", "EDU")).toBe(55 * 4);
    expect(pontosProfissao(a, "INT", "INT")).toBe(70 * 4);
  });

  it("seletor inválido ou vazio vale zero", () => {
    expect(pontosProfissao(a, "DES", "DES")).toBe(0); // 2º seletor só EDU ou INT
    expect(pontosProfissao(a, "", "EDU")).toBe(0);
    expect(pontosProfissao(a, "FOR", null)).toBe(0);
    expect(pontosProfissao(a, "POD", "EDU")).toBe(0); // POD não é opção do 1º seletor
  });

  it("interesse = INT × 2", () => {
    expect(pontosInteresse(a)).toBe(140);
    expect(pontosInteresse(undefined)).toBe(0);
  });
});

describe("criação: validar profissão", () => {
  const ok = { principal: "DES", secundario: "EDU", pericias: sete };

  it("escolha completa é válida", () => {
    expect(validarProfissao(ok, catalogo, "HUMANO")).toEqual({ ok: true, erros: [] });
  });

  it("exige os dois seletores", () => {
    const v = validarProfissao({ ...ok, principal: "", secundario: "DES" }, catalogo, "HUMANO");
    expect(v.ok).toBe(false);
    expect(v.erros).toHaveLength(2);
  });

  it("exige exatamente 7 perícias", () => {
    const v = validarProfissao({ ...ok, pericias: sete.slice(0, 5) }, catalogo, "HUMANO");
    expect(v.ok).toBe(false);
    expect(v.erros.join(" ")).toMatch(/faltam 2/);
  });

  it("exige ao menos uma Interpessoal", () => {
    const semInter = ["Furtividade", "Investigar", "Psicologia", "Ocultismo", "Armas de Fogo", "Briga", "Olfato"];
    const v = validarProfissao({ ...ok, pericias: semInter }, catalogo, "LOBISOMEM");
    expect(v.ok).toBe(false);
    expect(v.erros.join(" ")).toMatch(/Interpessoal/);
  });

  it("Olfato na profissão: ok para Lobisomem, inválido para outras raças", () => {
    const comOlfato = ["Olfato", "Investigar", "Psicologia", "Ocultismo", "Persuasão", "Armas de Fogo", "Briga"];
    expect(validarProfissao({ ...ok, pericias: comOlfato }, catalogo, "LOBISOMEM").ok).toBe(true);
    const v = validarProfissao({ ...ok, pericias: comOlfato }, catalogo, "HUMANO");
    expect(v.ok).toBe(false);
    expect(v.erros.join(" ")).toMatch(/Olfato/);
  });

  it("recusa repetidas", () => {
    const v = validarProfissao({ ...ok, pericias: [...sete.slice(0, 6), "Furtividade"] }, catalogo, "HUMANO");
    expect(v.ok).toBe(false);
    expect(v.erros.join(" ")).toMatch(/repetidas/);
  });
});

describe("criação: distribuição nas perícias", () => {
  const attrs = { FOR: 40, CON: 30, TAM: 30, DES: 40, APA: 30, INT: 20, POD: 30, EDU: 20 };
  const cat = [
    { nome: "Furtividade", categoria: "FISICA", valorInicial: 10 },
    { nome: "Briga", categoria: "COMBATE", valorInicial: 25 },
    { nome: "Investigar", categoria: "MENTAL", valorInicial: 5 },
    { nome: "Psicologia", categoria: "MENTAL", valorInicial: 10 },
    { nome: "Persuasão", categoria: "INTERPESSOAL", valorInicial: 15 },
    { nome: "Esquivar", categoria: "COMBATE", valorInicial: "DES_METADE" },
    { nome: "Olfato", categoria: "FISICA", valorInicial: 0 },
    { nome: "Primórdios", categoria: "DESCONHECIDA", valorInicial: 0 },
  ];
  // profissão: DES×2 + EDU×2 = 120 pontos; interesse: INT×2 = 40
  const ctx = {
    attrs,
    principal: "DES",
    secundario: "EDU",
    pericias: ["Furtividade", "Briga", "Investigar", "Persuasão"],
    catalogo: cat,
    raca: "HUMANO",
  };
  const vazio = () => ({ profissao: {}, interesse: {} });

  it("orçamentos: profissão e interesse", () => {
    expect(orcamentos(attrs, "DES", "EDU")).toEqual({ profissao: 120, interesse: 40 });
  });

  it("começa sem nada distribuído e com tudo por gastar", () => {
    expect(pontosRestantesPericias(SEM_GANHOS, ctx)).toEqual({ profissao: 120, interesse: 40 });
    expect(validarPericias(vazio(), ctx).ok).toBe(false);
  });

  it("valor final = inicial + profissão + interesse (inclui fórmulas como Esquivar)", () => {
    const g = { profissao: { Briga: 30 }, interesse: { Briga: 5, Esquivar: 10 } };
    expect(valorFinalPericia("Briga", g, ctx)).toBe(25 + 30 + 5);
    expect(valorFinalPericia("Esquivar", g, ctx)).toBe(20 + 10); // DES 40 / 2 = 20
  });

  it("não deixa gastar mais que o orçamento do bolso", () => {
    let g = ajustarGanho(vazio(), "profissao", "Furtividade", 70, ctx);
    expect(g.profissao.Furtividade).toBe(70);
    g = ajustarGanho(g, "profissao", "Briga", 55, ctx); // teto 80 - 25 = 55; restam 50
    expect(g.profissao.Briga).toBe(50);
    expect(pontosRestantesPericias(g, ctx).profissao).toBe(0);
  });

  it("respeita o teto de 80 no valor final, somando os dois bolsos", () => {
    let g = ajustarGanho(vazio(), "interesse", "Furtividade", 30, ctx); // 10 + 30 = 40
    g = ajustarGanho(g, "profissao", "Furtividade", 100, ctx);
    expect(g.profissao.Furtividade).toBe(40); // 80 - 10 - 30
    expect(valorFinalPericia("Furtividade", g, ctx)).toBe(80);
  });

  it("profissão só aceita as 7 escolhidas; interesse aceita qualquer uma", () => {
    expect(ajustarGanho(vazio(), "profissao", "Psicologia", 10, ctx).profissao).toEqual({});
    expect(ajustarGanho(vazio(), "interesse", "Psicologia", 10, ctx).interesse).toEqual({ Psicologia: 10 });
  });

  it("Primórdios nunca recebe pontos; Olfato só do Lobisomem", () => {
    expect(maximoGanho(vazio(), "interesse", "Primórdios", ctx)).toBe(0);
    expect(maximoGanho(vazio(), "interesse", "Olfato", ctx)).toBe(0);
    const lobo = { ...ctx, raca: "LOBISOMEM", pericias: [...ctx.pericias.slice(0, 3), "Olfato"] };
    expect(maximoGanho(vazio(), "profissao", "Olfato", lobo)).toBeGreaterThan(0);
    expect(maximoGanho(vazio(), "interesse", "Olfato", lobo)).toBeGreaterThan(0);
  });

  it("ajustar para zero remove a perícia do mapa", () => {
    let g = ajustarGanho(vazio(), "interesse", "Briga", 10, ctx);
    g = ajustarGanho(g, "interesse", "Briga", 0, ctx);
    expect(g.interesse).toEqual({});
  });

  it("normalizar: tira o que saiu da profissão e o que a raça não permite", () => {
    const g = { profissao: { Briga: 30, Psicologia: 20 }, interesse: { Olfato: 10, Briga: 5 } };
    const n = normalizarGanhos(g, ctx);
    expect(n.profissao).toEqual({ Briga: 30 });
    expect(n.interesse).toEqual({ Briga: 5 });
  });

  it("normalizar: se os atributos baixam, o orçamento encolhe e os pontos sobrando saem", () => {
    const g = { profissao: { Furtividade: 70, Briga: 50 }, interesse: { Investigar: 40 } };
    const menor = { ...ctx, attrs: { ...attrs, EDU: 10, INT: 10 } }; // profissão 100, interesse 20
    const n = normalizarGanhos(g, menor);
    expect(pontosRestantesPericias(n, menor)).toEqual({ profissao: 0, interesse: 0 });
    expect(n.interesse.Investigar).toBe(20);
  });

  it("normalizar: se o valor inicial sobe (Esquivar acompanha DES), o teto de 80 é reaplicado", () => {
    const alto = { ...ctx, attrs: { ...attrs, DES: 90 } }; // Esquivar inicia em 45
    const n = normalizarGanhos({ profissao: {}, interesse: { Esquivar: 40 } }, alto);
    expect(n.interesse.Esquivar).toBe(35);
  });

  it("completa só quando os dois bolsos zeram", () => {
    let g = vazio();
    g = ajustarGanho(g, "profissao", "Furtividade", 70, ctx);
    g = ajustarGanho(g, "profissao", "Briga", 50, ctx);
    expect(validarPericias(g, ctx).ok).toBe(false); // interesse ainda tem 40
    g = ajustarGanho(g, "interesse", "Psicologia", 40, ctx);
    expect(validarPericias(g, ctx)).toMatchObject({ ok: true, restante: { profissao: 0, interesse: 0 } });
  });

  it("sobra aceita só quando o teto de 80 impede de colocar em qualquer perícia", () => {
    // catálogo mínimo: uma perícia da profissão com inicial 70 -> cabem só 10 pontos
    const apertado = { ...ctx, catalogo: [{ nome: "X", categoria: "MENTAL", valorInicial: 70 }], pericias: ["X"] };
    let g = ajustarGanho(vazio(), "profissao", "X", 100, apertado);
    g = ajustarGanho(g, "interesse", "X", 100, apertado);
    expect(valorFinalPericia("X", g, apertado)).toBe(80);
    expect(validarPericias(g, apertado).ok).toBe(true);
  });

  it("ganhosParaEnvio soma os dois bolsos por perícia", () => {
    const g = { profissao: { Briga: 30, Furtividade: 10 }, interesse: { Briga: 5, Psicologia: 7 } };
    expect(ganhosParaEnvio(g)).toEqual({ Briga: 35, Furtividade: 10, Psicologia: 7 });
  });
});

describe("criação: corpo do envio", () => {
  it("monta exatamente o contrato do backend, sem campos extras", () => {
    const corpo = montarEnvio({
      atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 60, extra: 1 },
      profissao: { principal: "DES", secundario: "EDU", pericias: ["A", "B"], lixo: true },
      ganhos: { profissao: { A: 10 }, interesse: { B: 5 }, outro: {} },
    });
    expect(Object.keys(corpo).sort()).toEqual(["atributos", "ganhos", "profissao"]);
    expect(Object.keys(corpo.atributos)).toHaveLength(8);
    expect(corpo.profissao).toEqual({ principal: "DES", secundario: "EDU", pericias: ["A", "B"] });
    expect(corpo.ganhos).toEqual({ profissao: { A: 10 }, interesse: { B: 5 } });
  });
});