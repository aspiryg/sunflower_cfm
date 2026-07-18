"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/features/auth/AuthContext";
import { hasRole, can, type Role } from "@/lib/rbac";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NotificationsBell } from "./NotificationsBell";
import { UserMenu } from "./UserMenu";
import { CommandPalette, toggleCommandPalette, type CommandAction } from "./CommandPalette";

const NAV: { href: string; key: string; minRole?: Role }[] = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/cases", key: "cases" },
  { href: "/users", key: "users", minRole: "admin" },
  { href: "/settings", key: "settings", minRole: "manager" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations("shell");
  const tApp = useTranslations("app");
  const tc = useTranslations("common");
  const tCmd = useTranslations("command");
  const locale = useLocale();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Action commands for the palette (theme, language, sign out).
  const commandActions = useMemo<CommandAction[]>(
    () => [
      {
        id: "toggle-theme",
        label: tCmd("actionTheme"),
        hint: mode,
        keywords: "dark light appearance",
        icon: "◐",
        run: () => setMode(mode === "dark" ? "light" : "dark"),
      },
      {
        id: "switch-language",
        label: tCmd("actionLanguage"),
        hint: locale === "ar" ? "EN" : "ع",
        keywords: "arabic english locale لغة",
        icon: "⇄",
        run: () => router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" }),
      },
      {
        id: "sign-out",
        label: tCmd("actionSignOut"),
        keywords: "logout exit",
        icon: "⏻",
        run: async () => {
          await apiFetch("/api/auth/logout", { method: "POST" });
          router.replace("/login");
          router.refresh();
        },
      },
    ],
    [tCmd, mode, setMode, locale, router, pathname],
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (isLoading) return <div className="center-note">{tc("loading")}</div>;
  if (!isAuthenticated || !user) return null;

  const items = NAV.filter((n) => !n.minRole || hasRole(user, n.minRole));
  const commandNav = items.map((n) => ({ href: n.href, label: t(n.key) }));
  const canCreateCase = can(user, "cases", "create");

  return (
    <div className="shell">
      {drawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}
      <aside className={`sidebar ${drawerOpen ? "is-open" : ""}`}>
        <div className="sidebar__brand">
          <span aria-hidden>🌻</span>
          <span>{tApp("name")}</span>
        </div>
        {items.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`sidebar__link ${pathname === n.href ? "is-active" : ""}`}
          >
            {t(n.key)}
          </Link>
        ))}
      </aside>

      <div className="main">
        <header className="header">
          <button
            type="button"
            className="icon-btn header__menu-btn"
            aria-label={t("menu")}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            ☰
          </button>
          <span className="header__title">{tApp("name")}</span>
          <button
            type="button"
            className="header__cmdk"
            onClick={toggleCommandPalette}
            aria-label={t("search")}
          >
            <span aria-hidden>⌕</span>
            <span className="header__cmdk-label">{t("search")}</span>
            <kbd>⌘K</kbd>
          </button>
          <div className="header__actions">
            <NotificationsBell />
            <LocaleSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      <CommandPalette
        navItems={commandNav}
        actions={commandActions}
        newCaseHref={canCreateCase ? "/cases/new" : undefined}
        onNavigate={(href) => router.push(href)}
      />
    </div>
  );
}
