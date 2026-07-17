import { authed } from "@/lib/http/guard";
import { ok } from "@/lib/http/respond";
import { findUserById, toSafeUser } from "@/db/repositories/users";

export const GET = authed(async (_req, auth) => {
  const user = await findUserById(auth.user.id);
  return ok({ user: user ? toSafeUser(user) : null });
});
