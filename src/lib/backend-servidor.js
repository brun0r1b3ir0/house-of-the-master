import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getToken } from "next-auth/jwt";

// Leitura do Spring a partir de páginas/layouts (componentes de servidor).
// Devolve { status, dados }. Nunca lança por status HTTP.
export async function lerDoBackend(caminho) {
  const token = await getToken({
    req: { headers: await headers() },
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.accessToken) return { status: 401, dados: null };

  try {
    const res = await fetch(`${process.env.BACKEND_URL}${caminho}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      cache: "no-store",
    });
    const texto = await res.text();
    let dados = null;
    try {
      dados = texto ? JSON.parse(texto) : null;
    } catch {
      dados = null;
    }
    return { status: res.status, dados };
  } catch {
    return { status: 502, dados: null };
  }
}

// Mesma leitura, mas já trata os casos comuns: 401 vai ao login, 404 vira
// página não encontrada, qualquer outro erro lança (cai no error.js).
export async function exigirDoBackend(caminho) {
  const { status, dados } = await lerDoBackend(caminho);
  if (status === 401) redirect("/login");
  if (status === 404) notFound();
  if (status < 200 || status >= 300) throw new Error("Não foi possível carregar os dados.");
  return dados;
}