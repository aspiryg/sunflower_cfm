// Create this file: /frontend/src/features/resources/useResources.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  // Existing imports
  getCaseCategories,
  getCaseStatuses,
  getCasePriorities,
  getCaseChannels,
  getProviderTypes,
  getRegions,
  getGovernoratesByRegion,
  getCommunitiesByGovernorate,
  getPrograms,
  getProjectsByProgram,
  getActivitiesByProject,
  // New imports for missing functions
  getGovernorates,
  getCommunities,
  getProjects,
  getActivities,
  addResource,
  deleteResource,
  updateResource,
} from "../../services/caseApi";
import toast from "react-hot-toast";

// ================================
// QUERY KEYS
// ================================
export const RESOURCE_QUERY_KEYS = {
  // Flat resources
  categories: ["resources", "categories"],
  statuses: ["resources", "statuses"],
  priorities: ["resources", "priorities"],
  channels: ["resources", "channels"],
  providerTypes: ["resources", "provider-types"],

  // Geographic resources
  regions: ["resources", "regions"],
  governorates: ["resources", "governorates"],
  communities: ["resources", "communities"],

  // Program hierarchy
  programs: ["resources", "programs"],
  projects: ["resources", "projects"],
  activities: ["resources", "activities"],

  // Hierarchical relationships
  governoratesByRegion: (regionId) => [
    "resources",
    "governorates",
    "by-region",
    regionId,
  ],
  communitiesByGovernorate: (govId) => [
    "resources",
    "communities",
    "by-governorate",
    govId,
  ],
  projectsByProgram: (programId) => [
    "resources",
    "projects",
    "by-program",
    programId,
  ],
  activitiesByProject: (projectId) => [
    "resources",
    "activities",
    "by-project",
    projectId,
  ],
};

// ================================
// RESOURCE CONFIGURATION
// ================================
export const RESOURCE_CONFIG = {
  categories: {
    key: "categories",
    label: "Categories",
    apiEndpoint: "categories",
    queryFn: getCaseCategories,
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "arabicDescription",
        type: "textarea",
        label: "Arabic Description",
      },
      {
        name: "color",
        type: "color",
        label: "Color",
        defaultValue: "--color-blue-200",
      },
      // {
      //   name: "icon",
      //   type: "text",
      //   label: "Icon (CSS class, e.g., 'fa fa-icon')",
      //   defaultValue: "fa fa-tag",
      // },
      {
        name: "sortOrder",
        type: "number",
        label: "Sort Order",
        defaultValue: 0,
      },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  statuses: {
    key: "statuses",
    label: "Statuses",
    apiEndpoint: "statuses",
    queryFn: getCaseStatuses,
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "arabicDescription",
        type: "textarea",
        label: "Arabic Description",
      },
      {
        name: "color",
        type: "color",
        required: true,
        label: "Color",
        defaultValue: "--color-gray-200",
      },
      // {
      //   name: "icon",
      //   type: "text",
      //   label: "Icon (CSS class, e.g., 'fa fa-icon')",
      //   defaultValue: "fa fa-tag",
      // },
      {
        name: "sortOrder",
        type: "number",
        label: "Sort Order",
        defaultValue: 0,
      },
      {
        name: "isInitial",
        type: "boolean",
        label: "Is Initial Status",
        defaultValue: false,
      },
      {
        name: "isFinal",
        type: "boolean",
        label: "Is Final Status",
        defaultValue: false,
      },
      {
        name: "allowReopen",
        type: "boolean",
        label: "Allow Reopen",
        defaultValue: false,
      },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  priorities: {
    key: "priorities",
    label: "Priorities",
    apiEndpoint: "priorities",
    queryFn: getCasePriorities,
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "level",
        type: "number",
        required: true,
        label: "Level (1-10)",
        min: 1,
        max: 10,
      },
      {
        name: "color",
        type: "color",
        required: true,
        label: "Color",
        defaultValue: "--color-blue-200",
      },
      {
        name: "responseTimeHours",
        type: "number",
        label: "Response Time (Hours)",
        min: 1,
      },
      {
        name: "resolutionTimeHours",
        type: "number",
        label: "Resolution Time (Hours)",
        min: 1,
      },
      {
        name: "escalationTimeHours",
        type: "number",
        label: "Escalation Time (Hours)",
        min: 1,
      },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  channels: {
    key: "channels",
    label: "Channels",
    apiEndpoint: "channels",
    queryFn: getCaseChannels,
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  providerTypes: {
    key: "provider-types",
    label: "Provider Types",
    apiEndpoint: "provider-types",
    queryFn: getProviderTypes,
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  regions: {
    key: "regions",
    label: "Regions",
    apiEndpoint: "regions",
    queryFn: getRegions,
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      { name: "code", type: "text", required: true, label: "Code" },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  governorates: {
    key: "governorates",
    label: "Governorates",
    apiEndpoint: "governorates",
    queryFn: getGovernorates,
    parentField: "regionId",
    parentResource: "regions",
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      { name: "code", type: "text", required: true, label: "Code" },
      {
        name: "regionId",
        type: "select",
        required: true,
        label: "Region",
        resourceType: "regions",
      },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  communities: {
    key: "communities",
    label: "Communities",
    apiEndpoint: "communities",
    queryFn: getCommunities,
    parentField: "governorateId",
    parentResource: "governorates",
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      {
        name: "governorateId",
        type: "select",
        required: true,
        label: "Governorate",
        resourceType: "governorates",
      },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  programs: {
    key: "programs",
    label: "Programs",
    apiEndpoint: "programs",
    queryFn: getPrograms,
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      { name: "code", type: "text", required: true, label: "Code" },
      { name: "description", type: "textarea", label: "Description" },
      { name: "startDate", type: "date", label: "Start Date" },
      { name: "endDate", type: "date", label: "End Date" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  projects: {
    key: "projects",
    label: "Projects",
    apiEndpoint: "projects",
    queryFn: getProjects,
    parentField: "programId",
    parentResource: "programs",
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      { name: "code", type: "text", required: true, label: "Code" },
      {
        name: "programId",
        type: "select",
        label: "Program (Optional)",
        resourceType: "programs",
      },
      { name: "description", type: "textarea", label: "Description" },
      { name: "startDate", type: "date", label: "Start Date" },
      { name: "endDate", type: "date", label: "End Date" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
  activities: {
    key: "activities",
    label: "Activities",
    apiEndpoint: "activities",
    queryFn: getActivities,
    parentField: "projectId",
    parentResource: "projects",
    fields: [
      { name: "name", type: "text", required: true, label: "Name" },
      { name: "arabicName", type: "text", label: "Arabic Name" },
      { name: "code", type: "text", required: true, label: "Code" },
      {
        name: "projectId",
        type: "select",
        label: "Project (Optional)",
        resourceType: "projects",
      },
      { name: "description", type: "textarea", label: "Description" },
      { name: "startDate", type: "date", label: "Start Date" },
      { name: "endDate", type: "date", label: "End Date" },
      {
        name: "isActive",
        type: "boolean",
        label: "Active",
        defaultValue: true,
      },
    ],
  },
};

// ================================
// INDIVIDUAL RESOURCE HOOKS
// ================================

/**
 * Generic hook factory for resources
 */
function createResourceHook(resourceKey) {
  const config = RESOURCE_CONFIG[resourceKey];

  return function useResource(options = {}) {
    return useQuery({
      queryKey: RESOURCE_QUERY_KEYS[resourceKey],
      queryFn: () => config.queryFn(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
      select: (data) => {
        const resources = data?.data || [];
        return {
          ...data,
          data: resources,
          options: resources.map((item) => ({
            value: item.id,
            label: item.name,
            ...item,
          })),
          activeOptions: resources
            .filter((item) => item.isActive !== false)
            .map((item) => ({
              value: item.id,
              label: item.name,
              ...item,
            })),
        };
      },
      ...options,
    });
  };
}

// Create individual hooks
export const useCategories = createResourceHook("categories");
export const useStatuses = createResourceHook("statuses");
export const usePriorities = createResourceHook("priorities");
export const useChannels = createResourceHook("channels");
export const useProviderTypes = createResourceHook("providerTypes");
export const useRegions = createResourceHook("regions");
export const useGovernorates = createResourceHook("governorates");
export const useCommunities = createResourceHook("communities");
export const usePrograms = createResourceHook("programs");
export const useProjects = createResourceHook("projects");
export const useActivities = createResourceHook("activities");

// ================================
// HIERARCHICAL RESOURCES HOOKS
// ================================

export const useGovernoratesByRegion = (regionId, options = {}) => {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.governoratesByRegion(regionId),
    queryFn: () => getGovernoratesByRegion(regionId),
    enabled: !!regionId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCommunitiesByGovernorate = (governorateId, options = {}) => {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.communitiesByGovernorate(governorateId),
    queryFn: () => getCommunitiesByGovernorate(governorateId),
    enabled: !!governorateId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProjectsByProgram = (programId, options = {}) => {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.projectsByProgram(programId),
    queryFn: () => getProjectsByProgram(programId),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useActivitiesByProject = (projectId, options = {}) => {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.activitiesByProject(projectId),
    queryFn: () => getActivitiesByProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ================================
// MUTATION HOOKS
// ================================

/**
 * Hook to add a resource
 */
export function useAddResource(resourceKey) {
  const queryClient = useQueryClient();
  const config = RESOURCE_CONFIG[resourceKey];

  return useMutation({
    mutationFn: (resourceData) => addResource(config.apiEndpoint, resourceData),
    onSuccess: (data) => {
      // Invalidate and refetch the specific resource list
      queryClient.invalidateQueries({
        queryKey: RESOURCE_QUERY_KEYS[resourceKey],
      });

      // Also invalidate hierarchical queries if applicable
      if (config.key === "regions") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "governorates"],
        });
      } else if (config.key === "governorates") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "communities"],
        });
      } else if (config.key === "programs") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "projects"],
        });
      } else if (config.key === "projects") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "activities"],
        });
      }

      toast.success(`${config.label.slice(0, -1)} added successfully`);
    },
    onError: (error) => {
      console.error(`Error adding ${config.label}:`, error);
      toast.error(
        error?.message || `Failed to add ${config.label.slice(0, -1)}`
      );
    },
  });
}

/**
 * Hook to delete a resource
 */
export function useDeleteResource(resourceKey) {
  const queryClient = useQueryClient();
  const config = RESOURCE_CONFIG[resourceKey];

  return useMutation({
    mutationFn: (resourceId) => deleteResource(config.apiEndpoint, resourceId),
    onSuccess: () => {
      // Invalidate and refetch the specific resource list
      queryClient.invalidateQueries({
        queryKey: RESOURCE_QUERY_KEYS[resourceKey],
      });

      // Also invalidate hierarchical queries if applicable
      if (config.key === "regions") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "governorates"],
        });
        queryClient.invalidateQueries({
          queryKey: ["resources", "communities"],
        });
      } else if (config.key === "governorates") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "communities"],
        });
      } else if (config.key === "programs") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "projects"],
        });
        queryClient.invalidateQueries({
          queryKey: ["resources", "activities"],
        });
      } else if (config.key === "projects") {
        queryClient.invalidateQueries({
          queryKey: ["resources", "activities"],
        });
      }

      toast.success(`${config.label.slice(0, -1)} deleted successfully`);
    },
    onError: (error) => {
      console.error(`Error deleting ${config.label}:`, error);
      toast.error(
        error?.message || `Failed to delete ${config.label.slice(0, -1)}`
      );
    },
  });
}

/**
 * Hook to update a resource
 */
export function useUpdateResource(resourceKey) {
  const queryClient = useQueryClient();
  const config = RESOURCE_CONFIG[resourceKey];

  return useMutation({
    mutationFn: ({ resourceId, resourceData }) =>
      updateResource(config.apiEndpoint, resourceId, resourceData),
    onSuccess: () => {
      // Invalidate and refetch the specific resource list
      queryClient.invalidateQueries({
        queryKey: RESOURCE_QUERY_KEYS[resourceKey],
      });

      toast.success(`${config.label.slice(0, -1)} updated successfully`);
    },
    onError: (error) => {
      console.error(`Error updating ${config.label}:`, error);
      toast.error(
        error?.message || `Failed to update ${config.label.slice(0, -1)}`
      );
    },
  });
}

// ================================
// UTILITY HOOKS
// ================================

/**
 * Hook to get all flat resources in one object
 */
export function useAllFlatResources() {
  const categories = useCategories();
  const statuses = useStatuses();
  const priorities = usePriorities();
  const channels = useChannels();
  const providerTypes = useProviderTypes();

  return {
    categories,
    statuses,
    priorities,
    channels,
    providerTypes,
    isLoading: [categories, statuses, priorities, channels, providerTypes].some(
      (q) => q.isLoading
    ),
    isError: [categories, statuses, priorities, channels, providerTypes].some(
      (q) => q.isError
    ),
    isSuccess: [
      categories,
      statuses,
      priorities,
      channels,
      providerTypes,
    ].every((q) => q.isSuccess),
  };
}

/**
 * Hook to get all hierarchical resources in one object
 */
export function useAllHierarchicalResources() {
  const regions = useRegions();
  const governorates = useGovernorates();
  const communities = useCommunities();
  const programs = usePrograms();
  const projects = useProjects();
  const activities = useActivities();

  return {
    regions,
    governorates,
    communities,
    programs,
    projects,
    activities,
    isLoading: [
      regions,
      governorates,
      communities,
      programs,
      projects,
      activities,
    ].some((q) => q.isLoading),
    isError: [
      regions,
      governorates,
      communities,
      programs,
      projects,
      activities,
    ].some((q) => q.isError),
    isSuccess: [
      regions,
      governorates,
      communities,
      programs,
      projects,
      activities,
    ].every((q) => q.isSuccess),
  };
}

/**
 * Hook to get resource by key
 */
export function useResourceByKey(resourceKey, options = {}) {
  const hookMap = {
    categories: useCategories,
    statuses: useStatuses,
    priorities: usePriorities,
    channels: useChannels,
    providerTypes: useProviderTypes,
    regions: useRegions,
    governorates: useGovernorates,
    communities: useCommunities,
    programs: usePrograms,
    projects: useProjects,
    activities: useActivities,
  };

  const hook = hookMap[resourceKey];
  if (!hook) {
    // throw new Error(`Invalid resource key: ${resourceKey}`);
    return { data: [], isLoading: false, error: null, refetch: () => {} };
  }

  return hook(options);
}
