import { requireAuth } from "@/lib/auth";
import { listBudgetsForUser } from "@/lib/actions/budgets";
import { listAccounts } from "@/lib/actions/accounts";
import { BudgetsClient } from "./budgets-client";

export default async function BudgetsPage() {
  const userId = await requireAuth();
  const [initialBudgets, accounts] = await Promise.all([
    listBudgetsForUser(userId),
    listAccounts(userId),
  ]);

  return (
    <BudgetsClient initialBudgets={initialBudgets} accounts={accounts} />
  );
}
