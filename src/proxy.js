import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ROTAS_PUBLICAS = ["/", "/login", "/registro", "/api/registro"];
const ROTAS_SO_DESLOGADO = ["/login", "/registro"];

export const proxy = auth((req) => {
  const logado = !!req.auth;
  const { pathname } = req.nextUrl;

  if (!logado && !ROTAS_PUBLICAS.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (logado && ROTAS_SO_DESLOGADO.includes(pathname)) {
    return NextResponse.redirect(new URL("/campanhas", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};