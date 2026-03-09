"use server";

import { db } from "@/db";
import { budgets, userAccounts, accounts } from "@/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import {
  createBudgetSchema,
  updateBudgetSchema,
  updateBudgetListItemSchema,
} from "@/lib/validations/budgets";
import type { UpdateBudgetListItem } from "@/lib/validations/budgets";
import { logger } from "@/lib/logger";

async function assertAccountOwned(userId: string, accountId: string) {
  const link = await db.query.userAccounts.findFirst({
    where: and(
      eq(userAccounts.userId, userId),
      eq(userAccounts.accountId, accountId),
    ),
  });
  if (!link) throw new Error("Account not accessible");
}

export async function listBudgetsForAccount(
  userId: string,
  accountId: string,
) {
  await assertAccountOwned(userId, accountId);
  return db.query.budgets.findMany({
    where: eq(budgets.accountId, accountId),
    orderBy: asc(budgets.createdAt),
  });
}

export async function listBudgetsForUser(userId: string) {
  const links = await db.query.userAccounts.findMany({
    where: eq(userAccounts.userId, userId),
  });

  const accountIds = links.map((l) => l.accountId);
  if (accountIds.length === 0) return [];

  return db.query.budgets.findMany({
    where: inArray(budgets.accountId, accountIds),
    orderBy: asc(budgets.createdAt),
  });
}

export async function getBudget(
  userId: string,
  accountId: string,
  budgetId: string,
) {
  await assertAccountOwned(userId, accountId);
  const budget = await db.query.budgets.findFirst({
    where: and(eq(budgets.id, budgetId), eq(budgets.accountId, accountId)),
  });
  if (!budget) throw new Error("Budget not found");
  return budget;
}

export async function createBudget(userId: string, input: unknown) {
  const data = createBudgetSchema.parse(input);
  await assertAccountOwned(userId, data.accountId);

  const [budget] = await db
    .insert(budgets)
    .values({
      accountId: data.accountId,
      label: data.label,
      iconKey: data.iconKey,
      color: data.color,
      monthlyAmount: data.monthlyAmount.toString(),
      comment: data.comment ?? null,
    })
    .returning();

  logger.info({ budgetId: budget.id, userId }, "Budget created");
  return budget;
}

export async function updateBudget(
  userId: string,
  accountId: string,
  budgetId: string,
  input: unknown,
) {
  const data = updateBudgetSchema.parse(input);
  await getBudget(userId, accountId, budgetId);

  const [updated] = await db
    .update(budgets)
    .set({
      ...data,
      monthlyAmount: data.monthlyAmount?.toString(),
      updatedAt: new Date(),
    })
    .where(eq(budgets.id, budgetId))
    .returning();

  logger.info({ budgetId, userId }, "Budget updated");
  return updated;
}

export async function deleteBudget(
  userId: string,
  accountId: string,
  budgetId: string,
) {
  await getBudget(userId, accountId, budgetId);
  await db.delete(budgets).where(eq(budgets.id, budgetId));
  logger.info({ budgetId, userId }, "Budget deleted");
}

export async function updateBudgetList(
  userId: string,
  items: UpdateBudgetListItem[],
) {
  const parsed = items.map((item) => updateBudgetListItemSchema.parse(item));

  // Get user's account IDs
  const links = await db.query.userAccounts.findMany({
    where: eq(userAccounts.userId, userId),
  });
  const ownedAccountIds = links.map((l) => l.accountId);

  if (ownedAccountIds.length === 0) return [];

  await db.transaction(async (tx) => {
    // Get existing budgets
    const existing = await tx.query.budgets.findMany({
      where: inArray(budgets.accountId, ownedAccountIds),
    });

    const receivedIds = parsed.filter((b) => b.id).map((b) => b.id!);

    // Delete budgets not in the list
    const toDelete = existing.filter((b) => !receivedIds.includes(b.id));
    for (const b of toDelete) {
      await tx.delete(budgets).where(eq(budgets.id, b.id));
    }

    // Update or create
    for (const item of parsed) {
      if (item.id) {
        const existingBudget = existing.find((b) => b.id === item.id);
        if (existingBudget) {
          await tx
            .update(budgets)
            .set({
              label: item.label,
              iconKey: item.iconKey,
              color: item.color,
              monthlyAmount: item.monthlyAmount.toString(),
              comment: item.comment ?? null,
              updatedAt: new Date(),
            })
            .where(eq(budgets.id, item.id));
        }
      } else {
        if (!item.accountId || !ownedAccountIds.includes(item.accountId)) {
          throw new Error("Invalid accountId for new budget");
        }
        await tx.insert(budgets).values({
          accountId: item.accountId,
          label: item.label,
          iconKey: item.iconKey,
          color: item.color,
          monthlyAmount: item.monthlyAmount.toString(),
          comment: item.comment ?? null,
        });
      }
    }
  });

  logger.info({ userId }, "Budget list updated");
  return listBudgetsForUser(userId);
}
