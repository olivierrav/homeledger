import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PublicHomePage() {
  const t = useTranslations();

  return (
    <div className="flex max-w-md flex-col items-center gap-6 text-center">
      <Image
        src="/icons/logo-main.svg"
        alt="HomeLedger"
        width={80}
        height={80}
      />
      <h1 className="text-3xl font-bold text-foreground">
        {t("publicHome.title")}
      </h1>
      <p className="text-muted-foreground">{t("publicHome.description")}</p>
      <Link href="/auth/login">
        <Button size="lg" className="rounded-full">
          {t("publicHome.loginButton")}
        </Button>
      </Link>
    </div>
  );
}
