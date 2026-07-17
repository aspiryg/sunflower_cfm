import { useTranslations } from "next-intl";

export function PublicFooter() {
  const t = useTranslations("app");
  return (
    <footer className="public-footer">
      <div className="container">
        <p className="public-footer__brand">
          🌻 {t("name")}
        </p>
        <p className="public-footer__tagline">{t("tagline")}</p>
      </div>
    </footer>
  );
}
