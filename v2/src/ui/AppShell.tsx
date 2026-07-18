"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { hasRole, type Role } from "@/lib/rbac";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NotificationsBell } from "./NotificationsBell";
import { UserMenu } from "./UserMenu";

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
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          <div className="header__actions">
            <NotificationsBell />
            <LocaleSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
