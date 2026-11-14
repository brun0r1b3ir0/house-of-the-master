"use client";

import { useState } from "react";
import { formatarMetros } from "@/lib/ficha-visual";
import {
  GRAUS_TESTE,
  NIVEIS_SANGRIA,
  ORDEM_ATRIBUTOS,
  contarPalavras,
  hipnoseFunciona,
  origemAtributos,
  tempoProximoPsG,
} from "@/lib/warif/vampiro";
import { BotaoPasso } from "./controles";

const rotuloSecao = "mb-1 mt-4 font-mono text-[10px] uppercase tracking-[0.06em] text-wi-steel";
// Texto explicativo das regras: frase completa, tamanho de leitura.
const explicacao = "text-[13.5px] leading-snug";
const botao =
  "border border-wi-ink px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.05em] text-wi-ink " +
  "transition-colors enabled:hover:bg-wi-ink enabled:hover:text-wi-bone disabled:cursor-not-allowed disabled:opacity-40";
const botaoAtivo = "border-[var(--ac-p)] bg-[var(--ac-p)] text-wi-bone";
const tituloPainel = "font-wi-display text-[24px] font-normal tracking-wide text-[var(--ac-p)]";

// Painel "tingido" do mock: papel misturado com a cor da raça e faixa grossa no topo.
// As cores fixas são as do tema (papel #EDEAE1, tinta #121110).
function Painel({ titulo, children, recolhivel = false, iniciaAberto = true, resumo }) {
  const [aberto, setAberto] = useState(iniciaAberto);
  const mostrar = !recolhivel || aberto;

  return (
    <section className="min-w-0 border border-black border-t-[length:5px] border-t-[color:var(--ac-p)] bg-[color-mix(in_srgb,var(--ac-p)_7%,#EDEAE1)] p-4 text-wi-ink">
      <div className="flex items-center justify-between gap-2">
        <h3 className={tituloPainel}>{titulo}</h3>
        {recolhivel && (
          <div className="flex items-center gap-2">
            {!aberto && resumo && <span className="font-mono text-xs text-[var(--ac-p)]">{resumo}</span>}
            <button
              type="button"
              onClick={() => setAberto(!aberto)}
              aria-expanded={aberto}
              title={aberto ? `Recolher ${titulo}` : `Expandir ${titulo}`}
              className="h-[26px] w-[26px] shrink-0 border border-wi-ink font-mono text-[15px] leading-none transition-colors hover:bg-wi-ink hover:text-wi-bone"
            >
              {aberto ? "−" : "+"}
            </button>
          </div>
        )}
      </div>
      {mostrar && <div className="mt-1">{children}</div>}
    </section>
  );
}

function Linha({ rotulo, detalhe, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-wi-line py-1.5 text-[15px]">
      <span>
        {rotulo} {detalhe && <small className="font-mono text-[10px] text-wi-steel">{detalhe}</small>}
      </span>
      <b className="text-right font-mono text-sm font-medium text-[var(--ac-p)]">{children}</b>
    </div>
  );
}

function Capacidade({ ficha, calc }) {
  const origem = origemAtributos(ficha.estado);
  const d = calc.derivados;

  return (
    <>
      <p className={`${explicacao} mb-2`}>
        <b className="font-medium">Digitado</b> é o valor da sua ficha. <b className="font-medium">Efetivo</b> é o que
        vale em jogo, já com os efeitos do vampirismo, da Sangria e da Verbena. A coluna Origem mostra o que mudou cada
        valor.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-wi-ink text-left font-mono text-[9.5px] uppercase tracking-[0.05em] text-wi-steel">
              <th className="py-1 pr-2 font-normal">Atributo</th>
              <th className="px-2 py-1 text-center font-normal">Digitado</th>
              <th className="px-2 py-1 text-center font-normal">Efetivo</th>
              <th className="py-1 pl-2 font-normal">Origem</th>
            </tr>
          </thead>
          <tbody>
            {ORDEM_ATRIBUTOS.map((k) => (
              <tr key={k} className="border-b border-wi-line">
                <td className="py-1.5 pr-2 font-medium">{k}</td>
                <td className="px-2 py-1.5 text-center font-mono text-wi-steel">{ficha.estado.atributos?.[k] ?? 0}</td>
                <td className="px-2 py-1.5 text-center font-mono font-medium text-[var(--ac-p)]">{calc.atributos[k]}</td>
                <td className="py-1.5 pl-2 font-mono text-[10px] text-wi-steel">{origem[k].join(" · ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={rotuloSecao}>Derivados</p>
      {d.corpoAtivo && (
        <>
          <Linha rotulo="Corpo Ativo" detalhe="FOR+DES · quando você ataca">
            {d.corpoAtivo.corpo} · {d.corpoAtivo.modificadorDano}
          </Linha>
          <Linha rotulo="Corpo Passivo" detalhe="FOR+TAM · quando atacam você">
            {d.corpoPassivo.corpo} · {d.corpoPassivo.modificadorDano}
          </Linha>
        </>
      )}
      <Linha rotulo="Movimento" detalhe="MOV">
        {d.MOV} · {formatarMetros(d.distanciaMov)}
      </Linha>
    </>
  );
}

function Vulnerabilidades({ ficha, calc, editavel, alterar }) {
  const verbena = !!ficha.estado.flags?.verbena;
  const pv = ficha.estado.atuais?.PV ?? 0;
  const pvMax = calc.derivados.PV;
  const semCura = (ficha.estado.contadores?.sangria ?? 0) >= 10;

  return (
    <>
      <p className={rotuloSecao + " !mt-1"}>Verbena</p>
      <ul className={explicacao}>
        <li className="border-b border-wi-line py-1">
          Se a Verbena tocar a sua pele, ela queima como ferro quente e causa 1 de dano. Quantidades maiores podem
          causar mais.
        </li>
        <li className="border-b border-wi-line py-1">
          Se ela entrar no seu organismo, você precisa de um Teste de CON (constituição) com nível de sucesso EXTREMO
          para não desmaiar.
        </li>
        <li className="border-b border-wi-line py-1">
          Se você a ingerir, seus atributos e perícias físicas caem pela metade por 1d6+1 horas. Ative abaixo enquanto o
          efeito durar e desative quando passar.
        </li>
      </ul>
      <div className="flex items-center justify-between gap-3 border-b border-wi-line py-1.5">
        <span className="font-mono text-[11px] uppercase">Verbena ingerida</span>
        <button
          type="button"
          aria-pressed={verbena}
          disabled={!editavel}
          onClick={() => alterar("flags.verbena", !verbena)}
          className={`${botao} w-24 ${verbena ? botaoAtivo : ""}`}
        >
          {verbena ? "Ativa" : "Ativar"}
        </button>
      </div>

      <p className={rotuloSecao}>Luz solar</p>
      <ul className={explicacao}>
        <li className="border-b border-wi-line py-1">
          Quando você entra em contato direto com a luz solar, deve fazer um Teste de CON (constituição) com nível de
          sucesso BOM, ou fica sob a condição <b className="font-medium">Em Chamas</b> (fogo Laranja).
        </li>
        <li className="border-b border-wi-line py-1">
          A partir do 2º turno seguido exposto à luz, o nível de sucesso exigido sobe para EXTREMO e continua assim nos
          turnos seguintes.
        </li>
      </ul>

      <p className={rotuloSecao}>Cura passiva</p>
      <p className={explicacao}>
        Você recupera 3 PV no início de cada turno. Com 10 pontos de Sangria, a cura para até você beber sangue.
      </p>
      {editavel && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={botao}
            disabled={pv >= pvMax || semCura}
            onClick={() => alterar("atuais.PV", Math.min(pvMax, pv + 3))}
          >
            Curar +3 PV (1 turno)
          </button>
          <span className="font-mono text-[11px] text-wi-steel">
            PV {pv} / {pvMax}
          </span>
        </div>
      )}
    </>
  );
}

function Sangria({ ficha, calc, editavel, alterar }) {
  const psg = ficha.estado.contadores?.sangria ?? 0;
  const mudar = (n) => alterar("contadores.sangria", Math.min(10, Math.max(0, n)));
  const proximo = tempoProximoPsG(psg);

  return (
    <Painel titulo="Sangria" recolhivel resumo={`${psg} / 10 PsG`}>
      <p className={`${explicacao} mb-3`}>
        Quanto mais tempo você passa sem beber sangue, mais seu corpo enfraquece. Isso é medido em Pontos de Sangria
        (PsG), de 0 a 10. Sem sangue, você ganha 1 PsG a cada 6 horas; do 5º para o 6º ponto, a cada 24 horas. Beber
        sangue zera todos os pontos.
      </p>

      <div className="grid grid-cols-10 gap-[3px]" role="img" aria-label={`Sangria ${psg} de 10`}>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={
              "flex h-[26px] items-center justify-center border font-mono text-[10px] " +
              (i < psg
                ? "border-[var(--ac-p)] bg-[var(--ac-p)] text-wi-bone"
                : "border-wi-ink text-wi-steel")
            }
          >
            {i + 1}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {editavel && (
          <BotaoPasso rotulo="Diminuir Sangria" onClick={() => mudar(psg - 1)} desabilitado={psg <= 0}>
            −
          </BotaoPasso>
        )}
        <span className="font-mono text-xs text-[var(--ac-p)]">{psg} / 10 PsG</span>
        {editavel && (
          <BotaoPasso rotulo="Aumentar Sangria" onClick={() => mudar(psg + 1)} desabilitado={psg >= 10}>
            +
          </BotaoPasso>
        )}
        {editavel && (
          <button type="button" className={`${botao} ${botaoAtivo}`} disabled={psg === 0} onClick={() => mudar(0)}>
            Beber sangue · zerar PsG
          </button>
        )}
      </div>
      {proximo && (
        <p className="mt-2 font-mono text-[11px] text-wi-steel">
          Próximo ponto em {proximo} sem beber sangue.
        </p>
      )}

      {calc.mumificado && (
        <div role="status" className="mt-3 border border-wi-blood bg-wi-blood/10 px-3 py-2 text-sm">
          <b className="font-mono text-[11px] uppercase text-wi-blood">Mumificação ativa</b>
          <p className="mt-1">
            Seu corpo secou: a pele fica acinzentada e as veias, enegrecidas. Você não pode se mover nem agir de forma
            alguma até beber sangue.
          </p>
        </div>
      )}

      <p className={rotuloSecao}>O que cada ponto faz</p>
      <ul>
        {NIVEIS_SANGRIA.map((texto, i) => {
          const n = i + 1;
          const atual = n === psg;
          return (
            <li
              key={n}
              className={
                "grid grid-cols-[34px_1fr] gap-2 border-b border-wi-line px-1.5 py-1 text-[13px] " +
                (atual ? "bg-[var(--ac-p)] text-wi-bone" : n < psg ? "text-wi-steel" : "")
              }
            >
              <b className="font-mono font-medium">{n}</b>
              <span>{texto}</span>
            </li>
          );
        })}
      </ul>
    </Painel>
  );
}

function Hipnose() {
  const [vampiro, setVampiro] = useState(1);
  const [alvo, setAlvo] = useState(0);
  const [comando, setComando] = useState("");
  const funciona = hipnoseFunciona(vampiro, alvo);
  const palavras = contarPalavras(comando);

  const seletor =
    "mt-1 w-full border-0 border-b border-wi-ink bg-transparent py-1 font-mono text-[12.5px] text-wi-ink outline-none focus:border-[var(--ac-p)]";

  return (
    <Painel titulo="Hipnose vampírica" recolhivel iniciaAberto={false}>
      <p className={`${explicacao} mb-3`}>
        Você pode hipnotizar seres humanos. Em combate, precisa estar <b className="font-medium">Agarrado</b> ao alvo.
        Faça um teste de Hipnose contra o POD dele: se o seu nível de sucesso for pelo menos um acima do dele, você pode
        dar um comando de até 5 palavras, e ele é obrigado a obedecer.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <label className="block font-mono text-[9.5px] uppercase text-wi-steel">
          Seu resultado (Hipnose)
          <select value={vampiro} onChange={(e) => setVampiro(Number(e.target.value))} className={seletor}>
            {GRAUS_TESTE.map((g, i) => (
              <option key={g} value={i} className="text-black">
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-mono text-[9.5px] uppercase text-wi-steel">
          Resultado do alvo (POD)
          <select value={alvo} onChange={(e) => setAlvo(Number(e.target.value))} className={seletor}>
            {GRAUS_TESTE.map((g, i) => (
              <option key={g} value={i} className="text-black">
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        role="status"
        className={
          "mt-3 border px-3 py-2 font-mono text-[11px] uppercase " +
          (funciona ? "border-[var(--ac-p)] text-[var(--ac-p)]" : "border-wi-blood text-wi-blood")
        }
      >
        {funciona
          ? "Alvo hipnotizado · você pode dar o comando"
          : vampiro === 0
            ? "Você falhou no teste de Hipnose"
            : "Sem efeito · seu resultado precisa ser pelo menos um nível acima do dele"}
      </div>

      <label className="mt-3 block font-mono text-[9.5px] uppercase text-wi-steel">
        Comando (até 5 palavras)
        <input
          type="text"
          value={comando}
          onChange={(e) => setComando(e.target.value)}
          placeholder="Esqueça que me viu aqui"
          className={seletor}
        />
      </label>
      <p className={"mt-1 font-mono text-[11px] " + (palavras > 5 ? "text-wi-blood" : "text-[var(--ac-p)]")}>
        {palavras} / 5 palavras{palavras > 5 ? " · comando longo demais" : ""}
      </p>
    </Painel>
  );
}

function EmBreve() {
  return (
    <Painel titulo="Idade e evolução">
      <p className={`${explicacao} text-wi-steel`}>
        Em breve: sua idade como vampiro, o que muda no seu corpo a cada século de vida e o limite até onde você ainda
        consegue treinar as perícias Físicas e de Combate.
      </p>
    </Painel>
  );
}

export default function AbaVampirismo({ ficha, calc, editavel, alterar }) {
  return (
    <div className="grid gap-4">
      {/* Sem nome gigante ao fundo: a troca de aba é marcada pela transição de sangue. */}
      <h2 className="sr-only">Vampirismo</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <Painel titulo="Capacidade vampírica">
          <Capacidade ficha={ficha} calc={calc} />
        </Painel>
        <Painel titulo="Vulnerabilidades">
          <Vulnerabilidades ficha={ficha} calc={calc} editavel={editavel} alterar={alterar} />
        </Painel>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Sangria ficha={ficha} calc={calc} editavel={editavel} alterar={alterar} />
        <Hipnose />
      </div>

      <EmBreve />
    </div>
  );
}