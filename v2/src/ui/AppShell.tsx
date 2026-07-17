"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth, useLogout } from "@/features/auth/AuthContext";
import { hasRole, type Role } from "@/lib/rbac";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";

const NAV: { href: string; key: string; minRole?: Role }[] = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/cases", key: "cases" },
  { href: "/users", key: "users", minRole: "admin" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations("shell");
  const tApp = useTranslations("app");
  const tc = useTranslations("common");
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <div className="center-note">{tc("loading")}</div>;
  if (!isAuthenticated || !user) return null;

  const items = NAV.filter((n) => !n.minRole || hasRole(user, n.minRole));

  async function signOut() {
    try {
      await logout.mutateAsync();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
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
          <span className="header__title">{tApp("name")}</span>
          <div className="header__actions">
            <span className="header__user">
              {user.firstName} {user.lastName}
            </span>
            <LocaleSwitcher />
            <ThemeToggle />
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: "0.6rem 1.4rem", fontSize: "1.4rem" }}
              onClick={signOut}
            >
              {t("signOut")}
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
