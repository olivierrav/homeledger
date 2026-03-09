"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { safeCreateAccount } from "@/lib/actions/safe-accounts";

export function AccountForm() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      bankName: (formData.get("bankName") as string) || null,
      accountNumber: (formData.get("accountNumber") as string) || null,
      type: formData.get("type") as "current" | "savings",
      interestRate: formData.get("interestRate")
        ? parseFloat(formData.get("interestRate") as string)
        : null,
      initialBalance: parseFloat(formData.get("initialBalance") as string),
    };

    try {
      const account = await safeCreateAccount(data);
      router.push(`/app/accounts/${account.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("errors.unexpectedServerResponse")
      );
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl card-shadow">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("accounts.fields.name")} *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder={t("accounts.placeholders.name")}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">{t("accounts.fields.bankName")}</Label>
            <Input
              id="bankName"
              name="bankName"
              placeholder={t("accounts.placeholders.bankName")}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              {t("accounts.fields.accountNumber")}
            </Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              placeholder={t("accounts.placeholders.accountNumber")}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t("accounts.fields.type")} *</Label>
            <select
              id="type"
              name="type"
              defaultValue="current"
              className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="current">{t("accounts.types.current")}</option>
              <option value="savings">{t("accounts.types.savings")}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">
              {t("accounts.fields.interestRate")}
            </Label>
            <Input
              id="interestRate"
              name="interestRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder={t("accounts.placeholders.interestRate")}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">
              {t("accounts.fields.initialBalance")} *
            </Label>
            <Input
              id="initialBalance"
              name="initialBalance"
              type="number"
              step="0.01"
              defaultValue="0"
              required
              className="rounded-lg"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="rounded-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("accounts.actions.create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => router.push("/app/accounts")}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
