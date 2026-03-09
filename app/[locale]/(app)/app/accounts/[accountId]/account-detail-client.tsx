"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Settings, RefreshCw, Loader2 } from "lucide-react";
import { useRouter, Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  safeCreateOperation,
  safeUpdateOperation,
  safeDeleteOperation,
} from "@/lib/actions/safe-operations";
import type { ReconciliationStatus } from "@/lib/actions/reconciliation";

type Account = {
  id: string;
  name: string;
  bankName: string | null;
  type: "current" | "savings";
};

type Operation = {
  id: string;
  accountId: string;
  tierId: string | null;
  budgetId: string | null;
  categoryId: string | null;
  type: string | null;
  dateTime: Date;
  amount: string;
  description: string | null;
  status: "pending" | "posted" | "pointed";
};

type Budget = {
  id: string;
  label: string;
  monthlyAmount: string;
  currentBalance: string;
};

type Category = { id: string; name: string; color: string };
type Tier = { id: string; name: string };

export function AccountDetailClient({
  account,
  initialOperations,
  initialBudgets,
  reconciliation,
  categories,
  tiers,
}: {
  account: Account;
  initialOperations: Operation[];
  initialBudgets: Budget[];
  reconciliation: ReconciliationStatus | null;
  categories: Category[];
  tiers: Tier[];
}) {
  const t = useTranslations();
  const [operations, setOperations] = useState(initialOperations);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Operation | null>(null);
  const [adding, setAdding] = useState(false);

  const sortedOps = [...operations].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  async function handleAddOperation() {
    setAdding(true);
    try {
      const created = await safeCreateOperation(account.id, {
        description: t("operations.newOperation"),
        dateTime: new Date().toISOString(),
        amount: 0,
        type: "other",
      });
      setOperations((prev) => [...prev, created]);
    } catch (error) {
      console.error("Error creating operation", error);
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateField(
    op: Operation,
    field: string,
    value: string | number
  ) {
    setLoadingIds((prev) => [...prev, op.id]);
    try {
      const changes: Record<string, unknown> = {};
      if (field === "debit") {
        changes.amount = -Math.abs(Number(value));
      } else if (field === "credit") {
        changes.amount = Math.abs(Number(value));
      } else {
        changes[field] = value;
      }
      const updated = await safeUpdateOperation(
        account.id,
        op.id,
        changes
      );
      setOperations((prev) =>
        prev.map((o) => (o.id === op.id ? updated : o))
      );
    } catch (error) {
      console.error("Error updating operation", error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== op.id));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoadingIds((prev) => [...prev, deleteTarget.id]);
    try {
      await safeDeleteOperation(account.id, deleteTarget.id);
      setOperations((prev) =>
        prev.filter((o) => o.id !== deleteTarget.id)
      );
    } catch (error) {
      console.error("Error deleting operation", error);
    } finally {
      setLoadingIds((prev) =>
        prev.filter((id) => id !== deleteTarget?.id)
      );
      setDeleteTarget(null);
    }
  }

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(val);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    posted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    pointed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div className="space-y-4">
      {/* Account Header */}
      <Card className="rounded-2xl card-shadow">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-3 px-4">
          <span className="text-base font-semibold">{account.name}</span>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            {reconciliation && (
              <>
                <div>
                  <span className="text-muted-foreground">
                    {t("accounts.details.reconciledBalance")}:{" "}
                  </span>
                  <span
                    className={
                      reconciliation.lastReconciliationBalance < 0
                        ? "text-destructive"
                        : ""
                    }
                  >
                    {formatMoney(reconciliation.lastReconciliationBalance)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("accounts.details.theoreticalBalance")}:{" "}
                  </span>
                  <span
                    className={
                      reconciliation.theoreticalBalance < 0
                        ? "font-semibold text-destructive"
                        : "font-semibold"
                    }
                  >
                    {formatMoney(reconciliation.theoreticalBalance)}
                  </span>
                </div>
              </>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="h-7 rounded-full">
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                {t("accounts.actions.reconcile")}
              </Button>
              <Link href={`/app/accounts/${account.id}/edit`}>
                <Button size="sm" variant="outline" className="h-7 rounded-full">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets */}
      {initialBudgets.length > 0 && (
        <Card className="rounded-2xl card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {t("accounts.details.budgetsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {initialBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{budget.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatMoney(parseFloat(budget.currentBalance))} /{" "}
                    {formatMoney(parseFloat(budget.monthlyAmount))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operations */}
      <Card className="rounded-2xl card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">
            {t("accounts.details.operationsTitle")}
          </CardTitle>
          <Button
            size="sm"
            className="h-7 rounded-full"
            onClick={handleAddOperation}
            disabled={adding}
          >
            {adding ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="mr-1 h-3.5 w-3.5" />
            )}
            {t("operations.newOperation")}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-2">
            {t("operations.status.legend")}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="w-28">
                  {t("operations.columns.date")}
                </TableHead>
                <TableHead>{t("operations.columns.label")}</TableHead>
                <TableHead className="w-32">
                  {t("operations.columns.tier")}
                </TableHead>
                <TableHead className="w-24 text-right">
                  {t("operations.columns.debit")}
                </TableHead>
                <TableHead className="w-24 text-right">
                  {t("operations.columns.credit")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOps.map((op) => {
                const isLoading = loadingIds.includes(op.id);
                const amount = parseFloat(op.amount);
                const debit = amount < 0 ? Math.abs(amount) : 0;
                const credit = amount > 0 ? amount : 0;
                const tierName =
                  tiers.find((t) => t.id === op.tierId)?.name ?? "";

                return (
                  <TableRow key={op.id}>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1 py-0 ${statusColors[op.status] ?? ""}`}
                      >
                        {t(`operations.status.short.${op.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(op.dateTime).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <InlineEdit
                        value={op.description ?? ""}
                        disabled={isLoading || op.status === "pointed"}
                        onSave={(val) =>
                          handleUpdateField(op, "description", val)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tierName}
                    </TableCell>
                    <TableCell className="text-right text-sm text-destructive">
                      {debit > 0 ? formatMoney(debit) : ""}
                    </TableCell>
                    <TableCell className="text-right text-sm text-green-600 dark:text-green-400">
                      {credit > 0 ? formatMoney(credit) : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {isLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : op.status !== "pointed" ? (
                        <button
                          onClick={() => setDeleteTarget(op)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={t("common.delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedOps.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    —
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("operations.actions.deleteConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("operations.actions.deleteConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InlineEdit({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled: boolean;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onSave(draft);
          else setDraft(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (draft !== value) onSave(draft);
          }
          if (e.key === "Escape") {
            setEditing(false);
            setDraft(value);
          }
        }}
        className="h-6 rounded-md text-sm"
      />
    );
  }

  return (
    <span
      onClick={() => !disabled && setEditing(true)}
      className="cursor-pointer rounded px-1 py-0.5 text-sm hover:bg-muted"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") !disabled && setEditing(true);
      }}
    >
      {value || <span className="text-muted-foreground">—</span>}
    </span>
  );
}
