"use client";

import { useEffect } from "react";

// Transição ao abrir a aba da raça: uma mancha de sangue nasce no ponto clicado,
// cobre a tela, a aba troca por baixo e o sangue se dissolve.
// Desempenho: o contorno irregular é desenhado UMA vez (caminhos SVG gerados abaixo) e a
// animação só mexe em `transform` e `opacity`, que a placa de vídeo anima sozinha.
// Nada de filtro ao vivo: ele era recalculado a cada quadro e travava a animação.
// A animação está no globals.css (classes `sangue-*`).
// Quem tem "reduzir movimento" ligado nem chega a ver este componente (ver FichaEditavel).

const COBRE_EM = 1100; // ms até a tela estar coberta (aí a aba troca)
const TERMINA_EM = 1750; // ms até o sangue sumir de vez

// ---------- Gerador de manchas (roda uma vez, quando o arquivo carrega) ----------

// Números pseudoaleatórios fixos: a mancha tem sempre o mesmo formato.
function aleatorio(semente) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Contorno de mancha num quadro 200×200 (centro 100,100): círculo deformado por ondas,
// com algumas pontas mais longas (respingos). Pontos ligados por curvas suaves.
function gerarMancha(semente, pontas = 5) {
  const rnd = aleatorio(semente);
  const n = 56;
  const f1 = rnd() * 6.28;
  const f2 = rnd() * 6.28;
  const f3 = rnd() * 6.28;
  const picos = Array.from({ length: pontas }, () => ({ ang: rnd() * 6.28, forca: 10 + rnd() * 16 }));

  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let r = 66 + 8 * Math.sin(3 * a + f1) + 5 * Math.sin(5 * a + f2) + 3 * Math.sin(11 * a + f3);
    for (const p of picos) {
      const d = Math.atan2(Math.sin(a - p.ang), Math.cos(a - p.ang)); // distância angular
      r += p.forca * Math.exp(-(d * d) / 0.012); // ponta estreita
    }
    pts.push([100 + r * Math.cos(a), 100 + r * Math.sin(a)]);
  }

  // Catmull-Rom → Bézier cúbica (contorno fechado e suave)
  const f = (v) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

// Cada mancha: tamanho (antes da escala), deslocamento a partir do clique, escala final,
// giro e tempo. A primeira é o corpo principal; as outras são respingos ao redor.
const MANCHAS = [
  { tam: "140vmax", dx: 0, dy: 0, escala: 4.6, giro: 38, dur: 1.0, atraso: 0.08, semente: 11, pontas: 7, principal: true },
  { tam: "560px", dx: -170, dy: 80, escala: 1, giro: -25, dur: 0.55, atraso: 0, semente: 23, pontas: 4 },
  { tam: "460px", dx: 200, dy: -70, escala: 1, giro: 30, dur: 0.5, atraso: 0.03, semente: 37, pontas: 5 },
  { tam: "340px", dx: 70, dy: 220, escala: 1, giro: -40, dur: 0.6, atraso: 0.06, semente: 41, pontas: 3 },
  { tam: "260px", dx: -240, dy: -150, escala: 1, giro: 20, dur: 0.55, atraso: 0.1, semente: 59, pontas: 4 },
].map((m) => ({ ...m, d: gerarMancha(m.semente, m.pontas) }));

// Escorridos: descem do ponto do clique.
const ESCORRIDOS = [
  { w: 90, h: 700, dx: -90, dy: 120, dur: 0.85, atraso: 0.12 },
  { w: 70, h: 520, dx: 130, dy: 140, dur: 0.8, atraso: 0.18 },
  { w: 60, h: 420, dx: 260, dy: 60, dur: 0.75, atraso: 0.22 },
];

// ---------- Componente ----------

export default function TransicaoSangue({ x, y, onCobrir, onFim }) {
  useEffect(() => {
    const cobrir = setTimeout(onCobrir, COBRE_EM);
    const fim = setTimeout(onFim, TERMINA_EM);
    return () => {
      clearTimeout(cobrir);
      clearTimeout(fim);
    };
    // Roda uma vez por transição; onCobrir/onFim só chamam setState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-hidden="true" className="sangue-camada">
      {MANCHAS.map((m, i) => (
        <svg
          key={`m${i}`}
          viewBox="0 0 200 200"
          className="sangue-forma"
          style={{
            left: x,
            top: y,
            width: m.tam,
            height: m.tam,
            marginLeft: `calc(${m.tam} / -2 + ${m.dx}px)`,
            marginTop: `calc(${m.tam} / -2 + ${m.dy}px)`,
            "--escala": m.escala,
            "--giro": `${m.giro}deg`,
            "--dur": `${m.dur}s`,
            "--atraso": `${m.atraso}s`,
          }}
        >
          {m.principal && (
            <defs>
              <radialGradient id="sangue-grad-principal">
                <stop offset="0%" className="sangue-tom-claro" />
                <stop offset="40%" className="sangue-tom" />
                <stop offset="100%" className="sangue-tom-escuro" />
              </radialGradient>
            </defs>
          )}
          <path d={m.d} fill={m.principal ? "url(#sangue-grad-principal)" : undefined} className={m.principal ? "" : "sangue-preenche"} />
        </svg>
      ))}

      {ESCORRIDOS.map((e, i) => (
        <div
          key={`e${i}`}
          className="sangue-forma sangue-escorre"
          style={{
            left: x,
            top: y,
            width: e.w,
            height: e.h,
            marginLeft: e.dx - e.w / 2,
            marginTop: e.dy,
            "--dur": `${e.dur}s`,
            "--atraso": `${e.atraso}s`,
          }}
        />
      ))}
    </div>
  );
}