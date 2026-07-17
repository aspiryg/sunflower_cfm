import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramStr } from "@/lib/http/params";
import * as ref from "@/db/repositories/referenceData";

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
  async (req, _auth, ctx) => {
    const resource = await paramStr(ctx, "resource");
    const q = new URL(req.url).searchParams;
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
