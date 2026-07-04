"use client";
import Image from "next/image";

import { useActionState, useState } from "react";

export default function Home() {
    const [nome, setNome] = useState("");

    function saudacao() {
      return "bem-vindo, " + nome;
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div>
        <h1 className="text-3x1 font-bold text-emerald-500">Olá, House of The master</h1>
        <input
          type="text"
          value={nome}
          onChange={(e) => SetNome(e.target.value)}
          className="text-white px-2 py-1 rounded"
        />
        <p className="text-white text-neutral 400">{saudacao()}</p>
        <p className="text-neutral-400">Esse texto sou eu escrevendo JSX pela primeira vez</p>
      </div>
    </div>
  );
}
