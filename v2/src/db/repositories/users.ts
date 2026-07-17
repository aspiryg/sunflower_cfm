/**
 * User data access. `findByEmail`/`findByUsername` return the full row
 * (password hash included) for the auth flow; everything user-facing should pass
 * results through `toSafeUser` to strip secrets.
 */
import { and, count, eq } from "drizzle-orm";
import { db } from "../index";
import { users, type User, type NewUser } from "../schema";
import type { QueryScope } from "@/lib/rbac";

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
}

export async function listUsers({
  scope,
  page = 1,
  limit = 20,
}: ListParams): Promise<{ data: SafeUser[]; total: number }> {
  if (scope.kind === "none") return { data: [], total: 0 };

  const scopeCond =
    scope.kind === "field" ? eq(users.id, scope.value) : undefined;
  const where = and(live(), scopeCond);
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

export async function softDeleteUser(
  id: number,
  actorId: number,
): Promise<void> {
  await db
    .update(users)
    .set({ isDeleted: true, isActive: false, deletedAt: new Date(), deletedBy: actorId })
    .where(eq(users.id, id));
}
