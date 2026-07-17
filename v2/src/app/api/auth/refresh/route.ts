import { handler } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { REFRESH_COOKIE, setAccessCookie } from "@/lib/auth/cookies";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { findUserById, toSafeUser } from "@/db/repositories/users";
import { claimsForUser } from "@/lib/auth/service";

export const POST = handler(async (req) => {
  const token = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!token) return fail(401, "No refresh token.", "MISSING_REFRESH_TOKEN");

  const r = await verifyRefreshToken(token);
  if (!r.ok) {
    return r.reason === "expired"
      ? fail(401, "Refresh token expired.", "REFRESH_TOKEN_EXPIRED")
      : fail(401, "Invalid refresh token.", "INVALID_REFRESH_TOKEN");
  }

  const user = await findUserById(r.claims.id);
  if (!user) return fail(401, "User not found.", "USER_NOT_FOUND");

  const res = ok({ user: toSafeUser(user) }, "Token refreshed.");
  setAccessCookie(res, await signAccessToken(claimsForUser(user)));
  return res;
});
