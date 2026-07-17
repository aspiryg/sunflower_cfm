import { setRequestLocale } from "next-intl/server";
import { VerifyEmail } from "@/features/auth/PasswordFlows";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <VerifyEmail token={token} />;
}
