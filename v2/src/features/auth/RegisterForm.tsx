"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useRegister } from "./AuthContext";
import type { ApiError } from "@/lib/api/client";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const register = useRegister();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await register.mutateAsync({
        email: String(form.get("email")),
        password: String(form.get("password")),
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
      });
      router.push("/dashboard");
    } catch (err) {
      setError((err as ApiError)?.message ?? t("registerError"));
    }
  }

  return (
    <div className="auth-card">
      <p className="auth-card__brand" aria-hidden>
        🌻
      </p>
      <h1 className="auth-card__title">{t("registerTitle")}</h1>
      {error && (
        <div className="auth-card__error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="firstName">{t("firstName")}</label>
          <input id="firstName" name="firstName" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="lastName">{t("lastName")}</label>
          <input id="lastName" name="lastName" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">{t("password")}</label>
          <input id="password" name="password" type="password" required autoComplete="new-password" />
          <span className="muted" style={{ fontSize: "1.2rem" }}>
            {t("passwordHint")}
          </span>
        </div>
        <button type="submit" className="btn btn-primary" disabled={register.isPending}>
          {register.isPending ? t("creatingAccount") : t("signUp")}
        </button>
      </form>
      <p className="auth-card__foot">
        {t("haveAccount")} <Link href="/login">{t("signIn")}</Link>
      </p>
    </div>
  );
}
