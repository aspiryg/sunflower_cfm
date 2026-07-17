"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

const CATEGORY_KEYS = [
  "general",
  "complaint",
  "suggestion",
  "appreciation",
  "inquiry",
] as const;

export function FeedbackForm() {
  const t = useTranslations("feedback");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    const form = new FormData(e.currentTarget);
    const description = String(form.get("description") ?? "").trim();
    if (description.length < 10) {
      setFieldError(t("minLength"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description,
          name: String(form.get("name") ?? "") || undefined,
          contact: String(form.get("contact") ?? "") || undefined,
          category: String(form.get("category") ?? "") || undefined,
          location: String(form.get("location") ?? "") || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.message ?? t("errorGeneric"));
        return;
      }
      setReference(body.data.caseNumber);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <section className="success">
        <div className="success__icon" aria-hidden>
          ✓
        </div>
        <h1 className="success__title">{t("successTitle")}</h1>
        <p className="success__body">{t("successBody")}</p>
        <p className="success__ref">
          {t("referenceNumber")}: <strong dir="ltr">{reference}</strong>
        </p>
        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setReference(null)}
          >
            {t("submitAnother")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="feedback__card">
      {error && (
        <div className="feedback__error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">
            {t("name")} <span>({t("optional")})</span>
          </label>
          <input id="name" name="name" type="text" placeholder={t("namePlaceholder")} />
        </div>

        <div className="field">
          <label htmlFor="contact">
            {t("contact")} <span>({t("optional")})</span>
          </label>
          <input id="contact" name="contact" type="text" placeholder={t("contactPlaceholder")} />
        </div>

        <div className="field">
          <label htmlFor="category">{t("category")}</label>
          <select id="category" name="category" defaultValue="general">
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`categories.${key}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="location">
            {t("location")} <span>({t("optional")})</span>
          </label>
          <input id="location" name="location" type="text" placeholder={t("locationPlaceholder")} />
        </div>

        <div className="field">
          <label htmlFor="description">{t("description")}</label>
          <textarea
            id="description"
            name="description"
            dir="auto"
            placeholder={t("descriptionPlaceholder")}
            aria-invalid={!!fieldError}
          />
          {fieldError && <span className="field__error">{fieldError}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </button>

        <p className="feedback__help">{t("help")}</p>
      </form>
    </div>
  );
}
