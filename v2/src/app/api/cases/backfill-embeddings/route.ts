/**
 * Admin maintenance: embed a batch of cases that have no vector yet (e.g. cases
 * created before embeddings existed, or while AI was unconfigured). Idempotent
 * and batched — call repeatedly until `remaining` is 0. Never throws on an
 * individual embedding failure; it just reports how many succeeded.
 */
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { hasRole } from "@/lib/rbac";
import { isAiConfigured } from "@/lib/ai";
import { casesWithoutEmbedding } from "@/db/repositories/cases";
import { embedAndStoreCase } from "@/lib/ai/embedCase";

export const POST = authed(async (req, auth) => {
  if (!hasRole(auth.user, "admin")) {
    return fail(403, "Admin access required.", "FORBIDDEN");
  }
  if (!isAiConfigured()) {
    return fail(503, "AI is not configured.", "AI_UNAVAILABLE");
  }

  const url = new URL(req.url);
  const batchRaw = Number(url.searchParams.get("batch"));
  const batch = Number.isInteger(batchRaw) && batchRaw > 0 ? Math.min(batchRaw, 100) : 25;

  const pending = await casesWithoutEmbedding(batch);
  let embedded = 0;
  for (const c of pending) {
    const vector = await embedAndStoreCase(c.id, c);
    if (vector) embedded++;
  }

  // A full batch means there may be more to do.
  const remaining = pending.length === batch ? "more" : "done";
  return ok({ processed: pending.length, embedded, remaining });
}, {});
