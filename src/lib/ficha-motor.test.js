import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { criarMotor, mensagemDeErro } from "./ficha-motor";

const base = () => ({ nome: "Ana", estado: { atuais: { PV: 10, PE: 10 }, flags: {} }, pericias: [] });

function montar({ responder } = {}) {
  const chamadas = [];
  let ficha = null;
  const estados = [];
  const erros = [];
  const enviar = vi.fn(async (ops) => {
    chamadas.push(ops);
    return responder ? responder(ops, chamadas.length) : { status: 200, dados: base() };
  });
  const motor = criarMotor({
    inicial: base(),
    enviar,
    aoMudarFicha: (f) => (ficha = f),
    aoMudarStatus: (s) => estados.push(s),
    aoErro: (e) => erros.push(e),
    atraso: 600,
  });
  return { motor, enviar, chamadas, estados, erros, ficha: () => ficha };
}

// Resposta falsa que "aplica" as operações como o backend faria.
const aplicandoOps = (ops, estadoAnterior) => {
  const f = structuredClone(estadoAnterior);
  for (const { campo, valor } of ops) {
    const [grupo, chave] = campo.split(".");
    if (chave) f.estado[grupo][chave] = valor;
    else f[campo] = valor;
  }
  return f;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("motor de autosave", () => {
  it("a tela muda na hora, antes de qualquer envio", () => {
    const t = montar();
    t.motor.alterar("atuais.PV", 7);
    expect(t.ficha().estado.atuais.PV).toBe(7);
    expect(t.enviar).not.toHaveBeenCalled();
    expect(t.estados.at(-1)).toBe("pendente");
  });

  it("várias edições em sequência viram um único PATCH", async () => {
    const t = montar();
    t.motor.alterar("atuais.PV", 9);
    await vi.advanceTimersByTimeAsync(300);
    t.motor.alterar("atuais.PV", 8);
    await vi.advanceTimersByTimeAsync(300);
    t.motor.alterar("atuais.PV", 7);
    await vi.advanceTimersByTimeAsync(599);
    expect(t.enviar).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(t.enviar).toHaveBeenCalledTimes(1);
    expect(t.chamadas[0]).toEqual([{ campo: "atuais.PV", valor: 7 }]);
    expect(t.estados.at(-1)).toBe("salvo");
  });

  it("a resposta do servidor substitui o estado local", async () => {
    const t = montar({
      responder: () => ({ status: 200, dados: { ...base(), nome: "Ana (servidor)" } }),
    });
    t.motor.alterar("atuais.PV", 7);
    await vi.advanceTimersByTimeAsync(600);
    expect(t.ficha().nome).toBe("Ana (servidor)");
  });

  it("edição durante o envio espera e é reaplicada por cima da resposta", async () => {
    let liberar;
    const t = montar({
      responder: (ops, n) =>
        n === 1
          ? new Promise((resolve) => (liberar = () => resolve({ status: 200, dados: aplicandoOps(ops, base()) })))
          : { status: 200, dados: aplicandoOps(ops, t.ficha()) },
    });
    t.motor.alterar("atuais.PV", 9);
    await vi.advanceTimersByTimeAsync(600); // 1º envio fica pendurado
    expect(t.estados.at(-1)).toBe("salvando");

    t.motor.alterar("atuais.PE", 4); // edita enquanto envia
    await vi.advanceTimersByTimeAsync(700);
    expect(t.enviar).toHaveBeenCalledTimes(1); // não enviou em paralelo

    liberar();
    await vi.advanceTimersByTimeAsync(0);
    // resposta do 1º envio não apaga a edição de PE
    expect(t.ficha().estado.atuais).toEqual({ PV: 9, PE: 4 });

    await vi.advanceTimersByTimeAsync(600);
    expect(t.enviar).toHaveBeenCalledTimes(2);
    expect(t.chamadas[1]).toEqual([{ campo: "atuais.PE", valor: 4 }]);
    expect(t.estados.at(-1)).toBe("salvo");
  });

  it("falha: volta ao que o servidor confirmou e avisa", async () => {
    const t = montar({ responder: () => ({ status: 400, dados: { mensagem: "valor fora do limite" } }) });
    t.motor.alterar("atuais.PV", 99999);
    await vi.advanceTimersByTimeAsync(600);
    expect(t.ficha().estado.atuais.PV).toBe(10);
    expect(t.estados.at(-1)).toBe("erro");
    expect(t.erros.at(-1)).toEqual({ status: 400, mensagem: "valor fora do limite" });
  });

  it("falha de rede (exceção) também volta e avisa", async () => {
    const t = montar({
      responder: () => {
        throw new Error("offline");
      },
    });
    t.motor.alterar("nome", "Bia");
    await vi.advanceTimersByTimeAsync(600);
    expect(t.ficha().nome).toBe("Ana");
    expect(t.erros.at(-1).status).toBe(0);
  });

  it("sugestão é enviada uma vez; repetir o mesmo valor não reenvia", async () => {
    const t = montar();
    t.motor.sugerir("flags.colapsoMagico", true);
    t.motor.sugerir("flags.colapsoMagico", true);
    await vi.advanceTimersByTimeAsync(600);
    expect(t.chamadas).toEqual([[{ campo: "flags.colapsoMagico", valor: true }]]);
    t.motor.sugerir("flags.colapsoMagico", true);
    await vi.advanceTimersByTimeAsync(600);
    expect(t.enviar).toHaveBeenCalledTimes(1);
  });

  it("sugestão recusada não vira laço", async () => {
    const t = montar({ responder: () => ({ status: 400, dados: { mensagem: "não" } }) });
    t.motor.sugerir("perdaPermanenteTam", 3);
    await vi.advanceTimersByTimeAsync(600);
    t.motor.sugerir("perdaPermanenteTam", 3);
    await vi.advanceTimersByTimeAsync(600);
    expect(t.enviar).toHaveBeenCalledTimes(1);
  });

  it("depois que a sugestão some, o mesmo valor pode ser sugerido de novo", async () => {
    const t = montar();
    t.motor.sugerir("flags.colapsoMagico", true);
    await vi.advanceTimersByTimeAsync(600);
    t.motor.sugerir("flags.colapsoMagico", undefined);
    t.motor.sugerir("flags.colapsoMagico", true);
    await vi.advanceTimersByTimeAsync(600);
    expect(t.enviar).toHaveBeenCalledTimes(2);
  });

  it("descarregar envia na hora (saída da página)", async () => {
    const t = montar();
    t.motor.alterar("nome", "Bia");
    await t.motor.descarregar({ keepalive: true });
    expect(t.enviar).toHaveBeenCalledTimes(1);
    expect(t.enviar.mock.calls[0][1]).toEqual({ keepalive: true });
  });
});

describe("mensagemDeErro", () => {
  it("mensagens por status", () => {
    expect(mensagemDeErro({ status: 0 })).toMatch(/Sem conexão/);
    expect(mensagemDeErro({ status: 403, dados: null })).toMatch(/permissão/);
    expect(mensagemDeErro({ status: 404 })).toMatch(/arquivada/);
    expect(mensagemDeErro({ status: 400, dados: { mensagem: "campo inválido" } })).toBe("campo inválido");
    expect(mensagemDeErro({ status: 500, dados: null })).toMatch(/Não foi possível/);
  });
});