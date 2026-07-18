/**
 * User data access. `findByEmail`/`findByUsername` return the full row
 * (password hash included) for the auth flow; everything user-facing should pass
 * results through `toSafeUser` to strip secrets.
 */
import { and, count, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../index";
import { users, type User, type NewUser } from "../schema";
import type { QueryScope, Role } from "@/lib/rbac";

export type SafeUser = Omit<
  User,
  | "password"
  | "twoFactorSecret"
  | "emailVerificationToken"
  | "passwordResetToken"
>;

export function toSafeUser(user: User): SafeUser {
  const {
    password: _p,
    twoFactorSecret: _t,
    emailVerificationToken: _e,
    passwordResetToken: _r,
    ...safe
  } = user;
  void _p;
  void _t;
  void _e;
  void _r;
  return safe;
}

/** Active, non-deleted only. */
const live = () => and(eq(users.isActive, true), eq(users.isDeleted, false));

export async function findUserById(id: number): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), live()))
    .limit(1);
  return row;
}

/**
 * Fetch a user regardless of active/deleted state. For admin management flows
 * (edit / reactivate a deactivated user) — `findUserById` filters those out.
 */
export async function findUserByIdIncludingInactive(
  id: number,
): Promise<User | undefined> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row;
}

/** Minimal contact rows for a set of user ids (for notification emails). */
export async function getUserContacts(
  ids: number[],
): Promise<{ id: number; email: string; firstName: string }[]> {
  if (ids.length === 0) return [];
  return db
    .select({ id: users.id, email: users.email, firstName: users.firstName })
    .from(users)
    .where(and(inArray(users.id, ids), live()));
}

export async function findUserByEmail(
  email: string,
): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), live()))
    .limit(1);
  return row;
}

export async function findUserByUsername(
  username: string,
): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.username, username), live()))
    .limit(1);
  return row;
}

export interface ListParams {
  scope: QueryScope;
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  /** Include deactivated / soft-deleted users (admin management view). */
  includeInactive?: boolean;
}

export async function listUsers({
  scope,
  page = 1,
  limit = 20,
  search,
  role,
  includeInactive = false,
}: ListParams): Promise<{ data: SafeUser[]; total: number }> {
  if (scope.kind === "none") return { data: [], total: 0 };

  const scopeCond =
    scope.kind === "field" ? eq(users.id, scope.value) : undefined;
  const searchCond = search
    ? or(
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
        ilike(users.email, `%${search}%`),
      )
    : undefined;
  const roleCond = role ? eq(users.role, role) : undefined;
  const where = and(
    includeInactive ? undefined : live(),
    scopeCond,
    searchCond,
    roleCond,
  );
  const offset = (Math.max(1, page) - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(users).where(where).limit(limit).offset(offset),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return { data: rows.map(toSafeUser), total: Number(total) };
}

export async function createUser(data: NewUser): Promise<User> {
  const [row] = await db.insert(users).values(data).returning();
  return row;
}

export async function updateUser(
  id: number,
  patch: Partial<NewUser>,
): Promise<User | undefined> {
  const [row] = await db
    .update(users)
    .set(patch)
    .where(and(eq(users.id, id), live()))
    .returning();
  return row;
}

/**
 * Admin update by id, WITHOUT the `live()` filter — so deactivated / soft-deleted
 * users can be edited and reactivated. `updateUser` (which filters on live) is for
 * flows that only ever touch active accounts (login, self-profile).
 */
export async function updateUserById(
  id: number,
  patch: Partial<NewUser>,
): Promise<User | undefined> {
  const [row] = await db
    .update(users)
    .set(patch)
    .where(eq(users.id, id))
    .returning();
  return row;
}

export async function softDeleteUser(
  id: number,
  actorId: number,
): Promise<void> {
  await db
    .update(users)
    .set({ isDeleted: true, isActive: false, deletedAt: new Date(), deletedBy: actorId })
    .where(eq(users.id, id));
}
