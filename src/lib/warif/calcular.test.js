import { describe, it, expect } from "vitest";
import { calcularFicha } from "./calcular";

const sistema = {
  pericias: [
    { nome: "Furtividade", categoria: "FISICA", valorInicial: 20, exigePrecisao: true },
    { nome: "Escalar", categoria: "FISICA", valorInicial: 20, exigePrecisao: false },
    { nome: "Lutar (Briga)", categoria: "COMBATE", valorInicial: 25, exigePrecisao: true },
    { nome: "Esquivar", categoria: "COMBATE", valorInicial: "DES_METADE", exigePrecisao: true },
    { nome: "Ocultismo", categoria: "MENTAL", valorInicial: 5, exigePrecisao: false },
    { nome: "Língua Nativa (Inglês)", categoria: "MENTAL", valorInicial: "EDU", exigePrecisao: false },
    { nome: "Lidar com Animais", categoria: "MENTAL", valorInicial: 5, exigePrecisao: false },
    { nome: "Charme", categoria: "INTERPESSOAL", valorInicial: 15, exigePrecisao: false },
    { nome: "Primórdios", categoria: "DESCONHECIDA", valorInicial: 0, exigePrecisao: false },
  ],
};

function ficha({ raca = "HUMANO", estado = {}, ganhos = {}, extras = [] } = {}) {
  return {
    raca,
    estado: {
      atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50 },
      atuais: { PV: 10, PE: 10, PM: 10, SAN: 100, SRT: 100 },
      estagioSanidade: "MENTE_SA",
      contadores: { exaustao: 0, fome: 0, sede: 0, debilitantes: 0, frio: 0, sangria: 0 },
      perdaPermanenteTam: 0,
      flags: { verbena: false, colapsoMagico: false },
      alcateia: { ativa: false, membros: 0, papel: "membro", linhagem: "normal" },
      overrides: {},
      ...estado,
    },
    pericias: [
      ...sistema.pericias.map((p) => ({ nome: p.nome, ganho: ganhos[p.nome] ?? 0, ganhoTreino: 0, origem: "CATALOGO" })),
      ...extras,
    ],
  };
}
const pericia = (r, nome) => r.pericias.find((p) => p.nome === nome);

describe("calcularFicha: ficha nova", () => {
  it("Humano 'tudo 50': atributos, derivados e perícias com o valor inicial", () => {
    const r = calcularFicha(ficha(), sistema);
    expect(r.atributos.FOR).toBe(50);
    expect(r.derivados).toMatchObject({ PV: 10, PE: 10, PM: 10, MOV: 8, Corpo: 0 });
    expect(pericia(r, "Furtividade")).toMatchObject({ valorInicial: 20, ganho: 0, valor: 20, efetivo: 20, magica: false });
    expect(pericia(r, "Esquivar")).toMatchObject({ valorInicial: 25, efetivo: 25 });
    expect(pericia(r, "Língua Nativa (Inglês)")).toMatchObject({ valorInicial: 50, efetivo: 50 });
    expect(r.sugestoes).toEqual({});
  });

  it("valor = inicial + ganho", () => {
    const r = calcularFicha(ficha({ ganhos: { Ocultismo: 20 } }), sistema);
    expect(pericia(r, "Ocultismo")).toMatchObject({ valorInicial: 5, ganho: 20, valor: 25, efetivo: 25 });
  });

  it("Esquivar e Língua Nativa acompanham os atributos digitados ao vivo", () => {
    const r = calcularFicha(
      ficha({ estado: { atributos: { FOR: 50, CON: 50, TAM: 50, DES: 80, APA: 50, INT: 50, POD: 50, EDU: 70 } } }),
      sistema,
    );
    expect(pericia(r, "Esquivar").valorInicial).toBe(40);
    expect(pericia(r, "Língua Nativa (Inglês)").valorInicial).toBe(70);
  });

  it("mantém a ordem das perícias da ficha", () => {
    const r = calcularFicha(ficha(), sistema);
    expect(r.pericias.map((p) => p.nome)).toEqual(sistema.pericias.map((p) => p.nome));
  });
});

describe("calcularFicha: condições", () => {
  it("Alerta Vermelho + Exaustão 1 (sem propagação, Física só com precisão)", () => {
    const r = calcularFicha(
      ficha({ estado: { estagioSanidade: "ALERTA_VERMELHO", contadores: { exaustao: 1 } } }),
      sistema,
    );
    expect(pericia(r, "Furtividade").efetivo).toBe(5); // 20 -10 (precisão) -5 (Exaustão)
    expect(pericia(r, "Escalar").efetivo).toBe(15); // 20 -5 (Exaustão), sem precisão
    expect(pericia(r, "Lutar (Briga)").efetivo).toBe(15); // 25 -10
    expect(pericia(r, "Esquivar").efetivo).toBe(15); // inicial 25 (DES digitada), -10
    expect(pericia(r, "Ocultismo").efetivo).toBe(0); // 5 -15 -5, piso 0
    expect(pericia(r, "Charme").efetivo).toBe(0); // 15 -15
    expect(pericia(r, "Primórdios").efetivo).toBe(0); // inicial 0, sem modificador
    expect(r.atributos.DES).toBe(30); // 50 -10 -10
  });

  it("Primórdios fica fora dos modificadores de categoria", () => {
    const r = calcularFicha(ficha({ estado: { estagioSanidade: "COLAPSO_MENTAL" }, ganhos: { Primórdios: 10 } }), sistema);
    expect(pericia(r, "Primórdios")).toMatchObject({ valor: 10, efetivo: 10 });
  });
});

describe("calcularFicha: raças", () => {
  it("Caçador: +5 em todas as categorias e perícias mágicas", () => {
    const r = calcularFicha(ficha({ raca: "CACADOR", ganhos: { Ocultismo: 20 } }), sistema);
    expect(pericia(r, "Ocultismo")).toMatchObject({ valor: 25, efetivo: 30, magica: true });
    expect(pericia(r, "Charme")).toMatchObject({ efetivo: 20, magica: true });
    expect(pericia(r, "Primórdios")).toMatchObject({ efetivo: 0, magica: false });
    expect(r.atributos).toMatchObject({ FOR: 55, DES: 55, POD: 55 });
  });

  it("Lobisomem: +20 em Lidar com Animais por nome", () => {
    const r = calcularFicha(ficha({ raca: "LOBISOMEM" }), sistema);
    expect(pericia(r, "Lidar com Animais")).toMatchObject({ efetivo: 25, magica: true });
    expect(pericia(r, "Escalar")).toMatchObject({ efetivo: 30, magica: true });
    expect(pericia(r, "Ocultismo")).toMatchObject({ efetivo: 5, magica: false });
  });

  it("Vampiro: Física e Combate +20; Sangria 4 e Verbena multiplicam o resultado", () => {
    const base = calcularFicha(ficha({ raca: "VAMPIRO" }), sistema);
    expect(pericia(base, "Escalar").efetivo).toBe(40);
    expect(pericia(base, "Lutar (Briga)")).toMatchObject({ efetivo: 45, magica: true });
    expect(pericia(base, "Ocultismo")).toMatchObject({ efetivo: 5, magica: false });

    const sangue = calcularFicha(ficha({ raca: "VAMPIRO", estado: { contadores: { sangria: 4 } } }), sistema);
    expect(pericia(sangue, "Escalar").efetivo).toBe(30); // 40 x 3/4
    expect(pericia(sangue, "Lutar (Briga)").efetivo).toBe(33); // floor(45 x 3/4) // floor(25 x 3/4)

    const verbena = calcularFicha(
      ficha({ raca: "VAMPIRO", estado: { contadores: { sangria: 4 }, flags: { verbena: true } } }),
      sistema,
    );
    expect(pericia(verbena, "Escalar").efetivo).toBe(15); // 40 x 3/8
    expect(base.derivados.MOV).toBe(12);
  });

  it("Vampiro mumificado com 10 PsG", () => {
    const r = calcularFicha(ficha({ raca: "VAMPIRO", estado: { contadores: { sangria: 10 } } }), sistema);
    expect(r.mumificado).toBe(true);
    expect(pericia(r, "Escalar").efetivo).toBe(10); // 40 x 1/4
  });
});

describe("calcularFicha: sugestões de gravação", () => {
  it("Colapso Mágico: sugere ligar a flag ao chegar a 0 PM", () => {
    const r = calcularFicha(ficha({ raca: "BRUXO", estado: { atuais: { PV: 10, PE: 10, PM: 0, SAN: 100, SRT: 100 } } }), sistema);
    expect(r.colapso.ativo).toBe(true);
    expect(r.sugestoes.colapsoMagico).toBe(true);
  });

  it("Colapso Mágico: sugere desligar quando o PM chega ao alvo", () => {
    const r = calcularFicha(
      ficha({ raca: "BRUXO", estado: { flags: { verbena: false, colapsoMagico: true }, atuais: { PV: 10, PE: 10, PM: 7, SAN: 100, SRT: 100 } } }),
      sistema,
    );
    expect(r.sugestoes.colapsoMagico).toBe(false);
  });

  it("Fome: sugere tirar a perda do TAM digitado (12 PF => -10, TAM 50 => 40)", () => {
    const r = calcularFicha(ficha({ estado: { contadores: { fome: 12 } } }), sistema);
    expect(r.sugestoes.perdaPermanenteTam).toBe(10);
    expect(r.sugestoes.tam).toBe(40);
    expect(r.atributos.TAM).toBe(50); // o efetivo só muda depois que a tela grava o TAM
  });

  it("Fome: só tira a diferença do que já foi tirado", () => {
    const e = { contadores: { fome: 15 }, perdaPermanenteTam: 10, atributos: { FOR: 50, CON: 50, TAM: 40, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50 } };
    const r = calcularFicha(ficha({ estado: e }), sistema);
    expect(r.sugestoes).toMatchObject({ perdaPermanenteTam: 15, tam: 35 });
    expect(r.atributos.TAM).toBe(40);
  });

  it("Fome: respeita o teto de metade do TAM original", () => {
    const e = { contadores: { fome: 100 }, perdaPermanenteTam: 20, atributos: { FOR: 50, CON: 50, TAM: 30, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50 } };
    const r = calcularFicha(ficha({ estado: e }), sistema);
    expect(r.sugestoes).toMatchObject({ perdaPermanenteTam: 25, tam: 25 });
  });

  it("depois de gravado, a fome parada não tira mais TAM", () => {
    const e = { contadores: { fome: 12 }, perdaPermanenteTam: 10, atributos: { FOR: 50, CON: 50, TAM: 40, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50 } };
    const r = calcularFicha(ficha({ estado: e }), sistema);
    expect(r.sugestoes.perdaPermanenteTam).toBeUndefined();
    expect(r.sugestoes.tam).toBeUndefined();
  });

  it("recuperar o TAM (subir o valor digitado) sobe o efetivo junto", () => {
    const e = { contadores: { fome: 12 }, perdaPermanenteTam: 10, atributos: { FOR: 50, CON: 50, TAM: 50, DES: 50, APA: 50, INT: 50, POD: 50, EDU: 50 } };
    expect(calcularFicha(ficha({ estado: e }), sistema).atributos.TAM).toBe(50);
  });

  it("não sugere nada se a perda gravada já é suficiente, nem para o Vampiro", () => {
    const a = calcularFicha(ficha({ estado: { contadores: { fome: 12 }, perdaPermanenteTam: 10 } }), sistema);
    expect(a.sugestoes.perdaPermanenteTam).toBeUndefined();
  });
});

describe("calcularFicha: casos de borda", () => {
  it("perícia fora do catálogo (CUSTOM) começa em 0 e usa a categoria da ficha", () => {
    const r = calcularFicha(
      ficha({ extras: [{ nome: "Pintura", categoria: "MENTAL", ganho: 12, ganhoTreino: 0, origem: "CUSTOM" }] }),
      sistema,
    );
    expect(pericia(r, "Pintura")).toMatchObject({ valorInicial: 0, valor: 12, efetivo: 12, origem: "CUSTOM", exigePrecisao: false });
  });

  it("não quebra com ficha ou catálogo vazios", () => {
    expect(() => calcularFicha({}, {})).not.toThrow();
    expect(() => calcularFicha(undefined, undefined)).not.toThrow();
    expect(calcularFicha({ raca: null, estado: {}, pericias: [] }, sistema).pericias).toEqual([]);
  });

  it("aviso de Linhagem Verdadeira chega até o resultado", () => {
    const r = calcularFicha(
      ficha({ raca: "LOBISOMEM", estado: { alcateia: { ativa: true, membros: 10, papel: "alfa", linhagem: "true" } } }),
      sistema,
    );
    expect(r.linhagemNaoImplementada).toBe(true);
  });
});

describe("calcularFicha: Esquivar do vampiro", () => {
  const comDes = (raca, DES) =>
    ficha({
      raca,
      estado: { atributos: { FOR: 120, CON: 50, TAM: 50, DES, APA: 50, INT: 50, POD: 50, EDU: 50 } },
      ganhos: { Esquivar: 5 },
    });

  it.each([50, 120, 200])("valor inicial é 60 com DES digitada %i", (des) => {
    const e = pericia(calcularFicha(comDes("VAMPIRO", des), sistema), "Esquivar");
    expect(e.valorInicial).toBe(60);
    expect(e.valor).toBe(65);
  });

  it("humano continua com DES / 2", () => {
    expect(pericia(calcularFicha(comDes("HUMANO", 50), sistema), "Esquivar").valorInicial).toBe(25);
    expect(pericia(calcularFicha(comDes("HUMANO", 120), sistema), "Esquivar").valorInicial).toBe(60);
  });
});

describe("calcularFicha: raça nula vale como HUMANO", () => {
  it.each([null, undefined, ""])("ficha com raça %j calcula igual à de Humano", (r) => {
    const estado = { contadores: { exaustao: 1, fome: 4, sede: 0, debilitantes: 0, frio: 0, sangria: 0 } };
    const semRaca = calcularFicha({ ...ficha({ estado, ganhos: { Esquivar: 5 } }), raca: r }, sistema);
    const humano = calcularFicha(ficha({ raca: "HUMANO", estado, ganhos: { Esquivar: 5 } }), sistema);
    expect(semRaca).toEqual(humano);
  });
});

describe("calcularFicha: habilidades, Melhor do Mundo e classe", () => {
  // Perícias CUSTOM (inicial 0) com o ganho = valor base. A Língua Nativa (EDU 50) já conta como 1 perícia 50+.
  const extras = (qtd, valor) =>
    Array.from({ length: qtd }, (_, i) => ({ nome: `Ofício ${i}`, categoria: "MENTAL", ganho: valor, ganhoTreino: 0, origem: "CUSTOM" }));

  it("humano Perito: PE máximo 10 + 3", () => {
    const r = calcularFicha(ficha({ extras: extras(14, 60) }), sistema); // 15 perícias 50+, 29 EH
    expect(r.habilidades.periciasAcima50).toBe(15);
    expect(r.habilidades.eh.total).toBe(29);
    expect(r.habilidades.classe.chave).toBe("PERITO");
    expect(r.derivados.PE).toBe(13);
  });

  it("humano Extraordinário: PE máximo 10 + 11 e perícias marcadas como Melhor do Mundo", () => {
    const r = calcularFicha(ficha({ extras: extras(17, 90) }), sistema);
    expect(r.habilidades.classe.chave).toBe("EXTRAORDINARIO");
    expect(r.habilidades.melhoresDoMundo).toHaveLength(17);
    expect(r.derivados.PE).toBe(21);
    expect(pericia(r, "Ofício 0")).toMatchObject({ melhorDoMundo: true, valor: 90, efetivo: 90 });
    expect(pericia(r, "Charme").melhorDoMundo).toBe(false);
  });

  it("exceção manual de PE não muda com a classe", () => {
    const r = calcularFicha(ficha({ extras: extras(17, 90), estado: { overrides: { PE: 7 } } }), sistema);
    expect(r.habilidades.classe.chave).toBe("EXTRAORDINARIO");
    expect(r.derivados.PE).toBe(7);
  });

  it("humano comum: PE sem bônus", () => {
    const r = calcularFicha(ficha(), sistema);
    expect(r.habilidades.classe.chave).toBe("COMUM");
    expect(r.derivados.PE).toBe(10);
  });

  it("vampiro: Briga base 95 é mágica (sem EH, sem Melhor do Mundo); classe null e PE sem bônus", () => {
    const r = calcularFicha(ficha({ raca: "VAMPIRO", ganhos: { "Lutar (Briga)": 70 }, extras: extras(17, 90) }), sistema);
    const briga = pericia(r, "Lutar (Briga)");
    expect(briga).toMatchObject({ valor: 95, magica: true, melhorDoMundo: false });
    expect(pericia(r, "Ofício 0").melhorDoMundo).toBe(true);
    expect(r.habilidades.classe).toBeNull();
    expect(r.habilidades.proxima).toBeNull();
  });

  it("lobisomem com a Alcateia inativa continua com Lidar com Animais mágica", () => {
    const r = calcularFicha(ficha({ raca: "LOBISOMEM", ganhos: { "Lidar com Animais": 85 } }), sistema);
    expect(pericia(r, "Lidar com Animais")).toMatchObject({ valor: 90, magica: true, melhorDoMundo: false });
    expect(r.habilidades.eh.pericias).toBe(1); // só a Língua Nativa (50)
  });
});
