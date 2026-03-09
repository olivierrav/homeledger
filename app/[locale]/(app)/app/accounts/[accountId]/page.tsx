import { requireAuth } from "@/lib/auth";
import { getAccount } from "@/lib/actions/accounts";
import { listOperations } from "@/lib/actions/operations";
import { listBudgetsForAccount } from "@/lib/actions/budgets";
import { getReconciliationStatus } from "@/lib/actions/reconciliation";
import { listCategories } from "@/lib/actions/categories";
import { listTiers } from "@/lib/actions/tiers";
import { AccountDetailClient } from "./account-detail-client";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const userId = await requireAuth();

  const [account, operations, budgets, reconciliation, categories, tiers] =
    await Promise.all([
      getAccount(userId, accountId),
      listOperations(userId, accountId),
      listBudgetsForAccount(userId, accountId),
      getReconciliationStatus(userId, accountId).catch(() => null),
      listCategories(userId),
      listTiers(userId),
    ]);

  return (
    <AccountDetailClient
      account={account}
      initialOperations={operations}
      initialBudgets={budgets}
      reconciliation={reconciliation}
      categories={categories}
      tiers={tiers}
    />
  );
}
