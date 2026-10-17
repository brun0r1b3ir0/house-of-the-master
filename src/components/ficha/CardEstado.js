import Card from "@/components/campanha/Card";
import { formatarMetros } from "@/lib/ficha-visual";
import { BotaoPasso, CampoNumero } from "./controles";

const BARRAS = [
  ["PV", "Pontos de Vida"],
  ["PE", "Pontos de Esforço"],
  ["PM", "Pontos de Magia"],
  ["SAN", "Sanidade", "SA"],
  ["SRT", "Sorte"],
];

function Barra({ chave, sigla, nome, atual = 0, max = 0, editavel, alterar }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (atual / max) * 100)) : 0;
  // Nunca grava acima do máximo nem abaixo de zero.
  const mudar = (novo) => alterar(`atuais.${chave}`, Math.min(max, Math.max(0, novo)));

  return (
    <div className="border-b border-wi-line py-2">
      <div className="flex items-center gap-1.5">
        <span className="flex-1">
          <b className="font-medium">{sigla}</b>{" "}
          <small className="font-mono text-[10px] text-wi-steel">{nome}</small>
        </span>
        {editavel && (
          <BotaoPasso rotulo={`Diminuir ${sigla}`} onClick={() => mudar(atual - 1)} desabilitado={atual <= 0}>
            −
          </BotaoPasso>
        )}
        <span className="flex min-w-[78px] items-center justify-center font-mono text-[13px]">
          {editavel ? (
            <CampoNumero
              valor={atual}
              min={0}
              max={max}
              rotulo={`${sigla} atual`}
              onConfirmar={mudar}
              className="w-10"
            />
          ) : (
            atual
          )}
          <span className="ml-1 text-wi-steel">/ {max}</span>
        </span>
        {editavel && (
          <BotaoPasso rotulo={`Aumentar ${sigla}`} onClick={() => mudar(atual + 1)} desabilitado={atual >= max}>
            +
          </BotaoPasso>
        )}
      </div>
      <div className="mt-1.5 h-[5px] bg-wi-line">
        <div className="h-full bg-[var(--ac-p)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Linha({ rotulo, detalhe, children }) {
  return (
    <div className="flex items-baseline justify-between border-b border-wi-line py-1.5 text-[15px]">
      <span>
        {rotulo} {detalhe && <small className="font-mono text-[10px] text-wi-steel">{detalhe}</small>}
      </span>
      <b className="font-mono text-sm font-medium text-[var(--ac-p)]">{children}</b>
    </div>
  );
}

export default function CardEstado({ atuais = {}, derivados: d, editavel, alterar }) {
  return (
    <Card titulo="Estado Atual">
      {BARRAS.map(([chave, nome, sigla]) => (
        <Barra
          key={chave}
          chave={chave}
          sigla={sigla ?? chave}
          nome={nome}
          atual={atuais[chave]}
          max={d[chave]}
          editavel={editavel}
          alterar={alterar}
        />
      ))}

      {d.corpoAtivo ? (
        <>
          <Linha rotulo="Corpo Ativo" detalhe="(FOR+DES)">
            {d.corpoAtivo.corpo} · {d.corpoAtivo.modificadorDano}
          </Linha>
          <Linha rotulo="Corpo Passivo" detalhe="(FOR+TAM)">
            {d.corpoPassivo.corpo} · {d.corpoPassivo.modificadorDano}
          </Linha>
        </>
      ) : (
        <Linha rotulo="Corpo">
          {d.Corpo} · {d.modificadorDano}
        </Linha>
      )}
      <Linha rotulo="Movimento" detalhe="(MOV)">
        {d.MOV} · {formatarMetros(d.distanciaMov)}
      </Linha>
    </Card>
  );
}