"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function PublicNavbar() {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  return (
    <nav className="public-nav">
      <div className="container public-nav__inner">
        <Link href="/" className="public-nav__brand">
          <span className="public-nav__logo" aria-hidden>
            🌻
          </span>
          <span className="public-nav__brand-text">{tApp("name")}</span>
        </Link>

        <div className="public-nav__links">
          <Link href="/">{t("home")}</Link>
          <Link href="/submit-feedback">{t("submit")}</Link>
          <Link href="/about">{t("about")}</Link>
        </div>

        <div className="public-nav__actions">
          <LocaleSwitcher />
          <ThemeToggle />
          <Link href="/login" className="btn btn-primary public-nav__cta">
            {t("signIn")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
