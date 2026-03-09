import { requireAuth } from "@/lib/auth";
import { listAccounts } from "@/lib/actions/accounts";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountsPage() {
  const userId = await requireAuth();
  const accounts = await listAccounts(userId);
  const t = await getTranslations();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("accounts.title")}</h1>
        <Link href="/app/accounts/new">
          <Button size="sm" className="rounded-full">
            <Plus className="mr-1 h-4 w-4" />
            {t("common.add")}
          </Button>
        </Link>
      </div>

      {accounts.length === 0 ? (
        <Card className="rounded-2xl card-shadow">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("accounts.noAccounts")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Link key={account.id} href={`/app/accounts/${account.id}`}>
              <Card className="rounded-2xl card-shadow transition-shadow hover:shadow-lg cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base">{account.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {account.bankName ?? ""}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {account.type === "current"
                      ? t("accounts.types.current")
                      : t("accounts.types.savings")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
