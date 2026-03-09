"use server";

import { requireAuth } from "@/lib/auth";
import {
  listBudgetsForUser,
  listBudgetsForAccount,
  createBudget,
  updateBudget,
  deleteBudget,
  updateBudgetList,
} from "./budgets";
import type { UpdateBudgetListItem } from "@/lib/validations/budgets";
import { revalidatePath } from "next/cache";

export async function safeListBudgetsForUser() {
  const userId = await requireAuth();
  return listBudgetsForUser(userId);
}

export async function safeListBudgetsForAccount(accountId: string) {
  const userId = await requireAuth();
  return listBudgetsForAccount(userId, accountId);
}

export async function safeCreateBudget(input: unknown) {
  const userId = await requireAuth();
  const result = await createBudget(userId, input);
  revalidatePath("/app/budgets");
  return result;
}

export async function safeUpdateBudget(
  accountId: string,
  budgetId: string,
  input: unknown
) {
  const userId = await requireAuth();
  const result = await updateBudget(userId, accountId, budgetId, input);
  revalidatePath("/app/budgets");
  return result;
}

export async function safeDeleteBudget(accountId: string, budgetId: string) {
  const userId = await requireAuth();
  await deleteBudget(userId, accountId, budgetId);
  revalidatePath("/app/budgets");
}

export async function safeUpdateBudgetList(items: UpdateBudgetListItem[]) {
  const userId = await requireAuth();
  const result = await updateBudgetList(userId, items);
  revalidatePath("/app/budgets");
  return result;
}
