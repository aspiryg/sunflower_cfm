import { handler } from "@/lib/http/guard";
import { ok } from "@/lib/http/respond";
import { parseBody, emailOnlySchema } from "@/lib/validation";
import { LIMITS } from "@/lib/http/rateLimit";
import { findUserByEmail } from "@/db/repositories/users";
import { setPasswordResetToken } from "@/db/repositories/authTokens";
import { generateToken, RESET_TTL_MS } from "@/lib/auth/tokens";
import { sendEmailSafe } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email/templates";

/** Public. Always 200 (no account enumeration). */
export const POST = handler(
  async (req) => {
    const parsed = await parseBody(req, emailOnlySchema);
    if (!parsed.ok) return parsed.response;

    const user = await findUserByEmail(parsed.data.email);
    if (user) {
      const { raw, hash } = generateToken();
      await setPasswordResetToken(
        user.id,
        hash,
        new Date(Date.now() + RESET_TTL_MS),
      );
      sendEmailSafe(passwordResetEmail(user.email, raw));
    }
    return ok(
      undefined,
      "If that email is registered, a reset message has been sent.",
    );
  },
  { rate: LIMITS.auth, rateScope: "auth" },
);
