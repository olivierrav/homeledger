import { useTranslations } from "next-intl";
import Image from "next/image";
import { SignInButton } from "../auth/login/sign-in-button";

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
      <SignInButton label={t("publicHome.loginButton")} />
    </div>
  );
}
