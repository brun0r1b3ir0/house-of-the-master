import Link from "next/link";

const base = "px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.07em] whitespace-nowrap";

export default function MenuCampanha({ itens }) {
  return (
    <nav
      aria-label="Navegação da campanha"
      className="flex overflow-x-auto border-b border-wi-deep md:sticky md:top-20 md:flex-col md:overflow-visible md:border-b-0 md:border-l"
    >
      {itens.map((item) =>
        item.href ? (
          <Link
            key={item.rotulo}
            href={item.href}
            aria-current={item.ativo ? "page" : undefined}
            className={`${base} border-b-2 md:-ml-px md:border-b-0 md:border-l-2 ${
              item.ativo
                ? "border-wi-accent text-wi-bone"
                : "border-transparent text-wi-steel hover:text-wi-bone"
            }`}
          >
            {item.rotulo}
          </Link>
        ) : (
          <span
            key={item.rotulo}
            aria-disabled="true"
            className={`${base} flex items-center justify-between gap-2 text-wi-steel opacity-45`}
          >
            {item.rotulo}
            <em className="border border-wi-deep px-1.5 py-px text-[9px] not-italic">em breve</em>
          </span>
        )
      )}
    </nav>
  );
}