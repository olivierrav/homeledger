"use server";

import { requireAuth } from "@/lib/auth";
import { listTiers, createTier, updateTier, deleteTier } from "./tiers";
import { revalidatePath } from "next/cache";

export async function safeListTiers() {
  const userId = await requireAuth();
  return listTiers(userId);
}

export async function safeCreateTier(input: unknown) {
  const userId = await requireAuth();
  const result = await createTier(userId, input);
  revalidatePath("/app/tiers");
  return result;
}

export async function safeUpdateTier(tierId: string, input: unknown) {
  const userId = await requireAuth();
  const result = await updateTier(userId, tierId, input);
  revalidatePath("/app/tiers");
  return result;
}

export async function safeDeleteTier(tierId: string) {
  const userId = await requireAuth();
  await deleteTier(userId, tierId);
  revalidatePath("/app/tiers");
}
