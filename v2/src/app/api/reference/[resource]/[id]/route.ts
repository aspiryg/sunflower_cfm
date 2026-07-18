import type { NextRequest } from "next/server";
import { z } from "zod";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramInt, paramStr } from "@/lib/http/params";
import { can } from "@/lib/rbac";
import { parseBody } from "@/lib/validation";
import {
  isEditableLookup,
  isLifecycleLookup,
  updateLookupRow,
  deleteLookupRow,
  getStatusRow,
  countCasesUsing,
} from "@/db/repositories/referenceAdmin";
import { writeAudit } from "@/db/repositories/audit";

/**
 * Update-lookup body. Superset over every editable resource; the repository only
 * applies columns that exist on the target table. `null` clears a nullable text
 * field. Inline (validation.ts is shared-owned).
 */
const lookupUpdateSchema = z
  .object({
    name: z.string().min(1).max(200),
    arabicName: z.string().max(200).nullable(),
    description: z.string().max(1000).nullable(),
    arabicDescription: z.string().max(1000).nullable(),
    sortOrder: z.number().int().min(0),
    isActive: z.boolean(),
    color: z.string().max(20),
    // Status-only lifecycle flags.
    isInitial: z.boolean(),
    isFinal: z.boolean(),
    allowReopen: z.boolean(),
    // Priority-only ranking + SLA targets (hours).
    level: z.number().int().positive(),
    responseTimeHours: z.number().int().min(0).nullable(),
    resolutionTimeHours: z.number().int().min(0).nullable(),
    escalationTimeHours: z.number().int().min(0).nullable(),
  })
  .partial();

export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const resource = await paramStr(ctx, "resource");
    const id = await paramInt(ctx, "id");
    if (!resource || !isEditableLookup(resource)) {
      return fail(400, "This resource cannot be edited via the API.", "UNSUPPORTED");
    }
    if (isLifecycleLookup(resource) && !can(auth.user, "case_statuses", "update")) {
      return fail(403, "Only administrators can manage statuses and priorities.", "FORBIDDEN");
    }
    if (!id) return fail(400, "Invalid id.", "INVALID_ID");

    const parsed = await parseBody(req, lookupUpdateSchema);
    if (!parsed.ok) return parsed.response;

    try {
      const row = await updateLookupRow(resource, id, parsed.data, auth.user.id);
      if (!row) return fail(404, "Record not found.", "NOT_FOUND");

      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entityType: "setting",
        entityId: id,
        metadata: { resource, patch: parsed.data },
      });
      return ok({ item: row }, "Updated.");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23505") {
        return fail(409, "A record with that name, code, or level already exists.", "DUPLICATE");
      }
      throw err;
    }
  },
  { resource: "categories", action: "update" },
);

export const DELETE = authed(
  async (_req: NextRequest, auth, ctx) => {
    const resource = await paramStr(ctx, "resource");
    const id = await paramInt(ctx, "id");
    if (!resource || !isEditableLookup(resource)) {
      return fail(400, "This resource cannot be deleted via the API.", "UNSUPPORTED");
    }
    if (isLifecycleLookup(resource) && !can(auth.user, "case_statuses", "delete")) {
      return fail(403, "Only administrators can manage statuses and priorities.", "FORBIDDEN");
    }
    if (!id) return fail(400, "Invalid id.", "INVALID_ID");

    // Lifecycle guards: never remove the initial/final status, nor an in-use
    // status/priority (would break existing cases and SLA math).
    if (resource === "statuses") {
      const status = await getStatusRow(id);
      if (!status) return fail(404, "Record not found.", "NOT_FOUND");
      if (status.isInitial || status.isFinal) {
        return fail(409, "The initial and final statuses cannot be deleted.", "STATUS_PROTECTED");
      }
    }
    if (isLifecycleLookup(resource)) {
      const inUse = await countCasesUsing(resource, id);
      if (inUse > 0) {
        return fail(409, "This value is in use by existing cases and cannot be deleted.", "IN_USE");
      }
    }

    try {
      const row = await deleteLookupRow(resource, id);
      if (!row) return fail(404, "Record not found.", "NOT_FOUND");

      await writeAudit({
        userId: auth.user.id,
        action: "DELETE",
        entityType: "setting",
        entityId: id,
        metadata: { resource, name: (row as { name?: string }).name },
      });
      return ok({ item: row }, "Deleted.");
    } catch (err: unknown) {
      // FK violation → the row is referenced elsewhere (cases, children, …).
      if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23503") {
        return fail(409, "This value is in use and cannot be deleted.", "IN_USE");
      }
      throw err;
    }
  },
  { resource: "categories", action: "delete" },
);
