"use client";

import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
}

export interface CaseFormValues {
  title: string;
  description: string;
  categoryId: number;
  priorityId: number;
  channelId: number;
}

function useReference(resource: string) {
  return useQuery({
    queryKey: ["ref", resource],
    queryFn: () => apiFetch<Ref[]>(`/api/reference/${resource}`),
    staleTime: 60 * 60 * 1000,
  });
}

export function CaseForm({
  initial,
  submitLabel,
  busyLabel,
  busy,
  error,
  onSubmit,
}: {
  initial?: Partial<CaseFormValues>;
  submitLabel: string;
  busyLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (values: CaseFormValues) => void;
}) {
  const t = useTranslations("cases");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [localError, setLocalError] = useState<string | null>(null);

  const categories = useReference("categories");
  const priorities = useReference("priorities");
  const channels = useReference("channels");
  const loading =
    categories.isLoading || priorities.isLoading || channels.isLoading;

  const label = (r: Ref) =>
    locale === "ar" && r.arabicName ? r.arabicName : r.name;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);
    const f = new FormData(e.currentTarget);
    onSubmit({
      title: String(f.get("title")),
      description: String(f.get("description")),
      categoryId: Number(f.get("categoryId")),
      priorityId: Number(f.get("priorityId")),
      channelId: Number(f.get("channelId")),
    });
  }

  if (loading) return <p className="muted">{tc("loading")}</p>;

  return (
    <>
      {(error ?? localError) && (
        <div className="auth-card__error" role="alert">
          {error ?? localError}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">{t("titleLabel")}</label>
          <input
            id="title"
            name="title"
            required
            minLength={3}
            defaultValue={initial?.title ?? ""}
            dir="auto"
          />
        </div>

        <div className="field">
          <label htmlFor="categoryId">{t("category")}</label>
          <select id="categoryId" name="categoryId" required defaultValue={initial?.categoryId}>
            {categories.data?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {label(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="priorityId">{t("priorityLabel")}</label>
          <select id="priorityId" name="priorityId" required defaultValue={initial?.priorityId}>
            {priorities.data?.data.map((p) => (
              <option key={p.id} value={p.id}>
                {label(p)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="channelId">{t("channel")}</label>
          <select id="channelId" name="channelId" required defaultValue={initial?.channelId}>
            {channels.data?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {label(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="description">{t("descriptionLabel")}</label>
          <textarea
            id="description"
            name="description"
            dir="auto"
            required
            minLength={10}
            defaultValue={initial?.description ?? ""}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? busyLabel : submitLabel}
        </button>
      </form>
    </>
  );
}
