/**
 * Write access to editable lookup tables (settings screen) — flat lookups AND
 * the two hierarchies (region→governorate→community, program→project→activity).
 * Statuses and priorities are deliberately NOT editable — they drive the case
 * lifecycle and SLA math; changing them is a migration-level decision.
 */
import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  caseCategories,
  caseChannels,
  providerTypes,
  regions,
  governorates,
  communities,
  programs,
  projects,
  activities,
} from "../schema";

export const EDITABLE_LOOKUPS = {
  categories: caseCategories,
  channels: caseChannels,
  "provider-types": providerTypes,
  regions: regions,
  governorates: governorates,
  communities: communities,
  programs: programs,
  projects: projects,
  activities: activities,
} as const;

export type EditableLookup = keyof typeof EDITABLE_LOOKUPS;

export function isEditableLookup(v: string): v is EditableLookup {
  return v in EDITABLE_LOOKUPS;
}

/** Hierarchy: which resources need a parent id, and what it means. */
export const PARENT_OF: Partial<Record<EditableLookup, EditableLookup>> = {
  governorates: "regions",
  communities: "governorates",
  projects: "programs",
  activities: "projects",
};

/** Resources whose schema requires a short code. */
export const CODE_REQUIRED = new Set<EditableLookup>([
  "regions",
  "governorates",
  "programs",
  "projects",
  "activities",
]);

export interface LookupCreateInput {
  name: string;
  arabicName?: string;
  description?: string;
  code?: string;
  parentId?: number;
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
  const base = {
    name: input.name,
    arabicName: input.arabicName,
    description: input.description,
    sortOrder: input.sortOrder ?? 0,
    createdBy: actorId,
  };
  switch (resource) {
    case "categories": {
      const [row] = await db.insert(caseCategories).values(base).returning();
      return row;
    }
    case "channels": {
      const [row] = await db.insert(caseChannels).values(base).returning();
      return row;
    }
    case "provider-types": {
      const [row] = await db.insert(providerTypes).values(base).returning();
      return row;
    }
    case "regions": {
      const [row] = await db
        .insert(regions)
        .values({ ...base, code: input.code! })
        .returning();
      return row;
    }
    case "governorates": {
      const [row] = await db
        .insert(governorates)
        .values({ ...base, code: input.code!, regionId: input.parentId! })
        .returning();
      return row;
    }
    case "communities": {
      const [row] = await db
        .insert(communities)
        .values({ ...base, code: input.code, governorateId: input.parentId! })
        .returning();
      return row;
    }
    case "programs": {
      const [row] = await db
        .insert(programs)
        .values({ ...base, code: input.code! })
        .returning();
      return row;
    }
    case "projects": {
      const [row] = await db
        .insert(projects)
        .values({ ...base, code: input.code!, programId: input.parentId! })
        .returning();
      return row;
    }
    case "activities": {
      const [row] = await db
        .insert(activities)
        .values({ ...base, code: input.code!, projectId: input.parentId! })
        .returning();
      return row;
    }
  }
}

/** Admin listing: includes inactive rows; hierarchies filter by parent. */
export function listLookupRowsAdmin(
  resource: EditableLookup,
  parentId?: number,
) {
  switch (resource) {
    case "governorates":
      return db
        .select()
        .from(governorates)
        .where(parentId ? eq(governorates.regionId, parentId) : undefined)
        .orderBy(governorates.sortOrder, governorates.id);
    case "communities":
      return db
        .select()
        .from(communities)
        .where(parentId ? eq(communities.governorateId, parentId) : undefined)
        .orderBy(communities.sortOrder, communities.id);
    case "projects":
      return db
        .select()
        .from(projects)
        .where(parentId ? eq(projects.programId, parentId) : undefined)
        .orderBy(projects.sortOrder, projects.id);
    case "activities":
      return db
        .select()
        .from(activities)
        .where(parentId ? eq(activities.projectId, parentId) : undefined)
        .orderBy(activities.sortOrder, activities.id);
    default: {
      const table = EDITABLE_LOOKUPS[resource];
      return db.select().from(table).orderBy(table.sortOrder, table.id);
    }
  }
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
