// Create this file: /frontend/src/features/cases/useCase.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllCases,
  searchCases,
  getCaseById,
  getCaseByCaseNumber,
  createCase,
  updateCase,
  deleteCase,
  assignCase,
  changeCaseStatus,
  escalateCase,
  getCaseHistory,
  getCaseHistorySummary,
  getCaseComments,
  addCaseComment,
  updateCaseComment,
  deleteCaseComment,
  getCaseCommentCount,
  markCommentFollowUpCompleted,
  getCommentsRequiringFollowUp,
} from "../../services/caseApi";

import { caseAssignmentKeys } from "./useCaseAssignmentHistory";

// ============= QUERY KEYS =============
export const CASE_QUERY_KEYS = {
  all: ["cases"],
  lists: () => [...CASE_QUERY_KEYS.all, "list"],
  list: (filters) => [...CASE_QUERY_KEYS.lists(), { filters }],
  details: () => [...CASE_QUERY_KEYS.all, "detail"],
  detail: (id) => [...CASE_QUERY_KEYS.details(), id],
  caseNumber: (caseNumber) => [
    ...CASE_QUERY_KEYS.all,
    "caseNumber",
    caseNumber,
  ],
  search: (params) => [...CASE_QUERY_KEYS.all, "search", params],
  history: (caseId) => [...CASE_QUERY_KEYS.all, "history", caseId],
  historySummary: (caseId) => [
    ...CASE_QUERY_KEYS.all,
    "historySummary",
    caseId,
  ],
  comments: (caseId) => [...CASE_QUERY_KEYS.all, "comments", caseId],
  commentCount: (caseId) => [...CASE_QUERY_KEYS.all, "commentCount", caseId],
  followUpComments: (filters) => [
    ...CASE_QUERY_KEYS.all,
    "followUpComments",
    filters,
  ],
  stats: (filters = {}) => [...CASE_QUERY_KEYS.all, "stats", { filters }],
};

// ============= MAIN CASE CRUD HOOKS =============

/**
 * Hook to fetch all cases with filters and pagination
 * @param {Object} params - Query parameters for filtering, pagination, and sorting
 * @param {Object} options - React Query options
 * @returns {Object} Query result with cases data
 */
export const useCases = (params = {}, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.list(params),
    queryFn: () => getAllCases(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to search cases
 * @param {Object} searchParams - Search parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with search results
 */
export function useSearchCases(searchParams = {}, options = {}) {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.search(searchParams),
    queryFn: () => searchCases(searchParams),
    enabled: !!Object.keys(searchParams).length, // Only run if search params exist
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    ...options,
  });
}

/**
 * Hook to fetch single case by ID
 * @param {string|number} caseId - The case ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with case data
 */
export const useCase = (caseId, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.detail(caseId),
    queryFn: () => getCaseById(caseId),
    enabled: !!caseId, // Only run if caseId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch case by case number
 * @param {string} caseNumber - The case number
 * @param {Object} options - React Query options
 * @returns {Object} Query result with case data
 */
export const useCaseByCaseNumber = (caseNumber, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.caseNumber(caseNumber),
    queryFn: () => getCaseByCaseNumber(caseNumber),
    enabled: !!caseNumber, // Only run if caseNumber exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

// ============= CASE MUTATION HOOKS =============

/**
 * Hook to create a new case
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export function useCreateCase(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: createCase,
    onSuccess: (data) => {
      // console.log("Created Case Data:", data);

      // Invalidate and refetch cases list
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.lists() });

      const createdCaseId = data?.data?.id;
      const caseData = { data: data?.data, message: data?.message };

      // Add the new case to cache
      queryClient.setQueryData(
        CASE_QUERY_KEYS.detail(String(createdCaseId)),
        caseData
      );

      toast.success(data.message || "Case created successfully");
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to create case:", error);
      toast.error(error.message || "Failed to create case");
      if (onError) {
        onError(error);
      }
    },
  });
}

/**
 * Hook to update an existing case
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateCase = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;
  return useMutation({
    mutationFn: ({ caseId, caseData }) => updateCase(caseId, caseData),
    onSuccess: (data, variables) => {
      const { caseId } = variables;
      // console.log("Now, we are updating case:", caseId);
      // console.log("Updated Case Data:", data);

      const caseData = { data: data?.data, message: data?.message };

      // Update the specific case in cache
      queryClient.setQueryData(CASE_QUERY_KEYS.detail(caseId), caseData);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      });

      toast.success(data.message || "Case updated successfully");
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to update case:", error);
      toast.error(error.message || "Failed to update case");
      if (onError) {
        onError(error);
      }
    },
  });
};

/**
 * Hook to delete a case
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useDeleteCase = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: deleteCase,
    onSuccess: (data, caseId) => {
      // Remove the case from cache
      queryClient.removeQueries({ queryKey: CASE_QUERY_KEYS.detail(caseId) });

      // Invalidate cases list
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.lists() });

      toast.success(data.message || "Case deleted successfully");
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to delete case:", error);
      toast.error(error.message || "Failed to delete case");
      if (onError) {
        onError(error);
      }
    },
  });
};

// ============= CASE WORKFLOW MUTATION HOOKS =============

/**
 * Hook to assign a case to a user
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useAssignCase = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: ({ caseId, assignedTo, comments, expectedCompletionDate }) =>
      assignCase(caseId, assignedTo, comments, expectedCompletionDate),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate and refetch related data
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.detail(`${caseId}`),
      });
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(`${caseId}`),
      });

      queryClient.invalidateQueries({
        queryKey: caseAssignmentKeys.byCaseFiltered(`${caseId}`, {}),
      });

      toast.success(data.message || "Case assigned successfully");
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to assign case:", error);
      toast.error(error.message || "Failed to assign case");
      if (onError) {
        onError(error);
      }
    },
  });
};

/**
 * Hook to change case status
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useChangeCaseStatus = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: ({ caseId, statusId, statusOptions }) =>
      changeCaseStatus(caseId, statusId, statusOptions),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate and refetch related data
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.detail(caseId),
      });
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      });

      toast.success(data.message || "Case status updated successfully");
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to update case status:", error);
      toast.error(error.message || "Failed to update case status");
      if (onError) {
        onError(error);
      }
    },
  });
};

/**
 * Hook to escalate a case
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useEscalateCase = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: ({ caseId, escalationReason, escalationOptions }) =>
      escalateCase(caseId, escalationReason, escalationOptions),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate and refetch related data
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.detail(caseId),
      });
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      });

      toast.success(data.message || "Case escalated successfully");
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to escalate case:", error);
      toast.error(error.message || "Failed to escalate case");
      if (onError) {
        onError(error);
      }
    },
  });
};

// ============= CASE HISTORY HOOKS =============

/**
 * Hook to fetch case history
 * @param {string|number} caseId - The case ID
 * @param {Object} options - Query options
 * @returns {Object} Query result with history data
 */
export const useCaseHistory = (caseId, historyOptions = {}, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.history(caseId),
    queryFn: () => getCaseHistory(caseId, historyOptions),
    enabled: !!caseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch case history summary
 * @param {string|number} caseId - The case ID
 * @param {Object} options - Query options
 * @returns {Object} Query result with history summary
 */
export const useCaseHistorySummary = (caseId, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.historySummary(caseId),
    queryFn: () => getCaseHistorySummary(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

// ============= CASE COMMENTS HOOKS =============

/**
 * Hook to fetch case comments
 * @param {string|number} caseId - The case ID
 * @param {Object} commentOptions - Comment query options
 * @param {Object} options - Query options
 * @returns {Object} Query result with comments data
 */
export const useCaseComments = (caseId, commentOptions = {}, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.comments(caseId),
    queryFn: () => getCaseComments(caseId, commentOptions),
    enabled: !!caseId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    ...options,
  });
};

/**
 * Hook to get case comment count
 * @param {string|number} caseId - The case ID
 * @param {Object} options - Query options
 * @returns {Object} Query result with comment count
 */
export const useCaseCommentCount = (caseId, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.commentCount(caseId),
    queryFn: () => getCaseCommentCount(caseId),
    enabled: !!caseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to add a comment to a case
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useAddCaseComment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, commentData }) =>
      addCaseComment(caseId, commentData),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate comments and comment count
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.comments(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.commentCount(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      });

      // If comment requires follow-up, invalidate follow-up queries
      if (data.data?.requiresFollowUp) {
        queryClient.invalidateQueries({
          queryKey: CASE_QUERY_KEYS.followUpComments(),
        });
      }

      toast.success(data.message || "Comment added successfully");
    },
    onError: (error) => {
      console.error("Failed to add comment:", error);
      toast.error(error.message || "Failed to add comment");
    },
    ...options,
  });
};

/**
 * Hook to update a case comment
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateCaseComment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, commentId, commentData }) =>
      updateCaseComment(caseId, commentId, commentData),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate comments
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.comments(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      });

      toast.success(data.message || "Comment updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update comment:", error);
      toast.error(error.message || "Failed to update comment");
    },
    ...options,
  });
};

/**
 * Hook to delete a case comment
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useDeleteCaseComment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, commentId }) => deleteCaseComment(caseId, commentId),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate comments and comment count
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.comments(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.commentCount(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      });

      toast.success(data.message || "Comment deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
      toast.error(error.message || "Failed to delete comment");
    },
    ...options,
  });
};

/**
 * Hook to mark comment follow-up as completed
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useMarkCommentFollowUpCompleted = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, commentId }) =>
      markCommentFollowUpCompleted(caseId, commentId),
    onSuccess: (data, variables) => {
      const { caseId } = variables;

      // Invalidate comments and follow-up queries
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.comments(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.followUpComments(),
      });
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      });

      toast.success(data.message || "Follow-up marked as completed");
    },
    onError: (error) => {
      console.error("Failed to mark follow-up as completed:", error);
      toast.error(error.message || "Failed to mark follow-up as completed");
    },
    ...options,
  });
};

/**
 * Hook to fetch comments requiring follow-up
 * @param {Object} filters - Filter options
 * @param {Object} options - Query options
 * @returns {Object} Query result with follow-up comments
 */
export const useCommentsRequiringFollowUp = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.followUpComments(filters),
    queryFn: () => getCommentsRequiringFollowUp(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    ...options,
  });
};

// ============= UTILITY HOOKS =============

/**
 * Hook to prefetch a case (useful for hover states, etc.)
 * @param {string|number} caseId - The case ID to prefetch
 */
export const usePrefetchCase = () => {
  const queryClient = useQueryClient();

  return (caseId) => {
    queryClient.prefetchQuery({
      queryKey: CASE_QUERY_KEYS.detail(caseId),
      queryFn: () => getCaseById(caseId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};

/**
 * Hook to get case from cache (doesn't trigger network request)
 * @param {string|number} caseId - The case ID
 * @returns {Object|undefined} Cached case data or undefined
 */
export const useCaseFromCache = (caseId) => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(CASE_QUERY_KEYS.detail(caseId));
};

/**
 * Hook to invalidate specific case queries
 * @returns {Function} Function to invalidate case queries
 */
export const useInvalidateCaseQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: CASE_QUERY_KEYS.lists() }),
    invalidateCase: (caseId) =>
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.detail(caseId),
      }),
    invalidateComments: (caseId) =>
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.comments(caseId),
      }),
    invalidateHistory: (caseId) =>
      queryClient.invalidateQueries({
        queryKey: CASE_QUERY_KEYS.history(caseId),
      }),
  };
};

// ======== Stats Hooks ========= //
/**
 * Hook to get case statistics with optional filtering
 * Useful for dashboard widgets
 * @param {Object} options - Options object
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {Object} options.filters - Filter parameters to apply to stats calculation
 */
export function useCaseStats(options = {}) {
  const { enabled = true, filters = {} } = options;

  return useQuery({
    queryKey: CASE_QUERY_KEYS.stats(filters), // Include filters in query key for caching
    queryFn: async () => {
      // Fetch cases with filters and calculate stats
      const response = await getAllCases({
        limit: 100000,
        ...filters,
      });

      const data = response?.data || [];

      const stats = data.reduce(
        (acc, caseItem) => {
          acc.total++;

          // Count by status
          const statusName = caseItem.status?.name?.toLowerCase() || "unknown";
          acc.byStatus[statusName] = (acc.byStatus[statusName] || 0) + 1;

          // Count by priority
          const priorityName =
            caseItem.priority?.name?.toLowerCase() || "unknown";
          acc.byPriority[priorityName] =
            (acc.byPriority[priorityName] || 0) + 1;

          // Count by category
          const categoryName = caseItem.category?.name || "unknown";
          acc.byCategory[categoryName] =
            (acc.byCategory[categoryName] || 0) + 1;

          // Count sensitive cases
          if (caseItem.isSensitive) {
            acc.sensitive++;
          }

          // Count active cases (not closed/resolved)
          const finalStatuses = ["closed", "resolved"];
          if (!finalStatuses.includes(statusName)) {
            acc.active++;
          }

          // Daily submissions
          const submissionDate = new Date(caseItem.createdAt).toDateString();
          acc.dailySubmissions[submissionDate] =
            (acc.dailySubmissions[submissionDate] || 0) + 1;

          // Calculate processing time for resolved/closed cases
          if (finalStatuses.includes(statusName) && caseItem.resolvedAt) {
            const processingTime =
              new Date(caseItem.resolvedAt) - new Date(caseItem.createdAt);
            acc.totalProcessingTime += processingTime;
            acc.casesProcessed++;
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
          casesProcessed: 0,
        }
      );

      return stats;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (error) => {
      console.error("Failed to fetch case stats:", error);
    },
  });
}

/*
  return {
      // Core fields
      caseNumber: { type: sql.NVarChar },
      title: { type: sql.NVarChar },
      description: { type: sql.NVarChar },
      caseDate: { type: sql.DateTime },
      dueDate: { type: sql.DateTime },
      resolvedDate: { type: sql.DateTime },

      // Classification
      categoryId: { type: sql.Int },
      priorityId: { type: sql.Int },
      statusId: { type: sql.Int },
      channelId: { type: sql.Int },

      // Impact & Urgency
      impactDescription: { type: sql.NVarChar },
      urgencyLevel: { type: sql.NVarChar },
      affectedBeneficiaries: { type: sql.Int },

      // Related Programme/Project/Activity
      programId: { type: sql.Int },
      projectId: { type: sql.Int },
      activityId: { type: sql.Int },
      isProjectRelated: { type: sql.Bit },

      // Provider Information
      providerTypeId: { type: sql.Int },
      individualProviderGender: { type: sql.NVarChar },
      individualProviderAgeGroup: { type: sql.NVarChar },
      individualProviderDisabilityStatus: { type: sql.NVarChar },
      groupProviderSize: { type: sql.Int },
      groupProviderGenderComposition: { type: sql.NVarChar },

      // Contact Information
      providerName: { type: sql.NVarChar },
      providerEmail: { type: sql.NVarChar },
      providerPhone: { type: sql.NVarChar },
      providerOrganization: { type: sql.NVarChar },
      providerAddress: { type: sql.NVarChar },

      // Consent & Privacy
      dataSharingConsent: { type: sql.Bit },
      followUpConsent: { type: sql.Bit },
      followUpContactMethod: { type: sql.NVarChar },
      privacyPolicyAccepted: { type: sql.Bit },
      isSensitive: { type: sql.Bit },
      isAnonymized: { type: sql.Bit },
      isPublic: { type: sql.Bit },
      confidentialityLevel: { type: sql.NVarChar },

      // Location
      communityId: { type: sql.Int },
      location: { type: sql.NVarChar },
      coordinates: { type: sql.NVarChar },

      // Assignment Information
      assignedTo: { type: sql.Int },
      assignedBy: { type: sql.Int },
      assignedAt: { type: sql.DateTime },
      assignmentComments: { type: sql.NVarChar },

      // Submission Information
      submittedBy: { type: sql.Int },
      submittedAt: { type: sql.DateTime },
      submittedByInitials: { type: sql.NVarChar },
      submittedByConfirmation: { type: sql.Bit },
      submittedByComments: { type: sql.NVarChar },

      // Processing Information
      firstResponseDate: { type: sql.DateTime },
      lastActivityDate: { type: sql.DateTime },
      escalationLevel: { type: sql.Int },
      escalatedAt: { type: sql.DateTime },
      escalatedBy: { type: sql.Int },
      escalationReason: { type: sql.NVarChar },

      // Resolution Information
      resolutionSummary: { type: sql.NVarChar },
      resolutionCategory: { type: sql.NVarChar },
      resolutionSatisfaction: { type: sql.Int },

      // Follow-up & Monitoring
      followUpRequired: { type: sql.Bit },
      followUpDate: { type: sql.DateTime },
      monitoringRequired: { type: sql.Bit },
      monitoringDate: { type: sql.DateTime },

      // Quality Assurance
      qualityReviewed: { type: sql.Bit },
      qualityReviewedBy: { type: sql.Int },
      qualityReviewedAt: { type: sql.DateTime },
      qualityScore: { type: sql.Int },
      qualityComments: { type: sql.NVarChar },

      // Metadata
      tags: { type: sql.NVarChar },
      attachments: { type: sql.NVarChar },
      externalReferences: { type: sql.NVarChar },

      // Audit Information
      createdAt: { type: sql.DateTime },
      createdBy: { type: sql.Int },
      updatedAt: { type: sql.DateTime },
      updatedBy: { type: sql.Int },
      isActive: { type: sql.Bit },
      isDeleted: { type: sql.Bit },
      deletedAt: { type: sql.DateTime },
      deletedBy: { type: sql.Int },
    };
    */
