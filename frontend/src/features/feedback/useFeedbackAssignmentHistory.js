import { useQuery } from "@tanstack/react-query";
import { getFeedbackHistory } from "../../services/feedbackApi";

/**
 * Query keys for feedback assignment history
 */
export const feedbackAssignmentKeys = {
  all: ["feedbackAssignmentHistory"],
  byFeedback: (feedbackId) => [
    ...feedbackAssignmentKeys.all,
    "feedback",
    feedbackId,
  ],
  byFeedbackFiltered: (feedbackId, filters) => [
    ...feedbackAssignmentKeys.byFeedback(feedbackId),
    "filtered",
    filters,
  ],
};

/**
 * Hook to fetch assignment history for a specific feedback
 * Filters the history to show only assignment-related changes
 */
export function useFeedbackAssignmentHistory(feedbackId, options = {}) {
  const { filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: feedbackAssignmentKeys.byFeedbackFiltered(feedbackId, filters),
    queryFn: async () => {
      if (!feedbackId) {
        throw new Error("Feedback ID is required");
      }

      // Fetch all history for the feedback
      const response = await getFeedbackHistory(feedbackId);
      const allHistory = response.data || [];

      // Filter for only CREATION and ASSIGNMENT_CHANGE actions
      const assignmentHistory = allHistory.filter((entry) => {
        // Include creation events (first assignment)
        if (entry.actionType === "CREATION" && entry.assignedTo) {
          return true;
        }

        // Include explicit assignment changes
        if (entry.actionType === "ASSIGNMENT_CHANGE") {
          return true;
        }

        return false;
      });

      // Apply additional filters if provided
      let filteredHistory = assignmentHistory;

      if (filters.actionType && filters.actionType !== "all") {
        filteredHistory = filteredHistory.filter(
          (entry) => entry.actionType === filters.actionType
        );
      }

      if (filters.assignedTo && filters.assignedTo !== "all") {
        filteredHistory = filteredHistory.filter(
          (entry) => entry.assignedTo?.id === parseInt(filters.assignedTo)
        );
      }

      // Sort by date (oldest first for chronological progression)
      filteredHistory.sort(
        (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
      );

      return filteredHistory;
    },
    enabled: enabled && !!feedbackId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get assignment statistics for a feedback
 */
export function useFeedbackAssignmentStats(feedbackId) {
  return useQuery({
    queryKey: [...feedbackAssignmentKeys.byFeedback(feedbackId), "stats"],
    queryFn: async () => {
      if (!feedbackId) {
        throw new Error("Feedback ID is required");
      }

      const response = await getFeedbackHistory(feedbackId);
      const allHistory = response.data || [];

      // Filter for assignment-related entries
      const assignments = allHistory.filter(
        (entry) =>
          entry.actionType === "ASSIGNMENT_CHANGE" ||
          (entry.actionType === "CREATION" && entry.assignedTo)
      );

      // Calculate statistics
      const uniqueAssignees = [
        ...new Set(assignments.map((a) => a.assignedTo?.id).filter(Boolean)),
      ];

      const stats = {
        totalAssignments: assignments.length,
        uniqueAssignees: uniqueAssignees.length,
        averageDuration: calculateAverageAssignmentDuration(assignments),
        longestAssignment: calculateLongestAssignment(assignments),
        shortestAssignment: calculateShortestAssignment(assignments),
        firstAssignedAt:
          assignments.length > 0
            ? assignments[assignments.length - 1].updatedAt
            : null,
        lastAssignedAt:
          assignments.length > 0 ? assignments[0].updatedAt : null,
      };

      return stats;
    },
    enabled: !!feedbackId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Helper functions for statistics calculations
function calculateAverageAssignmentDuration(assignments) {
  if (assignments.length < 2) return null;

  const durations = [];
  // Sort by date first (oldest to newest)
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
  );

  for (let i = 0; i < sortedAssignments.length - 1; i++) {
    const current = new Date(sortedAssignments[i].updatedAt);
    const next = new Date(sortedAssignments[i + 1].updatedAt);
    durations.push(next - current);
  }

  const avgMs =
    durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  return Math.round(avgMs / (1000 * 60 * 60 * 24)); // Convert to days
}

function calculateLongestAssignment(assignments) {
  if (assignments.length < 2) return null;

  const durations = [];
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
  );

  for (let i = 0; i < sortedAssignments.length - 1; i++) {
    const current = new Date(sortedAssignments[i].updatedAt);
    const next = new Date(sortedAssignments[i + 1].updatedAt);
    durations.push(next - current);
  }

  const longestMs = Math.max(...durations);
  return Math.round(longestMs / (1000 * 60 * 60 * 24));
}

function calculateShortestAssignment(assignments) {
  if (assignments.length < 2) return null;

  const durations = [];
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
  );

  for (let i = 0; i < sortedAssignments.length - 1; i++) {
    const current = new Date(sortedAssignments[i].updatedAt);
    const next = new Date(sortedAssignments[i + 1].updatedAt);
    durations.push(next - current);
  }

  const shortestMs = Math.min(...durations);
  return Math.round(shortestMs / (1000 * 60 * 60 * 24));
}
