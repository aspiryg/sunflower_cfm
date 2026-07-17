/**
 * Email seam. Transport chosen by EMAIL_TRANSPORT:
 *  - "console" (default): logs the email — dev/test. The last message is kept
 *    in memory so integration tests can extract token links.
 *  - "smtp": nodemailer over SMTP_URL — works with any provider
 *    (Resend/Postmark/SES/etc. all expose SMTP), chosen at deploy time.
 * Sending is best-effort for callers: use `sendEmailSafe` in request paths so a
 * mail outage never fails the user action.
 */
import nodemailer from "nodemailer";

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Test/dev hook: the most recent email "sent" via the console transport.
 * (An object holder, not a `let` export — imported bindings can't be reassigned
 * across ESM modules, but tests need to clear it between assertions.)
 */
export const consoleMailbox: { last: OutgoingEmail | null } = { last: null };

async function sendViaConsole(mail: OutgoingEmail): Promise<void> {
  consoleMailbox.last = mail;
  console.log(
    `[email:console] to=${mail.to} subject="${mail.subject}"\n${mail.text}`,
  );
}

async function sendViaSmtp(mail: OutgoingEmail): Promise<void> {
  const url = process.env.SMTP_URL;
  if (!url) throw new Error("EMAIL_TRANSPORT=smtp but SMTP_URL is not set");
  const transporter = nodemailer.createTransport(url);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "no-reply@localhost",
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
}

export async function sendEmail(mail: OutgoingEmail): Promise<void> {
  const transport = process.env.EMAIL_TRANSPORT ?? "console";
  if (transport === "smtp") return sendViaSmtp(mail);
  return sendViaConsole(mail);
}

/** Fire-and-forget variant for request paths. */
export function sendEmailSafe(mail: OutgoingEmail): void {
  void sendEmail(mail).catch((err) =>
    console.error("[email] send failed:", err),
  );
}
