import { setRequestLocale } from "next-intl/server";
import { ResetPasswordForm } from "@/features/auth/PasswordFlows";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <ResetPasswordForm token={token} />;
}
