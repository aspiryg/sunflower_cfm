"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/ui/Toast";

interface LookupRow {
  id: number;
  name: string;
  arabicName: string | null;
  code?: string | null;
  isActive: boolean;
}

const RESOURCES = ["categories", "channels", "provider-types", "regions"] as const;
type ResourceKey = (typeof RESOURCES)[number];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const qc = useQueryClient();
  const [resource, setResource] = useState<ResourceKey>("categories");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const tToast = useTranslations("toasts");

  const listQ = useQuery({
    queryKey: ["ref-admin", resource],
    queryFn: () => apiFetch<LookupRow[]>(`/api/reference/${resource}?all=true`),
  });
  const rows = listQ.data?.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ref-admin", resource] });
    qc.invalidateQueries({ queryKey: ["ref", resource] });
  };

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/api/reference/${resource}`, { method: "POST", body }),
    onSuccess: () => {
      invalidate();
      toast.success(tToast("settingsSaved"));
    },
    onError: (e) => setError((e as unknown as ApiError)?.message ?? t("error")),
  });
  const updateM = useMutation({
    mutationFn: (v: { id: number; body: Record<string, unknown> }) =>
      apiFetch(`/api/reference/${resource}/${v.id}`, { method: "PATCH", body: v.body }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
      toast.success(tToast("settingsSaved"));
    },
    onError: (e) => setError((e as unknown as ApiError)?.message ?? t("error")),
  });

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const body: Record<string, unknown> = {
      name: String(f.get("name")),
      arabicName: String(f.get("arabicName") ?? "") || undefined,
    };
    if (resource === "regions") body.code = String(f.get("code") ?? "");
    createM.mutate(body, { onSuccess: () => formEl.reset() });
  }

  function onSaveEdit(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    updateM.mutate({
      id,
      body: {
        name: String(f.get("name")),
        arabicName: String(f.get("arabicName") ?? "") || null,
      },
    });
  }

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
      </div>
      <p className="muted" style={{ marginBottom: "1.6rem" }}>
        {t("intro")}
      </p>

      <div className="filters-bar">
        <select
          id="resource-type"
          value={resource}
          onChange={(e) => {
            setResource(e.target.value as ResourceKey);
            setEditingId(null);
            setError(null);
          }}
        >
          {RESOURCES.map((r) => (
            <option key={r} value={r}>
              {t(`types.${r}`)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="auth-card__error" role="alert">
          {error}
        </div>
      )}

      <div className="form-card" style={{ marginBottom: "2.4rem" }}>
        <h3 style={{ marginBottom: "1.2rem" }}>{t("addTitle")}</h3>
        <form onSubmit={onAdd} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: "16rem" }}>
            <label htmlFor="name">{t("name")}</label>
            <input id="name" name="name" required />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: "16rem" }}>
            <label htmlFor="arabicName">{t("arabicName")}</label>
            <input id="arabicName" name="arabicName" dir="rtl" />
          </div>
          {resource === "regions" && (
            <div className="field" style={{ marginBottom: 0, width: "10rem" }}>
              <label htmlFor="code">{t("code")}</label>
              <input id="code" name="code" required maxLength={10} dir="ltr" />
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={createM.isPending}>
            {t("add")}
          </button>
        </form>
      </div>

      {listQ.isLoading ? (
        <p className="muted">…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("arabicName")}</th>
              <th>{t("status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
              editingId === r.id ? (
                <tr key={r.id}>
                  <td colSpan={4}>
                    <form
                      onSubmit={(e) => onSaveEdit(e, r.id)}
                      style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}
                    >
                      <input name="name" defaultValue={r.name} required style={{ flex: 1, minWidth: "14rem" }} />
                      <input name="arabicName" defaultValue={r.arabicName ?? ""} dir="rtl" style={{ flex: 1, minWidth: "14rem" }} />
                      <button type="submit" className="btn btn-primary" disabled={updateM.isPending} style={{ padding: "0.6rem 1.4rem" }}>
                        {t("save")}
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)} style={{ padding: "0.6rem 1.4rem" }}>
                        {t("cancel")}
                      </button>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td>
                    {r.name}
                    {r.code ? <span className="muted"> ({r.code})</span> : null}
                  </td>
                  <td dir="rtl">{r.arabicName}</td>
                  <td>
                    <span className={r.isActive ? "badge" : "muted"}>
                      {r.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                        onClick={() => setEditingId(r.id)}
                      >
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                        disabled={updateM.isPending}
                        onClick={() =>
                          updateM.mutate({ id: r.id, body: { isActive: !r.isActive } })
                        }
                      >
                        {r.isActive ? t("deactivate") : t("activate")}
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}

      <p className="muted" style={{ marginTop: "1.6rem", fontSize: "1.3rem" }}>
        {t("lockedNote")}
      </p>
    </>
  );
}
