"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useRegister } from "./AuthContext";
import type { ApiError } from "@/lib/api/client";
import { TextField } from "@/ui/form";

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
        organization: String(form.get("organization")).trim() || undefined,
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
        <TextField id="firstName" name="firstName" type="text" label={t("firstName")} required />
        <TextField id="lastName" name="lastName" type="text" label={t("lastName")} required />
        <TextField id="email" name="email" type="email" label={t("email")} required autoComplete="email" />
        <TextField
          id="organization"
          name="organization"
          type="text"
          label={t("organization")}
          labelSuffix={` ${t("optional")}`}
          autoComplete="organization"
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label={t("password")}
          required
          autoComplete="new-password"
          hint={t("passwordHint")}
        />
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
