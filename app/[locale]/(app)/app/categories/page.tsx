import { requireAuth } from "@/lib/auth";
import { listCategories } from "@/lib/actions/categories";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const userId = await requireAuth();
  const initialCategories = await listCategories(userId);

  return <CategoriesClient initialCategories={initialCategories} />;
}
