"use client";

import { useMemo, useState } from "react";
import Card from "@/components/campanha/Card";
import { BotaoPasso, CampoNumero } from "@/components/ficha/controles";
import {
  CRIACAO,
  maximoGanho,
  periciasDaRaca,
  pontosRestantesPericias,
  valorFinalPericia,
} from "@/lib/warif/criacao";
import { valorInicialPericia } from "@/lib/warif";
import { campo, rotulo } from "./estilos";

const CATEGORIAS = [
  ["FISICA", "Física"],
  ["COMBATE", "Combate"],
  ["MENTAL", "Mental"],
  ["INTERPESSOAL", "Interpessoal"],
];

function Contador({ titulo, restante, total }) {
  const ok = restante === 0;
  return (
    <div className={`flex-1 border px-3 py-2 ${ok ? "border-[var(--ac-p)]" : "border-black"}`} aria-live="polite">
      <span className="block font-mono text-[10px] uppercase tracking-[0.06em] text-wi-steel">{titulo}</span>
      <b className={`font-mono text-xl ${restante < 0 ? "text-wi-blood" : ok ? "text-[var(--ac-p)]" : ""}`}>{restante}</b>
      <small className="font-mono text-[10px] text-wi-steel"> / {total}</small>
    </div>
  );
}

function Linha({ pericia, inicial, ganho, final, max, onChange, rotuloCampo }) {
  const noTeto = final >= CRIACAO.TETO_PERICIA;
  return (
    <div className="flex items-center gap-2 border-b border-wi-line py-1.5">
      <span className="min-w-0 flex-1 text-[15px]">
        {pericia.nome}
        <small className="ml-1 font-mono text-[10px] text-wi-steel">({inicial})</small>
      </span>
      <BotaoPasso rotulo={`Diminuir ${rotuloCampo}`} desabilitado={ganho <= 0} onClick={() => onChange(ganho - 1)}>
        −
      </BotaoPasso>
      <CampoNumero valor={ganho} min={0} max={max} rotulo={rotuloCampo} onConfirmar={onChange} className="w-10" />
      <BotaoPasso rotulo={`Aumentar ${rotuloCampo}`} desabilitado={ganho >= max} onClick={() => onChange(ganho + 1)}>
        +
      </BotaoPasso>
      <b className={`w-9 text-right font-mono text-sm ${noTeto ? "text-[var(--ac-p)]" : ""}`} title={noTeto ? "Teto de 80 atingido" : undefined}>
        {final}
      </b>
    </div>
  );
}

export default function PassoPericias({ ganhos, onChange, ctx }) {
  const [busca, setBusca] = useState("");
  const restante = pontosRestantesPericias(ganhos, ctx);
  const total = {
    profissao: restante.profissao + Object.values(ganhos.profissao).reduce((s, v) => s + v, 0),
    interesse: restante.interesse + Object.values(ganhos.interesse).reduce((s, v) => s + v, 0),
  };

  const disponiveis = useMemo(() => periciasDaRaca(ctx.catalogo, ctx.raca), [ctx.catalogo, ctx.raca]);
  const daProfissao = disponiveis.filter((p) => ctx.pericias.includes(p.nome));
  const filtradas = disponiveis.filter((p) => p.nome.toLowerCase().includes(busca.trim().toLowerCase()));
  const grupos = [
    ...CATEGORIAS.map(([chave, nome]) => [nome, filtradas.filter((p) => p.categoria === chave)]),
    ["Outras", filtradas.filter((p) => !CATEGORIAS.some(([c]) => c === p.categoria))],
  ].filter(([, lista]) => lista.length > 0);

  const inicialDe = (p) => valorInicialPericia(p.valorInicial, ctx.attrs);
  const linha = (p, bolso) => (
    <Linha
      key={`${bolso}-${p.nome}`}
      pericia={p}
      inicial={inicialDe(p)}
      ganho={ganhos[bolso][p.nome] ?? 0}
      final={valorFinalPericia(p.nome, ganhos, ctx)}
      max={maximoGanho(ganhos, bolso, p.nome, ctx)}
      rotuloCampo={`${bolso === "profissao" ? "Pontos de profissão" : "Pontos de interesse"} em ${p.nome}`}
      onChange={(v) => onChange(bolso, p.nome, v)}
    />
  );

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex gap-2 bg-wi-ink py-2">
        <Contador titulo="Profissão: restam" restante={restante.profissao} total={total.profissao} />
        <Contador titulo="Interesse: restam" restante={restante.interesse} total={total.interesse} />
      </div>

      <Card titulo="Pontos de profissão">
        <p className="mb-2 text-sm text-wi-steel">
          Distribua os pontos entre as {daProfissao.length} perícias da sua profissão. O número entre parênteses é o
          valor inicial; o da direita é o valor final (teto de {CRIACAO.TETO_PERICIA}).
        </p>
        {daProfissao.map((p) => linha(p, "profissao"))}
      </Card>

      <Card titulo="Pontos de interesse">
        <p className="mb-2 text-sm text-wi-steel">
          Vão para qualquer perícia, inclusive as de raça (INT × 2 pontos).
        </p>
        <label className="mb-3 block">
          <span className={rotulo}>Buscar perícia</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite para filtrar"
            className={campo}
          />
        </label>

        {grupos.length === 0 && <p className="text-sm italic text-wi-steel">Nenhuma perícia encontrada.</p>}
        {grupos.map(([nome, lista]) => (
          <fieldset key={nome} className="mb-3">
            <legend className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">{nome}</legend>
            {lista.map((p) => linha(p, "interesse"))}
          </fieldset>
        ))}
      </Card>
    </div>
  );
}
