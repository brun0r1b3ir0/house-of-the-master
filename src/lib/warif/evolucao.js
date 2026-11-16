// Evolução do personagem: compara o que foi montado na criação (snapshot guardado pelo
// backend em estado.criacao) com os valores de hoje. Só entram valores DIGITADOS:
// bônus de raça e condições (fome, sanidade...) não contam.

import { ATRIBUTOS } from "./modificadores";
import { valorInicialPericia } from "./pericias";
import { normalizarRaca } from "./raca";

/**
 * @returns {null | {
 *   atributos: { chave: string, criacao: number, atual: number, diff: number }[],
 *   pericias: { nome: string, categoria: string, criacao: number, atual: number, diff: number }[],
 *   totais: { pontosCriacao: number, pontosGanhos: number }
 * }}  null quando a ficha não passou pela criação (ou ela ainda não terminou).
 */
export function calcularEvolucao(ficha, sistema) {
  const criacao = ficha?.estado?.criacao;
  const snapshot = criacao?.snapshot;
  if (!criacao?.concluida || !snapshot?.atributos) return null;

  const atuais = ficha.estado.atributos ?? {};
  const atributos = ATRIBUTOS.map((chave) => {
    const antes = snapshot.atributos[chave] ?? 0;
    const agora = atuais[chave] ?? 0;
    return { chave, criacao: antes, atual: agora, diff: agora - antes };
  });

  // Pontos que cada perícia recebeu na criação (profissão + interesse).
  const daCriacao = {};
  for (const bolso of ["profissao", "interesse"])
    for (const [nome, v] of Object.entries(snapshot.ganhos?.[bolso] ?? {})) daCriacao[nome] = (daCriacao[nome] ?? 0) + v;

  const raca = normalizarRaca(ficha.raca);
  const catalogo = new Map((sistema?.pericias ?? []).map((p) => [p.nome, p]));
  const pericias = [];
  for (const p of ficha.pericias ?? []) {
    const cat = catalogo.get(p.nome);
    const iniAntes = valorInicialPericia(cat?.valorInicial, snapshot.atributos, raca);
    const iniAgora = valorInicialPericia(cat?.valorInicial, atuais, raca);
    const antes = iniAntes + (daCriacao[p.nome] ?? 0);
    const agora = iniAgora + (p.ganho ?? 0) + (p.ganhoTreino ?? 0);
    // Só aparecem as perícias que receberam pontos na criação ou que mudaram depois.
    if (!daCriacao[p.nome] && agora === antes) continue;
    pericias.push({ nome: p.nome, categoria: cat?.categoria ?? p.categoria, criacao: antes, atual: agora, diff: agora - antes });
  }
  pericias.sort((a, b) => b.diff - a.diff || a.nome.localeCompare(b.nome, "pt-BR"));

  return {
    atributos,
    pericias,
    totais: {
      pontosCriacao: Object.values(daCriacao).reduce((s, v) => s + v, 0),
      pontosGanhos: pericias.reduce((s, p) => s + p.diff, 0),
    },
  };
}
