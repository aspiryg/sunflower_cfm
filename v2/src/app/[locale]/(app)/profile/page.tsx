"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/ui/Toast";
import { Avatar } from "@/ui/Avatar";
import type { ApiError } from "@/lib/api/client";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const qc = useQueryClient();
  const { user, isLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const toast = useToast();
  const tToast = useTranslations("toasts");

  const changePw = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiFetch("/api/auth/change-password", { method: "POST", body }),
    onSuccess: () => toast.success(t("passwordChanged")),
    onError: (e) =>
      setPwError((e as unknown as ApiError)?.message ?? tToast("error")),
  });

  async function onPictureChosen(file: File) {
    setUploadingPic(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/picture", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        toast.error(body.message ?? tToast("error"));
        return;
      }
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(t("pictureUpdated"));
    } catch {
      toast.error(tToast("error"));
    } finally {
      setUploadingPic(false);
    }
  }

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

      {/* Profile picture */}
      <div className="form-card" style={{ marginBottom: "2.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            size={7.2}
            src={
              user.profilePicture
                ? `/api/profile/picture?v=${encodeURIComponent(user.profilePicture)}`
                : undefined
            }
          />
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: "20rem" }}>
            <label htmlFor="picture">{t("picture")}</label>
            <input
              id="picture"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingPic}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPictureChosen(f);
                e.target.value = "";
              }}
            />
            <span className="muted" style={{ fontSize: "1.2rem" }}>
              {t("pictureHint")}
            </span>
          </div>
        </div>
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

      {/* Change password */}
      <div className="form-card" style={{ marginTop: "2.4rem" }}>
        <h3 style={{ marginBottom: "1.6rem" }}>{t("changePassword")}</h3>
        {pwError && (
          <div className="auth-card__error" role="alert">
            {pwError}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPwError(null);
            const formEl = e.currentTarget;
            const f = new FormData(formEl);
            changePw.mutate(
              {
                currentPassword: String(f.get("currentPassword")),
                newPassword: String(f.get("newPassword")),
                confirmPassword: String(f.get("confirmPassword")),
              },
              { onSuccess: () => formEl.reset() },
            );
          }}
        >
          <div className="field">
            <label htmlFor="currentPassword">{t("currentPassword")}</label>
            <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="newPassword">{t("newPassword")}</label>
              <input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={changePw.isPending}>
            {changePw.isPending ? t("saving") : t("changePassword")}
          </button>
        </form>
      </div>
    </>
  );
}
