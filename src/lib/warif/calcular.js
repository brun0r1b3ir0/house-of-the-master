// Ponto de entrada do módulo: recebe a ficha e o catálogo da API e devolve
// tudo que a tela precisa mostrar. Não grava nada: o que precisa ser gravado
// vem em `sugestoes` e a tela decide quando mandar o PATCH.
//
//   const r = calcularFicha(ficha, sistema);
//
// ficha:   resposta de GET /campanhas/{cid}/fichas/{fid}
// sistema: resposta de GET /campanhas/{cid}/sistema

import { calcularEfeitos, atributosEfetivos } from "./efeitos";
import { calcularDerivados } from "./derivados";
import { periciaEfetiva, periciaEhMagica, valorInicialPericia } from "./pericias";
import { perdaPermanenteTamDesejada } from "./condicoes";

export function calcularFicha(ficha, sistema) {
  const estado = ficha?.estado ?? {};
  const raca = ficha?.raca ?? null;

  const efeitos = calcularEfeitos(estado, raca);
  const atributos = atributosEfetivos(estado, raca, efeitos);
  const derivados = calcularDerivados(estado, raca, efeitos, atributos);

  const catalogo = new Map((sistema?.pericias ?? []).map((p) => [p.nome, p]));
  const pericias = (ficha?.pericias ?? []).map((p) => {
    const cat = catalogo.get(p.nome);
    const categoria = cat?.categoria ?? p.categoria;
    const exigePrecisao = cat?.exigePrecisao ?? false;
    const valorInicial = cat ? valorInicialPericia(cat.valorInicial, estado.atributos, raca) : 0;
    const ganho = p.ganho ?? 0;
    const valor = valorInicial + ganho;
    return {
      nome: p.nome,
      categoria,
      origem: p.origem,
      exigePrecisao,
      valorInicial,
      ganho,
      ganhoTreino: p.ganhoTreino ?? 0,
      valor,
      efetivo: periciaEfetiva(
        { nome: p.nome, categoria, valor, exigePrecisao },
        efeitos.pacote,
        efeitos.multiplicadores.pericias,
      ),
      magica: periciaEhMagica(p.nome, categoria, raca),
    };
  });

  // O que a tela deve gravar (PATCH) porque o estado guardado ficou desatualizado.
  const sugestoes = {};
  if (efeitos.colapso.mudou) sugestoes.colapsoMagico = efeitos.colapso.ativo;
  if (!efeitos.imuneFomeSede) {
    const tam = estado.atributos?.TAM ?? 0;
    const aplicada = estado.perdaPermanenteTam ?? 0;
    const desejada = perdaPermanenteTamDesejada(estado.contadores?.fome, tam, aplicada);
    if (desejada > aplicada) {
      // A perda vai para o valor digitado do TAM; o contador só registra quanto já foi tirado.
      sugestoes.perdaPermanenteTam = desejada;
      sugestoes.tam = Math.max(0, tam - (desejada - aplicada));
    }
  }

  return {
    atributos,
    derivados,
    pericias,
    colapso: efeitos.colapso,
    mumificado: efeitos.multiplicadores.mumificado,
    linhagemNaoImplementada: efeitos.linhagemNaoImplementada,
    sugestoes,
  };
}
