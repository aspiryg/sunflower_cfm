import { handler } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { parseBody, registerSchema } from "@/lib/validation";
import { LIMITS } from "@/lib/http/rateLimit";
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  toSafeUser,
} from "@/db/repositories/users";
import { hashPassword, issueTokens } from "@/lib/auth/service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { writeAudit } from "@/db/repositories/audit";

export const POST = handler(
  async (req) => {
    const parsed = await parseBody(req, registerSchema);
    if (!parsed.ok) return parsed.response;
    const { email, password, firstName, lastName, username, organization } =
      parsed.data;

    if (await findUserByEmail(email)) {
      return fail(409, "Email is already registered.", "DUPLICATE_EMAIL");
    }
    const uname = username ?? email.split("@")[0];
    if (await findUserByUsername(uname)) {
      return fail(409, "Username is already taken.", "DUPLICATE_USERNAME");
    }

    // Public registration can never self-assign a privileged role.
    const user = await createUser({
      email,
      username: uname,
      password: await hashPassword(password),
      firstName,
      lastName,
      organization,
      role: "user",
    });

    const tokens = await issueTokens(user);
    const res = ok({ user: toSafeUser(user) }, "Registration successful.", {
      status: 201,
    });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    await writeAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "user",
      entityId: user.id,
    });
    return res;
  },
  { rate: LIMITS.auth, rateScope: "auth" },
);
