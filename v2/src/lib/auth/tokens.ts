/**
 * One-time email tokens (verification / password reset). The RAW token goes in
 * the email link; only its SHA-256 hash is stored — a DB leak can't be replayed
 * (hardening over v1, which stored raw tokens).
 */
import { createHash, randomBytes } from "node:crypto";

export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
export const RESET_TTL_MS = 60 * 60 * 1000; // 1h
