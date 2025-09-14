// Create this file: /frontend/src/features/resources/resourcesApi.js
// Re-export functions with cleaner organization
export {
  // Main case operations (already exists)
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,

  // Flat resources
  getCaseCategories as getCategories,
  getCaseStatuses as getStatuses,
  getCasePriorities as getPriorities,
  getCaseChannels as getChannels,
  getProviderTypes,

  // Geographic hierarchy
  getRegions,
  getGovernorates,
  getCommunities,
  getGovernoratesByRegion,
  getCommunitiesByGovernorate,

  // Program hierarchy
  getPrograms,
  getProjects,
  getActivities,
  getProjectsByProgram,
  getActivitiesByProject,

  // Universal operations
  addResource,
  deleteResource,
  updateResource,
} from "../../services/caseApi";
