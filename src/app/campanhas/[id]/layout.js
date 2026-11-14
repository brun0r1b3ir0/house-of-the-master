import Link from "next/link";
import { exigirCampanha } from "@/lib/campanha";
import MenuCampanha from "@/components/campanha/MenuCampanha";

export default async function CampanhaLayout({ children, params }) {
  const { id } = await params;
  const campanha = await exigirCampanha(id);

  const eMestre = campanha.papel === "MESTRE";
  const painel = `/campanhas/${id}/${eMestre ? "mestre" : "jogador"}`;

  const itens = [
    { rotulo: "Painel", href: painel },
    { rotulo: eMestre ? "Fichas" : "Minhas fichas", href: `/campanhas/${id}/fichas` },
    ...(eMestre ? [{ rotulo: "Jogadores" }] : []),
    { rotulo: "Anotações" },
    { rotulo: "Quadro" },
    { rotulo: "Sistema" },
    ...(eMestre ? [{ rotulo: "Configurações" }] : []),
  ];

  const contagem =
    typeof campanha.jogadores === "number"
      ? ` · ${campanha.jogadores}${campanha.maxJogadores ? `/${campanha.maxJogadores}` : ""} jogadores`
      : "";

  return (
    // `fundo-campanha`: nas abas de raça da ficha, o globals.css pinta este fundo com o tom da raça.
    <div className="fundo-campanha flex min-h-screen flex-1 flex-col bg-wi-ink font-wi-body text-wi-bone">
      <header className="sticky top-0 z-10 border-b border-wi-deep bg-wi-ink">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <span className="whitespace-nowrap font-wi-display text-[22px] tracking-wide">WAR IF</span>
          <div className="min-w-44 flex-1">
            <b className="block font-wi-display text-2xl font-normal leading-none">
              {campanha.titulo}
            </b>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-steel">
              {campanha.sistema}
              {contagem}
            </span>
          </div>
          <span className="border border-wi-accent px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.07em] text-wi-accent">
            {eMestre ? "Mestre" : "Jogador"}
          </span>
          <Link
            href="/campanhas"
            className="whitespace-nowrap border border-wi-steel px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors hover:bg-wi-bone hover:text-wi-ink"
          >
            ← Minhas campanhas
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 md:grid-cols-[210px_minmax(0,1fr)] md:items-start md:gap-5">
        <MenuCampanha itens={itens} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}