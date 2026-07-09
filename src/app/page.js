export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 bg-paper border-b border-paper-line">
        <div className="max-w-280 mx-auto flex items-center justify-between px-5 sm:px-7 py-4">
          <div className="flex items-center gap-2 font-display font-semibold text-base sm:text-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="1" y="1" width="22" height="22" rx="3" stroke="#22221E" strokeWidth="1.3" />
              <line x1="6" y1="8" x2="18" y2="8" stroke="#22221E" strokeWidth="1" />
              <line x1="6" y1="12" x2="14" y2="12" stroke="#22221E" strokeWidth="1" />
              <line x1="6" y1="16" x2="16" y2="16" stroke="#22221E" strokeWidth="1" />
            </svg>
            House of the Master
          </div>
          <nav className="flex items-center gap-3 sm:gap-7">
            <a href="#sobre" className="hidden md:inline font-mono text-xs tracking-wide uppercase text-ink-soft hover:text-ink">
              Como funciona
            </a>
            <a href="#momentos" className="hidden md:inline font-mono text-xs tracking-wide uppercase text-ink-soft hover:text-ink">
              Uma sessão
            </a>
            <a href="#" className="font-mono text-xs uppercase px-3 sm:px-4 py-2 rounded border border-ink hover:bg-ink hover:text-paper transition-colors">
              Entrar
            </a>
            <a href="#" className="hidden sm:inline-block font-mono text-xs uppercase px-4 py-2 rounded bg-wax text-paper hover:opacity-90 transition-opacity">
              Criar conta
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-280 mx-auto px-5 sm:px-7">
        {/* HERO */}
        <section className="grid md:grid-cols-[1.05fr_0.85fr] gap-10 md:gap-14 items-center py-14 md:py-20">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-wax mb-4 md:mb-5">
              <span className="w-5 h-px bg-wax" /> Fora de qualquer campanha
            </div>
            <h1 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight mb-4 md:mb-5">
              Toda mesa começa numa <span className="text-wax">folha em branco.</span>
            </h1>
            <p className="text-ink-soft text-base sm:text-lg leading-relaxed max-w-[46ch] mb-7 md:mb-8">
              Isto é a House of the Master antes de qualquer campanha existir — neutra, de
              propósito. No instante em que um mestre cria ou entra numa mesa, o sistema ganha
              a cara daquela campanha específica.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#" className="text-center font-mono text-xs uppercase px-5 py-3 sm:py-2.5 rounded bg-wax text-paper hover:opacity-90 transition-opacity">
                Criar minha conta
              </a>
              <a href="#" className="text-center font-mono text-xs uppercase px-5 py-3 sm:py-2.5 rounded border border-ink hover:bg-ink hover:text-paper transition-colors">
                Já tenho conta
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-75 sm:max-w-85 bg-sheet border border-paper-line rounded-md shadow-xl p-5 sm:p-6 rotate-[1.4deg]">
              <div className="font-mono text-[10px] tracking-wide uppercase text-ink-faint mb-1">
                Ficha — em branco
              </div>
              <div className="font-display font-semibold text-lg text-ink-faint mb-5 border-b border-dashed border-paper-line pb-3">
                Personagem
              </div>
              {["Nome", "HP", "Sanidade", "Poder", "Perícia"].map((campo) => (
                <div key={campo} className="flex items-baseline gap-2.5 mb-4">
                  <span className="font-mono text-[10px] uppercase text-ink-faint w-20 shrink-0">{campo}</span>
                  <span className="flex-1 border-b border-paper-line h-4" />
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <div className="w-14 h-14 rounded-full border border-dashed border-ink-faint flex items-center justify-center text-center font-mono text-[8px] uppercase text-ink-faint leading-tight">
                  selo do<br />mestre
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre" className="py-14 md:py-20 border-t border-paper-line">
          <div className="max-w-160 mx-auto text-center mb-8 md:mb-10">
            <div className="font-mono text-xs tracking-wider uppercase text-wax mb-4 md:mb-5">Por que isso existe</div>
            <h2 className="font-display font-semibold text-xl sm:text-2xl md:text-3xl">
              Uma mesa de Call of Cthulhu tem contas demais pra fazer de cabeça.
            </h2>
          </div>
          <div className="max-w-160 mx-auto text-ink-soft text-[15px] sm:text-base leading-7 sm:leading-8 space-y-5">
            <p>
              A House of the Master nasceu de uma mesa real: uma campanha de Call of Cthulhu com
              regras homebrew, onde recalcular metade e um quinto de cada perícia no meio de uma
              cena de tensão tira o jogador do momento.
            </p>
            <p className="font-display font-medium text-lg sm:text-xl text-ink border-l-2 border-wax pl-5 py-1 my-7 md:my-8">
              O mestre vê a ficha de cada jogador atualizar em tempo real. O jogador nunca mais
              faz uma conta de porcentagem na mão.
            </p>
            <p>
              Fora de uma campanha, o sistema é deliberadamente neutro — sem tema, sem cor
              definida. Essa identidade real pertence a cada mesa, definida pelo mestre assim
              que a campanha começa a existir.
            </p>
          </div>
        </section>

        {/* MOMENTOS */}
        <section id="momentos" className="py-16 md:py-24">
          <div className="text-center max-w-140 mx-auto mb-10 md:mb-12">
            <div className="font-mono text-xs tracking-wider uppercase text-wax mb-4 md:mb-5">O que acontece na mesa</div>
            <h2 className="font-display font-semibold text-xl sm:text-2xl md:text-3xl">Uma sessão, em quatro momentos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { titulo: "Os dados decidem", eyebrow: "Teste de perícia", texto: "Um teste de Força decide se a porta cede — o sistema já sabe seu valor regular, metade e um quinto.", rot: "sm:-rotate-[1.1deg]" },
              { titulo: "Os fatores vem, o sistema recalcula", eyebrow: "Ficha em uso", texto: "Cada fator influente aplicado já atualiza os efeitos e limites da ficha, sozinho.", rot: "sm:rotate-[0.8deg]" },
              { titulo: "O mestre vê ao vivo", eyebrow: "Tempo real", texto: "Enquanto o jogador atualiza a própria ficha, a mudança já aparece do lado do mestre.", rot: "sm:-rotate-[0.6deg]" },
              { titulo: "NPCs prontos entre cenas", eyebrow: "Do lado do mestre", texto: "Fichas de NPC's guardadas à parte, prontas pra entrar numa cena sem atrapalhar o ritmo.", rot: "sm:rotate-[1.2deg]" },
            ].map((card) => (
              <div key={card.titulo} className={`bg-sheet border border-paper-line rounded p-6 shadow-md hover:rotate-0! hover:-translate-y-1 transition-transform ${card.rot}`}>
                <div className="font-mono text-[10px] uppercase text-ink-faint mb-2">{card.eyebrow}</div>
                <h3 className="font-display font-semibold text-base mb-2">{card.titulo}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{card.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-paper-line py-8 md:py-9">
        <div className="max-w-280 mx-auto px-5 sm:px-7 flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-3 text-center sm:text-left">
          <div className="font-display font-semibold text-sm text-ink-soft">House of the Master</div>
          <div className="font-mono text-xs text-ink-faint">O visual muda assim que você entra em uma campanha.</div>
        </div>
      </footer>
    </>
  );
}