"use client";

// Controles pequenos da ficha. Os campos só gravam ao sair do campo (blur) ou
// no Enter, e não a cada tecla, para não "brigar" com quem está digitando.
// O `key` faz o campo recomeçar quando o valor muda por fora (servidor, +/−).

const base =
  "border-0 border-b border-dashed bg-transparent text-wi-ink outline-none " +
  "focus:border-[var(--ac-p)] disabled:cursor-default disabled:border-transparent disabled:opacity-100";

function teclas(valorAtual) {
  return (e) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      e.currentTarget.value = String(valorAtual ?? "");
      e.currentTarget.blur();
    }
  };
}

export function CampoNumero({
  valor,
  min = 0,
  max = 9999,
  onConfirmar,
  desabilitado = false,
  rotulo,
  className = "w-10",
}) {
  function confirmar(e) {
    const campo = e.currentTarget;
    const bruto = campo.value.trim();
    const n = Number(bruto);
    if (bruto === "" || !Number.isFinite(n)) {
      campo.value = String(valor);
      return;
    }
    const final = Math.min(max, Math.max(min, Math.round(n)));
    campo.value = String(final);
    if (final !== valor) onConfirmar(final);
  }

  return (
    <input
      key={valor}
      type="text"
      inputMode="numeric"
      defaultValue={valor}
      disabled={desabilitado}
      aria-label={rotulo}
      onBlur={confirmar}
      onKeyDown={teclas(valor)}
      onFocus={(e) => e.currentTarget.select()}
      className={`${base} border-wi-line py-px text-center font-mono text-[13px] ${className}`}
    />
  );
}

export function CampoTexto({
  valor,
  onConfirmar,
  obrigatorio = false,
  maxLength = 120,
  desabilitado = false,
  rotulo,
  placeholder,
  className = "",
}) {
  function confirmar(e) {
    const campo = e.currentTarget;
    const texto = campo.value.trim();
    const anterior = valor ?? "";
    if (obrigatorio && texto === "") {
      campo.value = anterior;
      return;
    }
    campo.value = texto;
    if (texto !== anterior) onConfirmar(texto === "" ? null : texto);
  }

  return (
    <input
      key={valor ?? ""}
      type="text"
      defaultValue={valor ?? ""}
      maxLength={maxLength}
      disabled={desabilitado}
      aria-label={rotulo}
      placeholder={placeholder}
      onBlur={confirmar}
      onKeyDown={teclas(valor)}
      className={className}
    />
  );
}

export function BotaoPasso({ onClick, desabilitado = false, rotulo, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-label={rotulo}
      className="h-[26px] w-[26px] shrink-0 border border-wi-ink font-mono leading-none text-wi-ink transition-colors hover:bg-wi-ink hover:text-wi-bone disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-wi-ink"
    >
      {children}
    </button>
  );
}