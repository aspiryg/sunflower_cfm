/**
 * Related/possibly-duplicate cases for a given case, by embedding similarity.
 * Reuses the case's stored embedding when present; otherwise embeds its text
 * on the fly. Returns [] (not an error) when AI is unavailable.
 */
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { queryScope } from "@/lib/rbac";
import { isAiConfigured, embedText, caseEmbeddingText } from "@/lib/ai";
import { findCaseById, semanticSearchCases } from "@/db/repositories/cases";

export const GET = authed(
  async (_req, auth, ctx) => {
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      return fail(400, "Invalid case id.", "VALIDATION_ERROR");
    }
    const target = await findCaseById(id);
    if (!target) return fail(404, "Case not found.", "NOT_FOUND");
    if (!isAiConfigured()) return ok([]);

    let vector = target.embedding ?? null;
    if (!vector) {
      try {
        vector = await embedText(caseEmbeddingText(target));
      } catch {
        return ok([]);
      }
    }

    const scope = queryScope(auth.user, "cases", "read");
    const results = await semanticSearchCases({
      scope,
      vector,
      limit: 6,
      maxDistance: 0.45,
    });
    // Exclude the case itself.
    return ok(results.filter((c) => c.id !== id));
  },
  { resource: "cases", action: "read" },
);
