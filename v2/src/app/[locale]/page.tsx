import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tApp = await getTranslations("app");

  return (
    <main className="landing">
      <p className="brand">{tApp("name")}</p>
      <h1>{t("title")}</h1>
      <p className="subtitle">{t("subtitle")}</p>
      <div className="actions">
        <a className="btn btn-primary" href={`/${locale}/submit-feedback`}>
          {t("submitFeedback")}
        </a>
        <a className="btn btn-outline" href={`/${locale}/login`}>
          {t("signIn")}
        </a>
      </div>
      <p className="locale-hint">
        locale: <strong>{locale}</strong> — Phase 1 skeleton
      </p>
    </main>
  );
}
