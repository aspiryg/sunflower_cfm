/**
 * Semantic case search (Phase 6 part 2): embeds the query and ranks cases by
 * cosine similarity, honoring the caller's permission scope. Falls back with a
 * clear error when AI is unconfigured so the client can degrade to text search.
 */
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { queryScope } from "@/lib/rbac";
import { isAiConfigured, embedText } from "@/lib/ai";
import { semanticSearchCases } from "@/db/repositories/cases";

export const GET = authed(
  async (req, auth) => {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const limitRaw = Number(url.searchParams.get("limit"));
    const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 25) : 10;

    if (q.length < 2) return ok([], undefined);
    if (!isAiConfigured()) {
      return fail(503, "Semantic search is unavailable.", "AI_UNAVAILABLE");
    }

    let vector: number[];
    try {
      vector = await embedText(q);
    } catch {
      return fail(502, "The embedding service failed.", "AI_ERROR");
    }

    const scope = queryScope(auth.user, "cases", "read");
    const results = await semanticSearchCases({ scope, vector, limit });
    return ok(results);
  },
  { resource: "cases", action: "read" },
);
