import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: `${t("title")} — Community Feedback Management` };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <section className="about container">
      <h1 className="about__title">{t("title")}</h1>
      <p className="about__mission">{t("mission")}</p>
      <h2 className="about__contact-title">{t("contactTitle")}</h2>
      <div className="about__contact">
        <p>
          {t("email")}: <a href="mailto:info@sunflower-cfm.org">info@sunflower-cfm.org</a>
        </p>
        <p>{t("phone")}: +970 000 000</p>
      </div>
    </section>
  );
}
