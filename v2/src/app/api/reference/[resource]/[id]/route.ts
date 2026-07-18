import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramInt, paramStr } from "@/lib/http/params";
import { parseBody, lookupUpdateSchema } from "@/lib/validation";
import {
  isEditableLookup,
  updateLookupRow,
} from "@/db/repositories/referenceAdmin";
import { writeAudit } from "@/db/repositories/audit";

export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const resource = await paramStr(ctx, "resource");
    const id = await paramInt(ctx, "id");
    if (!resource || !isEditableLookup(resource)) {
      return fail(400, "This resource cannot be edited via the API.", "UNSUPPORTED");
    }
    if (!id) return fail(400, "Invalid id.", "INVALID_ID");

    const parsed = await parseBody(req, lookupUpdateSchema);
    if (!parsed.ok) return parsed.response;

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
  },
  { resource: "categories", action: "update" },
);
