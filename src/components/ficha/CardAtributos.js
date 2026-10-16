import Card from "@/components/campanha/Card";
import { metade, quinto } from "@/lib/warif";

const ORDEM = ["FOR", "CON", "TAM", "DES", "INT", "POD", "EDU"];

export default function CardAtributos({ base = {}, efetivos = {} }) {
  const chaves = ORDEM.filter((k) => base[k] !== undefined || efetivos[k] !== undefined);

  return (
    <Card titulo="Atributos">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {chaves.map((k) => {
          const ef = efetivos[k] ?? base[k] ?? 0;
          const alterado = base[k] !== undefined && ef !== base[k];
          return (
            <div key={k} className="border border-wi-ink/25 p-2">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">{k}</div>
              <div className="font-wi-display text-3xl leading-none">
                {ef}
                {alterado && (
                  <span className="ml-1 font-mono text-[11px] text-wi-accent">({base[k]})</span>
                )}
              </div>
              <div className="mt-1 font-mono text-[10.5px] text-wi-steel">
                ½ {metade(ef)} · ⅕ {quinto(ef)}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs italic text-wi-steel">
        O valor grande é o efetivo (com raça e condições); entre parênteses, o valor digitado.
      </p>
    </Card>
  );
}