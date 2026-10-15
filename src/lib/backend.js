import { getToken } from "next-auth/jwt";

export async function chamarBackend(req, caminho, opcoes = {}) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token?.accessToken) {
    return { status: 401, dados: { mensagem: "Sessão expirada." } };
  }

  const res = await fetch(`${process.env.BACKEND_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    cache: "no-store",
  });

  const texto = await res.text();
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    dados = { mensagem: texto };
  }

  return { status: res.status, dados };
}