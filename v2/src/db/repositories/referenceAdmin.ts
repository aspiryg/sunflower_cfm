/**
 * Write access to editable lookup tables (settings screen). Statuses and
 * priorities are deliberately NOT editable here — they drive the case
 * lifecycle and SLA math; changing them is a migration-level decision.
 */
import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  caseCategories,
  caseChannels,
  providerTypes,
  regions,
} from "../schema";

export const EDITABLE_LOOKUPS = {
  categories: caseCategories,
  channels: caseChannels,
  "provider-types": providerTypes,
  regions: regions,
} as const;

export type EditableLookup = keyof typeof EDITABLE_LOOKUPS;

export function isEditableLookup(v: string): v is EditableLookup {
  return v in EDITABLE_LOOKUPS;
}

export interface LookupCreateInput {
  name: string;
  arabicName?: string;
  description?: string;
  code?: string; // required for regions (enforced in the route)
  sortOrder?: number;
}

export interface LookupUpdateInput {
  name?: string;
  arabicName?: string | null; // null clears the value
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export async function createLookupRow(
  resource: EditableLookup,
  input: LookupCreateInput,
  actorId: number,
) {
  const table = EDITABLE_LOOKUPS[resource];
  if (resource === "regions") {
    const [row] = await db
      .insert(regions)
      .values({
        name: input.name,
        arabicName: input.arabicName,
        description: input.description,
        code: input.code!,
        sortOrder: input.sortOrder ?? 0,
        createdBy: actorId,
      })
      .returning();
    return row;
  }
  const [row] = await db
    .insert(table)
    .values({
      name: input.name,
      arabicName: input.arabicName,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
      createdBy: actorId,
    })
    .returning();
  return row;
}

/** Admin listing: includes inactive rows (the public lists filter them out). */
export function listLookupRowsAdmin(resource: EditableLookup) {
  const table = EDITABLE_LOOKUPS[resource];
  return db.select().from(table).orderBy(table.sortOrder, table.id);
}

export async function updateLookupRow(
  resource: EditableLookup,
  id: number,
  patch: LookupUpdateInput,
  actorId: number,
) {
  const table = EDITABLE_LOOKUPS[resource];
  const [row] = await db
    .update(table)
    .set({ ...patch, updatedBy: actorId })
    .where(eq(table.id, id))
    .returning();
  return row;
}
