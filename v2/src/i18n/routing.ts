import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

/** Text direction per locale — drives <html dir> and logical-property layout. */
export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // Always prefix so /en and /ar are explicit and SEO-addressable.
  localePrefix: "always",
});

/** Type guard for validating a raw string against supported locales. */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}
