"use server";

import { db } from "@/db";
import {
  operations,
  reconciliations,
  budgets,
  userAccounts,
} from "@/db/schema";
import { eq, and, ne, inArray, desc, sql } from "drizzle-orm";
import { createReconciliationSchema } from "@/lib/validations/operations";
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

export interface ReconciliationStatus {
  lastReconciliationDate: Date | null;
  lastReconciliationBalance: number;
  theoreticalBalance: number;
  budgetBalance: number;
}

export async function getReconciliationStatus(
  userId: string,
  accountId: string,
): Promise<ReconciliationStatus> {
  await assertAccountOwned(userId, accountId);

  // Last reconciliation
  const lastRecon = await db.query.reconciliations.findFirst({
    where: eq(reconciliations.accountId, accountId),
    orderBy: desc(reconciliations.date),
  });

  if (!lastRecon) throw new Error("No reconciliation found");

  // Sum of unpointed operations
  const [unpointedResult] = await db
    .select({ total: sql<string>`COALESCE(SUM(${operations.amount}), 0)` })
    .from(operations)
    .where(
      and(
        eq(operations.accountId, accountId),
        ne(operations.status, "pointed"),
      ),
    );

  // Sum of budget balances
  const [budgetResult] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${budgets.currentBalance}), 0)`,
    })
    .from(budgets)
    .where(eq(budgets.accountId, accountId));

  const reconBalance = parseFloat(lastRecon.balance);
  const unpointedSum = parseFloat(unpointedResult.total);
  const budgetSum = parseFloat(budgetResult.total);

  const theoreticalBalance =
    Math.round((reconBalance + unpointedSum - budgetSum) * 100) / 100;

  return {
    lastReconciliationDate: lastRecon.date,
    lastReconciliationBalance: reconBalance,
    theoreticalBalance,
    budgetBalance: Math.round(budgetSum * 100) / 100,
  };
}

export async function createReconciliation(
  userId: string,
  accountId: string,
  input: unknown,
) {
  const data = createReconciliationSchema.parse(input);
  await assertAccountOwned(userId, accountId);

  return await db.transaction(async (tx) => {
    // Get previous balance
    const lastRecon = await tx.query.reconciliations.findFirst({
      where: eq(reconciliations.accountId, accountId),
      orderBy: desc(reconciliations.date),
    });

    const previousBalance = lastRecon ? parseFloat(lastRecon.balance) : 0;

    // Get operations to reconcile
    const ops = await tx.query.operations.findMany({
      where: and(
        inArray(operations.id, data.operationIds),
        eq(operations.accountId, accountId),
      ),
    });

    const totalAmount = ops.reduce(
      (sum, op) => sum + parseFloat(op.amount),
      0,
    );

    if (previousBalance + totalAmount !== data.balance) {
      throw new Error(
        "Balance difference does not match sum of operations",
      );
    }

    // Create reconciliation
    const [recon] = await tx
      .insert(reconciliations)
      .values({
        accountId,
        date: new Date(data.date),
        balance: data.balance.toString(),
      })
      .returning();

    // Mark operations as pointed
    for (const op of ops) {
      await tx
        .update(operations)
        .set({
          reconciliationId: recon.id,
          status: "pointed",
          updatedAt: new Date(),
        })
        .where(eq(operations.id, op.id));
    }

    logger.info(
      { reconciliationId: recon.id, accountId, userId, opsCount: ops.length },
      "Reconciliation created",
    );
    return recon;
  });
}
