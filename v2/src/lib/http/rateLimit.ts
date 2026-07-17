/**
 * Minimal in-memory sliding-window rate limiter. Adequate for a single-instance
 * deployment (the Hetzner target); swap for a Redis-backed limiter when scaling
 * horizontally (docs/v2/ROADMAP.md Phase 7).
 */
const buckets = new Map<string, number[]>();

export interface RateLimit {
  limit: number;
  windowMs: number;
}

/** Named presets mirroring v1's limiters. */
export const LIMITS = {
  general: { limit: 1000, windowMs: 15 * 60 * 1000 },
  auth: { limit: 50, windowMs: 15 * 60 * 1000 },
  caseSubmission: { limit: 1000, windowMs: 60 * 60 * 1000 },
  publicIntake: { limit: 20, windowMs: 60 * 60 * 1000 },
} satisfies Record<string, RateLimit>;

/** Returns true if the request is allowed, false if the key is over its limit. */
export function allow(key: string, { limit, windowMs }: RateLimit): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0]!.trim() : "unknown";
  return `${scope}:${ip}`;
}

/** Test-only: reset all buckets. */
export function _reset() {
  buckets.clear();
}
