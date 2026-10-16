import Card from "@/components/campanha/Card";

function Barra({ rotulo, atual = 0, max }) {
  return (
    <div className="border border-wi-ink/25 p-2">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">{rotulo}</div>
      <div className="font-wi-display text-3xl leading-none">
        {atual}
        <span className="font-mono text-sm text-wi-steel"> / {max}</span>
      </div>
    </div>
  );
}

function Info({ rotulo, children }) {
  return (
    <div className="flex items-baseline justify-between border-b border-wi-ink/15 py-1.5">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">{rotulo}</span>
      <span>{children}</span>
    </div>
  );
}

export default function CardEstado({ atuais = {}, derivados }) {
  const d = derivados;
  const sinal = d.modificadorDano ?? "";

  return (
    <Card titulo="Estado atual">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Barra rotulo="PV" atual={atuais.PV} max={d.PV} />
        <Barra rotulo="PE" atual={atuais.PE} max={d.PE} />
        <Barra rotulo="PM" atual={atuais.PM} max={d.PM} />
        <Barra rotulo="SAN" atual={atuais.SAN} max={d.SAN} />
        <Barra rotulo="SRT" atual={atuais.SRT} max={d.SRT} />
      </div>

      <div className="mt-3">
        {d.corpoAtivo ? (
          <>
            <Info rotulo="Corpo (ativo)">{d.corpoAtivo.corpo} · dano {d.corpoAtivo.modificadorDano}</Info>
            <Info rotulo="Corpo (passivo)">{d.corpoPassivo.corpo} · dano {d.corpoPassivo.modificadorDano}</Info>
          </>
        ) : (
          <Info rotulo="Corpo">{d.Corpo} · dano {sinal}</Info>
        )}
        <Info rotulo="MOV">{d.MOV} · {d.distanciaMov}</Info>
        <Info rotulo="Conhecimento">{d.Conhecimento}</Info>
      </div>
    </Card>
  );
}