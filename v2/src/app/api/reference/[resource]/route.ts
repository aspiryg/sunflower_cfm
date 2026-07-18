import type { NextRequest } from "next/server";
import { z } from "zod";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramStr } from "@/lib/http/params";
import { can } from "@/lib/rbac";
import { parseBody } from "@/lib/validation";
import * as ref from "@/db/repositories/referenceData";
import {
  isEditableLookup,
  isLifecycleLookup,
  createLookupRow,
  listLookupRowsAdmin,
  PARENT_OF,
  CODE_REQUIRED,
} from "@/db/repositories/referenceAdmin";
import { writeAudit } from "@/db/repositories/audit";

/**
 * Create-lookup body. A superset covering every editable resource; per-resource
 * required fields (code, parent, color, level) are enforced in the handler so
 * one schema serves all. Kept inline (validation.ts is shared-owned).
 */
const lookupCreateSchema = z.object({
  name: z.string().min(1).max(200),
  arabicName: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  arabicDescription: z.string().max(1000).optional(),
  code: z.string().min(1).max(20).optional(),
  parentId: z.number().int().positive().optional(),
  sortOrder: z.number().int().min(0).optional(),
  color: z.string().max(20).optional(),
  // Status-only lifecycle flags.
  isInitial: z.boolean().optional(),
  isFinal: z.boolean().optional(),
  allowReopen: z.boolean().optional(),
  // Priority-only ranking + SLA targets (hours).
  level: z.number().int().positive().optional(),
  responseTimeHours: z.number().int().min(0).optional(),
  resolutionTimeHours: z.number().int().min(0).optional(),
  escalationTimeHours: z.number().int().min(0).optional(),
});

/**
 * Unified reference-data reader. Flat lists:
 *   /api/reference/{categories|statuses|priorities|channels|provider-types|regions|programs}
 * Hierarchy drill-downs via query param:
 *   /api/reference/governorates?regionId=…
 *   /api/reference/communities?governorateId=…
 *   /api/reference/projects?programId=…
 *   /api/reference/activities?projectId=…
 */
export const GET = authed(
  async (req, auth, ctx) => {
    const resource = await paramStr(ctx, "resource");
    const q = new URL(req.url).searchParams;

    // Admin listing (includes inactive rows) for the settings screen.
    if (q.get("all") === "true") {
      if (!resource || !isEditableLookup(resource)) {
        return fail(400, "This resource has no admin listing.", "UNSUPPORTED");
      }
      if (!can(auth.user, "categories", "update")) {
        return fail(403, "You cannot manage reference data.", "FORBIDDEN");
      }
      const parentId = Number(q.get("parentId")) || undefined;
      return ok(await listLookupRowsAdmin(resource, parentId));
    }
    const parent = (key: string) => {
      const n = Number(q.get(key));
      return Number.isInteger(n) && n > 0 ? n : null;
    };

    switch (resource) {
      case "categories":
        return ok(await ref.listCategories());
      case "statuses":
        return ok(await ref.listStatuses());
      case "priorities":
        return ok(await ref.listPriorities());
      case "channels":
        return ok(await ref.listChannels());
      case "provider-types":
        return ok(await ref.listProviderTypes());
      case "regions":
        return ok(await ref.listRegions());
      case "programs":
        return ok(await ref.listPrograms());
      case "governorates": {
        const regionId = parent("regionId");
        if (!regionId) return fail(400, "regionId is required.", "MISSING_PARENT");
        return ok(await ref.listGovernoratesByRegion(regionId));
      }
      case "communities": {
        const governorateId = parent("governorateId");
        if (!governorateId) return fail(400, "governorateId is required.", "MISSING_PARENT");
        return ok(await ref.listCommunitiesByGovernorate(governorateId));
      }
      case "projects": {
        const programId = parent("programId");
        if (!programId) return fail(400, "programId is required.", "MISSING_PARENT");
        return ok(await ref.listProjectsByProgram(programId));
      }
      case "activities": {
        const projectId = parent("projectId");
        if (!projectId) return fail(400, "projectId is required.", "MISSING_PARENT");
        return ok(await ref.listActivitiesByProject(projectId));
      }
      default:
        return fail(404, "Unknown reference resource.", "UNKNOWN_RESOURCE");
    }
  },
  { resource: "categories", action: "read" },
);

export const POST = authed(
  async (req: NextRequest, auth, ctx) => {
    const resource = await paramStr(ctx, "resource");
    if (!resource || !isEditableLookup(resource)) {
      return fail(400, "This resource cannot be created via the API.", "UNSUPPORTED");
    }
    // Statuses/priorities are lifecycle/SLA-critical → admin-only.
    if (isLifecycleLookup(resource) && !can(auth.user, "case_statuses", "create")) {
      return fail(403, "Only administrators can manage statuses and priorities.", "FORBIDDEN");
    }
    const parsed = await parseBody(req, lookupCreateSchema);
    if (!parsed.ok) return parsed.response;
    if (CODE_REQUIRED.has(resource) && !parsed.data.code) {
      return fail(400, "This resource requires a code.", "MISSING_CODE");
    }
    if (PARENT_OF[resource] && !parsed.data.parentId) {
      return fail(400, "This resource requires a parent.", "MISSING_PARENT");
    }
    if (isLifecycleLookup(resource) && !parsed.data.color) {
      return fail(400, "A color is required.", "MISSING_COLOR");
    }
    if (resource === "priorities" && parsed.data.level == null) {
      return fail(400, "A priority level is required.", "MISSING_LEVEL");
    }

    try {
      const row = await createLookupRow(resource, parsed.data, auth.user.id);
      await writeAudit({
        userId: auth.user.id,
        action: "CREATE",
        entityType: "setting",
        entityId: row.id,
        metadata: { resource, name: parsed.data.name },
      });
      return ok({ item: row }, "Created.", { status: 201 });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23505") {
        return fail(409, "A record with that name, code, or level already exists.", "DUPLICATE");
      }
      throw err;
    }
  },
  { resource: "categories", action: "create" },
);
