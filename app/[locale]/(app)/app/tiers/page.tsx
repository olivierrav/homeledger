import { requireAuth } from "@/lib/auth";
import { listTiers } from "@/lib/actions/tiers";
import { listCategories } from "@/lib/actions/categories";
import { TiersClient } from "./tiers-client";

export default async function TiersPage() {
  const userId = await requireAuth();
  const [initialTiers, initialCategories] = await Promise.all([
    listTiers(userId),
    listCategories(userId),
  ]);

  return (
    <TiersClient
      initialTiers={initialTiers}
      categories={initialCategories}
    />
  );
}
