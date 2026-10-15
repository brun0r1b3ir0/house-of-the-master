import Link from "next/link";
import { redirect } from "next/navigation";
import { exigirCampanha } from "@/lib/campanha";

export default async function MestrePage({ params }) {
  const { id } = await params;
  const campanha = await exigirCampanha(id);

  // Quem não é Mestre desta campanha vai para a visão de Jogador
  if (campanha.papel !== "MESTRE") {
    redirect(`/campanhas/${id}/jogador`);
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-wax mb-2">
          Feed de mestre
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-2">
          {campanha.titulo}
        </h1>
        <p className="font-body text-ink-soft mb-8">
          Código de convite:{" "}
          <span className="font-mono text-ink">{campanha.codigoConvite}</span>
        </p>
        <Link
          href="/campanhas"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:text-ink transition-colors"
        >
          Voltar ao feed
        </Link>
      </div>
    </main>
  );
}