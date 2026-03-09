"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validations/categories";
import { logger } from "@/lib/logger";

export async function listCategories(userId: string) {
  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: asc(categories.name),
  });
}

export async function getCategory(userId: string, categoryId: string) {
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
  });

  if (!category) throw new Error("Category not found");
  return category;
}

export async function createCategory(userId: string, input: unknown) {
  const data = createCategorySchema.parse(input);

  const [category] = await db
    .insert(categories)
    .values({
      userId,
      name: data.name,
      color: data.color ?? "#1890ff",
      iconKey: data.iconKey ?? null,
    })
    .returning();

  logger.info({ categoryId: category.id, userId }, "Category created");
  return category;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: unknown,
) {
  const data = updateCategorySchema.parse(input);
  await getCategory(userId, categoryId);

  const [updated] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, categoryId))
    .returning();

  logger.info({ categoryId, userId }, "Category updated");
  return updated;
}

export async function deleteCategory(userId: string, categoryId: string) {
  await getCategory(userId, categoryId);
  await db.delete(categories).where(eq(categories.id, categoryId));
  logger.info({ categoryId, userId }, "Category deleted");
}
