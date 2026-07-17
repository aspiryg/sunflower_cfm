/**
 * Auth domain helpers: password hashing/verification and token issuance.
 */
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, type JwtClaims } from "./jwt";
import type { User } from "@/db/schema";

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function claimsForUser(user: User): JwtClaims {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    organization: user.organization,
    isEmailVerified: user.isEmailVerified,
  };
}

export async function issueTokens(user: User): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const claims = claimsForUser(user);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(claims),
    signRefreshToken(claims),
  ]);
  return { accessToken, refreshToken };
}
