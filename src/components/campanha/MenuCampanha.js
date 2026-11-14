"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const base = "px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.07em] whitespace-nowrap";

// Item ativo = a rota atual é a do item ou está dentro dela.
function estaAtivo(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// `aba-raca:` (variante do globals.css) clareia o menu quando a aba da raça da ficha está
// aberta, porque o fundo tingido derruba o contraste do cinza normal.
export default function MenuCampanha({ itens }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação da campanha"
      className="flex overflow-x-auto border-b border-wi-deep md:sticky md:top-20 md:flex-col md:overflow-visible md:border-b-0 md:border-l"
    >
      {itens.map((item) => {
        if (!item.href) {
          return (
            <span
              key={item.rotulo}
              aria-disabled="true"
              className={`${base} flex items-center justify-between gap-2 text-wi-steel opacity-45 aba-raca:text-wi-ash aba-raca:opacity-100`}
            >
              {item.rotulo}
              <em className="border border-wi-deep px-1.5 py-px text-[9px] not-italic">em breve</em>
            </span>
          );
        }

        const ativo = estaAtivo(pathname, item.href);
        return (
          <Link
            key={item.rotulo}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`${base} border-b-2 md:-ml-px md:border-b-0 md:border-l-2 ${
              ativo
                ? "border-wi-accent text-wi-bone"
                : "border-transparent text-wi-steel hover:text-wi-bone aba-raca:text-wi-fog aba-raca:hover:text-wi-bone"
            }`}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}