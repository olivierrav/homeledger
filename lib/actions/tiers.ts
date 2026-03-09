"use server";

import { db } from "@/db";
import { tiers, categories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { createTierSchema, updateTierSchema } from "@/lib/validations/tiers";
import { logger } from "@/lib/logger";

export async function listTiers(userId: string) {
  return db.query.tiers.findMany({
    where: eq(tiers.userId, userId),
    orderBy: asc(tiers.name),
  });
}

export async function getTier(userId: string, tierId: string) {
  const tier = await db.query.tiers.findFirst({
    where: and(eq(tiers.id, tierId), eq(tiers.userId, userId)),
  });

  if (!tier) throw new Error("Tier not found");
  return tier;
}

async function assertCategoryOwned(userId: string, categoryId: string) {
  const cat = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
  });
  if (!cat) throw new Error("Invalid categoryId");
}

export async function createTier(userId: string, input: unknown) {
  const data = createTierSchema.parse(input);

  if (data.categoryId) {
    await assertCategoryOwned(userId, data.categoryId);
  }

  const [tier] = await db
    .insert(tiers)
    .values({
      userId,
      name: data.name,
      description: data.description ?? null,
      categoryId: data.categoryId ?? null,
    })
    .returning();

  logger.info({ tierId: tier.id, userId }, "Tier created");
  return tier;
}

export async function updateTier(
  userId: string,
  tierId: string,
  input: unknown,
) {
  const data = updateTierSchema.parse(input);
  await getTier(userId, tierId);

  if (data.categoryId) {
    await assertCategoryOwned(userId, data.categoryId);
  }

  const [updated] = await db
    .update(tiers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tiers.id, tierId))
    .returning();

  logger.info({ tierId, userId }, "Tier updated");
  return updated;
}

export async function deleteTier(userId: string, tierId: string) {
  await getTier(userId, tierId);
  await db.delete(tiers).where(eq(tiers.id, tierId));
  logger.info({ tierId, userId }, "Tier deleted");
}
