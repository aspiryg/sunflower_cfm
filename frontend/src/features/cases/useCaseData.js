// Create this file: /frontend/src/features/cases/useCaseData.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCaseCategories,
  getCaseStatuses,
  getCasePriorities,
  getCaseChannels,
  getRegions,
  getGovernoratesByRegion,
  getCommunitiesByGovernorate,
  getProviderTypes,
  getPrograms,
  getProjectsByProgram,
  getActivitiesByProject,
} from "../../services/caseApi";

// ============= QUERY KEYS FOR SUPPORTING DATA =============
export const CASE_DATA_QUERY_KEYS = {
  // Main lookup data
  categories: ["case-data", "categories"],
  statuses: ["case-data", "statuses"],
  priorities: ["case-data", "priorities"],
  channels: ["case-data", "channels"],
  providerTypes: ["case-data", "provider-types"],

  // Geographic data
  regions: ["case-data", "regions"],
  governorates: (regionId) => ["case-data", "governorates", regionId],
  communities: (governorateId) => ["case-data", "communities", governorateId],

  // Program hierarchy
  programs: ["case-data", "programs"],
  projects: (programId) => ["case-data", "projects", programId],
  activities: (projectId) => ["case-data", "activities", projectId],

  // Combined data for forms
  allLookupData: ["case-data", "all-lookup"],
  geographicHierarchy: ["case-data", "geographic-hierarchy"],
  programHierarchy: ["case-data", "program-hierarchy"],
};

// ============= BASIC LOOKUP DATA HOOKS =============

/**
 * Hook to fetch case categories
 * @param {Object} options - Query options
 * @returns {Object} Query result with categories data
 */
export const useCaseCategories = (options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.categories,
    queryFn: () => getCaseCategories(options),
    staleTime: 15 * 60 * 1000, // 15 minutes - categories don't change often
    retry: 2,
    select: (data) => {
      // Transform data for easier use in forms
      const categories = data?.data || [];
      return {
        ...data,
        data: categories,
        options: categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
          description: cat.description,
          isActive: cat.isActive,
        })),
        activeOptions: categories
          .filter((cat) => cat.isActive)
          .map((cat) => ({
            value: cat.id,
            label: cat.name,
            description: cat.description,
          })),
      };
    },
  });
};

/**
 * Hook to fetch case statuses
 * @param {Object} options - Query options
 * @returns {Object} Query result with statuses data
 */
export const useCaseStatuses = (options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.statuses,
    queryFn: () => getCaseStatuses(options),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const statuses = data?.data || [];
      return {
        ...data,
        data: statuses,
        options: statuses.map((status) => ({
          value: status.id,
          label: status.name,
          description: status.description,
          isActive: status.isActive,
          isFinal: status.isFinal,
          color: status.color,
        })),
        activeOptions: statuses
          .filter((status) => status.isActive)
          .map((status) => ({
            value: status.id,
            label: status.name,
            description: status.description,
            isFinal: status.isFinal,
            color: status.color,
          })),
        // Group by type for easier use
        openStatuses: statuses.filter((s) => s.isActive && !s.isFinal),
        closedStatuses: statuses.filter((s) => s.isActive && s.isFinal),
      };
    },
  });
};

/**
 * Hook to fetch case priorities
 * @param {Object} options - Query options
 * @returns {Object} Query result with priorities data
 */
export const useCasePriorities = (options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.priorities,
    queryFn: () => getCasePriorities(options),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const priorities = data?.data || [];
      return {
        ...data,
        data: priorities,
        options: priorities.map((priority) => ({
          value: priority.id,
          label: priority.name,
          description: priority.description,
          level: priority.level,
          color: priority.color,
          isActive: priority.isActive,
        })),
        activeOptions: priorities
          .filter((priority) => priority.isActive)
          .sort((a, b) => a.level - b.level) // Sort by priority level
          .map((priority) => ({
            value: priority.id,
            label: priority.name,
            description: priority.description,
            level: priority.level,
            color: priority.color,
          })),
      };
    },
  });
};

/**
 * Hook to fetch case channels
 * @param {Object} options - Query options
 * @returns {Object} Query result with channels data
 */
export const useCaseChannels = (options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.channels,
    queryFn: () => getCaseChannels(options),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const channels = data?.data || [];
      return {
        ...data,
        data: channels,
        options: channels.map((channel) => ({
          value: channel.id,
          label: channel.name,
          description: channel.description,
          isActive: channel.isActive,
        })),
        activeOptions: channels
          .filter((channel) => channel.isActive)
          .map((channel) => ({
            value: channel.id,
            label: channel.name,
            description: channel.description,
          })),
      };
    },
  });
};

/**
 * Hook to fetch provider types
 * @param {Object} options - Query options
 * @returns {Object} Query result with provider types data
 */
export const useProviderTypes = (options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.providerTypes,
    queryFn: () => getProviderTypes(options),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const providerTypes = data?.data || [];
      return {
        ...data,
        data: providerTypes,
        options: providerTypes.map((type) => ({
          value: type.id,
          label: type.name,
          description: type.description,
          isActive: type.isActive,
        })),
        activeOptions: providerTypes
          .filter((type) => type.isActive)
          .map((type) => ({
            value: type.id,
            label: type.name,
            description: type.description,
          })),
      };
    },
  });
};

// ============= GEOGRAPHIC DATA HOOKS =============

/**
 * Hook to fetch regions
 * @param {Object} options - Query options
 * @returns {Object} Query result with regions data
 */
export const useRegions = (options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.regions,
    queryFn: () => getRegions(options),
    staleTime: 30 * 60 * 1000, // 30 minutes - geographic data changes rarely
    retry: 2,
    select: (data) => {
      const regions = data?.data || [];
      return {
        ...data,
        data: regions,
        options: regions.map((region) => ({
          value: region.id,
          label: region.name,
          isActive: region.isActive,
        })),
        activeOptions: regions
          .filter((region) => region.isActive)
          .map((region) => ({
            value: region.id,
            label: region.name,
          })),
      };
    },
  });
};

/**
 * Hook to fetch governorates by region
 * @param {string|number} regionId - The region ID
 * @param {Object} options - Query options
 * @returns {Object} Query result with governorates data
 */
export const useGovernoratesByRegion = (regionId, options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.governorates(regionId),
    queryFn: () => getGovernoratesByRegion(regionId),
    enabled: !!regionId, // Only fetch if regionId is provided
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    select: (data) => {
      const governorates = data?.data || [];
      return {
        ...data,
        data: governorates,
        options: governorates.map((gov) => ({
          value: gov.id,
          label: gov.name,
          regionId: gov.regionId,
          isActive: gov.isActive,
        })),
        activeOptions: governorates
          .filter((gov) => gov.isActive)
          .map((gov) => ({
            value: gov.id,
            label: gov.name,
            regionId: gov.regionId,
          })),
      };
    },
    ...options,
  });
};

/**
 * Hook to fetch communities by governorate
 * @param {string|number} governorateId - The governorate ID
 * @param {Object} options - Query options
 * @returns {Object} Query result with communities data
 */
export const useCommunitiesByGovernorate = (governorateId, options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.communities(governorateId),
    queryFn: () => getCommunitiesByGovernorate(governorateId),
    enabled: !!governorateId, // Only fetch if governorateId is provided
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    select: (data) => {
      const communities = data?.data || [];
      return {
        ...data,
        data: communities,
        options: communities.map((community) => ({
          value: community.id,
          label: community.name,
          governorateId: community.governorateId,
          isActive: community.isActive,
        })),
        activeOptions: communities
          .filter((community) => community.isActive)
          .map((community) => ({
            value: community.id,
            label: community.name,
            governorateId: community.governorateId,
          })),
      };
    },
    ...options,
  });
};

// ============= PROGRAM HIERARCHY HOOKS =============

/**
 * Hook to fetch programs
 * @param {Object} options - Query options
 * @returns {Object} Query result with programs data
 */
export const usePrograms = (options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.programs,
    queryFn: () => getPrograms(options),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const programs = data?.data || [];
      return {
        ...data,
        data: programs,
        options: programs.map((program) => ({
          value: program.id,
          label: program.name,
          description: program.description,
          isActive: program.isActive,
        })),
        activeOptions: programs
          .filter((program) => program.isActive)
          .map((program) => ({
            value: program.id,
            label: program.name,
            description: program.description,
          })),
      };
    },
  });
};

/**
 * Hook to fetch projects by program
 * @param {string|number} programId - The program ID
 * @param {Object} options - Query options
 * @returns {Object} Query result with projects data
 */
export const useProjectsByProgram = (programId, options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.projects(programId),
    queryFn: () => getProjectsByProgram(programId),
    enabled: !!programId, // Only fetch if programId is provided
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const projects = data?.data || [];
      return {
        ...data,
        data: projects,
        options: projects.map((project) => ({
          value: project.id,
          label: project.name,
          description: project.description,
          programId: project.programId,
          isActive: project.isActive,
        })),
        activeOptions: projects
          .filter((project) => project.isActive)
          .map((project) => ({
            value: project.id,
            label: project.name,
            description: project.description,
            programId: project.programId,
          })),
      };
    },
    ...options,
  });
};

/**
 * Hook to fetch activities by project
 * @param {string|number} projectId - The project ID
 * @param {Object} options - Query options
 * @returns {Object} Query result with activities data
 */
export const useActivitiesByProject = (projectId, options = {}) => {
  return useQuery({
    queryKey: CASE_DATA_QUERY_KEYS.activities(projectId),
    queryFn: () => getActivitiesByProject(projectId),
    enabled: !!projectId, // Only fetch if projectId is provided
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const activities = data?.data || [];
      return {
        ...data,
        data: activities,
        options: activities.map((activity) => ({
          value: activity.id,
          label: activity.name,
          description: activity.description,
          projectId: activity.projectId,
          isActive: activity.isActive,
        })),
        activeOptions: activities
          .filter((activity) => activity.isActive)
          .map((activity) => ({
            value: activity.id,
            label: activity.name,
            description: activity.description,
            projectId: activity.projectId,
          })),
      };
    },
    ...options,
  });
};

// ============= COMBINED DATA HOOKS =============

/**
 * Hook to fetch all basic lookup data at once (for forms)
 * @param {Object} options - Query options
 * @returns {Object} Combined query result with all lookup data
 */
export const useAllCaseLookupData = (options = {}) => {
  const categories = useCaseCategories();
  const statuses = useCaseStatuses();
  const priorities = useCasePriorities();
  const channels = useCaseChannels();
  const providerTypes = useProviderTypes();
  const regions = useRegions();
  const programs = usePrograms();

  // Check if all queries are loaded
  const isLoading = [
    categories,
    statuses,
    priorities,
    channels,
    providerTypes,
    regions,
    programs,
  ].some((query) => query.isLoading);

  const isError = [
    categories,
    statuses,
    priorities,
    channels,
    providerTypes,
    regions,
    programs,
  ].some((query) => query.isError);

  const errors = [
    categories,
    statuses,
    priorities,
    channels,
    providerTypes,
    regions,
    programs,
  ]
    .filter((query) => query.isError)
    .map((query) => query.error);

  return {
    // Loading states
    isLoading,
    isError,
    errors,
    isSuccess: !isLoading && !isError,

    // Raw data
    categories: categories.data,
    statuses: statuses.data,
    priorities: priorities.data,
    channels: channels.data,
    providerTypes: providerTypes.data,
    regions: regions.data,
    programs: programs.data,

    // Formatted options for forms
    categoryOptions: categories.data?.activeOptions || [],
    statusOptions: statuses.data?.activeOptions || [],
    priorityOptions: priorities.data?.activeOptions || [],
    channelOptions: channels.data?.activeOptions || [],
    providerTypeOptions: providerTypes.data?.activeOptions || [],
    regionOptions: regions.data?.activeOptions || [],
    programOptions: programs.data?.activeOptions || [],

    // Grouped status options
    openStatusOptions: statuses.data?.openStatuses || [],
    closedStatusOptions: statuses.data?.closedStatuses || [],

    // Refresh function
    refetch: () => {
      categories.refetch();
      statuses.refetch();
      priorities.refetch();
      channels.refetch();
      providerTypes.refetch();
      regions.refetch();
      programs.refetch();
    },
  };
};

/**
 * Hook for managing geographic hierarchy (region -> governorate -> community)
 * @param {Object} initialValues - Initial selected values
 * @returns {Object} Geographic hierarchy state and helpers
 */
export const useGeographicHierarchy = (initialValues = {}) => {
  const { regionId: initialRegionId, governorateId: initialGovernorateId } =
    initialValues;

  // Fetch regions
  const regions = useRegions();

  // Fetch governorates based on selected region
  const governorates = useGovernoratesByRegion(initialRegionId, {
    enabled: !!initialRegionId,
  });

  // Fetch communities based on selected governorate
  const communities = useCommunitiesByGovernorate(initialGovernorateId, {
    enabled: !!initialGovernorateId,
  });

  const queryClient = useQueryClient();

  // Helper functions
  const prefetchGovernoratesForRegion = (regionId) => {
    if (regionId) {
      queryClient.prefetchQuery({
        queryKey: CASE_DATA_QUERY_KEYS.governorates(regionId),
        queryFn: () => getGovernoratesByRegion(regionId),
        staleTime: 30 * 60 * 1000,
      });
    }
  };

  const prefetchCommunitiesForGovernorate = (governorateId) => {
    if (governorateId) {
      queryClient.prefetchQuery({
        queryKey: CASE_DATA_QUERY_KEYS.communities(governorateId),
        queryFn: () => getCommunitiesByGovernorate(governorateId),
        staleTime: 30 * 60 * 1000,
      });
    }
  };

  return {
    // Query states
    regions,
    governorates,
    communities,

    // Loading states
    isLoading:
      regions.isLoading || governorates.isLoading || communities.isLoading,
    isError: regions.isError || governorates.isError || communities.isError,

    // Options for forms
    regionOptions: regions.data?.activeOptions || [],
    governorateOptions: governorates.data?.activeOptions || [],
    communityOptions: communities.data?.activeOptions || [],

    // Helper functions
    prefetchGovernoratesForRegion,
    prefetchCommunitiesForGovernorate,

    // Reset functions
    resetGovernorates: () => {
      queryClient.removeQueries({
        queryKey: CASE_DATA_QUERY_KEYS.governorates(initialRegionId),
      });
    },
    resetCommunities: () => {
      queryClient.removeQueries({
        queryKey: CASE_DATA_QUERY_KEYS.communities(initialGovernorateId),
      });
    },
  };
};

/**
 * Hook for managing program hierarchy (program -> project -> activity)
 * @param {Object} initialValues - Initial selected values
 * @returns {Object} Program hierarchy state and helpers
 */
export const useProgramHierarchy = (initialValues = {}) => {
  const { programId: initialProgramId, projectId: initialProjectId } =
    initialValues;

  // Fetch programs
  const programs = usePrograms();

  // Fetch projects based on selected program
  const projects = useProjectsByProgram(initialProgramId, {
    enabled: !!initialProgramId,
  });

  // Fetch activities based on selected project
  const activities = useActivitiesByProject(initialProjectId, {
    enabled: !!initialProjectId,
  });

  const queryClient = useQueryClient();

  // Helper functions
  const prefetchProjectsForProgram = (programId) => {
    if (programId) {
      queryClient.prefetchQuery({
        queryKey: CASE_DATA_QUERY_KEYS.projects(programId),
        queryFn: () => getProjectsByProgram(programId),
        staleTime: 15 * 60 * 1000,
      });
    }
  };

  const prefetchActivitiesForProject = (projectId) => {
    if (projectId) {
      queryClient.prefetchQuery({
        queryKey: CASE_DATA_QUERY_KEYS.activities(projectId),
        queryFn: () => getActivitiesByProject(projectId),
        staleTime: 15 * 60 * 1000,
      });
    }
  };

  return {
    // Query states
    programs,
    projects,
    activities,

    // Loading states
    isLoading: programs.isLoading || projects.isLoading || activities.isLoading,
    isError: programs.isError || projects.isError || activities.isError,

    // Options for forms
    programOptions: programs.data?.activeOptions || [],
    projectOptions: projects.data?.activeOptions || [],
    activityOptions: activities.data?.activeOptions || [],

    // Helper functions
    prefetchProjectsForProgram,
    prefetchActivitiesForProject,

    // Reset functions
    resetProjects: () => {
      queryClient.removeQueries({
        queryKey: CASE_DATA_QUERY_KEYS.projects(initialProgramId),
      });
    },
    resetActivities: () => {
      queryClient.removeQueries({
        queryKey: CASE_DATA_QUERY_KEYS.activities(initialProjectId),
      });
    },
  };
};

// ============= UTILITY HOOKS =============

/**
 * Hook to prefetch lookup data (useful for preloading forms)
 */
export const usePrefetchCaseLookupData = () => {
  const queryClient = useQueryClient();

  return {
    prefetchBasicLookupData: () => {
      const prefetchQueries = [
        { key: CASE_DATA_QUERY_KEYS.categories, fn: getCaseCategories },
        { key: CASE_DATA_QUERY_KEYS.statuses, fn: getCaseStatuses },
        { key: CASE_DATA_QUERY_KEYS.priorities, fn: getCasePriorities },
        { key: CASE_DATA_QUERY_KEYS.channels, fn: getCaseChannels },
        { key: CASE_DATA_QUERY_KEYS.providerTypes, fn: getProviderTypes },
        { key: CASE_DATA_QUERY_KEYS.regions, fn: getRegions },
        { key: CASE_DATA_QUERY_KEYS.programs, fn: getPrograms },
      ];

      return Promise.all(
        prefetchQueries.map(({ key, fn }) =>
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn: fn,
            staleTime: 15 * 60 * 1000,
          })
        )
      );
    },
    prefetchGeographicData: () => {
      return queryClient.prefetchQuery({
        queryKey: CASE_DATA_QUERY_KEYS.regions,
        queryFn: getRegions,
        staleTime: 30 * 60 * 1000,
      });
    },
    prefetchProgramData: () => {
      return queryClient.prefetchQuery({
        queryKey: CASE_DATA_QUERY_KEYS.programs,
        queryFn: getPrograms,
        staleTime: 15 * 60 * 1000,
      });
    },
  };
};

/**
 * Hook to invalidate all case lookup data
 */
export const useInvalidateCaseLookupData = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: ["case-data"] }),
    invalidateCategories: () =>
      queryClient.invalidateQueries({
        queryKey: CASE_DATA_QUERY_KEYS.categories,
      }),
    invalidateStatuses: () =>
      queryClient.invalidateQueries({
        queryKey: CASE_DATA_QUERY_KEYS.statuses,
      }),
    invalidatePriorities: () =>
      queryClient.invalidateQueries({
        queryKey: CASE_DATA_QUERY_KEYS.priorities,
      }),
    invalidateChannels: () =>
      queryClient.invalidateQueries({
        queryKey: CASE_DATA_QUERY_KEYS.channels,
      }),
    invalidateProviderTypes: () =>
      queryClient.invalidateQueries({
        queryKey: CASE_DATA_QUERY_KEYS.providerTypes,
      }),
    invalidateGeographicData: () => {
      queryClient.invalidateQueries({ queryKey: CASE_DATA_QUERY_KEYS.regions });
      queryClient.invalidateQueries({
        queryKey: ["case-data", "governorates"],
      });
      queryClient.invalidateQueries({ queryKey: ["case-data", "communities"] });
    },
    invalidateProgramData: () => {
      queryClient.invalidateQueries({
        queryKey: CASE_DATA_QUERY_KEYS.programs,
      });
      queryClient.invalidateQueries({ queryKey: ["case-data", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["case-data", "activities"] });
    },
  };
};
