"use client";

import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Link, useRouter } from "@/i18n/navigation";

interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
}

function useRef(resource: string) {
  return useQuery({
    queryKey: ["ref", resource],
    queryFn: () => apiFetch<Ref[]>(`/api/reference/${resource}`),
    staleTime: 60 * 60 * 1000,
  });
}

export default function NewCasePage() {
  const t = useTranslations("cases");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const categories = useRef("categories");
  const priorities = useRef("priorities");
  const channels = useRef("channels");

  const label = (r: Ref) =>
    locale === "ar" && r.arabicName ? r.arabicName : r.name;

  const create = useMutation({
    mutationFn: (body: unknown) =>
      apiFetch<{ case: { id: number } }>("/api/cases", { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      router.push("/cases");
    },
    onError: (e) => setError((e as unknown as ApiError)?.message ?? t("loadError")),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    create.mutate({
      title: String(f.get("title")),
      description: String(f.get("description")),
      categoryId: Number(f.get("categoryId")),
      priorityId: Number(f.get("priorityId")),
      channelId: Number(f.get("channelId")),
    });
  }

  const loading =
    categories.isLoading || priorities.isLoading || channels.isLoading;

  return (
    <>
      <div className="page-head">
        <h1>{t("createTitle")}</h1>
        <Link href="/cases" className="btn btn-outline">
          {t("backToList")}
        </Link>
      </div>

      <div className="form-card">
        {error && (
          <div className="auth-card__error" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <p className="muted">{tc("loading")}</p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="title">{t("titleLabel")}</label>
              <input id="title" name="title" required minLength={3} />
            </div>

            <div className="field">
              <label htmlFor="categoryId">{t("category")}</label>
              <select id="categoryId" name="categoryId" required>
                {categories.data?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {label(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="priorityId">{t("priorityLabel")}</label>
              <select id="priorityId" name="priorityId" required>
                {priorities.data?.data.map((p) => (
                  <option key={p.id} value={p.id}>
                    {label(p)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="channelId">{t("channel")}</label>
              <select id="channelId" name="channelId" required>
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
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={create.isPending}
            >
              {create.isPending ? t("creating") : t("submit")}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
