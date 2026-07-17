import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FeedbackForm } from "@/features/public/FeedbackForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });
  return { title: `${t("title")} — Sunflower CFM` };
}

export default async function SubmitFeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feedback");

  return (
    <section className="feedback container">
      <div className="feedback__head">
        <span className="feedback__badge">{t("badge")}</span>
        <h1 className="feedback__title">{t("title")}</h1>
        <p className="feedback__subtitle">{t("subtitle")}</p>
      </div>
      <FeedbackForm />
    </section>
  );
}
