import type { NextAuthConfig } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * Auth.js config without DB dependencies.
 * Used by the Edge middleware for session checks.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathWithoutLocale =
        nextUrl.pathname.replace(/^\/(en|fr)/, "") || "/";
      const isProtected = pathWithoutLocale.startsWith("/app");

      if (isProtected && !isLoggedIn) return false;
      return true;
    },

    async jwt({ token, profile }) {
      if (profile?.sub) {
        token.keycloakSub = profile.sub;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
};
