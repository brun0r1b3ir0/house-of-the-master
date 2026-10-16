export default function Card({ titulo, acao, className = "", children }) {
  return (
    <section className={`border border-black bg-wi-paper p-4 text-wi-ink ${className}`}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="font-wi-display text-[21px] font-normal tracking-wide">{titulo}</h3>
        {acao}
      </div>
      {children}
    </section>
  );
}