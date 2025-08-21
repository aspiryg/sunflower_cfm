import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeedbackComments,
  createFeedbackComment,
  updateFeedbackComment,
  deleteFeedbackComment,
  getFeedbackCommentCount,
} from "../../services/feedbackApi";
import toast from "react-hot-toast";

// Query Keys for comments
export const feedbackCommentsKeys = {
  all: ["feedback-comments"],
  lists: () => [...feedbackCommentsKeys.all, "list"],
  list: (feedbackId, options = {}) => [
    ...feedbackCommentsKeys.lists(),
    feedbackId,
    options,
  ],
  details: () => [...feedbackCommentsKeys.all, "detail"],
  detail: (commentId) => [...feedbackCommentsKeys.details(), commentId],
  count: (feedbackId) => [...feedbackCommentsKeys.all, "count", feedbackId],
};

/**
 * Hook to fetch all comments for a specific feedback
 * @param {string|number} feedbackId - The feedback ID
 * @param {Object} options - Query options
 */
export function useFeedbackComments(feedbackId, options = {}) {
  const { enabled = true, limit, offset, includeInactive = false } = options;

  return useQuery({
    queryKey: feedbackCommentsKeys.list(feedbackId, {
      limit,
      offset,
      includeInactive,
    }),
    queryFn: () =>
      getFeedbackComments(feedbackId, { limit, offset, includeInactive }),
    enabled: enabled && !!feedbackId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      console.error(
        `Failed to fetch comments for feedback ${feedbackId}:`,
        error
      );
    },
  });
}

/**
 * Hook to get comment count for a feedback
 * @param {string|number} feedbackId - The feedback ID
 * @param {Object} options - Query options
 */
export function useFeedbackCommentCount(feedbackId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: feedbackCommentsKeys.count(feedbackId),
    queryFn: () => getFeedbackCommentCount(feedbackId),
    enabled: enabled && !!feedbackId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (error) => {
      console.error(
        `Failed to fetch comment count for feedback ${feedbackId}:`,
        error
      );
    },
  });
}

/**
 * Hook to create a new comment
 * @param {Object} options - Mutation options
 */
export function useCreateFeedbackComment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ feedbackId, commentData }) =>
      createFeedbackComment(feedbackId, commentData),
    onSuccess: (data, variables) => {
      const { feedbackId } = variables;

      // Invalidate and refetch comments for this feedback
      queryClient.invalidateQueries({
        queryKey: feedbackCommentsKeys.list(feedbackId),
      });

      // Update comment count
      queryClient.invalidateQueries({
        queryKey: feedbackCommentsKeys.count(feedbackId),
      });

      // Optimistically add the new comment to the cache
      queryClient.setQueriesData(
        { queryKey: feedbackCommentsKeys.list(feedbackId) },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: [data.data, ...(oldData.data || [])],
            count: (oldData.count || 0) + 1,
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
      console.error("Failed to create comment:", error);

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
 * Hook to update a comment
 * @param {Object} options - Mutation options
 */
export function useUpdateFeedbackComment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ feedbackId, commentId, commentData }) =>
      updateFeedbackComment(feedbackId, commentId, commentData),
    onSuccess: (data, variables) => {
      const { feedbackId, commentId } = variables;

      // Update the specific comment in all relevant caches
      queryClient.setQueriesData(
        { queryKey: feedbackCommentsKeys.list(feedbackId) },
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.data)) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((comment) =>
              comment.id === commentId ? data.data : comment
            ),
          };
        }
      );

      // Update comment detail cache if it exists
      queryClient.setQueryData(
        feedbackCommentsKeys.detail(commentId),
        data.data
      );

      if (showSuccessToast) {
        toast.success("Comment updated successfully!");
      }

      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to update comment:", error);

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
 * Hook to delete a comment
 * @param {Object} options - Mutation options
 */
export function useDeleteFeedbackComment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: ({ feedbackId, commentId }) =>
      deleteFeedbackComment(feedbackId, commentId),
    onSuccess: (data, variables) => {
      const { feedbackId, commentId } = variables;

      // Remove the comment from the cache
      queryClient.setQueriesData(
        { queryKey: feedbackCommentsKeys.list(feedbackId) },
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.data)) return oldData;

          return {
            ...oldData,
            data: oldData.data.filter((comment) => comment.id !== commentId),
            count: Math.max((oldData.count || 0) - 1, 0),
          };
        }
      );

      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: feedbackCommentsKeys.detail(commentId),
      });

      // Update comment count
      queryClient.invalidateQueries({
        queryKey: feedbackCommentsKeys.count(feedbackId),
      });

      if (showSuccessToast) {
        toast.success("Comment deleted successfully!");
      }

      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to delete comment:", error);

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
 * Utility hook to prefetch comments
 * @param {string|number} feedbackId - The feedback ID
 */
export function usePrefetchFeedbackComments() {
  const queryClient = useQueryClient();

  return (feedbackId) => {
    queryClient.prefetchQuery({
      queryKey: feedbackCommentsKeys.list(feedbackId),
      queryFn: () => getFeedbackComments(feedbackId),
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };
}

/**
 * Utility hook to invalidate all comment queries for a feedback
 * @param {string|number} feedbackId - The feedback ID
 */
export function useInvalidateFeedbackComments() {
  const queryClient = useQueryClient();

  return (feedbackId) => {
    queryClient.invalidateQueries({
      queryKey: feedbackCommentsKeys.list(feedbackId),
    });
    queryClient.invalidateQueries({
      queryKey: feedbackCommentsKeys.count(feedbackId),
    });
  };
}
