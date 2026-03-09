import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect({ href: "/auth/login", locale });
    return null;
  }

  const userName =
    session.user.name ?? session.user.email ?? "User";

  return (
    <AppShell userName={userName}>
      {children}
    </AppShell>
  );
}
