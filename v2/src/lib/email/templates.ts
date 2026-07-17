/**
 * Bilingual (EN + AR) transactional email templates. Both languages appear in
 * one message since users have no stored locale preference yet.
 */
import type { OutgoingEmail } from "./index";

const BRAND = "Community Feedback Management";

function baseUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function shell(bodyEn: string, bodyAr: string, cta: { url: string; labelEn: string; labelAr: string }): string {
  return `<!doctype html><html><body style="font-family:sans-serif;line-height:1.6;color:#1e293b;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="color:#4f46e5">🌻 ${BRAND}</h2>
  <p>${bodyEn}</p>
  <p style="margin:24px 0"><a href="${cta.url}" style="background:#4f46e5;color:#eef2ff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">${cta.labelEn}</a></p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <div dir="rtl" style="text-align:right">
  <p>${bodyAr}</p>
  <p style="margin:24px 0"><a href="${cta.url}" style="background:#4f46e5;color:#eef2ff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">${cta.labelAr}</a></p>
  </div>
  <p style="color:#64748b;font-size:13px">If the button does not work, open this link:<br>${cta.url}</p>
  </body></html>`;
}

export function verificationEmail(to: string, token: string): OutgoingEmail {
  const url = `${baseUrl()}/en/verify-email/${token}`;
  return {
    to,
    subject: `Verify your email — ${BRAND}`,
    html: shell(
      "Welcome! Please confirm your email address to activate your account. This link expires in 24 hours.",
      "مرحباً! يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك. تنتهي صلاحية هذا الرابط خلال 24 ساعة.",
      { url, labelEn: "Verify email", labelAr: "تأكيد البريد الإلكتروني" },
    ),
    text: `Verify your email / تأكيد البريد الإلكتروني: ${url}`,
  };
}

export function passwordResetEmail(to: string, token: string): OutgoingEmail {
  const url = `${baseUrl()}/en/reset-password/${token}`;
  return {
    to,
    subject: `Reset your password — ${BRAND}`,
    html: shell(
      "We received a request to reset your password. This link expires in 1 hour. If you didn't ask for this, you can ignore this email.",
      "تلقّينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. تنتهي صلاحية هذا الرابط خلال ساعة واحدة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.",
      { url, labelEn: "Reset password", labelAr: "إعادة تعيين كلمة المرور" },
    ),
    text: `Reset your password / إعادة تعيين كلمة المرور: ${url}`,
  };
}
