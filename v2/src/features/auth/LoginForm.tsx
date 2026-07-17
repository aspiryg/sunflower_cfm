"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useLogin } from "./AuthContext";

export function LoginForm() {
  const t = useTranslations("auth");
  const tFlows = useTranslations("authFlows");
  const tApp = useTranslations("app");
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await login.mutateAsync({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      router.push("/dashboard");
    } catch {
      setError(t("loginError"));
    }
  }

  return (
    <div className="auth-card">
      <p className="auth-card__brand" aria-hidden>
        🌻
      </p>
      <h1 className="auth-card__title">{t("loginTitle")}</h1>
      {error && (
        <div className="auth-card__error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">{t("password")}</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
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
