"use client";

import Card from "@/components/campanha/Card";
import { RACAS } from "@/lib/fichas";
import { campo, rotulo, seta } from "./estilos";

export default function PassoIdentidade({ identidade, onChange }) {
  const mudar = (parte) => onChange({ ...identidade, ...parte });

  return (
    <Card titulo="Identidade">
      <div className="grid gap-5">
        <label className="block">
          <span className={rotulo}>Nome</span>
          <input
            value={identidade.nome}
            onChange={(e) => mudar({ nome: e.target.value })}
            maxLength={120}
            className={campo}
            placeholder="Como o personagem se chama"
          />
        </label>

        <label className="block">
          <span className={rotulo}>Ocupação (opcional)</span>
          <input
            value={identidade.ocupacao}
            onChange={(e) => mudar({ ocupacao: e.target.value })}
            maxLength={120}
            className={campo}
            placeholder="Detetive, médico, caçador de recompensas..."
          />
        </label>

        <label className="block">
          <span className={rotulo}>Raça</span>
          <select value={identidade.raca} onChange={(e) => mudar({ raca: e.target.value })} className={`${campo} ${seta}`}>
            <option value="">Escolha a raça</option>
            {RACAS.map((r) => (
              <option key={r.valor} value={r.valor}>
                {r.rotulo}
              </option>
            ))}
          </select>
          <small className="mt-1 block text-xs text-wi-steel">
            A raça define quais perícias aparecem (o Olfato, por exemplo, é só do Lobisomem). Os bônus dela entram
            depois, direto no valor efetivo.
          </small>
        </label>
      </div>
    </Card>
  );
}
