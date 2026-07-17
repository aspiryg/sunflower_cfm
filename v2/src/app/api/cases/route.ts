import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { queryScope } from "@/lib/rbac";
import { LIMITS } from "@/lib/http/rateLimit";
import { parseBody, createCaseSchema } from "@/lib/validation";
import { listCases, createCase, type CaseFilters } from "@/db/repositories/cases";
import { writeAudit } from "@/db/repositories/audit";

function intParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export const GET = authed(
  async (req, auth) => {
    const url = new URL(req.url);
    const q = url.searchParams;
    const page = intParam(q.get("page")) ?? 1;
    const limit = Math.min(intParam(q.get("limit")) ?? 20, 100);
    const filters: CaseFilters = {
      statusId: intParam(q.get("statusId")),
      priorityId: intParam(q.get("priorityId")),
      categoryId: intParam(q.get("categoryId")),
      assignedTo: intParam(q.get("assignedTo")),
      search: q.get("search") ?? undefined,
    };

    const scope = queryScope(auth.user, "cases", "read");
    const { data, total } = await listCases({ scope, filters, page, limit });

    return ok(data, undefined, {
      extra: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  },
  { resource: "cases", action: "read" },
);

export const POST = authed(
  async (req, auth) => {
    const parsed = await parseBody(req, createCaseSchema);
    if (!parsed.ok) return parsed.response;

    try {
      const created = await createCase(parsed.data, auth.user.id);
      await writeAudit({
        userId: auth.user.id,
        action: "CREATE",
        entityType: "case",
        entityId: created.id,
      });
      return ok({ case: created }, "Case created.", { status: 201 });
    } catch (err: unknown) {
      // 23503 = foreign_key_violation (bad category/priority/channel id, etc.)
      if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23503") {
        return fail(400, "One or more referenced records do not exist.", "INVALID_REFERENCE");
      }
      throw err;
    }
  },
  { resource: "cases", action: "create", rate: LIMITS.caseSubmission, rateScope: "cases" },
);
