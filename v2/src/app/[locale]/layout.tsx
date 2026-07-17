import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { routing, isLocale, localeDirection, type Locale } from "@/i18n/routing";
import { poppins, cairo } from "../fonts";
import { ThemeProvider, themeInitScript } from "@/ui/ThemeProvider";
import { Providers } from "@/ui/Providers";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sunflower CFM",
  description: "Community Feedback Management platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  const dir = localeDirection[locale as Locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${poppins.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
