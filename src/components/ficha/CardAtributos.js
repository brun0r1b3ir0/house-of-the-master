import Card from "@/components/campanha/Card";
import { metade, quinto } from "@/lib/warif";
import { NOMES_ATRIBUTOS } from "@/lib/ficha-visual";
import { regrasAtributos } from "@/lib/warif/criacao";
import { CampoNumero } from "./controles";

const ORDEM = ["FOR", "CON", "TAM", "DES", "APA", "INT", "POD", "EDU"];
const GRADE = "grid grid-cols-[1fr_112px_36px_36px] items-center";

export default function CardAtributos({ base = {}, efetivos = {}, raca, editavel, alterar }) {
  // FOR/DES do vampiro: sempre 120 na tela e sem edição (nunca sai PATCH desses campos).
  const { fixos } = regrasAtributos(raca);
  return (
    <Card titulo="Atributos">
      <div className={`${GRADE} border-b border-wi-ink pb-1 font-mono text-[10px] uppercase tracking-[0.06em] text-wi-steel`}>
        <span>Atributo</span>
        <span className="text-center">(Valor) Efetivo</span>
        <span className="text-center">½</span>
        <span className="text-center">⅕</span>
      </div>

      {ORDEM.map((k) => {
        const fixo = k in fixos;
        const valor = fixo ? fixos[k] : (base[k] ?? 0);
        const ef = efetivos[k] ?? valor;
        return (
          <div key={k} className={`${GRADE} border-b border-wi-line py-1.5 text-[15px]`}>
            <span>
              <b className="font-medium">{k}</b>{" "}
              <small className="font-mono text-[10px] text-wi-steel">{NOMES_ATRIBUTOS[k]}</small>
              {fixo && (
                <small className="block font-mono text-[9.5px] uppercase tracking-[0.06em] text-wi-steel">
                  Valor não alterável · Vampiros
                </small>
              )}
            </span>
            <span className="flex items-center justify-center font-mono text-[13px]">
              <span className="text-wi-steel">(</span>
              {editavel && !fixo ? (
                <CampoNumero
                  valor={valor}
                  min={0}
                  max={999}
                  rotulo={`Valor de ${k}`}
                  onConfirmar={(v) => alterar(`atributos.${k}`, v)}
                  className="w-9"
                />
              ) : (
                <span className="text-wi-steel">{valor}</span>
              )}
              <span className="text-wi-steel">)</span>
              <b className="ml-1.5 text-base text-[var(--ac-p)]">{ef}</b>
            </span>
            <span className="text-center font-mono text-[13px]">{metade(ef)}</span>
            <span className="text-center font-mono text-[13px]">{quinto(ef)}</span>
          </div>
        );
      })}
    </Card>
  );
}