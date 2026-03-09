"use server";

import { requireAuth } from "@/lib/auth";
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from "./accounts";
import { revalidatePath } from "next/cache";

export async function safeListAccounts() {
  const userId = await requireAuth();
  return listAccounts(userId);
}

export async function safeGetAccount(accountId: string) {
  const userId = await requireAuth();
  return getAccount(userId, accountId);
}

export async function safeCreateAccount(input: unknown) {
  const userId = await requireAuth();
  const result = await createAccount(userId, input);
  revalidatePath("/app/accounts");
  revalidatePath("/app");
  return result;
}

export async function safeUpdateAccount(accountId: string, input: unknown) {
  const userId = await requireAuth();
  const result = await updateAccount(userId, accountId, input);
  revalidatePath("/app/accounts");
  return result;
}

export async function safeDeleteAccount(accountId: string) {
  const userId = await requireAuth();
  await deleteAccount(userId, accountId);
  revalidatePath("/app/accounts");
  revalidatePath("/app");
}
