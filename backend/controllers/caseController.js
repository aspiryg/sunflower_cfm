import { Case } from "../models/Case.js";
import {
  CaseCategories,
  CaseStatus,
  CasePriority,
  CaseChannels,
  Regions,
  Governorates,
  Communities,
  ProviderTypes,
  Programs,
  Projects,
  Activities,
} from "../models/caseSupportingModels.js";

export const caseController = {
  // ============= MAIN CASE CRUD OPERATIONS =============

  /**
   * Create a new case
   * @route POST /api/cases
   */
  createCase: async (req, res) => {
    try {
      const userId = req.user ? req.user.id : 1;

      // Extract case data from request body
      const caseData = {
        ...req.body,
        // Ensure audit fields are set
        submittedBy: req.body.submittedBy || userId,
        assignedBy: req.body.assignedBy || userId,
      };

      const newCase = await Case.createCaseAsync(caseData, userId);

      res.status(201).json({
        success: true,
        message: "Case created successfully",
        data: newCase,
      });
    } catch (error) {
      console.error("❌ Failed to create case:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create case",
        error: error.message,
      });
    }
  },

  /**
   * Get all cases with filtering and pagination
   * @route GET /api/cases
   */
  getAllCases: async (req, res) => {
    try {
      // Merge query parameters with permission filters
      const options = {
        ...req.query,
        ...req.permissionFilters,
      };

      // If permission filter indicates impossible condition, return empty array
      if (options.impossible) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: parseInt(req.query.limit) || 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      }

      const result = await Case.getAllCasesAsync(options);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("❌ Failed to get cases:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve cases",
        error: error.message,
      });
    }
  },

  /**
   * Get case by ID
   * @route GET /api/cases/:id
   */
  getCaseById: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const caseData = await Case.findCaseByIdAsync(caseId);

      if (!caseData) {
        return res.status(404).json({
          success: false,
          message: "Case not found",
          error: `No case found with ID ${caseId}`,
        });
      }

      res.status(200).json({
        success: true,
        data: caseData,
      });
    } catch (error) {
      console.error(`❌ Failed to get case ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case",
        error: error.message,
      });
    }
  },

  /**
   * Get case by case number
   * @route GET /api/cases/number/:caseNumber
   */
  getCaseByCaseNumber: async (req, res) => {
    try {
      const { caseNumber } = req.params;

      if (!caseNumber || caseNumber.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Case number is required",
          error: "Case number parameter is missing or empty",
        });
      }

      const caseData = await Case.findCaseByIdAsync(null, caseNumber);

      if (!caseData) {
        return res.status(404).json({
          success: false,
          message: "Case not found",
          error: `No case found with number ${caseNumber}`,
        });
      }

      res.status(200).json({
        success: true,
        data: caseData,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get case by number ${req.params.caseNumber}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case",
        error: error.message,
      });
    }
  },

  /**
   * Update case
   * @route PUT /api/cases/:id
   */
  updateCase: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      // Extract metadata for history tracking
      const metadata = {
        comments: req.body.comments,
        statusReason: req.body.statusReason,
        assignmentComments: req.body.assignmentComments,
        escalationReason: req.body.escalationReason,
        resolutionSummary: req.body.resolutionSummary,
        ipAddress: req.socket.remoteAddress,
        userAgent: req.get("User-Agent"),
      };

      // Filter out metadata from update data
      const updateData = { ...req.body };
      delete updateData.comments;
      delete updateData.statusReason;
      delete updateData.assignmentComments;
      delete updateData.escalationReason;
      delete updateData.resolutionSummary;

      const result = await Case.updateCaseAsync(
        caseId,
        updateData,
        userId,
        metadata
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.case,
        changes: result.changes,
      });
    } catch (error) {
      console.error(`❌ Failed to update case ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to update case",
        error: error.message,
      });
    }
  },

  /**
   * Soft delete case
   * @route DELETE /api/cases/:id
   */
  softDeleteCase: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const success = await Case.softDeleteCaseAsync(caseId, userId);

      if (success) {
        res.status(200).json({
          success: true,
          message: "Case deleted successfully",
          data: { id: caseId },
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to delete case",
          error: "Unknown error occurred during deletion",
        });
      }
    } catch (error) {
      console.error(`❌ Failed to delete case ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to delete case",
        error: error.message,
      });
    }
  },

  // ============= CASE SEARCH AND FILTERING =============

  /**
   * Advanced case search with filtering
   * @route GET /api/cases/search
   */
  searchCases: async (req, res) => {
    try {
      // Merge query parameters with permission filters
      const queryParams = {
        ...req.query,
        ...req.permissionFilters,
      };

      // If permission filter indicates impossible condition, return empty result
      if (queryParams.impossible) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: parseInt(req.query.limit) || 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          filters: {},
          search: { query: req.query.search || null, resultsCount: 0 },
        });
      }

      const result = await Case.searchCasesAsync(queryParams);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: result.filters,
        search: result.search,
      });
    } catch (error) {
      console.error("❌ Error searching cases:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search cases",
        error: error.message,
      });
    }
  },

  // ============= CASE HISTORY OPERATIONS =============

  /**
   * Get case history
   * @route GET /api/cases/:id/history
   */
  getCaseHistory: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const history = await Case.getCaseHistoryAsync(caseId, req.query);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get case history for ${req.params.id}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case history",
        error: error.message,
      });
    }
  },

  /**
   * Get case history summary
   * @route GET /api/cases/:id/history/summary
   */
  getCaseHistorySummary: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const summary = await Case.getCaseHistorySummaryAsync(caseId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get case history summary for ${req.params.id}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case history summary",
        error: error.message,
      });
    }
  },

  // ============= CASE COMMENTS OPERATIONS =============

  /**
   * Add comment to case
   * @route POST /api/cases/:id/comments
   */
  addCaseComment: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const { comment, ...options } = req.body;

      if (!comment || comment.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Comment text is required",
          error: "Comment cannot be empty",
        });
      }

      const createdComment = await Case.addCaseCommentAsync(
        caseId,
        userId,
        comment,
        options
      );

      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: createdComment,
      });
    } catch (error) {
      console.error(
        `❌ Failed to add comment to case ${req.params.id}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to add comment",
        error: error.message,
      });
    }
  },

  /**
   * Get case comments
   * @route GET /api/cases/:id/comments
   */
  getCaseComments: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const comments = await Case.getCaseCommentsAsync(caseId, req.query);

      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get comments for case ${req.params.id}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve comments",
        error: error.message,
      });
    }
  },

  /**
   * Get case comment count
   * @route GET /api/cases/:id/comments/count
   */
  getCaseCommentCount: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const count = await Case.getCaseCommentCountAsync(caseId, req.query);

      res.status(200).json({
        success: true,
        data: count,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get comment count for case ${req.params.id}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve comment count",
        error: error.message,
      });
    }
  },

  /**
   * Update case comment
   * @route PUT /api/cases/:caseId/comments/:commentId
   */
  updateCaseComment: async (req, res) => {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(commentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID",
          error: "Comment ID must be a valid number",
        });
      }

      const { comment: newComment, ...options } = req.body;

      if (!newComment || newComment.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Comment text is required",
          error: "Comment cannot be empty",
        });
      }

      const updatedComment = await Case.updateCaseCommentAsync(
        commentId,
        newComment,
        userId,
        options
      );

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } catch (error) {
      console.error(
        `❌ Failed to update comment ${req.params.commentId}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to update comment",
        error: error.message,
      });
    }
  },

  /**
   * Delete case comment
   * @route DELETE /api/cases/:caseId/comments/:commentId
   */
  deleteCaseComment: async (req, res) => {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(commentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID",
          error: "Comment ID must be a valid number",
        });
      }

      const success = await Case.deleteCaseCommentAsync(commentId, userId);

      if (success) {
        res.status(200).json({
          success: true,
          message: "Comment deleted successfully",
          data: { id: commentId },
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to delete comment",
          error: "Unknown error occurred during deletion",
        });
      }
    } catch (error) {
      console.error(
        `❌ Failed to delete comment ${req.params.commentId}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to delete comment",
        error: error.message,
      });
    }
  },

  /**
   * Mark comment follow-up as completed
   * @route PATCH /api/cases/:caseId/comments/:commentId/follow-up/complete
   */
  markCommentFollowUpCompleted: async (req, res) => {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(commentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID",
          error: "Comment ID must be a valid number",
        });
      }

      const updatedComment = await Case.markCommentFollowUpCompletedAsync(
        commentId,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Follow-up marked as completed",
        data: updatedComment,
      });
    } catch (error) {
      console.error(
        `❌ Failed to mark follow-up completed for comment ${req.params.commentId}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to mark follow-up as completed",
        error: error.message,
      });
    }
  },

  /**
   * Get comments requiring follow-up
   * @route GET /api/cases/comments/follow-up
   */
  getCommentsRequiringFollowUp: async (req, res) => {
    try {
      const comments = await Case.getCommentsRequiringFollowUpAsync(req.query);

      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error("❌ Failed to get comments requiring follow-up:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve comments requiring follow-up",
        error: error.message,
      });
    }
  },

  // ============= CASE WORKFLOW OPERATIONS =============

  /**
   * Assign case to user
   * @route PATCH /api/cases/:id/assign
   */
  assignCase: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const { assignedTo, comments, expectedCompletionDate } = req.body;

      if (!assignedTo) {
        return res.status(400).json({
          success: false,
          message: "Assigned user is required",
          error: "assignedTo field is missing",
        });
      }

      const result = await Case.assignCaseAsync(caseId, assignedTo, userId, {
        comments,
        expectedCompletionDate,
      });

      res.status(200).json({
        success: true,
        message: "Case assigned successfully",
        data: result.case,
        changes: result.changes,
      });
    } catch (error) {
      console.error(`❌ Failed to assign case ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to assign case",
        error: error.message,
      });
    }
  },

  /**
   * Change case status
   * @route PATCH /api/cases/:id/status
   */
  changeCaseStatus: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const { statusId, reason, comments, resolutionSummary, isResolved } =
        req.body;

      if (!statusId) {
        return res.status(400).json({
          success: false,
          message: "Status ID is required",
          error: "statusId field is missing",
        });
      }

      const result = await Case.changeCaseStatusAsync(
        caseId,
        statusId,
        userId,
        {
          reason,
          comments,
          resolutionSummary,
          isResolved,
        }
      );

      res.status(200).json({
        success: true,
        message: "Case status updated successfully",
        data: result.case,
        changes: result.changes,
      });
    } catch (error) {
      console.error(
        `❌ Failed to change status for case ${req.params.id}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to change case status",
        error: error.message,
      });
    }
  },

  /**
   * Escalate case
   * @route PATCH /api/cases/:id/escalate
   */
  escalateCase: async (req, res) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const userId = req.user ? req.user.id : 1;

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid case ID",
          error: "Case ID must be a valid number",
        });
      }

      const { escalationReason, escalatedTo, newPriorityId } = req.body;

      if (!escalationReason || escalationReason.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Escalation reason is required",
          error: "escalationReason field is missing or empty",
        });
      }

      const result = await Case.escalateCaseAsync(
        caseId,
        userId,
        escalationReason,
        {
          escalatedTo,
          newPriorityId,
        }
      );

      res.status(200).json({
        success: true,
        message: "Case escalated successfully",
        data: result.case,
        changes: result.changes,
      });
    } catch (error) {
      console.error(`❌ Failed to escalate case ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to escalate case",
        error: error.message,
      });
    }
  },

  // ============= SUPPORTING DATA OPERATIONS =============

  /**
   * Get all case categories
   * @route GET /api/cases/categories
   */
  getCaseCategories: async (req, res) => {
    try {
      const categories = await CaseCategories.getAll(req.query);

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("❌ Failed to get case categories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case categories",
        error: error.message,
      });
    }
  },

  /**
   * Get all case statuses
   * @route GET /api/cases/statuses
   */
  getCaseStatuses: async (req, res) => {
    try {
      const statuses = await CaseStatus.getAll(req.query);

      res.status(200).json({
        success: true,
        data: statuses,
      });
    } catch (error) {
      console.error("❌ Failed to get case statuses:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case statuses",
        error: error.message,
      });
    }
  },

  /**
   * Get all case priorities
   * @route GET /api/cases/priorities
   */
  getCasePriorities: async (req, res) => {
    try {
      const priorities = await CasePriority.getAll(req.query);

      res.status(200).json({
        success: true,
        data: priorities,
      });
    } catch (error) {
      console.error("❌ Failed to get case priorities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case priorities",
        error: error.message,
      });
    }
  },

  /**
   * Get all case channels
   * @route GET /api/cases/channels
   */
  getCaseChannels: async (req, res) => {
    try {
      const channels = await CaseChannels.getAll(req.query);

      res.status(200).json({
        success: true,
        data: channels,
      });
    } catch (error) {
      console.error("❌ Failed to get case channels:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve case channels",
        error: error.message,
      });
    }
  },

  /**
   * Get all regions
   * @route GET /api/cases/regions
   */
  getRegions: async (req, res) => {
    try {
      const regions = await Regions.getAll(req.query);

      res.status(200).json({
        success: true,
        data: regions,
      });
    } catch (error) {
      console.error("❌ Failed to get regions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve regions",
        error: error.message,
      });
    }
  },

  /**
   * Get governorates by region
   * @route GET /api/cases/regions/:regionId/governorates
   */
  getGovernoratesByRegion: async (req, res) => {
    try {
      const regionId = parseInt(req.params.regionId, 10);

      if (isNaN(regionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid region ID",
          error: "Region ID must be a valid number",
        });
      }

      const governorates = await Governorates.getByRegion(regionId);

      res.status(200).json({
        success: true,
        data: governorates,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get governorates for region ${req.params.regionId}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve governorates",
        error: error.message,
      });
    }
  },

  /**
   * Get communities by governorate
   * @route GET /api/cases/governorates/:governorateId/communities
   */
  getCommunitiesByGovernorate: async (req, res) => {
    try {
      const governorateId = parseInt(req.params.governorateId, 10);

      if (isNaN(governorateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid governorate ID",
          error: "Governorate ID must be a valid number",
        });
      }

      const communities = await Communities.getByGovernorate(governorateId);

      res.status(200).json({
        success: true,
        data: communities,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get communities for governorate ${req.params.governorateId}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve communities",
        error: error.message,
      });
    }
  },

  /**
   * Get all provider types
   * @route GET /api/cases/provider-types
   */
  getProviderTypes: async (req, res) => {
    try {
      const providerTypes = await ProviderTypes.getAll(req.query);

      res.status(200).json({
        success: true,
        data: providerTypes,
      });
    } catch (error) {
      console.error("❌ Failed to get provider types:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve provider types",
        error: error.message,
      });
    }
  },

  /**
   * Get all programs
   * @route GET /api/cases/programs
   */
  getPrograms: async (req, res) => {
    try {
      const programs = await Programs.getAll(req.query);

      res.status(200).json({
        success: true,
        data: programs,
      });
    } catch (error) {
      console.error("❌ Failed to get programs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve programs",
        error: error.message,
      });
    }
  },

  /**
   * Get projects by program
   * @route GET /api/cases/programs/:programId/projects
   */
  getProjectsByProgram: async (req, res) => {
    try {
      const programId = parseInt(req.params.programId, 10);

      if (isNaN(programId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid program ID",
          error: "Program ID must be a valid number",
        });
      }

      const projects = await Projects.getByProgram(programId);

      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get projects for program ${req.params.programId}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve projects",
        error: error.message,
      });
    }
  },

  /**
   * Get activities by project
   * @route GET /api/cases/projects/:projectId/activities
   */
  getActivitiesByProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);

      if (isNaN(projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
          error: "Project ID must be a valid number",
        });
      }

      const activities = await Activities.getByProject(projectId);

      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      console.error(
        `❌ Failed to get activities for project ${req.params.projectId}:`,
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve activities",
        error: error.message,
      });
    }
  },
};
