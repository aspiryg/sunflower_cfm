import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Create axios instance for feedback-related data
const api = axios.create({
  baseURL: "/api/feedback-related-data",
  withCredentials: true,
});

// Query Keys for related data
export const feedbackDataKeys = {
  categories: ["feedback-categories"],
  channels: ["feedback-channels"],
  providerTypes: ["feedback-providerTypes"],
  programmes: ["programmes"],
  projects: (programmeId) =>
    programmeId ? ["projects", programmeId] : ["projects"],
  activities: (projectId) =>
    projectId ? ["activities", projectId] : ["activities"],
  communities: ["communities"],
};

/**
 * Hook to fetch feedback categories
 * Categories like: Service Quality, Access to Services, Staff Behavior, etc.
 */
export function useFeedbackCategories(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: feedbackDataKeys.categories,
    queryFn: async () => {
      const { data } = await api.get("/categories");
      // console.log("Fetched feedback categories:", data);
      return data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutes - categories don't change often
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onError: (error) => {
      console.error("Failed to fetch feedback categories:", error);
    },
  });
}

/**
 * Hook to fetch feedback channels
 * Channels like: In-Person, Phone Call, Email, Online Form, etc.
 */
export function useFeedbackChannels(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: feedbackDataKeys.channels,
    queryFn: async () => {
      const { data } = await api.get("/channels");
      return data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onError: (error) => {
      console.error("Failed to fetch feedback channels:", error);
    },
  });
}

/**
 * Hook to fetch feedback providers (individuals/organizations providing feedback)
 * Can be filtered by type: individual, group, organization
 */
export function useFeedbackProviderTypes(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [...feedbackDataKeys.providerTypes],
    queryFn: async () => {
      const { data } = await api.get(`/providers`);
      // console.log("Fetched feedback providers:", data);
      return data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
    onError: (error) => {
      console.error("Failed to fetch feedback providers:", error);
    },
  });
}

/**
 * Hook to fetch programmes
 * Top-level organizational programs
 */
export function useProgrammes(options = {}) {
  const { enabled = true, active = true } = options;

  return useQuery({
    queryKey: [...feedbackDataKeys.programmes, { active }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (active !== null) params.append("active", active);

      const { data } = await api.get(`/programmes?${params}`);
      return data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
    onError: (error) => {
      console.error("Failed to fetch programmes:", error);
    },
  });
}

/**
 * Hook to fetch projects
 * Can be filtered by programme ID for hierarchical loading
 */
export function useProjects(options = {}) {
  const { enabled = true, programmeId = null, active = true } = options;

  return useQuery({
    queryKey: [...feedbackDataKeys.projects(programmeId), { active }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (programmeId) params.append("programmeId", programmeId);
      if (active !== null) params.append("active", active);

      const { data } = await api.get(`/projects?${params}`);
      return data || [];
    },
    enabled: enabled && (programmeId !== null || !programmeId), // Enable if no programmeId filter or if programmeId is provided
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
    onError: (error) => {
      console.error("Failed to fetch projects:", error);
    },
  });
}

/**
 * Hook to fetch activities
 * Can be filtered by project ID for hierarchical loading
 */
export function useActivities(options = {}) {
  const { enabled = true, projectId = null, active = true } = options;

  return useQuery({
    queryKey: [...feedbackDataKeys.activities(projectId), { active }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.append("projectId", projectId);
      if (active !== null) params.append("active", active);

      const { data } = await api.get(`/activities?${params}`);
      return data || [];
    },
    enabled: enabled && (projectId !== null || !projectId), // Enable if no projectId filter or if projectId is provided
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
    onError: (error) => {
      console.error("Failed to fetch activities:", error);
    },
  });
}

/**
 * Hook to fetch communities
 * Geographic locations where feedback can originate
 */
export function useCommunities(options = {}) {
  const { enabled = true, search = "", region = null, limit = 200 } = options;

  return useQuery({
    queryKey: [...feedbackDataKeys.communities, { search, region, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (region) params.append("region", region);
      if (limit) params.append("limit", limit);

      const { data } = await api.get(`/communities?${params}`);
      return data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutes - communities don't change often
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onError: (error) => {
      console.error("Failed to fetch communities:", error);
    },
  });
}

/**
 * Hierarchical hook to fetch projects based on selected programme
 * Automatically enables/disables based on programme selection
 */
export function useProjectsByProgramme(programmeId, options = {}) {
  return useProjects({
    ...options,
    programmeId,
    enabled: !!programmeId && options.enabled !== false,
  });
}

/**
 * Hierarchical hook to fetch activities based on selected project
 * Automatically enables/disables based on project selection
 */
export function useActivitiesByProject(projectId, options = {}) {
  return useActivities({
    ...options,
    projectId,
    enabled: !!projectId && options.enabled !== false,
  });
}

/**
 * Compound hook for feedback form options
 * Combines all the dropdown options needed for the feedback form
 */
export function useFeedbackFormOptions() {
  const categories = useFeedbackCategories();
  const channels = useFeedbackChannels();
  const providerTypes = useFeedbackProviderTypes();
  const programmes = useProgrammes();
  const projects = useProjects();
  const activities = useActivities();
  const communities = useCommunities();

  return {
    categories,
    channels,
    providerTypes,
    programmes,
    projects,
    activities,
    communities,
    isLoading:
      categories.isLoading ||
      channels.isLoading ||
      providerTypes.isLoading ||
      programmes.isLoading ||
      projects.isLoading ||
      activities.isLoading ||
      communities.isLoading,

    isError:
      categories.isError ||
      channels.isError ||
      providerTypes.isError ||
      programmes.isError ||
      projects.isError ||
      activities.isError ||
      communities.isError,

    error:
      categories.error ||
      channels.error ||
      providerTypes.error ||
      programmes.error ||
      projects.error ||
      activities.error ||
      communities.error,
  };
}

/**
 * Hook for dynamic project/activity loading
 * Returns projects and activities with hierarchical loading logic
 */
export function useProjectHierarchy(programmeId, projectId) {
  const projects = useProjectsByProgramme(programmeId);
  const activities = useActivitiesByProject(projectId);

  return {
    projects,
    activities,
    isLoading: projects.isLoading || activities.isLoading,
    isError: projects.isError || activities.isError,
    error: projects.error || activities.error,
  };
}
