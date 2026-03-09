"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { safeUpdateBudgetList } from "@/lib/actions/safe-budgets";

type Budget = {
  id: string;
  accountId: string;
  label: string;
  iconKey: string;
  color: string;
  monthlyAmount: string;
  currentBalance: string;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Account = {
  id: string;
  name: string;
};

type LocalBudget = Budget & { _isNew?: boolean };

export function BudgetsClient({
  initialBudgets,
  accounts,
}: {
  initialBudgets: Budget[];
  accounts: Account[];
}) {
  const t = useTranslations();
  const [budgets, setBudgets] = useState<LocalBudget[]>(initialBudgets);
  const [saving, setSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  function handleAdd() {
    const newBudget: LocalBudget = {
      id: `temp_${Date.now()}`,
      accountId: accounts[0]?.id ?? "",
      label: "Budget",
      iconKey: "wallet",
      color: "#1890ff",
      monthlyAmount: "100",
      currentBalance: "0",
      comment: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      _isNew: true,
    };
    setBudgets((prev) => [...prev, newBudget]);
  }

  function handleRemove() {
    if (deleteIndex === null) return;
    setBudgets((prev) => prev.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  }

  function handleFieldChange(
    index: number,
    field: string,
    value: string
  ) {
    setBudgets((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const items = budgets.map((b) => ({
        id: b._isNew ? undefined : b.id,
        accountId: b.accountId,
        label: b.label,
        iconKey: b.iconKey,
        color: b.color,
        monthlyAmount: parseFloat(b.monthlyAmount),
        comment: b.comment ?? undefined,
      }));
      const result = await safeUpdateBudgetList(items);
      setBudgets(result);
    } catch (error) {
      console.error("Error saving budgets", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card className="rounded-2xl card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("budgets.title")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full"
              onClick={handleAdd}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("common.add")}
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              {t("common.save")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("budgets.columns.label")}</TableHead>
                <TableHead>{t("common.account")}</TableHead>
                <TableHead className="text-right">
                  {t("budgets.monthlyAmount")}
                </TableHead>
                <TableHead className="text-right">
                  {t("budgets.currentBalance")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget, index) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    <Input
                      value={budget.label}
                      onChange={(e) =>
                        handleFieldChange(index, "label", e.target.value)
                      }
                      className="h-7 rounded-md"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={budget.accountId}
                      onValueChange={(val) =>
                        handleFieldChange(index, "accountId", val ?? "")
                      }
                    >
                      <SelectTrigger className="h-7 rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.01"
                      value={budget.monthlyAmount}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "monthlyAmount",
                          e.target.value
                        )
                      }
                      className="h-7 w-28 rounded-md text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {parseFloat(budget.currentBalance).toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => setDeleteIndex(index)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {budgets.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
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

      <Dialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("budgets.actions.deleteConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("budgets.actions.deleteConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
