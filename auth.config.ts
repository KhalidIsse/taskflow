// Edge-safe config (no database imports) so middleware can use it.
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [Google, GitHub],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/dashboard")) return !!auth?.user;
      return true;
    },
  },
} satisfies NextAuthConfig;
