import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getToken } from "next-auth/jwt";

// Uma única chamada ao Spring por requisição, mesmo se layout e página pedirem.
const obterCampanha = cache(async (id) => {
  const token = await getToken({
    req: { headers: await headers() },
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.accessToken) return { status: 401, campanha: null };

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/campanhas/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${token.accessToken}` },
        cache: "no-store",
      }
    );

    if (!res.ok) return { status: res.status, campanha: null };
    return { status: 200, campanha: await res.json() };
  } catch {
    return { status: 502, campanha: null };
  }
});

// Devolve a campanha (com o papel do usuário NELA) ou redireciona/404.
export async function exigirCampanha(id) {
  const { status, campanha } = await obterCampanha(id);

  if (status === 401) redirect("/login");
  if (status === 404) notFound();
  if (!campanha) throw new Error("Não foi possível carregar a campanha.");

  return campanha;
}