import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  const features = ["submit", "classify", "resolve"] as const;

  return (
    <>
      <section className="hero container">
        <span className="hero__badge">{t("badge")}</span>
        <h1 className="hero__title">{t("title")}</h1>
        <p className="hero__subtitle">{t("subtitle")}</p>
        <div className="hero__actions">
          <Link href="/submit-feedback" className="btn btn-primary">
            {t("submitFeedback")}
          </Link>
          <Link href="/login" className="btn btn-outline">
            {t("signIn")}
          </Link>
        </div>
      </section>

      <section className="features container">
        <h2 className="features__title">{t("featuresTitle")}</h2>
        <div className="features__grid">
          {features.map((key) => (
            <article key={key} className="feature-card">
              <h3 className="feature-card__title">
                {t(`features.${key}.title`)}
              </h3>
              <p className="feature-card__body">{t(`features.${key}.body`)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
