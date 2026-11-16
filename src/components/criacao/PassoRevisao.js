"use client";

import Card from "@/components/campanha/Card";
import { NOMES_ATRIBUTOS } from "@/lib/ficha-visual";
import { rotuloRaca } from "@/lib/fichas";
import { ATRIBUTOS } from "@/lib/warif/modificadores";
import { iniciaisPermitidas, pontosProfissao, pontosInteresse, valorParaProfissao } from "@/lib/warif/criacao";

export default function PassoRevisao({ identidade, atributos, profissao, ganhos, ctx }) {
  const iniciais = iniciaisPermitidas(ctx.catalogo, ctx.raca, ctx.attrs);
  const naConta = (k) => valorParaProfissao(atributos, k, ctx.raca).toLocaleString("pt-BR");
  const nomes = [...new Set([...Object.keys(ganhos.profissao), ...Object.keys(ganhos.interesse)])].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

  return (
    <div className="space-y-4">
      <Card titulo="Revise antes de concluir">
        <p className="text-sm">
          Depois de concluir, a distribuição não pode ser refeita por aqui. Confira tudo com calma. Os bônus da raça
          entram no valor efetivo, sem mexer nos números abaixo.
        </p>
      </Card>

      <Card titulo="Identidade">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px]">
          <dt className="font-mono text-[10.5px] uppercase text-wi-steel">Nome</dt>
          <dd>{identidade.nome}</dd>
          <dt className="font-mono text-[10.5px] uppercase text-wi-steel">Ocupação</dt>
          <dd>{identidade.ocupacao || "—"}</dd>
          <dt className="font-mono text-[10.5px] uppercase text-wi-steel">Raça</dt>
          <dd>{rotuloRaca(identidade.raca)}</dd>
        </dl>
      </Card>

      <Card titulo="Atributos">
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
          {ATRIBUTOS.map((k) => (
            <div key={k} className="flex items-baseline justify-between border-b border-wi-line py-1">
              <span title={NOMES_ATRIBUTOS[k]}>
                <b className="font-medium">{k}</b>
              </span>
              <span className="font-mono text-sm">{atributos[k]}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card titulo="Profissão">
        <p className="mb-2 font-mono text-[13px]">
          {profissao.principal} {naConta(profissao.principal)} × 2 + {profissao.secundario}{" "}
          {naConta(profissao.secundario)} × 2 ={" "}
          <b className="text-[var(--ac-p)]">
            {pontosProfissao(atributos, profissao.principal, profissao.secundario, ctx.raca)}
          </b>{" "}
          pontos de profissão · interesse (INT × 2): <b className="text-[var(--ac-p)]">{pontosInteresse(atributos)}</b>
        </p>
        <p className="text-sm">{profissao.pericias.join(", ")}</p>
      </Card>

      <Card titulo="Perícias com pontos">
        <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-wi-steel">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 border-b border-wi-ink pb-1">
            <span>Perícia</span>
            <span className="w-8 text-right">Ini</span>
            <span className="w-8 text-right">Prof</span>
            <span className="w-8 text-right">Int</span>
            <span className="w-9 text-right">Final</span>
          </div>
        </div>
        {nomes.map((nome) => {
          const ini = iniciais.get(nome) ?? 0;
          const p = ganhos.profissao[nome] ?? 0;
          const i = ganhos.interesse[nome] ?? 0;
          return (
            <div key={nome} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 border-b border-wi-line py-1 text-[15px]">
              <span>{nome}</span>
              <span className="w-8 text-right font-mono text-sm text-wi-steel">{ini}</span>
              <span className="w-8 text-right font-mono text-sm">{p || "·"}</span>
              <span className="w-8 text-right font-mono text-sm">{i || "·"}</span>
              <b className="w-9 text-right font-mono text-sm text-[var(--ac-p)]">{ini + p + i}</b>
            </div>
          );
        })}
        {nomes.length === 0 && <p className="text-sm italic text-wi-steel">Nenhum ponto distribuído.</p>}
      </Card>
    </div>
  );
}
