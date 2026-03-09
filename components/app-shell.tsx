"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/routing";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Tags,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";

interface AppShellProps {
  userName: string;
  children: React.ReactNode;
}

const navItems = [
  { href: "/app", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/app/accounts", icon: BookOpen, labelKey: "nav.accounts" },
  { href: "/app/budgets", icon: ShoppingCart, labelKey: "nav.budgets" },
  { href: "/app/categories", icon: Tags, labelKey: "nav.categories" },
  { href: "/app/tiers", icon: Users, labelKey: "nav.tiers" },
];

export function AppShell({ userName, children }: AppShellProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-center px-3">
          {collapsed ? (
            <Image
              src="/icons/logo-mono-white.svg"
              alt="HomeLedger"
              width={28}
              height={28}
            />
          ) : (
            <Image
              src="/icons/logo-horizontal-light.svg"
              alt="HomeLedger"
              width={140}
              height={32}
            />
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm hover:bg-muted"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: "hsl(18, 100%, 64%)" }}
              >
                <User className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium">{userName}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="py-3 text-center text-xs text-muted-foreground">
          HomeLedger © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
