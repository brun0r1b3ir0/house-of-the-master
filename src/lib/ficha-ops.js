// Edição da ficha no navegador: aplicar uma operação do PATCH sobre a ficha
// (para a tela responder na hora) e a fila que agrupa as operações pendentes.
//
// O backend continua sendo a fonte da verdade: a resposta do PATCH sempre
// substitui o que foi aplicado aqui.

const RAIZ = new Set(["nome", "ocupacao", "raca"]);
const REMOVE_QUANDO_NULO = new Set(["overrides", "regenOverrides"]);
const GANHO_DE_PERICIA = /^pericias\.(.+)\.ganho$/;

function definir(objeto, caminho, valor, remover) {
  const [chave, ...resto] = caminho;
  const copia = { ...objeto };
  if (resto.length === 0) {
    if (remover && valor === null) delete copia[chave];
    else copia[chave] = valor;
  } else {
    copia[chave] = definir(objeto?.[chave] ?? {}, resto, valor, remover);
  }
  return copia;
}

/** Devolve uma NOVA ficha com a operação aplicada. Não altera a original. */
export function aplicarOp(ficha, campo, valor) {
  if (RAIZ.has(campo)) return { ...ficha, [campo]: valor };

  const pericia = GANHO_DE_PERICIA.exec(campo);
  if (pericia) {
    const nome = pericia[1];
    return {
      ...ficha,
      pericias: (ficha.pericias ?? []).map((p) => (p.nome === nome ? { ...p, ganho: valor } : p)),
    };
  }

  const caminho = campo.split(".");
  const remover = REMOVE_QUANDO_NULO.has(caminho[0]);
  return { ...ficha, estado: definir(ficha.estado ?? {}, caminho, valor, remover) };
}

export function aplicarOps(ficha, ops) {
  return ops.reduce((f, { campo, valor }) => aplicarOp(f, campo, valor), ficha);
}

/**
 * Fila de operações pendentes. Duas edições do mesmo campo viram uma só
 * (vale a última) e a ordem é a da edição mais recente.
 */
export function criarFila() {
  const mapa = new Map();
  return {
    adicionar(campo, valor) {
      mapa.delete(campo);
      mapa.set(campo, valor);
    },
    ops() {
      return Array.from(mapa, ([campo, valor]) => ({ campo, valor }));
    },
    /** Tira até `max` operações (o backend aceita 100 por PATCH). */
    tirarLote(max = 100) {
      const lote = [];
      for (const [campo, valor] of mapa) {
        if (lote.length >= max) break;
        lote.push({ campo, valor });
      }
      for (const { campo } of lote) mapa.delete(campo);
      return lote;
    },
    limpar() {
      mapa.clear();
    },
    tamanho() {
      return mapa.size;
    },
  };
}