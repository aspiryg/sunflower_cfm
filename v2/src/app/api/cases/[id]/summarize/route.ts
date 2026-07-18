import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { findCaseById, listCaseHistory } from "@/db/repositories/cases";
import { listComments } from "@/db/repositories/comments";
import { listStatuses } from "@/db/repositories/referenceData";
import { summarizeCase, isAiConfigured } from "@/lib/ai";

/** On-demand AI summary of a case + its thread (localized). */
export const POST = authed(
  async (req, auth, ctx) => {
    if (!isAiConfigured()) {
      return fail(503, "AI summarization is not configured.", "AI_UNAVAILABLE");
    }
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }

    const locale = new URL(req.url).searchParams.get("locale") ?? "en";
    const [comments, history, statuses] = await Promise.all([
      listComments(id),
      listCaseHistory(id),
      listStatuses(),
    ]);

    try {
      const summary = await summarizeCase({
        caseNumber: found.caseNumber,
        title: found.title,
        description: found.description,
        statusName: statuses.find((s) => s.id === found.statusId)?.name,
        comments: comments.map((c) => ({
          comment: c.comment,
          createdAt: c.createdAt.toISOString(),
        })),
        history: history.map((h) => ({
          actionType: h.actionType,
          changeDescription: h.changeDescription,
          createdAt: h.createdAt.toISOString(),
        })),
        locale,
      });
      return ok({ summary });
    } catch (err) {
      console.error("[ai] summarize failed:", err);
      return fail(502, "AI summarization failed.", "AI_ERROR");
    }
  },
  { resource: "cases", action: "read" },
);
