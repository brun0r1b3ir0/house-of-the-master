import { describe, it, expect } from "vitest";
import {
  PRIMORDIOS_MAGICA,
  periciaEhMagica,
  ehDaPericia,
  calcularEH,
  ehMelhorDoMundo,
  CLASSES,
  HUMANO_COMUM,
  classeHumana,
  proximaClasse,
  calcularHabilidades,
} from "./habilidades";

// Perícia já calculada, como sai do calcularFicha (valor = base).
const per = (nome, categoria, valor, raca = "HUMANO") => ({
  nome,
  categoria,
  valor,
  magica: periciaEhMagica(nome, categoria, raca),
});
const chave = (classe) => classe?.chave ?? null;

describe("perícia mágica (derivada dos bônus fixos da raça)", () => {
  it.each([
    ["VAMPIRO", ["FISICA", "COMBATE"]],
    ["LOBISOMEM", ["FISICA", "COMBATE"]],
    ["CACADOR", ["FISICA", "COMBATE", "MENTAL", "INTERPESSOAL"]],
    ["HUMANO", []],
    ["BRUXO", []],
    ["VIAJANTE", []],
    [null, []],
  ])("%s: categorias mágicas %j", (raca, magicas) => {
    for (const cat of ["FISICA", "COMBATE", "MENTAL", "INTERPESSOAL"]) {
      expect(periciaEhMagica("Qualquer", cat, raca)).toBe(magicas.includes(cat));
    }
  });

  it("Lobisomem: Lidar com Animais (por nome) e Olfato (Física) são mágicas; Psicologia não", () => {
    expect(periciaEhMagica("Lidar com Animais", "MENTAL", "LOBISOMEM")).toBe(true);
    expect(periciaEhMagica("  lidar com animais ", "MENTAL", "LOBISOMEM")).toBe(true);
    expect(periciaEhMagica("Olfato", "FISICA", "LOBISOMEM")).toBe(true);
    expect(periciaEhMagica("Psicologia", "MENTAL", "LOBISOMEM")).toBe(false);
    expect(periciaEhMagica("Lidar com Animais", "MENTAL", "HUMANO")).toBe(false);
  });

  it("Primórdios (sem categoria) segue a constante, hoje não mágica", () => {
    expect(PRIMORDIOS_MAGICA).toBe(false);
    for (const raca of ["CACADOR", "VAMPIRO", "LOBISOMEM", "HUMANO"]) {
      expect(periciaEhMagica("Primórdios", "DESCONHECIDA", raca)).toBe(false);
    }
  });
});

describe("EH por perícia", () => {
  it.each([
    [0, 0],
    [49, 0],
    [50, 1],
    [59, 1],
    [60, 2],
    [74, 2],
    [75, 3],
    [120, 3],
  ])("valor base %i → %i EH", (valor, eh) => {
    expect(ehDaPericia(valor)).toBe(eh);
  });

  it("soma só as não mágicas, cada uma pela maior faixa", () => {
    const eh = calcularEH([per("A", "MENTAL", 50), per("B", "MENTAL", 60), per("C", "MENTAL", 75), per("D", "MENTAL", 49)]);
    expect(eh).toEqual({ pericias: 6, falhas: 0, total: 6, ocupado: 0, livre: 6 });
  });

  it("vampiro: Briga base 95 não dá EH nem é Melhor do Mundo; Psicologia base 90 é", () => {
    const briga = per("Lutar (Briga)", "COMBATE", 95, "VAMPIRO");
    const psico = per("Psicologia", "MENTAL", 90, "VAMPIRO");
    expect(briga.magica).toBe(true);
    expect(calcularEH([briga]).pericias).toBe(0);
    expect(ehMelhorDoMundo(briga)).toBe(false);
    expect(ehMelhorDoMundo(psico)).toBe(true);
    expect(calcularEH([briga, psico]).pericias).toBe(3);
  });

  it("Caçador com tudo em 90: 0 EH de perícias e nenhum Melhor do Mundo", () => {
    const lista = ["FISICA", "COMBATE", "MENTAL", "INTERPESSOAL"].flatMap((cat) =>
      [1, 2, 3].map((i) => per(`${cat} ${i}`, cat, 90, "CACADOR")),
    );
    const r = calcularHabilidades(lista, "CACADOR");
    expect(r.eh.pericias).toBe(0);
    expect(r.melhoresDoMundo).toEqual([]);
    expect(r.periciasAcima50).toBe(0);
  });

  it("falhas dão EH e habilidades ocupam, por grau; livre = total − ocupado", () => {
    const pericias = [per("A", "MENTAL", 75)]; // 3
    const falhas = [{ grau: "GRAU_3" }, { grau: "GRAU_2" }, { grau: "GRAU_1" }, { grau: "ESPECIAL" }]; // 1+2+3+5
    const habilidades = [{ grau: "GRAU_3" }, { grau: "GRAU_2" }, { grau: "GRAU_1" }, { grau: "ESPECIAL" }]; // 3+4+5+7
    expect(calcularEH(pericias, falhas, habilidades)).toEqual({ pericias: 3, falhas: 11, total: 14, ocupado: 19, livre: -5 });
  });

  it("falhas e habilidades vazias por padrão", () => {
    expect(calcularEH([per("A", "MENTAL", 60)])).toEqual({ pericias: 2, falhas: 0, total: 2, ocupado: 0, livre: 2 });
  });
});

describe("Melhor do Mundo", () => {
  it("não mágica com base 90+; 89 não é", () => {
    expect(ehMelhorDoMundo(per("A", "MENTAL", 90))).toBe(true);
    expect(ehMelhorDoMundo(per("A", "MENTAL", 89))).toBe(false);
  });
});

describe("classes humanas", () => {
  // contagem = { melhorDoMundo, periciasAcima50, eh (TOTAL) }
  const c = (melhorDoMundo, periciasAcima50, eh) => ({ melhorDoMundo, periciasAcima50, eh });

  it.each([
    ["HABILIDOSO", c(0, 10, 14), "HABILIDOSO"],
    ["HABILIDOSO − 1 perícia", c(0, 9, 14), "COMUM"],
    ["HABILIDOSO − 1 EH", c(0, 10, 13), "COMUM"],
    ["PROFISSIONAL", c(0, 12, 21), "PROFISSIONAL"],
    ["PROFISSIONAL − 1 perícia", c(0, 11, 21), "HABILIDOSO"],
    ["PROFISSIONAL − 1 EH", c(0, 12, 20), "HABILIDOSO"],
    ["PERITO", c(0, 14, 28), "PERITO"],
    ["PERITO − 1 perícia", c(0, 13, 28), "PROFISSIONAL"],
    ["PERITO − 1 EH", c(0, 14, 27), "PROFISSIONAL"],
    ["ESPECIALISTA", c(1, 14, 28), "ESPECIALISTA"],
    ["ESPECIALISTA − 1 Melhor do Mundo", c(0, 14, 28), "PERITO"],
    ["ESPECIALISTA − 1 perícia", c(1, 13, 28), "PROFISSIONAL"],
    ["ESPECIALISTA − 1 EH", c(1, 14, 27), "PROFISSIONAL"],
    ["EXTRAORDINÁRIO", c(2, 17, 35), "EXTRAORDINARIO"],
    ["EXTRAORDINÁRIO − 1 Melhor do Mundo", c(1, 17, 35), "ESPECIALISTA"],
    ["EXTRAORDINÁRIO − 1 perícia", c(2, 16, 35), "ESPECIALISTA"],
    ["EXTRAORDINÁRIO − 1 EH", c(2, 17, 34), "ESPECIALISTA"],
    ["nada", c(0, 0, 0), "COMUM"],
  ])("%s → %s", (_, contagem, esperada) => {
    expect(chave(classeHumana("HUMANO", contagem))).toBe(esperada);
  });

  it("raça nula vale como Humano", () => {
    expect(chave(classeHumana(null, c(0, 10, 14)))).toBe("HABILIDOSO");
  });

  it.each(["VAMPIRO", "LOBISOMEM", "CACADOR", "BRUXO", "VIAJANTE"])("%s: classe null", (raca) => {
    expect(classeHumana(raca, c(2, 17, 35))).toBeNull();
    expect(proximaClasse(raca, c(0, 0, 0))).toBeNull();
    const r = calcularHabilidades([per("A", "MENTAL", 90, raca)], raca);
    expect(r.classe).toBeNull();
    expect(r.beneficios).toBeNull();
    expect(r.proxima).toBeNull();
  });

  it("PE máximo acumula por classe; recuperação substitui", () => {
    expect(HUMANO_COMUM).toMatchObject({ bonusPE: 0, recuperacaoPE: "2 PE por hora" });
    expect(CLASSES.map((x) => [x.chave, x.bonusPE, x.recuperacaoPE])).toEqual([
      ["HABILIDOSO", 0, "1 PE a cada 30 minutos"],
      ["PROFISSIONAL", 1, "3 PE por hora"],
      ["PERITO", 3, "4 PE por hora"],
      ["ESPECIALISTA", 6, "6 PE por hora"],
      ["EXTRAORDINARIO", 11, "1 PE por turno"],
    ]);
  });

  it("Grau Único e ação bônus (só informação)", () => {
    const por = Object.fromEntries(CLASSES.map((x) => [x.chave, x]));
    expect(por.PERITO).toMatchObject({ grauUnico: false, acoesBonus: 0 });
    expect(por.ESPECIALISTA).toMatchObject({ grauUnico: true, acoesBonus: 0 });
    expect(por.EXTRAORDINARIO).toMatchObject({ grauUnico: true, acoesBonus: 1 });
  });

  it("próxima classe mostra atual / necessário de cada requisito", () => {
    const p = proximaClasse("HUMANO", c(0, 14, 28)); // Perito → Especialista
    expect(p.classe.chave).toBe("ESPECIALISTA");
    expect(p.requisitos).toEqual([
      { chave: "melhorDoMundo", nome: "Melhor do Mundo", atual: 0, necessario: 1, falta: 1, ok: false },
      { chave: "periciasAcima50", nome: "Perícias 50+", atual: 14, necessario: 14, falta: 0, ok: true },
      { chave: "eh", nome: "EH total", atual: 28, necessario: 28, falta: 0, ok: true },
    ]);
  });

  it("humano comum: próxima é Habilidoso; Extraordinário não tem próxima", () => {
    expect(proximaClasse("HUMANO", c(0, 3, 5)).classe.chave).toBe("HABILIDOSO");
    expect(proximaClasse("HUMANO", c(0, 3, 5)).requisitos.map((r) => r.chave)).toEqual(["periciasAcima50", "eh"]);
    expect(proximaClasse("HUMANO", c(2, 17, 35))).toBeNull();
  });
});

describe("calcularHabilidades (saída para a aba)", () => {
  it("humano Habilidoso: 10 perícias em 50 + falhas para chegar a 14 EH", () => {
    const pericias = Array.from({ length: 10 }, (_, i) => per(`P${i}`, "MENTAL", 50));
    const r = calcularHabilidades(pericias, "HUMANO", { falhas: [{ grau: "GRAU_1" }, { grau: "GRAU_3" }] });
    expect(r.eh).toEqual({ pericias: 10, falhas: 4, total: 14, ocupado: 0, livre: 14 });
    expect(r.periciasAcima50).toBe(10);
    expect(r.classe.chave).toBe("HABILIDOSO");
    expect(r.beneficios).toEqual({ recuperacaoPE: "1 PE a cada 30 minutos", bonusPE: 0, grauUnico: false, acoesBonus: 0 });
    expect(r.proxima.classe.chave).toBe("PROFISSIONAL");
  });

  it("EH ocupado não tira a classe (a classe usa o EH TOTAL)", () => {
    const pericias = Array.from({ length: 10 }, (_, i) => per(`P${i}`, "MENTAL", 50));
    const r = calcularHabilidades(pericias, "HUMANO", {
      falhas: [{ grau: "GRAU_1" }, { grau: "GRAU_3" }],
      habilidades: [{ grau: "ESPECIAL" }, { grau: "ESPECIAL" }],
    });
    expect(r.eh.livre).toBe(0);
    expect(r.classe.chave).toBe("HABILIDOSO");
  });

  it("lista os nomes das perícias Melhor do Mundo", () => {
    const r = calcularHabilidades([per("Ciência", "MENTAL", 92), per("Charme", "INTERPESSOAL", 89)], "HUMANO");
    expect(r.melhoresDoMundo).toEqual(["Ciência"]);
  });
});
