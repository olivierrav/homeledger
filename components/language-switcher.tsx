"use client";

import { useParams } from "next/navigation";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocale = params.locale as string;

  function onSelectChange(locale: string) {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onSelectChange("en")}
        disabled={isPending}
        className={`px-3 py-1 rounded-full text-sm transition-colors ${
          currentLocale === "en"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onSelectChange("fr")}
        disabled={isPending}
        className={`px-3 py-1 rounded-full text-sm transition-colors ${
          currentLocale === "fr"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        FR
      </button>
    </div>
  );
}
