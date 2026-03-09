import { auth } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <Card className="rounded-2xl card-shadow">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{t("placeholder")}</p>
      </CardContent>
    </Card>
  );
}
