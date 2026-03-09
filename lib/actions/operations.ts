"use server";

import { db } from "@/db";
import {
  operations,
  userAccounts,
  tiers,
  budgets,
  categories,
} from "@/db/schema";
import { eq, and, ne, inArray, desc } from "drizzle-orm";
import {
  createOperationSchema,
  updateOperationSchema,
  bulkCreateOperationsSchema,
} from "@/lib/validations/operations";
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

async function assertTierOwned(userId: string, tierId: string) {
  const tier = await db.query.tiers.findFirst({
    where: and(eq(tiers.id, tierId), eq(tiers.userId, userId)),
  });
  if (!tier) throw new Error("Tier not accessible");
}

async function assertBudgetCompatible(accountId: string, budgetId: string) {
  const budget = await db.query.budgets.findFirst({
    where: and(eq(budgets.id, budgetId), eq(budgets.accountId, accountId)),
  });
  if (!budget) throw new Error("Budget does not belong to this account");
}

async function assertCategoryOwned(userId: string, categoryId: string) {
  const cat = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
  });
  if (!cat) throw new Error("Category not accessible");
}

export async function listOperations(
  userId: string,
  accountId: string,
  options: { pointed?: boolean } = {},
) {
  await assertAccountOwned(userId, accountId);

  const conditions = [eq(operations.accountId, accountId)];

  if (options.pointed === true) {
    conditions.push(
      inArray(operations.status, ["pointed", "posted", "pending"]),
    );
  } else if (options.pointed === false) {
    conditions.push(inArray(operations.status, ["posted", "pending"]));
  }

  return db.query.operations.findMany({
    where: and(...conditions),
    orderBy: desc(operations.dateTime),
  });
}

export async function getOperation(
  userId: string,
  accountId: string,
  operationId: string,
) {
  await assertAccountOwned(userId, accountId);

  const op = await db.query.operations.findFirst({
    where: and(
      eq(operations.id, operationId),
      eq(operations.accountId, accountId),
    ),
  });

  if (!op) throw new Error("Operation not found");
  return op;
}

export async function createOperation(
  userId: string,
  accountId: string,
  input: unknown,
) {
  const data = createOperationSchema.parse(input);

  await assertAccountOwned(userId, accountId);
  if (data.tierId) await assertTierOwned(userId, data.tierId);
  if (data.budgetId) await assertBudgetCompatible(accountId, data.budgetId);
  if (data.categoryId) await assertCategoryOwned(userId, data.categoryId);
  if (data.linkedAccountId)
    await assertAccountOwned(userId, data.linkedAccountId);

  const validTypes = [
    "card",
    "transfer",
    "deposit",
    "cheque",
    "direct_debit",
    "other",
  ] as const;
  const opType =
    data.type && validTypes.includes(data.type) ? data.type : "other";

  const [op] = await db
    .insert(operations)
    .values({
      accountId,
      tierId: data.tierId ?? null,
      budgetId: data.budgetId ?? null,
      categoryId: data.categoryId ?? null,
      linkedAccountId: data.linkedAccountId ?? null,
      type: opType,
      dateTime: new Date(data.dateTime),
      amount: data.amount.toString(),
      description: data.description ?? null,
      status: "pending",
      imported: data.imported ?? false,
      rawLabel: data.rawLabel ?? null,
      normalizedLabel: data.normalizedLabel ?? null,
      suggestedTierId: data.suggestedTierId ?? null,
      suggestedBudgetId: data.suggestedBudgetId ?? null,
      suggestionConfidence: data.suggestionConfidence?.toString() ?? null,
      suggestionAccepted: data.suggestionAccepted ?? null,
    })
    .returning();

  logger.info({ operationId: op.id, accountId, userId }, "Operation created");
  return op;
}

export async function updateOperation(
  userId: string,
  accountId: string,
  operationId: string,
  input: unknown,
) {
  const data = updateOperationSchema.parse(input);
  const op = await getOperation(userId, accountId, operationId);

  if (op.status === "pointed") {
    throw new Error("Cannot modify a pointed operation");
  }

  if (data.tierId) await assertTierOwned(userId, data.tierId);
  if (data.budgetId) await assertBudgetCompatible(accountId, data.budgetId);
  if (data.categoryId) await assertCategoryOwned(userId, data.categoryId);
  if (data.linkedAccountId)
    await assertAccountOwned(userId, data.linkedAccountId);

  // Only allow pending <-> posted status changes
  let newStatus = op.status;
  if (data.status && data.status !== op.status) {
    if (data.status === "pending" || data.status === "posted") {
      newStatus = data.status;
    }
  }

  const [updated] = await db
    .update(operations)
    .set({
      tierId: data.tierId !== undefined ? (data.tierId ?? null) : undefined,
      dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
      amount: data.amount?.toString(),
      description:
        data.description !== undefined ? (data.description ?? null) : undefined,
      budgetId:
        data.budgetId !== undefined ? (data.budgetId ?? null) : undefined,
      categoryId:
        data.categoryId !== undefined ? (data.categoryId ?? null) : undefined,
      linkedAccountId:
        data.linkedAccountId !== undefined
          ? (data.linkedAccountId ?? null)
          : undefined,
      type: data.type !== undefined ? (data.type ?? undefined) : undefined,
      imported: data.imported,
      status: newStatus,
      rawLabel:
        data.rawLabel !== undefined ? (data.rawLabel ?? null) : undefined,
      normalizedLabel:
        data.normalizedLabel !== undefined
          ? (data.normalizedLabel ?? null)
          : undefined,
      suggestedTierId:
        data.suggestedTierId !== undefined
          ? (data.suggestedTierId ?? null)
          : undefined,
      suggestedBudgetId:
        data.suggestedBudgetId !== undefined
          ? (data.suggestedBudgetId ?? null)
          : undefined,
      suggestionConfidence:
        data.suggestionConfidence !== undefined
          ? (data.suggestionConfidence?.toString() ?? null)
          : undefined,
      suggestionAccepted:
        data.suggestionAccepted !== undefined
          ? (data.suggestionAccepted ?? null)
          : undefined,
      updatedAt: new Date(),
    })
    .where(eq(operations.id, operationId))
    .returning();

  logger.info({ operationId, userId }, "Operation updated");
  return updated;
}

export async function deleteOperation(
  userId: string,
  accountId: string,
  operationId: string,
) {
  const op = await getOperation(userId, accountId, operationId);

  if (op.status === "pointed") {
    throw new Error("Cannot delete a pointed operation");
  }

  await db.delete(operations).where(eq(operations.id, operationId));
  logger.info({ operationId, userId }, "Operation deleted");
}

export async function bulkCreateOperations(
  userId: string,
  accountId: string,
  input: unknown,
) {
  const items = bulkCreateOperationsSchema.parse(input);
  await assertAccountOwned(userId, accountId);

  // Validate all referenced entities upfront
  const tierIds = [
    ...new Set(items.map((op) => op.tierId).filter(Boolean)),
  ] as string[];
  const budgetIds = [
    ...new Set(items.map((op) => op.budgetId).filter(Boolean)),
  ] as string[];
  const categoryIds = [
    ...new Set(items.map((op) => op.categoryId).filter(Boolean)),
  ] as string[];

  for (const id of tierIds) await assertTierOwned(userId, id);
  for (const id of budgetIds) await assertBudgetCompatible(accountId, id);
  for (const id of categoryIds) await assertCategoryOwned(userId, id);

  const validTypes = [
    "card",
    "transfer",
    "deposit",
    "cheque",
    "direct_debit",
    "other",
  ] as const;

  const rows = items.map((item) => ({
    accountId,
    tierId: item.tierId ?? null,
    budgetId: item.budgetId ?? null,
    categoryId: item.categoryId ?? null,
    linkedAccountId: item.linkedAccountId ?? null,
    type:
      item.type && validTypes.includes(item.type) ? item.type : ("other" as const),
    dateTime: new Date(item.dateTime),
    amount: item.amount.toString(),
    description: item.description ?? null,
    status:
      (item.status as "pending" | "posted") ?? ("pending" as const),
    imported: item.imported ?? false,
    rawLabel: item.rawLabel ?? null,
    normalizedLabel: item.normalizedLabel ?? null,
    suggestedTierId: item.suggestedTierId ?? null,
    suggestedBudgetId: item.suggestedBudgetId ?? null,
    suggestionConfidence: item.suggestionConfidence?.toString() ?? null,
    suggestionAccepted: item.suggestionAccepted ?? null,
  }));

  const created = await db.insert(operations).values(rows).returning();

  logger.info(
    { count: created.length, accountId, userId },
    "Bulk operations created",
  );
  return created;
}
