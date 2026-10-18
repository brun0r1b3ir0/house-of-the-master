"use client";

import Card from "@/components/campanha/Card";
import { valorInicialPericia } from "@/lib/warif";
import {
  QTD_PERICIAS_PROFISSAO,
  SELETOR_PRINCIPAL,
  SELETOR_SECUNDARIO,
  periciasDaRaca,
  pontosProfissao,
} from "@/lib/warif/criacao";
import { campo, rotulo, seta } from "./estilos";

const CATEGORIAS = [
  ["FISICA", "Física"],
  ["COMBATE", "Combate"],
  ["MENTAL", "Mental"],
  ["INTERPESSOAL", "Interpessoal"],
];

export default function PassoProfissao({ profissao, onChange, atributos, catalogo, raca }) {
  const { principal, secundario, pericias } = profissao;
  const disponiveis = periciasDaRaca(catalogo, raca);
  const pontos = pontosProfissao(atributos, principal, secundario);
  const cheio = pericias.length >= QTD_PERICIAS_PROFISSAO;

  function alternar(nome) {
    const marcada = pericias.includes(nome);
    if (!marcada && cheio) return;
    onChange({ ...profissao, pericias: marcada ? pericias.filter((n) => n !== nome) : [...pericias, nome] });
  }

  const grupos = [
    ...CATEGORIAS.map(([chave, nome]) => [nome, disponiveis.filter((p) => p.categoria === chave)]),
    ["Outras", disponiveis.filter((p) => !CATEGORIAS.some(([c]) => c === p.categoria))],
  ].filter(([, lista]) => lista.length > 0);

  return (
    <div className="space-y-4">
      <Card titulo="Pontos de profissão">
        <details open>
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.06em] text-wi-steel">
            Atributos que definem a profissão
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <label className="block">
              <span className={rotulo}>1º atributo</span>
              <select
                value={principal}
                onChange={(e) => onChange({ ...profissao, principal: e.target.value })}
                className={`${campo} ${seta}`}
              >
                <option value="">Escolha</option>
                {SELETOR_PRINCIPAL.map((k) => (
                  <option key={k} value={k}>
                    {k} ({atributos[k]})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={rotulo}>2º atributo</span>
              <select
                value={secundario}
                onChange={(e) => onChange({ ...profissao, secundario: e.target.value })}
                className={`${campo} ${seta}`}
              >
                <option value="">Escolha</option>
                {SELETOR_SECUNDARIO.map((k) => (
                  <option key={k} value={k}>
                    {k} ({atributos[k]})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        <p className="mt-3 border-t border-wi-line pt-3 font-mono text-[13px]" aria-live="polite">
          {pontos > 0 ? (
            <>
              {principal} {atributos[principal]} × 2 + {secundario} {atributos[secundario]} × 2 ={" "}
              <b className="text-base text-[var(--ac-p)]">{pontos}</b> pontos
            </>
          ) : (
            <span className="text-wi-steel">Escolha os dois atributos para ver os pontos.</span>
          )}
        </p>
        <small className="block text-xs text-wi-steel">
          Quer EDU × 4 ou INT × 4? Escolha o mesmo atributo nos dois campos.
        </small>
      </Card>

      <Card
        titulo="Perícias da profissão"
        acao={
          <span className="font-mono text-xs">
            {pericias.length}/{QTD_PERICIAS_PROFISSAO}
          </span>
        }
      >
        <p className="mb-3 text-sm text-wi-steel">
          Escolha {QTD_PERICIAS_PROFISSAO} perícias, com pelo menos uma Interpessoal. Os pontos são distribuídos
          entre elas no passo seguinte.
        </p>

        {!raca && <p className="text-sm text-wi-blood">Volte e escolha a raça para ver as perícias.</p>}

        {grupos.map(([nome, lista]) => (
          <fieldset key={nome} className="mb-3">
            <legend className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">{nome}</legend>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              {lista.map((p) => {
                const marcada = pericias.includes(p.nome);
                const bloqueada = !marcada && cheio;
                return (
                  <label
                    key={p.nome}
                    className={`flex items-center gap-2 border-b border-wi-line py-1.5 text-[15px] ${
                      bloqueada ? "opacity-40" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={marcada}
                      disabled={bloqueada}
                      onChange={() => alternar(p.nome)}
                      className="accent-[var(--ac-p)]"
                    />
                    <span className="flex-1">{p.nome}</span>
                    <small className="font-mono text-[10px] text-wi-steel">
                      {valorInicialPericia(p.valorInicial, atributos)}
                    </small>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </Card>
    </div>
  );
}
