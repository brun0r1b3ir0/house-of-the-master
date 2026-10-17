"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calcularFicha } from "@/lib/warif";
import { criarMotor } from "@/lib/ficha-motor";

// Liga o motor de autosave ao React.
// Devolve: ficha (já com as edições), calc (valores calculados), status e erro.
export function useFichaAutosave({ campanhaId, fichaId, fichaInicial, sistema, editavel }) {
  const router = useRouter();
  const [ficha, setFicha] = useState(fichaInicial);
  const [status, setStatus] = useState("salvo"); // salvo | pendente | salvando | erro
  const [erro, setErro] = useState(null);

  async function enviar(ops, { keepalive = false } = {}) {
    const res = await fetch(
      `/api/campanhas/${encodeURIComponent(campanhaId)}/fichas/${encodeURIComponent(fichaId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops }),
        keepalive,
      },
    );
    if (res.status === 401) router.push("/login");
    const dados = await res.json().catch(() => null);
    return { status: res.status, dados };
  }

  const [motor] = useState(() =>
    criarMotor({
      inicial: fichaInicial,
      enviar,
      aoMudarFicha: setFicha,
      aoMudarStatus: setStatus,
      aoErro: setErro,
    }),
  );

  const calc = useMemo(() => calcularFicha(ficha, sistema), [ficha, sistema]);

  // Correções que o cálculo pede (Colapso Mágico, perda permanente de TAM).
  useEffect(() => {
    if (!editavel) return;
    motor.sugerir("flags.colapsoMagico", calc.sugestoes.colapsoMagico);
    // Fome: a perda sai do TAM digitado e o contador registra quanto já foi tirado.
    motor.sugerir("atributos.TAM", calc.sugestoes.tam);
    motor.sugerir("perdaPermanenteTam", calc.sugestoes.perdaPermanenteTam);
  }, [calc, editavel, motor]);

  // Ao sair da página ou da aba, envia o que ainda estiver na fila.
  useEffect(() => {
    const sair = () => motor.descarregar({ keepalive: true });
    const aoEsconder = () => {
      if (document.visibilityState === "hidden") sair();
    };
    window.addEventListener("pagehide", sair);
    document.addEventListener("visibilitychange", aoEsconder);
    return () => {
      window.removeEventListener("pagehide", sair);
      document.removeEventListener("visibilitychange", aoEsconder);
      sair();
    };
  }, [motor]);

  return { ficha, calc, status, erro, alterar: motor.alterar };
}