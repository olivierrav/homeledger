import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{t("appName")}</h1>
      <p className="mt-4 text-muted-foreground">
        Personal Finance Manager - Coming Soon
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" locale="en" className="text-primary hover:underline">
          English
        </Link>
        <Link href="/" locale="fr" className="text-primary hover:underline">
          Français
        </Link>
      </div>
    </main>
  );
}
