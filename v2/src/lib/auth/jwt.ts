/**
 * JWT signing/verification via jose (works in Node and Edge runtimes).
 * Two tokens over the same claims: a short-lived access token and a long-lived
 * refresh token, each with its own secret.
 */
import { SignJWT, jwtVerify, errors } from "jose";
import type { Role } from "@/lib/rbac";

export interface JwtClaims {
  id: number;
  email: string;
  username: string;
  role: Role;
  organization?: string | null;
  isEmailVerified: boolean;
}

const encode = (s: string) => new TextEncoder().encode(s);

function accessSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return encode(s);
}
function refreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error("JWT_REFRESH_SECRET is not set");
  return encode(s);
}

const ACCESS_TTL = process.env.JWT_EXPIRES_IN ?? "1h";
const REFRESH_TTL = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

async function sign(
  claims: JwtClaims,
  secret: Uint8Array,
  ttl: string,
): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export const signAccessToken = (claims: JwtClaims) =>
  sign(claims, accessSecret(), ACCESS_TTL);
export const signRefreshToken = (claims: JwtClaims) =>
  sign(claims, refreshSecret(), REFRESH_TTL);

export type VerifyResult =
  | { ok: true; claims: JwtClaims }
  | { ok: false; reason: "expired" | "invalid" };

async function verify(
  token: string,
  secret: Uint8Array,
): Promise<VerifyResult> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { ok: true, claims: payload as unknown as JwtClaims };
  } catch (e) {
    // Explicitly distinguish expiry from tampering — v1 let an expired token
    // fall through to a 500 (docs/v2/IMPROVEMENTS.md).
    if (e instanceof errors.JWTExpired) return { ok: false, reason: "expired" };
    return { ok: false, reason: "invalid" };
  }
}

export const verifyAccessToken = (token: string) =>
  verify(token, accessSecret());
export const verifyRefreshToken = (token: string) =>
  verify(token, refreshSecret());
