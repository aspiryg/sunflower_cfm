"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiFetch, type ApiError } from "@/lib/api/client";

export function ForgotPasswordForm() {
  const t = useTranslations("authFlows");
  const tAuth = useTranslations("auth");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = String(new FormData(e.currentTarget).get("email"));
    try {
      await apiFetch("/api/auth/forgot-password", { method: "POST", body: { email } });
    } finally {
      // Always show the same message — no account enumeration.
      setSent(true);
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <p className="auth-card__brand" aria-hidden>🌻</p>
      <h1 className="auth-card__title">{t("forgotTitle")}</h1>
      {sent ? (
        <p style={{ textAlign: "center" }}>{t("sentNote")}</p>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: "1.6rem", textAlign: "center" }}>
            {t("forgotIntro")}
          </p>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">{tAuth("email")}</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t("sending") : t("sendReset")}
            </button>
          </form>
        </>
      )}
      <p className="auth-card__foot">
        <Link href="/login">{t("backToLogin")}</Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("authFlows");
  const [state, setState] = useState<"form" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      await apiFetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        body: {
          password: String(f.get("password")),
          confirmPassword: String(f.get("confirmPassword")),
        },
      });
      setState("done");
    } catch (err) {
      setError((err as ApiError)?.message ?? t("resetError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <p className="auth-card__brand" aria-hidden>🌻</p>
      <h1 className="auth-card__title">{t("resetTitle")}</h1>
      {state === "done" ? (
        <p style={{ textAlign: "center" }}>{t("resetSuccess")}</p>
      ) : (
        <>
          {error && (
            <div className="auth-card__error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="password">{t("newPassword")}</label>
              <input id="password" name="password" type="password" required autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t("resetting") : t("resetSubmit")}
            </button>
          </form>
        </>
      )}
      <p className="auth-card__foot">
        <Link href="/login">{t("backToLogin")}</Link>
      </p>
    </div>
  );
}

export function VerifyEmail({ token }: { token: string }) {
  const t = useTranslations("authFlows");
  const [state, setState] = useState<"pending" | "ok" | "error">("pending");

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/auth/verify-email/${token}`)
      .then(() => !cancelled && setState("ok"))
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="auth-card">
      <p className="auth-card__brand" aria-hidden>🌻</p>
      <h1 className="auth-card__title">{t("verifyTitle")}</h1>
      <p style={{ textAlign: "center" }}>
        {state === "pending" && t("verifying")}
        {state === "ok" && t("verifySuccess")}
        {state === "error" && t("verifyError")}
      </p>
      <p className="auth-card__foot">
        <Link href="/login">{t("backToLogin")}</Link>
      </p>
    </div>
  );
}
