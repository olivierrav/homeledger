"use server";

import { db } from "@/db";
import { accounts, userAccounts, reconciliations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createAccountSchema, updateAccountSchema } from "@/lib/validations/accounts";
import { logger } from "@/lib/logger";

export async function listAccounts(userId: string) {
  const links = await db.query.userAccounts.findMany({
    where: eq(userAccounts.userId, userId),
    with: { account: true },
  });

  return links.map((link) => link.account);
}

export async function getAccount(userId: string, accountId: string) {
  const link = await db.query.userAccounts.findFirst({
    where: and(
      eq(userAccounts.userId, userId),
      eq(userAccounts.accountId, accountId),
    ),
    with: { account: true },
  });

  if (!link) throw new Error("Account not found");
  return link.account;
}

export async function createAccount(userId: string, input: unknown) {
  const data = createAccountSchema.parse(input);

  if (data.type === "current") {
    data.interestRate = null;
  }

  return await db.transaction(async (tx) => {
    const [account] = await tx
      .insert(accounts)
      .values({
        name: data.name,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        type: data.type,
        interestRate: data.interestRate?.toString(),
        initialBalance: data.initialBalance.toString(),
      })
      .returning();

    await tx.insert(userAccounts).values({
      userId,
      accountId: account.id,
      role: "owner",
    });

    await tx.insert(reconciliations).values({
      accountId: account.id,
      date: new Date(),
      balance: data.initialBalance.toString(),
      comment: "Initial balance",
    });

    logger.info({ accountId: account.id, userId }, "Account created");
    return account;
  });
}

export async function updateAccount(
  userId: string,
  accountId: string,
  input: unknown,
) {
  const data = updateAccountSchema.parse(input);

  // Verify ownership
  await getAccount(userId, accountId);

  if (data.type === "current") {
    data.interestRate = null;
  }

  const [updated] = await db
    .update(accounts)
    .set({
      ...data,
      interestRate: data.interestRate?.toString(),
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, accountId))
    .returning();

  logger.info({ accountId, userId }, "Account updated");
  return updated;
}

export async function deleteAccount(userId: string, accountId: string) {
  // Verify ownership
  await getAccount(userId, accountId);

  await db.transaction(async (tx) => {
    await tx
      .delete(userAccounts)
      .where(
        and(
          eq(userAccounts.userId, userId),
          eq(userAccounts.accountId, accountId),
        ),
      );

    // Check if other users still linked
    const remaining = await tx.query.userAccounts.findFirst({
      where: eq(userAccounts.accountId, accountId),
    });

    if (!remaining) {
      await tx.delete(accounts).where(eq(accounts.id, accountId));
    }
  });

  logger.info({ accountId, userId }, "Account deleted");
}
