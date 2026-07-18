import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { parseBody, changePasswordSchema } from "@/lib/validation";
import { findUserById, updateUser } from "@/db/repositories/users";
import { verifyPassword, hashPassword } from "@/lib/auth/service";
import { writeAudit } from "@/db/repositories/audit";

export const POST = authed(async (req, auth) => {
  const parsed = await parseBody(req, changePasswordSchema);
  if (!parsed.ok) return parsed.response;
  const { currentPassword, newPassword } = parsed.data;

  const user = await findUserById(auth.user.id);
  if (!user) return fail(404, "User not found.", "USER_NOT_FOUND");
  if (!(await verifyPassword(currentPassword, user.password))) {
    return fail(400, "Current password is incorrect.", "INCORRECT_CURRENT_PASSWORD");
  }
  if (await verifyPassword(newPassword, user.password)) {
    return fail(400, "New password must differ from the current one.", "SAME_PASSWORD");
  }

  await updateUser(user.id, {
    password: await hashPassword(newPassword),
    passwordChangedAt: new Date(),
  });
  await writeAudit({
    userId: user.id,
    action: "UPDATE",
    entityType: "user",
    entityId: user.id,
    metadata: { passwordChanged: true },
  });
  return ok(undefined, "Password updated.");
});
