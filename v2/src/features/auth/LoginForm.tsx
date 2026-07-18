"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useLogin } from "./AuthContext";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { TextField, CheckboxField } from "@/ui/form";

export function LoginForm() {
  const t = useTranslations("auth");
  const tFlows = useTranslations("authFlows");
  const tApp = useTranslations("app");
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  // When set, the account authenticated but its email is unverified — we hold
  // the entered address to power the "resend verification" action.
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLocked(false);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    try {
      const res = await login.mutateAsync({
        email,
        password: String(form.get("password")),
        rememberMe: form.get("rememberMe") === "on",
      });
      if (res.data.emailVerificationRequired) {
        setUnverifiedEmail(email);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      const e = err as ApiError;
      if (e?.status === 423 || e?.error === "ACCOUNT_LOCKED") {
        setLocked(true);
        return;
      }
      setError(t("loginError"));
    }
  }

  async function resend() {
    if (!unverifiedEmail) return;
    setResendState("sending");
    try {
      await apiFetch("/api/auth/verify-email/request", {
        method: "POST",
        body: { email: unverifiedEmail },
      });
    } catch {
      /* endpoint is intentionally non-enumerating; treat as sent */
    }
    setResendState("sent");
  }

  if (unverifiedEmail) {
    return (
      <div className="auth-card">
        <p className="auth-card__brand" aria-hidden>
          🌻
        </p>
        <h1 className="auth-card__title">{tFlows("unverifiedTitle")}</h1>
        <p className="auth-card__foot" style={{ marginBottom: "1.6rem" }}>
          {tFlows("unverifiedBody")}
        </p>
        {resendState === "sent" ? (
          <div className="auth-card__error" role="status" style={{ background: "transparent" }}>
            {tFlows("verifySentNote")}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            disabled={resendState === "sending"}
            onClick={resend}
          >
            {resendState === "sending"
              ? tFlows("sending")
              : tFlows("resendVerification")}
          </button>
        )}
        <p className="auth-card__foot">
          <Link href="/dashboard">{tFlows("continueAnyway")}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <p className="auth-card__brand" aria-hidden>
        🌻
      </p>
      <h1 className="auth-card__title">{t("loginTitle")}</h1>
      {locked && (
        <div className="auth-card__error" role="alert">
          {t("accountLocked")}
        </div>
      )}
      {error && (
        <div className="auth-card__error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <TextField id="email" name="email" type="email" label={t("email")} required autoComplete="email" />
        <TextField id="password" name="password" type="password" label={t("password")} required autoComplete="current-password" />
        <CheckboxField id="rememberMe" name="rememberMe" label={t("rememberMe")} />
        <button type="submit" className="btn btn-primary" disabled={login.isPending}>
          {login.isPending ? t("signingIn") : t("signIn")}
        </button>
      </form>
      <p className="auth-card__foot">
        <Link href="/forgot-password">{tFlows("forgotLink")}</Link>
      </p>
      <p className="auth-card__foot">
        {t("noAccount")} <Link href="/register">{t("signUp")}</Link>
      </p>
      <p className="auth-card__foot">
        <Link href="/">{tApp("name")}</Link>
      </p>
    </div>
  );
}
