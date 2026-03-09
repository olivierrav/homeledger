"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// TODO: Replace with real Auth.js session when configured
// For now, this is a placeholder that will be wired to Auth.js v5 + Keycloak
export async function getCurrentUser() {
  // This will be replaced by:
  // const session = await auth();
  // if (!session?.user) throw new Error("Unauthorized");
  // return session.user;
  throw new Error("Auth not configured yet");
}

export async function getOrCreateUser(keycloakSub: string, email: string, firstName?: string, lastName?: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.keycloakSub, keycloakSub),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({ keycloakSub, email, firstName, lastName })
    .returning();

  return created;
}
