"use client";

/**
 * Breadcrumb — page-location trail. Items with an href render as links via
 * the locale-aware Link; the last item renders as plain text. The separator
 * is a direction-neutral "/" drawn with CSS ::after (RTL-safe).
 */
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations("common");
  return (
    <nav className="breadcrumb" aria-label={t("breadcrumb")}>
      <ol className="breadcrumb__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="breadcrumb__item">
              {item.href && !last ? (
                <Link href={item.href} className="breadcrumb__link">
                  {item.label}
                </Link>
              ) : (
                <span
                  className="breadcrumb__current"
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
