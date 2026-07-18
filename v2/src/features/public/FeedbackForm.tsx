"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { TextField, TextAreaField, SelectField } from "@/ui/form";

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
        <TextField
          id="name"
          name="name"
          type="text"
          label={t("name")}
          labelSuffix={` (${t("optional")})`}
          placeholder={t("namePlaceholder")}
        />

        <TextField
          id="contact"
          name="contact"
          type="text"
          label={t("contact")}
          labelSuffix={` (${t("optional")})`}
          placeholder={t("contactPlaceholder")}
        />

        <SelectField
          id="category"
          name="category"
          label={t("category")}
          defaultValue="general"
          options={CATEGORY_KEYS.map((key) => ({ value: key, label: t(`categories.${key}`) }))}
        />

        <TextField
          id="location"
          name="location"
          type="text"
          label={t("location")}
          labelSuffix={` (${t("optional")})`}
          placeholder={t("locationPlaceholder")}
        />

        <TextAreaField
          id="description"
          name="description"
          label={t("description")}
          dir="auto"
          placeholder={t("descriptionPlaceholder")}
          error={fieldError}
        />

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </button>

        <p className="feedback__help">{t("help")}</p>
      </form>
    </div>
  );
}
