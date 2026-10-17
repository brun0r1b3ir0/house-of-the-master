// Motor de autosave da ficha. Não depende do React: recebe funções de fora,
// o que permite testar o comportamento com um "backend" falso.
//
//   alterar(campo, valor)  aplica na tela na hora e enfileira
//   sugerir(campo, valor)  só enfileira (correção calculada, ex.: Colapso Mágico)
//
// A fila é enviada num único PATCH depois de `atraso` ms sem novas edições.
// Se chegarem edições durante o envio, elas esperam e vão no PATCH seguinte,
// reaplicadas por cima da resposta do servidor (a tela não "pisca").

import { aplicarOp, aplicarOps, criarFila } from "./ficha-ops";

export function mensagemDeErro({ status, dados }) {
  const texto = typeof dados === "string" ? dados : dados?.mensagem;
  if (status === 0) return "Sem conexão com o servidor. As últimas alterações não foram salvas.";
  if (status === 403) return texto || "Você não tem permissão para alterar esta ficha.";
  if (status === 404) return "Esta ficha não existe mais ou foi arquivada.";
  return texto || "Não foi possível salvar as alterações.";
}

export function criarMotor({ inicial, enviar, aoMudarFicha, aoMudarStatus, aoErro, atraso = 600 }) {
  let servidor = inicial; // última ficha confirmada pelo backend
  let atual = inicial; // o que a tela mostra: servidor + pendentes
  let timer = null;
  let emVoo = false;
  const fila = criarFila();
  const sugeridas = new Map();

  function publicar(ficha) {
    atual = ficha;
    aoMudarFicha(ficha);
  }

  function agendar() {
    clearTimeout(timer);
    timer = setTimeout(() => descarregar(), atraso);
    if (!emVoo) aoMudarStatus("pendente");
  }

  async function descarregar(opcoes = {}) {
    clearTimeout(timer);
    timer = null;
    if (emVoo || fila.tamanho() === 0) return;

    emVoo = true;
    aoMudarStatus("salvando");
    const lote = fila.tirarLote(100);

    let resposta;
    try {
      resposta = await enviar(lote, opcoes);
    } catch {
      resposta = { status: 0, dados: null };
    }
    emVoo = false;

    const ok = resposta.status >= 200 && resposta.status < 300 && resposta.dados;
    if (ok) {
      servidor = resposta.dados;
      publicar(aplicarOps(servidor, fila.ops()));
      aoErro(null);
      if (fila.tamanho() > 0) agendar();
      else aoMudarStatus("salvo");
    } else {
      // Falhou: volta ao que o servidor confirmou, em vez de mostrar algo que não foi salvo.
      fila.limpar();
      publicar(servidor);
      aoErro({ status: resposta.status, mensagem: mensagemDeErro(resposta) });
      aoMudarStatus("erro");
    }
  }

  return {
    alterar(campo, valor) {
      publicar(aplicarOp(atual, campo, valor));
      fila.adicionar(campo, valor);
      agendar();
    },

    // Correção calculada. Cada valor é sugerido uma vez só (se o servidor
    // recusar, não tentamos de novo em loop); some da memória quando a
    // sugestão desaparece (valor === undefined).
    sugerir(campo, valor) {
      if (valor === undefined) {
        sugeridas.delete(campo);
        return;
      }
      if (sugeridas.get(campo) === valor) return;
      sugeridas.set(campo, valor);
      fila.adicionar(campo, valor);
      agendar();
    },

    descarregar,
  };
}
