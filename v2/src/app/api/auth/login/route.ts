import { handler } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { parseBody, loginSchema } from "@/lib/validation";
import { LIMITS } from "@/lib/http/rateLimit";
import {
  findUserByEmail,
  updateUser,
  toSafeUser,
} from "@/db/repositories/users";
import { verifyPassword, issueTokens } from "@/lib/auth/service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { writeAudit } from "@/db/repositories/audit";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export const POST = handler(
  async (req) => {
    const parsed = await parseBody(req, loginSchema);
    if (!parsed.ok) return parsed.response;
    const { email, password, rememberMe } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      return fail(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }
    if (user.lockUntil && user.lockUntil > new Date()) {
      return fail(423, "Account temporarily locked. Try again later.", "ACCOUNT_LOCKED");
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      const attempts = (user.loginAttempts ?? 0) + 1;
      await updateUser(user.id, {
        loginAttempts: attempts,
        lockUntil: attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS) : null,
      });
      await writeAudit({
        userId: user.id,
        action: "LOGIN",
        entityType: "user",
        entityId: user.id,
        success: false,
        errorMessage: "invalid password",
      });
      return fail(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    await updateUser(user.id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
      isOnline: true,
    });

    const tokens = await issueTokens(user);
    const res = ok(
      { user: toSafeUser(user), emailVerificationRequired: !user.isEmailVerified },
      "Login successful.",
    );
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken, rememberMe);
    await writeAudit({
      userId: user.id,
      action: "LOGIN",
      entityType: "user",
      entityId: user.id,
    });
    return res;
  },
  { rate: LIMITS.auth, rateScope: "auth" },
);
