"use client";

export const NOMES_RACA = {
  BRUXO: "Bruxaria",
  VAMPIRO: "Vampirismo",
  LOBISOMEM: "Licantropia",
  CACADOR: "A Marca",
  VIAJANTE: "Natureza",
};

// Raças cuja aba já existe. As outras aparecem cinza, "em breve".
export const RACAS_COM_ABA = ["VAMPIRO"];

const base = "whitespace-nowrap px-3 py-2 font-mono text-[11px] uppercase tracking-[0.07em]";

// `aba-raca:` (variante do globals.css) clareia o texto quando a aba da raça está aberta,
// porque o fundo tingido derruba o contraste do cinza normal.
function Desabilitada({ nome }) {
  return (
    <span
      aria-disabled="true"
      title="Em breve"
      className={`${base} cursor-not-allowed text-wi-steel/60 aba-raca:text-wi-ash`}
    >
      {nome}
    </span>
  );
}

function Aba({ nome, ativa, onClick, daRaca = false }) {
  // A aba da raça é igual às outras; só o texto usa a cor da raça (vermelho no vampiro).
  const estilo = daRaca
    ? ativa
      ? "border-wi-accent text-[var(--ac-t)]"
      : "border-transparent text-[var(--ac-t)] opacity-70 hover:opacity-100"
    : ativa
      ? "border-wi-accent text-wi-bone"
      : "border-transparent text-wi-steel hover:text-wi-bone aba-raca:text-wi-fog aba-raca:hover:text-wi-bone";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={ativa ? "page" : undefined}
      className={`${base} border-b-2 transition-colors ${estilo}`}
    >
      {nome}
    </button>
  );
}

// Barra de abas do mock. Hoje existem a Ficha Geral e a aba da raça (quando pronta).
// `onTrocar(destino, evento)`: o evento do clique vai junto para a transição de sangue
// saber de onde nascer.
export default function AbasFicha({ raca, ativa, onTrocar }) {
  const nomeRaca = NOMES_RACA[raca];
  const racaPronta = RACAS_COM_ABA.includes(raca);

  return (
    <nav aria-label="Seções da ficha" className="-mx-1 flex gap-1 overflow-x-auto border-b border-wi-steel/40">
      <Desabilitada nome="Combate" />
      <Desabilitada nome="Treinamento" />
      <Aba nome="Ficha Geral" ativa={ativa === "geral"} onClick={(e) => onTrocar("geral", e)} />
      <Desabilitada nome="Habilidades" />
      <Desabilitada nome="Inventário" />
      <Desabilitada nome="Histórico" />
      {nomeRaca &&
        (racaPronta ? (
          <Aba nome={nomeRaca} ativa={ativa === "raca"} onClick={(e) => onTrocar("raca", e)} daRaca />
        ) : (
          <Desabilitada nome={nomeRaca} />
        ))}
    </nav>
  );
}