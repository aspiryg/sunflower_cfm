import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  updateFeedbackStatus,
  assignFeedback,
  bulkUpdateFeedback,
} from "../../services/feedbackApi";
import { getFeedbackHistory } from "../../services/feedbackApi";
import toast from "react-hot-toast";

// Query Keys - Centralized for consistency
export const feedbackKeys = {
  all: ["feedback"],
  lists: () => [...feedbackKeys.all, "list"],
  list: (filters) => [...feedbackKeys.lists(), { filters }],
  details: () => [...feedbackKeys.all, "detail"],
  detail: (id) => [...feedbackKeys.details(), id],
  stats: (filters = {}) => [...feedbackKeys.all, "stats", { filters }], // Include filters in stats key
  search: (query) => [...feedbackKeys.all, "search", query],
  history: (feedbackId) => [...feedbackKeys.all, "history", feedbackId], // Add this line
};

/**
 * Hook to fetch all feedback with optional filtering and pagination
 *
 * @param {Object} options - Query options
 * @param {Object} options.filters - Filter parameters (status, priority, category, etc.)
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Items per page
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort direction ('asc' | 'desc')
 * @param {boolean} options.enabled - Whether to enable the query
 */
export function useFeedbacks(options = {}) {
  const {
    filters = {
      isDeleted: false,
    },
    page = 1,
    limit = 10000,
    sortBy = "createdAt",
    sortOrder = "desc",
    enabled = true,
  } = options;

  return useQuery({
    queryKey: feedbackKeys.list({ filters, page, limit, sortBy, sortOrder }),
    queryFn: () =>
      searchFeedback({
        ...filters,
        page,
        limit,
        sortBy,
        sortOrder,
      }),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true, // Keep previous data while fetching new page
    onError: (error) => {
      console.error("Failed to fetch feedback:", error);
      toast.error("Failed to load feedback data");
    },
  });
}

/**
 * Hook to fetch a single feedback by ID
 *
 * @param {string|number} feedbackId - The feedback ID to fetch
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether to enable the query
 */
export function useFeedback(feedbackId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: feedbackKeys.detail(feedbackId),
    queryFn: () => getFeedbackById(feedbackId),
    enabled: enabled && !!feedbackId, // Only run if ID exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
    onError: (error) => {
      console.error(`Failed to fetch feedback ${feedbackId}:`, error);
      if (error?.response?.status !== 404) {
        toast.error("Failed to load feedback details");
      }
    },
  });
}

/**
 * Hook to create a new feedback entry
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
export function useCreateFeedback(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;
  return useMutation({
    mutationFn: createFeedback,
    onSuccess: (data) => {
      // Invalidate and refetch feedback lists and user notifications
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });

      // Add the new feedback to all relevant list caches
      queryClient.setQueriesData(
        { queryKey: feedbackKeys.lists() },
        (oldData) => {
          // console.log("Old data before adding new feedback:", oldData);
          // Ensure oldData is defined and has a data array
          if (!oldData || !Array.isArray(oldData.data.data)) {
            console.warn(
              "Old data is not in expected format, returning unchanged"
            );
            return oldData;
          }

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [data, ...oldData.data.data], // Prepend new feedback
              pagination: {
                ...oldData.data?.pagination,
                total: (oldData.data?.pagination?.total || 0) + 1, // Increment total count
              },
            },
          };
        }
      );

      toast.success("Feedback created successfully!");

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to create feedback:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create feedback";

      toast.error(errorMessage);

      if (onError) {
        onError(error);
      }
    },
  });
}

/**
 * Hook to update an existing feedback entry
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
export function useUpdateFeedback(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: ({ id, data }) => updateFeedback(id, data),
    onSuccess: (updatedFeedback, variables) => {
      const { id } = variables;

      // Update the specific feedback in cache
      queryClient.setQueryData(
        feedbackKeys.detail(id),
        updatedFeedback.feedback
      );

      // Update feedback in all list caches
      queryClient.setQueriesData(
        { queryKey: feedbackKeys.lists() },
        (oldData) => {
          // ensure oldData is defined and has a data array
          if (!oldData || !Array.isArray(oldData.data.data)) {
            console.warn(
              "Old data is not in expected format, returning unchanged"
            );
            return oldData;
          }

          const newData = oldData.data.data.map((item) =>
            item.id === Number(id) ? updatedFeedback.feedback : item
          );

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: newData,
            },
          };
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
      // Invalidate notifications
      // queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast.success("Feedback updated successfully!");

      if (onSuccess) {
        onSuccess(updatedFeedback, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to update feedback:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update feedback";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook to delete a feedback entry
 * Enhanced for modal usage with better confirmation handling
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.showSuccessToast - Whether to show success toast (default: true)
 */
export function useDeleteFeedback(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  // console.log("useDeleteFeedback initialized with options:", options);
  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: (deletedData, feedbackId) => {
      // Remove from specific detail cache
      queryClient.removeQueries({ queryKey: feedbackKeys.detail(feedbackId) });

      // Remove from all list caches
      queryClient.setQueriesData(
        { queryKey: feedbackKeys.lists() },
        (oldData) => {
          // ensure oldData is defined and has a data array
          if (!oldData || !Array.isArray(oldData.data.data)) {
            console.warn(
              "Old data is not in expected format, returning unchanged"
            );
            return oldData;
          }

          const newData = oldData.data.data.filter(
            (item) => item.id !== Number(feedbackId)
          );

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: newData,
              pagination: {
                ...oldData.data?.pagination,
                total: (oldData.data?.pagination?.total || 0) - 1, // Decrement total count
              },
            },
          };
        }
      );

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });

      if (showSuccessToast) {
        toast.success("Feedback deleted successfully");
      }

      if (onSuccess) {
        onSuccess(deletedData, feedbackId);
      }
    },
    onError: (error, feedbackId) => {
      console.error("Failed to delete feedback:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete feedback";

      toast.error(errorMessage);

      if (onError) {
        onError(error, feedbackId);
      }
    },
  });
}

/**
 * Hook to update feedback status only
 * Optimized for quick status changes in modals
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.showSuccessToast - Whether to show success toast (default: true)
 */
export function useUpdateFeedbackStatus(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ id, status, comments }) =>
      updateFeedbackStatus(id, status, comments),
    onSuccess: (updatedFeedback, variables) => {
      const { id } = variables;

      // Invalidate stats to update status counts
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
        queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
        queryClient.invalidateQueries({ queryKey: feedbackKeys.details(id) });
      }, 1000);

      if (showSuccessToast) {
        toast.success("Feedback status updated successfully!");
      }

      if (onSuccess) {
        onSuccess(updatedFeedback, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to update feedback status:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update feedback status";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook to assign feedback to a user
 * Specialized for assignment modals
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.showSuccessToast - Whether to show success toast (default: true)
 */
export function useAssignFeedback(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ id, assignedTo, comments }) =>
      assignFeedback(id, assignedTo, comments),
    onSuccess: (updatedFeedback, variables) => {
      const { id } = variables;

      // Invalidate related queries after 10 seconds
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: feedbackKeys.details(id) });
        queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
        // queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
        // queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
        // queryClient.invalidateQueries({ queryKey: ["userAssignments"] });
      }, 10000);

      if (showSuccessToast) {
        toast.success("Feedback assigned successfully!", {
          position: "top-center",
          duration: 3000,
        });
      }

      if (onSuccess) {
        onSuccess(updatedFeedback, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to assign feedback:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign feedback";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook for bulk operations
 * Useful for multi-select actions in tables
 *
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
export function useBulkUpdateFeedback(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: ({ ids, updates }) =>
      bulkUpdateFeedback
        ? bulkUpdateFeedback(ids, updates)
        : Promise.all(ids.map((id) => updateFeedback(id, updates))),
    onSuccess: (updatedFeedbacks, variables) => {
      // Invalidate all related queries for simplicity
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.details() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });

      const count = Array.isArray(updatedFeedbacks)
        ? updatedFeedbacks.length
        : variables.ids.length;
      toast.success(`${count} feedback(s) updated successfully!`);

      if (onSuccess) {
        onSuccess(updatedFeedbacks, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to bulk update feedback:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update selected feedback";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook for advanced search with debouncing
 * Useful for search modals or real-time search
 *
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @param {Object} options - Query options
 */
/**
 * Hook for advanced search with debouncing
 * Fixed to return proper data structure
 */
export function useFeedbackSearch(
  query = "",
  filters = { stats: "open" },
  options = {}
) {
  const { enabled = true, debounceMs = 300 } = options;

  // Simple debouncing logic
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery({
    queryKey: feedbackKeys.search({ query: debouncedQuery, filters }),
    queryFn: async () => {
      const response = await searchFeedback({
        ...filters,
        search: debouncedQuery,
        limit: 50, // Limit search results
      });

      console.log("useFeedbackSearch response:", response);

      return response; // Return full response object with data, total, etc.
    },
    enabled: enabled && debouncedQuery.length >= 2, // Only search with 2+ characters
    staleTime: 1000 * 60 * 1, // 1 minute
    cacheTime: 1000 * 60 * 3, // 3 minutes
    onError: (error) => {
      console.error("Search failed:", error);
      // Don't show toast for search errors to avoid spam
    },
  });
}

//========= Statistics =========//

/**
 * Hook to get feedback statistics with optional filtering
 * Useful for dashboard widgets
 * @param {Object} options - Options object
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {Object} options.filters - Filter parameters to apply to stats calculation
 */
export function useFeedbackStats(options = {}) {
  const { enabled = true, filters = {} } = options;

  // console.log("useFeedbackStats filters:", filters);

  return useQuery({
    queryKey: feedbackKeys.stats(filters), // Include filters in query key for caching
    queryFn: async () => {
      // If you have a dedicated stats endpoint, use it with filters
      // Otherwise, calculate from the filtered list
      const response = await searchFeedback({
        limit: 100000,
        ...filters, // Spread the filters into the search parameters
      });

      const data = response?.data?.data || [];
      // console.log("useFeedbackStats data:", response);

      const stats = data.reduce(
        (acc, f) => {
          acc.total += 1;
          acc.byStatus[f.status] = (acc.byStatus[f.status] || 0) + 1;
          acc.byPriority[f.priority] = (acc.byPriority[f.priority] || 0) + 1;
          acc.byCategory[f.category?.name] =
            (acc.byCategory[f.category?.name] || 0) + 1;
          if (f.sensitive) {
            acc.sensitive += 1;
          }
          if (f.isActive) {
            acc.active += 1;
          }

          // Compute the daily rate of submissions
          const submissionDate = new Date(f.createdAt).toDateString();
          acc.dailySubmissions[submissionDate] =
            (acc.dailySubmissions[submissionDate] || 0) + 1;

          if (f.status === "closed" || f.status === "resolved") {
            const closingDate = new Date(f.updatedAt);
            const submissionDate = new Date(f.submittedAt);

            const delay = closingDate - submissionDate;
            acc.totalProcessingTime += delay;
            acc.caseProcessed += 1;
          }

          return acc;
        },
        {
          total: 0,
          byStatus: {},
          byPriority: {},
          byCategory: {},
          sensitive: 0,
          active: 0,
          dailySubmissions: {},
          totalProcessingTime: 0,
          caseProcessed: 0,
        }
      );

      return stats;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (error) => {
      console.error("Failed to fetch feedback stats:", error);
    },
  });
}

//========= Feedback History =========//

export function useFeedbackHistory(feedbackId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: feedbackKeys.history(feedbackId),
    queryFn: () => getFeedbackHistory(feedbackId),
    enabled: enabled && !!feedbackId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (error) => {
      console.error("Failed to fetch feedback history:", error);
      // Don't show toast for history errors to avoid spam
    },
  });
}

//========= Utility Functions =========//

/**
 * Utility function to prefetch feedback
 * Useful for hover states or predictive loading
 */
export function usePrefetchFeedback() {
  const queryClient = useQueryClient();

  return (feedbackId) => {
    queryClient.prefetchQuery({
      queryKey: feedbackKeys.detail(feedbackId),
      queryFn: () => getFeedbackById(feedbackId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}

/**
 * Utility function to invalidate all feedback queries
 * Useful for force refresh scenarios
 */
export function useInvalidateFeedback() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
  };
}
