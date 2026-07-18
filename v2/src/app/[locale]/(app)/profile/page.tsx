"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/ui/Toast";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const qc = useQueryClient();
  const { user, isLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const toast = useToast();
  const tToast = useTranslations("toasts");

  const save = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiFetch(`/api/users/${user!.id}`, { method: "PUT", body }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(tToast("profileSaved"));
    },
  });

  if (isLoading) return <p className="muted">{tc("loading")}</p>;
  if (!user) return null;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const f = new FormData(e.currentTarget);
    save.mutate({
      firstName: String(f.get("firstName")),
      lastName: String(f.get("lastName")),
      phone: String(f.get("phone") ?? ""),
      organization: String(f.get("organization") ?? ""),
    });
  }

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
      </div>
      <div className="form-card">
        {saved && (
          <div
            className="auth-card__error"
            style={{ background: "var(--color-green-100)", color: "var(--color-green-700)" }}
          >
            {t("saved")}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="firstName">{t("firstName")}</label>
            <input id="firstName" name="firstName" defaultValue={user.firstName} required />
          </div>
          <div className="field">
            <label htmlFor="lastName">{t("lastName")}</label>
            <input id="lastName" name="lastName" defaultValue={user.lastName} required />
          </div>
          <div className="field">
            <label htmlFor="email">{t("email")}</label>
            <input id="email" type="email" defaultValue={user.email} dir="ltr" disabled />
          </div>
          <div className="field">
            <label htmlFor="organization">{t("organization")}</label>
            <input id="organization" name="organization" defaultValue={user.organization ?? ""} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? t("saving") : t("save")}
          </button>
        </form>
      </div>
    </>
  );
}
