import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { queryScope, assignableRoles, ROLES, type Role } from "@/lib/rbac";
import { parseBody, createUserSchema } from "@/lib/validation";
import {
  listUsers,
  findUserByEmail,
  findUserByUsername,
  createUser,
  toSafeUser,
} from "@/db/repositories/users";
import { hashPassword } from "@/lib/auth/service";
import { writeAudit } from "@/db/repositories/audit";

function intParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export const GET = authed(
  async (req, auth) => {
    const url = new URL(req.url);
    const page = intParam(url.searchParams.get("page")) ?? 1;
    const limit = Math.min(intParam(url.searchParams.get("limit")) ?? 20, 100);
    const search = url.searchParams.get("search")?.trim() || undefined;
    // Strict whitelist — unknown roles are ignored.
    const roleRaw = url.searchParams.get("role");
    const role = (ROLES as readonly string[]).includes(roleRaw ?? "")
      ? (roleRaw as Role)
      : undefined;
    const scope = queryScope(auth.user, "users", "read");
    const { data, total } = await listUsers({ scope, page, limit, search, role });
    return ok(data, undefined, {
      extra: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  },
  { resource: "users", action: "read" },
);

export const POST = authed(
  async (req, auth) => {
    const parsed = await parseBody(req, createUserSchema);
    if (!parsed.ok) return parsed.response;
    const { email, firstName, lastName, username, organization, password } =
      parsed.data;
    const requestedRole: Role = parsed.data.role ?? "user";

    // May only create users with a role strictly below one's own.
    if (!assignableRoles(auth.user).includes(requestedRole)) {
      return fail(403, "You cannot assign that role.", "INVALID_ROLE_ASSIGNMENT");
    }
    if (await findUserByEmail(email)) {
      return fail(409, "Email is already registered.", "DUPLICATE_EMAIL");
    }
    const uname = username ?? email.split("@")[0];
    if (await findUserByUsername(uname)) {
      return fail(409, "Username is already taken.", "DUPLICATE_USERNAME");
    }

    // If no password given, generate a temporary one to be reset on first login.
    const temporaryPassword = password ?? `Cfm-${Math.abs(hashSeed(email))}A1`;
    const user = await createUser({
      email,
      username: uname,
      password: await hashPassword(temporaryPassword),
      firstName,
      lastName,
      organization,
      role: requestedRole,
      createdBy: auth.user.id,
    });
    await writeAudit({
      userId: auth.user.id,
      action: "CREATE",
      entityType: "user",
      entityId: user.id,
    });
    return ok(
      { user: toSafeUser(user), temporaryPassword: password ? undefined : temporaryPassword },
      "User created.",
      { status: 201 },
    );
  },
  { resource: "users", action: "create" },
);

// Deterministic non-crypto seed for a readable temp password (reset on first login).
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
