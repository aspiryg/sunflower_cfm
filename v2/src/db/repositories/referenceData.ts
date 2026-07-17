/**
 * Read access to lookup / reference data (active rows, ordered by sortOrder),
 * plus the two hierarchy drill-downs. These back the case-form dropdowns and
 * the resources admin screens.
 */
import { and, asc, eq } from "drizzle-orm";
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
} from "../schema";

export const listCategories = () =>
  db.select().from(caseCategories).where(eq(caseCategories.isActive, true)).orderBy(asc(caseCategories.sortOrder));

export const listStatuses = () =>
  db.select().from(caseStatuses).where(eq(caseStatuses.isActive, true)).orderBy(asc(caseStatuses.sortOrder));

export const listPriorities = () =>
  db.select().from(casePriorities).where(eq(casePriorities.isActive, true)).orderBy(asc(casePriorities.level));

export const listChannels = () =>
  db.select().from(caseChannels).where(eq(caseChannels.isActive, true)).orderBy(asc(caseChannels.sortOrder));

export const listProviderTypes = () =>
  db.select().from(providerTypes).where(eq(providerTypes.isActive, true)).orderBy(asc(providerTypes.sortOrder));

export const listRegions = () =>
  db.select().from(regions).where(eq(regions.isActive, true)).orderBy(asc(regions.sortOrder));

export const listGovernoratesByRegion = (regionId: number) =>
  db
    .select()
    .from(governorates)
    .where(and(eq(governorates.regionId, regionId), eq(governorates.isActive, true)))
    .orderBy(asc(governorates.sortOrder));

export const listCommunitiesByGovernorate = (governorateId: number) =>
  db
    .select()
    .from(communities)
    .where(and(eq(communities.governorateId, governorateId), eq(communities.isActive, true)))
    .orderBy(asc(communities.sortOrder));

export const listPrograms = () =>
  db.select().from(programs).where(eq(programs.isActive, true)).orderBy(asc(programs.sortOrder));

export const listProjectsByProgram = (programId: number) =>
  db
    .select()
    .from(projects)
    .where(and(eq(projects.programId, programId), eq(projects.isActive, true)))
    .orderBy(asc(projects.sortOrder));

export const listActivitiesByProject = (projectId: number) =>
  db
    .select()
    .from(activities)
    .where(and(eq(activities.projectId, projectId), eq(activities.isActive, true)))
    .orderBy(asc(activities.sortOrder));
