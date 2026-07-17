/**
 * Email-token flows on the users table: verification + password reset.
 * All lookups are by token HASH (see lib/auth/tokens) and enforce expiry.
 */
import { and, eq, gt } from "drizzle-orm";
import { db } from "../index";
import { users, type User } from "../schema";

export async function setVerificationToken(
  userId: number,
  tokenHash: string,
  expires: Date,
): Promise<void> {
  await db
    .update(users)
    .set({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: expires,
    })
    .where(eq(users.id, userId));
}

/** Consume a verification token: mark verified and clear it. */
export async function verifyEmailByTokenHash(
  tokenHash: string,
): Promise<User | undefined> {
  const [row] = await db
    .update(users)
    .set({
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
    })
    .where(
      and(
        eq(users.emailVerificationToken, tokenHash),
        gt(users.emailVerificationExpires, new Date()),
        eq(users.isDeleted, false),
      ),
    )
    .returning();
  return row;
}

export async function setPasswordResetToken(
  userId: number,
  tokenHash: string,
  expires: Date,
): Promise<void> {
  await db
    .update(users)
    .set({ passwordResetToken: tokenHash, passwordResetExpires: expires })
    .where(eq(users.id, userId));
}

/** Consume a reset token: set the new password hash, clear token + lockout. */
export async function resetPasswordByTokenHash(
  tokenHash: string,
  newPasswordHash: string,
): Promise<User | undefined> {
  const [row] = await db
    .update(users)
    .set({
      password: newPasswordHash,
      passwordChangedAt: new Date(),
      passwordResetToken: null,
      passwordResetExpires: null,
      loginAttempts: 0,
      lockUntil: null,
    })
    .where(
      and(
        eq(users.passwordResetToken, tokenHash),
        gt(users.passwordResetExpires, new Date()),
        eq(users.isDeleted, false),
      ),
    )
    .returning();
  return row;
}
