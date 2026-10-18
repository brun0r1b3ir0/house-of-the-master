const NOMES_RACA = {
  BRUXO: "Bruxaria",
  VAMPIRO: "Vampirismo",
  LOBISOMEM: "Licantropia",
  CACADOR: "A Marca",
  VIAJANTE: "Natureza",
};

// Barra de abas do mock. Por enquanto só a Ficha Geral existe; as demais são a Fase 3.
export default function AbasFicha({ raca }) {
  const abas = [
    { nome: "Combate" },
    { nome: "Treinamento" },
    { nome: "Ficha Geral", ativa: true },
    { nome: "Habilidades" },
    { nome: "Inventário" },
    { nome: "Histórico" },
  ];
  if (NOMES_RACA[raca]) abas.push({ nome: NOMES_RACA[raca] });

  return (
    <nav aria-label="Seções da ficha" className="-mx-1 flex gap-1 overflow-x-auto border-b border-wi-steel/40">
      {abas.map((a) =>
        a.ativa ? (
          <span
            key={a.nome}
            aria-current="page"
            className="whitespace-nowrap border-b-2 border-wi-accent px-3 py-2 font-mono text-[11px] uppercase tracking-[0.07em] text-wi-bone"
          >
            {a.nome}
          </span>
        ) : (
          <span
            key={a.nome}
            aria-disabled="true"
            title="Em breve"
            className="cursor-not-allowed whitespace-nowrap px-3 py-2 font-mono text-[11px] uppercase tracking-[0.07em] text-wi-steel/60"
          >
            {a.nome}
          </span>
        ),
      )}
    </nav>
  );
}
