"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const LABEL: Record<Locale, string> = { en: "EN", ar: "ع" };
const OTHER: Record<Locale, Locale> = { en: "ar", ar: "en" };

/** Toggles between English and Arabic, preserving the current path. */
export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const target = OTHER[locale];

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => router.replace(pathname, { locale: target })}
      aria-label={`Switch language to ${target === "ar" ? "Arabic" : "English"}`}
    >
      {LABEL[target]}
    </button>
  );
}
