import { handler } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramStr } from "@/lib/http/params";
import { parseBody, resetPasswordSchema } from "@/lib/validation";
import { LIMITS } from "@/lib/http/rateLimit";
import { resetPasswordByTokenHash } from "@/db/repositories/authTokens";
import { hashToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/service";
import { writeAudit } from "@/db/repositories/audit";

/** Public. Consumes the emailed token and sets a new password. */
export const POST = handler(
  async (req, ctx) => {
    const token = await paramStr(ctx, "token");
    if (!token || token.length < 32) {
      return fail(400, "Invalid reset link.", "INVALID_TOKEN");
    }
    const parsed = await parseBody(req, resetPasswordSchema);
    if (!parsed.ok) return parsed.response;

    const user = await resetPasswordByTokenHash(
      hashToken(token),
      await hashPassword(parsed.data.password),
    );
    if (!user) {
      return fail(400, "This reset link is invalid or has expired.", "INVALID_TOKEN");
    }
    await writeAudit({
      userId: user.id,
      action: "UPDATE",
      entityType: "user",
      entityId: user.id,
      metadata: { passwordReset: true },
    });
    return ok(undefined, "Password updated. You can now sign in.");
  },
  { rate: LIMITS.auth, rateScope: "auth" },
);
