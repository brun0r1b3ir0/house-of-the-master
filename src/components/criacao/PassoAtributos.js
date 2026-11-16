"use client";

import Card from "@/components/campanha/Card";
import { NOMES_ATRIBUTOS } from "@/lib/ficha-visual";
import { ATRIBUTOS } from "@/lib/warif/modificadores";
import {
  CRIACAO,
  ajustarAtributo,
  maximoAtual,
  pontosRestantes,
  regrasAtributos,
  validarAtributos,
} from "@/lib/warif/criacao";
import { BotaoPasso, CampoNumero } from "@/components/ficha/controles";

export default function PassoAtributos({ atributos, onChange, raca }) {
  const { fixos, livres, total } = regrasAtributos(raca);
  const restante = pontosRestantes(atributos, raca);
  const { ok } = validarAtributos(atributos, raca);

  function mudar(chave, valor) {
    onChange(ajustarAtributo(atributos, chave, valor, raca));
  }

  return (
    <Card titulo="Atributos">
      <p className="mb-3 text-sm text-wi-steel">
        Distribua {total} pontos entre os {livres.length} atributos{livres.length < ATRIBUTOS.length && " livres"}.
        Cada um começa em {CRIACAO.MIN_ATRIBUTO} e pode chegar a {CRIACAO.MAX_ATRIBUTO_INICIAL}.
        {raca === "VAMPIRO" && " FOR e DES do Vampiro são fixos em 120."} Os bônus da raça entram depois.
      </p>

      <div
        className={`mb-3 flex items-baseline justify-between border px-3 py-2 ${
          ok ? "border-[var(--ac-p)]" : "border-black"
        }`}
        aria-live="polite"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-wi-steel">Pontos restantes</span>
        <b className={`font-mono text-2xl ${restante < 0 ? "text-wi-blood" : ok ? "text-[var(--ac-p)]" : ""}`}>
          {restante}
        </b>
      </div>

      {ATRIBUTOS.map((k) => {
        const nome = (
          <span className="w-28 shrink-0 text-[15px]">
            <b className="font-medium">{k}</b>{" "}
            <small className="font-mono text-[10px] text-wi-steel">{NOMES_ATRIBUTOS[k]}</small>
          </span>
        );

        if (k in fixos) {
          return (
            <div key={k} className="flex items-center gap-2 border-b border-wi-line py-1.5">
              {nome}
              <small className="min-w-0 flex-1 font-mono text-[10px] uppercase tracking-[0.06em] text-wi-steel">
                Valor não alterável · Vampiros
              </small>
              <b className="w-10 text-center font-mono text-[13px] text-[var(--ac-p)]">{fixos[k]}</b>
            </div>
          );
        }

        const valor = atributos[k];
        const max = maximoAtual(atributos, k, raca);
        return (
          <div key={k} className="flex items-center gap-2 border-b border-wi-line py-1.5">
            {nome}
            <div className="relative h-1.5 min-w-0 flex-1 bg-wi-line" aria-hidden="true">
              <div
                className="absolute inset-y-0 left-0 bg-[var(--ac-p)]"
                style={{ width: `${(valor / CRIACAO.MAX_ATRIBUTO_INICIAL) * 100}%` }}
              />
            </div>
            <BotaoPasso rotulo={`Diminuir ${k}`} desabilitado={valor <= CRIACAO.MIN_ATRIBUTO} onClick={() => mudar(k, valor - 1)}>
              −
            </BotaoPasso>
            <CampoNumero
              valor={valor}
              min={CRIACAO.MIN_ATRIBUTO}
              max={max}
              rotulo={`Valor de ${k}`}
              onConfirmar={(v) => mudar(k, v)}
              className="w-10"
            />
            <BotaoPasso rotulo={`Aumentar ${k}`} desabilitado={valor >= max} onClick={() => mudar(k, valor + 1)}>
              +
            </BotaoPasso>
          </div>
        );
      })}
    </Card>
  );
}
