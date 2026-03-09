import NextAuth from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ profile }) {
      if (!profile?.sub || !profile?.email) return false;

      // Upsert user in our DB on every sign-in
      const existing = await db.query.users.findFirst({
        where: eq(users.keycloakSub, profile.sub),
      });

      if (!existing) {
        await db.insert(users).values({
          keycloakSub: profile.sub,
          email: profile.email,
          firstName: (profile.given_name as string) ?? null,
          lastName: (profile.family_name as string) ?? null,
        });
      } else {
        await db
          .update(users)
          .set({
            email: profile.email,
            firstName: (profile.given_name as string) ?? existing.firstName,
            lastName: (profile.family_name as string) ?? existing.lastName,
            updatedAt: new Date(),
          })
          .where(eq(users.keycloakSub, profile.sub));
      }

      return true;
    },

    async jwt({ token, profile }) {
      // On sign-in, resolve the internal user ID
      if (profile?.sub) {
        token.keycloakSub = profile.sub;
        const dbUser = await db.query.users.findFirst({
          where: eq(users.keycloakSub, profile.sub),
        });
        if (dbUser) {
          token.userId = dbUser.id;
        }
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
});

/**
 * Get the current authenticated user's internal DB ID.
 * Throws if not authenticated.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
