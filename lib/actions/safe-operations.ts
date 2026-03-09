"use server";

import { requireAuth } from "@/lib/auth";
import {
  listOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  bulkCreateOperations,
} from "./operations";
import {
  getReconciliationStatus,
  createReconciliation,
} from "./reconciliation";
import { revalidatePath } from "next/cache";

export async function safeListOperations(
  accountId: string,
  options?: { pointed?: boolean }
) {
  const userId = await requireAuth();
  return listOperations(userId, accountId, options);
}

export async function safeCreateOperation(accountId: string, input: unknown) {
  const userId = await requireAuth();
  const result = await createOperation(userId, accountId, input);
  revalidatePath(`/app/accounts/${accountId}`);
  return result;
}

export async function safeUpdateOperation(
  accountId: string,
  operationId: string,
  input: unknown
) {
  const userId = await requireAuth();
  const result = await updateOperation(userId, accountId, operationId, input);
  revalidatePath(`/app/accounts/${accountId}`);
  return result;
}

export async function safeDeleteOperation(
  accountId: string,
  operationId: string
) {
  const userId = await requireAuth();
  await deleteOperation(userId, accountId, operationId);
  revalidatePath(`/app/accounts/${accountId}`);
}

export async function safeBulkCreateOperations(
  accountId: string,
  input: unknown
) {
  const userId = await requireAuth();
  const result = await bulkCreateOperations(userId, accountId, input);
  revalidatePath(`/app/accounts/${accountId}`);
  return result;
}

export async function safeGetReconciliationStatus(accountId: string) {
  const userId = await requireAuth();
  return getReconciliationStatus(userId, accountId);
}

export async function safeCreateReconciliation(
  accountId: string,
  input: unknown
) {
  const userId = await requireAuth();
  const result = await createReconciliation(userId, accountId, input);
  revalidatePath(`/app/accounts/${accountId}`);
  return result;
}
