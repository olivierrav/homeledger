"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

export function AutoSignIn() {
  const t = useTranslations("auth");

  useEffect(() => {
    signIn("keycloak", { callbackUrl: "/app" });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("finalizing")}
      </div>
    </div>
  );
}
