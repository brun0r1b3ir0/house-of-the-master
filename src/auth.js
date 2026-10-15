import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24h, igual à validade do token do Spring
  },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, senha: {} },
      async authorize(credentials) {
        const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            senha: credentials.senha,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        return {
          id: data.usuario.id,
          name: data.usuario.nome,
          email: data.usuario.email,
          accessToken: data.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // "user" só existe no momento do login
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Só o id vai para a sessão. O accessToken NÃO entra aqui de propósito.
      session.user.id = token.userId;
      return session;
    },
  },
});