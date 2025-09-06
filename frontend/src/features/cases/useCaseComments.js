import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCaseComments,
  addCaseComment,
  updateCaseComment,
  deleteCaseComment,
  getCaseCommentCount,
  markCommentFollowUpCompleted,
} from "../../services/caseApi";
import toast from "react-hot-toast";

// Query Keys for case comments
export const caseCommentsKeys = {
  all: ["case-comments"],
  lists: () => [...caseCommentsKeys.all, "list"],
  list: (caseId, options = {}) => [
    ...caseCommentsKeys.lists(),
    caseId,
    options,
  ],
  details: () => [...caseCommentsKeys.all, "detail"],
  detail: (commentId) => [...caseCommentsKeys.details(), commentId],
  count: (caseId) => [...caseCommentsKeys.all, "count", caseId],
  followUp: (filters) => [...caseCommentsKeys.all, "followUp", filters],
};

/**
 * Hook to fetch all comments for a specific case
 * @param {string|number} caseId - The case ID
 * @param {Object} options - Query options
 */
export function useCaseComments(caseId, options = {}) {
  const { enabled = true, limit, offset, includeInactive = false } = options;

  return useQuery({
    queryKey: caseCommentsKeys.list(caseId, {
      limit,
      offset,
      includeInactive,
    }),
    queryFn: () => getCaseComments(caseId, { limit, offset, includeInactive }),
    enabled: enabled && !!caseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      console.error(`Failed to fetch comments for case ${caseId}:`, error);
    },
  });
}

/**
 * Hook to get comment count for a case
 * @param {string|number} caseId - The case ID
 * @param {Object} options - Query options
 */
export function useCaseCommentCount(caseId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: caseCommentsKeys.count(caseId),
    queryFn: () => getCaseCommentCount(caseId),
    enabled: enabled && !!caseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (error) => {
      console.error(`Failed to fetch comment count for case ${caseId}:`, error);
    },
  });
}

/**
 * Hook to create a new case comment
 * @param {Object} options - Mutation options
 */
export function useCreateCaseComment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ caseId, commentData }) =>
      addCaseComment(caseId, commentData),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate and refetch comments for this case
      queryClient.invalidateQueries({
        queryKey: caseCommentsKeys.list(caseId),
      });

      // Update comment count
      queryClient.invalidateQueries({
        queryKey: caseCommentsKeys.count(caseId),
      });

      // Invalidate case history as comments create history entries
      queryClient.invalidateQueries({
        queryKey: ["cases", "history", caseId],
      });

      // Optimistically add the new comment to the cache - FIXED DATA STRUCTURE
      queryClient.setQueriesData(
        { queryKey: caseCommentsKeys.list(caseId) },
        (oldData) => {
          if (!oldData?.data?.data) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [data.data, ...oldData.data.data],
              pagination: {
                ...oldData.data.pagination,
                total: (oldData.data.pagination?.total || 0) + 1,
              },
            },
          };
        }
      );

      if (showSuccessToast) {
        toast.success("Comment added successfully!");
      }

      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to create case comment:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add comment";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook to update a case comment
 * @param {Object} options - Mutation options
 */
export function useUpdateCaseComment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ caseId, commentId, commentData }) =>
      updateCaseComment(caseId, commentId, commentData),
    onSuccess: (data, variables) => {
      const { caseId, commentId } = variables;

      // Update the specific comment in all relevant caches - FIXED DATA STRUCTURE
      queryClient.setQueriesData(
        { queryKey: caseCommentsKeys.list(caseId) },
        (oldData) => {
          if (!oldData?.data?.data || !Array.isArray(oldData.data.data))
            return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.map((comment) =>
                comment.id === commentId ? data.data : comment
              ),
            },
          };
        }
      );

      // Update comment detail cache if it exists
      queryClient.setQueryData(caseCommentsKeys.detail(commentId), data.data);

      // Invalidate case history as comment updates create history entries
      queryClient.invalidateQueries({
        queryKey: ["cases", "history", caseId],
      });

      if (showSuccessToast) {
        toast.success("Comment updated successfully!");
      }

      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to update case comment:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update comment";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook to delete a case comment
 * @param {Object} options - Mutation options
 */
export function useDeleteCaseComment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ caseId, commentId }) => deleteCaseComment(caseId, commentId),
    onSuccess: (data, variables) => {
      const { caseId, commentId } = variables;

      // Remove the comment from the cache - FIXED DATA STRUCTURE
      queryClient.setQueriesData(
        { queryKey: caseCommentsKeys.list(caseId) },
        (oldData) => {
          if (!oldData?.data?.data || !Array.isArray(oldData.data.data))
            return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.filter(
                (comment) => comment.id !== commentId
              ),
              pagination: {
                ...oldData.data.pagination,
                total: Math.max((oldData.data.pagination?.total || 0) - 1, 0),
              },
            },
          };
        }
      );

      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: caseCommentsKeys.detail(commentId),
      });

      // Update comment count
      queryClient.invalidateQueries({
        queryKey: caseCommentsKeys.count(caseId),
      });

      // Invalidate case history
      queryClient.invalidateQueries({
        queryKey: ["cases", "history", caseId],
      });

      if (showSuccessToast) {
        toast.success("Comment deleted successfully!");
      }

      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to delete case comment:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete comment";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook to mark comment follow-up as completed
 * @param {Object} options - Mutation options
 */
export function useMarkCommentFollowUpCompleted(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ caseId, commentId }) =>
      markCommentFollowUpCompleted(caseId, commentId),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate comments and follow-up queries
      queryClient.invalidateQueries({
        queryKey: caseCommentsKeys.list(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: caseCommentsKeys.followUp(),
      });
      queryClient.invalidateQueries({
        queryKey: ["cases", "history", caseId],
      });

      if (showSuccessToast) {
        toast.success("Follow-up marked as completed");
      }

      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to mark follow-up as completed:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to mark follow-up as completed";

      toast.error(errorMessage);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Utility hook to prefetch case comments
 * @param {string|number} caseId - The case ID
 */
export function usePrefetchCaseComments() {
  const queryClient = useQueryClient();

  return (caseId) => {
    queryClient.prefetchQuery({
      queryKey: caseCommentsKeys.list(caseId),
      queryFn: () => getCaseComments(caseId),
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };
}

/**
 * Utility hook to invalidate all comment queries for a case
 * @param {string|number} caseId - The case ID
 */
export function useInvalidateCaseComments() {
  const queryClient = useQueryClient();

  return (caseId) => {
    queryClient.invalidateQueries({
      queryKey: caseCommentsKeys.list(caseId),
    });
    queryClient.invalidateQueries({
      queryKey: caseCommentsKeys.count(caseId),
    });
  };
}
