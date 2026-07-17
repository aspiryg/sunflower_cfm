import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/features/auth/PasswordFlows";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordForm />;
}
