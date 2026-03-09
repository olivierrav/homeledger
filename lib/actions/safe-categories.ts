"use server";

import { requireAuth } from "@/lib/auth";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories";
import { revalidatePath } from "next/cache";

export async function safeListCategories() {
  const userId = await requireAuth();
  return listCategories(userId);
}

export async function safeCreateCategory(input: unknown) {
  const userId = await requireAuth();
  const result = await createCategory(userId, input);
  revalidatePath("/app/categories");
  return result;
}

export async function safeUpdateCategory(categoryId: string, input: unknown) {
  const userId = await requireAuth();
  const result = await updateCategory(userId, categoryId, input);
  revalidatePath("/app/categories");
  return result;
}

export async function safeDeleteCategory(categoryId: string) {
  const userId = await requireAuth();
  await deleteCategory(userId, categoryId);
  revalidatePath("/app/categories");
}
