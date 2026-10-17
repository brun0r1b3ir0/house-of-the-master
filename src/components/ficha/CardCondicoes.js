import { EFEITOS_SANIDADE } from "@/lib/ficha-visual";
import { BotaoPasso } from "./controles";

function Contador({ rotulo, detalhe, valor = 0, max = 9999, editavel, onMudar }) {
  return (
    <div className="flex items-center gap-2 border-b border-wi-line py-1.5">
      <span className="flex-1 font-mono text-[11px] uppercase">
        {rotulo} {detalhe && <small className="text-[10px] text-wi-steel">{detalhe}</small>}
      </span>
      {editavel && (
        <BotaoPasso rotulo={`Diminuir ${rotulo}`} onClick={() => onMudar(valor - 1)} desabilitado={valor <= 0}>
          −
        </BotaoPasso>
      )}
      <span className={"min-w-6 text-center font-mono " + (valor > 0 ? "font-medium text-[var(--ac-p)]" : "")}>
        {valor}
      </span>
      {editavel && (
        <BotaoPasso rotulo={`Aumentar ${rotulo}`} onClick={() => onMudar(valor + 1)} desabilitado={valor >= max}>
          +
        </BotaoPasso>
      )}
    </div>
  );
}

function Opcao({ rotulo, texto }) {
  return (
    <div className="flex items-center justify-between border-b border-wi-line py-1.5">
      <span className="font-mono text-[11px] uppercase">{rotulo}</span>
      <span className="font-mono text-[10.5px] uppercase">{texto}</span>
    </div>
  );
}

export default function CardCondicoes({ estado, raca, estagios = [], colapsoAtivo, editavel, alterar }) {
  const contadores = estado.contadores ?? {};
  const flags = estado.flags ?? {};
  const vampiro = raca === "VAMPIRO";
  const mostrarColapso = raca === "BRUXO" || raca === "VIAJANTE" || colapsoAtivo;
  const extras = Object.entries(estado.condicoes ?? {}).filter(([, v]) => v);

  const mudar = (chave) => (novo) => alterar(`contadores.${chave}`, Math.max(0, novo));

  return (
    <>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-wi-steel">
        Estágio de Sanidade
      </p>
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        {estagios.map((e) => {
          const ativo = e.chave === estado.estagioSanidade;
          return (
            <button
              key={e.chave}
              type="button"
              aria-pressed={ativo}
              disabled={!editavel}
              onClick={() => !ativo && alterar("estagioSanidade", e.chave)}
              className={
                "border px-1 py-2 text-center font-mono text-[10.5px] uppercase leading-tight tracking-[0.04em] transition-colors disabled:cursor-default " +
                (ativo
                  ? "border-[var(--ac-p)] bg-[var(--ac-p)] text-wi-bone"
                  : "border-wi-ink text-wi-ink enabled:hover:bg-wi-line")
              }
            >
              {e.nome}
            </button>
          );
        })}
      </div>
      <p className="mb-3 border-l-2 border-[var(--ac-p)] pl-2 font-mono text-[10.5px]">
        {EFEITOS_SANIDADE[estado.estagioSanidade] ?? "sem efeitos"}
      </p>

      <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-wi-steel">Contadores</p>
      {!vampiro && <Contador rotulo="Exaustão" valor={contadores.exaustao} editavel={editavel} onMudar={mudar("exaustao")} />}
      {!vampiro && <Contador rotulo="Fome" detalhe="(PF)" valor={contadores.fome} editavel={editavel} onMudar={mudar("fome")} />}
      {!vampiro && <Contador rotulo="Sede" detalhe="(PS)" valor={contadores.sede} editavel={editavel} onMudar={mudar("sede")} />}
      <Contador rotulo="Debilitantes" detalhe="(PD)" valor={contadores.debilitantes} editavel={editavel} onMudar={mudar("debilitantes")} />
      <Contador rotulo="Frio" valor={contadores.frio} editavel={editavel} onMudar={mudar("frio")} />
      {vampiro && (
        <Contador
          rotulo="Sangria"
          detalhe="(PsG 0–10)"
          valor={contadores.sangria}
          max={10}
          editavel={editavel}
          onMudar={(novo) => alterar("contadores.sangria", Math.min(10, Math.max(0, novo)))}
        />
      )}

      {vampiro && (
        <div className="flex items-center justify-between border-b border-wi-line py-1.5">
          <span className="font-mono text-[11px] uppercase">Verbena</span>
          <button
            type="button"
            aria-pressed={!!flags.verbena}
            disabled={!editavel}
            onClick={() => alterar("flags.verbena", !flags.verbena)}
            className={
              "w-24 border px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.04em] transition-colors disabled:cursor-default " +
              (flags.verbena
                ? "border-[var(--ac-p)] bg-[var(--ac-p)] text-wi-bone"
                : "border-wi-ink text-wi-ink enabled:hover:bg-wi-line")
            }
          >
            {flags.verbena ? "Ativa" : "Ativar"}
          </button>
        </div>
      )}
      {mostrarColapso && <Opcao rotulo="Colapso Mágico" texto={colapsoAtivo ? "Ativo" : "Inativo"} />}

      {extras.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {extras.map(([chave]) => (
            <li key={chave} className="border border-wi-ink/40 px-2 py-1 font-mono text-[10px] uppercase">
              {chave}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}