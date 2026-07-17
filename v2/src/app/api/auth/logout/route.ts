import { handler } from "@/lib/http/guard";
import { ok } from "@/lib/http/respond";
import { authenticate } from "@/lib/auth/session";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { updateUser } from "@/db/repositories/users";
import { writeAudit } from "@/db/repositories/audit";

export const POST = handler(async (req) => {
  const auth = await authenticate(req);
  if (auth) {
    await updateUser(auth.user.id, { isOnline: false });
    await writeAudit({
      userId: auth.user.id,
      action: "LOGOUT",
      entityType: "user",
      entityId: auth.user.id,
    });
  }
  const res = ok(undefined, "Logged out.");
  clearAuthCookies(res);
  return res;
});
