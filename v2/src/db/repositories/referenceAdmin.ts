/**
 * Write access to editable lookup tables (settings screen) — flat lookups, the
 * two hierarchies (region→governorate→community, program→project→activity), and
 * the lifecycle/SLA lookups (statuses, priorities).
 *
 * Statuses and priorities drive the case lifecycle and SLA math, so their
 * mutations are additionally gated to admins in the route layer and their
 * deletion is guarded here (protected/in-use rows cannot be removed).
 */
import { eq, count } from "drizzle-orm";
import { db } from "../index";
import {
  caseCategories,
  caseStatuses,
  casePriorities,
  caseChannels,
  providerTypes,
  regions,
  governorates,
  communities,
  programs,
  projects,
  activities,
  cases,
} from "../schema";

export const EDITABLE_LOOKUPS = {
  categories: caseCategories,
  statuses: caseStatuses,
  priorities: casePriorities,
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

/** Lifecycle/SLA lookups — extra-guarded (admin-only mutations, delete guards). */
export function isLifecycleLookup(v: string): v is "statuses" | "priorities" {
  return v === "statuses" || v === "priorities";
}

/** Resources carrying a `color` column. */
const COLOR_LOOKUPS = new Set<EditableLookup>([
  "categories",
  "statuses",
  "priorities",
  "channels",
  "provider-types",
  "programs",
  "projects",
  "activities",
]);

export function hasColor(resource: EditableLookup): boolean {
  return COLOR_LOOKUPS.has(resource);
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
  arabicDescription?: string;
  code?: string;
  parentId?: number;
  sortOrder?: number;
  color?: string;
  // Status-only.
  isInitial?: boolean;
  isFinal?: boolean;
  allowReopen?: boolean;
  // Priority-only.
  level?: number;
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  escalationTimeHours?: number;
}

export interface LookupUpdateInput {
  name?: string;
  arabicName?: string | null; // null clears the value
  description?: string | null;
  arabicDescription?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  color?: string;
  // Status-only.
  isInitial?: boolean;
  isFinal?: boolean;
  allowReopen?: boolean;
  // Priority-only.
  level?: number;
  responseTimeHours?: number | null;
  resolutionTimeHours?: number | null;
  escalationTimeHours?: number | null;
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
    arabicDescription: input.arabicDescription,
    sortOrder: input.sortOrder ?? 0,
    createdBy: actorId,
  };
  const color = input.color;
  switch (resource) {
    case "categories": {
      const [row] = await db.insert(caseCategories).values({ ...base, color }).returning();
      return row;
    }
    case "channels": {
      const [row] = await db.insert(caseChannels).values({ ...base, color }).returning();
      return row;
    }
    case "provider-types": {
      const [row] = await db.insert(providerTypes).values({ ...base, color }).returning();
      return row;
    }
    case "statuses": {
      const [row] = await db
        .insert(caseStatuses)
        .values({
          ...base,
          color: color!,
          isInitial: input.isInitial ?? false,
          isFinal: input.isFinal ?? false,
          allowReopen: input.allowReopen ?? true,
        })
        .returning();
      return row;
    }
    case "priorities": {
      const [row] = await db
        .insert(casePriorities)
        .values({
          ...base,
          color: color!,
          level: input.level!,
          responseTimeHours: input.responseTimeHours,
          resolutionTimeHours: input.resolutionTimeHours,
          escalationTimeHours: input.escalationTimeHours,
        })
        .returning();
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
        .values({ ...base, code: input.code!, color })
        .returning();
      return row;
    }
    case "projects": {
      const [row] = await db
        .insert(projects)
        .values({ ...base, code: input.code!, programId: input.parentId!, color })
        .returning();
      return row;
    }
    case "activities": {
      const [row] = await db
        .insert(activities)
        .values({ ...base, code: input.code!, projectId: input.parentId!, color })
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

/**
 * Common column subset present on EVERY editable lookup table. Typed precisely so
 * a single object is assignable to `.set()` across the whole table union.
 */
type CommonUpdate = {
  name?: string;
  arabicName?: string | null;
  description?: string | null;
  arabicDescription?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  updatedBy: number;
};

function commonUpdate(patch: LookupUpdateInput, actorId: number): CommonUpdate {
  const set: CommonUpdate = { updatedBy: actorId };
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.arabicName !== undefined) set.arabicName = patch.arabicName;
  if (patch.description !== undefined) set.description = patch.description;
  if (patch.arabicDescription !== undefined)
    set.arabicDescription = patch.arabicDescription;
  if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
  if (patch.isActive !== undefined) set.isActive = patch.isActive;
  return set;
}

export async function updateLookupRow(
  resource: EditableLookup,
  id: number,
  patch: LookupUpdateInput,
  actorId: number,
) {
  const common = commonUpdate(patch, actorId);
  const color = patch.color !== undefined ? { color: patch.color } : {};
  switch (resource) {
    case "categories": {
      const [row] = await db.update(caseCategories).set({ ...common, ...color }).where(eq(caseCategories.id, id)).returning();
      return row;
    }
    case "channels": {
      const [row] = await db.update(caseChannels).set({ ...common, ...color }).where(eq(caseChannels.id, id)).returning();
      return row;
    }
    case "provider-types": {
      const [row] = await db.update(providerTypes).set({ ...common, ...color }).where(eq(providerTypes.id, id)).returning();
      return row;
    }
    case "programs": {
      const [row] = await db.update(programs).set({ ...common, ...color }).where(eq(programs.id, id)).returning();
      return row;
    }
    case "projects": {
      const [row] = await db.update(projects).set({ ...common, ...color }).where(eq(projects.id, id)).returning();
      return row;
    }
    case "activities": {
      const [row] = await db.update(activities).set({ ...common, ...color }).where(eq(activities.id, id)).returning();
      return row;
    }
    case "regions": {
      const [row] = await db.update(regions).set(common).where(eq(regions.id, id)).returning();
      return row;
    }
    case "governorates": {
      const [row] = await db.update(governorates).set(common).where(eq(governorates.id, id)).returning();
      return row;
    }
    case "communities": {
      const [row] = await db.update(communities).set(common).where(eq(communities.id, id)).returning();
      return row;
    }
    case "statuses": {
      const [row] = await db
        .update(caseStatuses)
        .set({
          ...common,
          ...color,
          ...(patch.isInitial !== undefined ? { isInitial: patch.isInitial } : {}),
          ...(patch.isFinal !== undefined ? { isFinal: patch.isFinal } : {}),
          ...(patch.allowReopen !== undefined ? { allowReopen: patch.allowReopen } : {}),
        })
        .where(eq(caseStatuses.id, id))
        .returning();
      return row;
    }
    case "priorities": {
      const [row] = await db
        .update(casePriorities)
        .set({
          ...common,
          ...color,
          ...(patch.level !== undefined ? { level: patch.level } : {}),
          ...(patch.responseTimeHours !== undefined ? { responseTimeHours: patch.responseTimeHours } : {}),
          ...(patch.resolutionTimeHours !== undefined ? { resolutionTimeHours: patch.resolutionTimeHours } : {}),
          ...(patch.escalationTimeHours !== undefined ? { escalationTimeHours: patch.escalationTimeHours } : {}),
        })
        .where(eq(casePriorities.id, id))
        .returning();
      return row;
    }
  }
}

/** Fetch a single status row (for delete guards). */
export async function getStatusRow(id: number) {
  const [row] = await db.select().from(caseStatuses).where(eq(caseStatuses.id, id)).limit(1);
  return row;
}

/** How many cases currently reference this lookup row (delete-in-use guard). */
export async function countCasesUsing(
  resource: "statuses" | "priorities",
  id: number,
): Promise<number> {
  const col = resource === "statuses" ? cases.statusId : cases.priorityId;
  const [row] = await db.select({ n: count() }).from(cases).where(eq(col, id));
  return row?.n ?? 0;
}

/** Hard-delete a lookup row. Returns the removed row, or undefined if absent. */
export async function deleteLookupRow(resource: EditableLookup, id: number) {
  const table = EDITABLE_LOOKUPS[resource];
  const [row] = await db.delete(table).where(eq(table.id, id)).returning();
  return row;
}
