import { handler } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramStr } from "@/lib/http/params";
import { verifyEmailByTokenHash } from "@/db/repositories/authTokens";
import { hashToken } from "@/lib/auth/tokens";
import { toSafeUser } from "@/db/repositories/users";
import { writeAudit } from "@/db/repositories/audit";

/** Public. Consumes the emailed token. */
export const GET = handler(async (_req, ctx) => {
  const token = await paramStr(ctx, "token");
  if (!token || token.length < 32) {
    return fail(400, "Invalid verification link.", "INVALID_TOKEN");
  }
  const user = await verifyEmailByTokenHash(hashToken(token));
  if (!user) {
    return fail(400, "This verification link is invalid or has expired.", "INVALID_TOKEN");
  }
  await writeAudit({
    userId: user.id,
    action: "UPDATE",
    entityType: "user",
    entityId: user.id,
    metadata: { emailVerified: true },
  });
  return ok({ user: toSafeUser(user) }, "Email verified.");
});
