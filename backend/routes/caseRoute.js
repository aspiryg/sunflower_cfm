import { Router } from "express";
import { caseController } from "../controllers/caseController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/autherization.js";
import { ResourceHelpers } from "../utils/resourceHelpers.js";
import { RESOURCES, ACTIONS } from "../config/rolesConfig.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ============= MAIN CASE CRUD ROUTES =============

/**
 * @route POST /api/cases
 * @description Create new case
 * @access Protected - Requires CREATE permission on CASES
 */
router.post(
  "/",
  requirePermission(RESOURCES.CASES, ACTIONS.CREATE),
  caseController.createCase
);

/**
 * @route GET /api/cases
 * @description Get all cases with filtering and pagination
 * @access Protected - Requires READ permission on CASES
 */
router.get(
  "/",
  requirePermission(RESOURCES.CASES, ACTIONS.READ),
  caseController.getAllCases
);

/**
 * @route GET /api/cases/search
 * @description Advanced case search with filtering
 * @access Protected - Requires READ permission on CASES
 * @note Must be before /:id route to avoid conflict
 */
router.get(
  "/search",
  requirePermission(RESOURCES.CASES, ACTIONS.READ),
  caseController.searchCases
);

/**
 * @route GET /api/cases/number/:caseNumber
 * @description Get case by case number
 * @access Protected - Requires READ permission on CASES
 */
router.get(
  "/number/:caseNumber",
  requirePermission(RESOURCES.CASES, ACTIONS.READ, {
    getResource: ResourceHelpers.getCaseByCaseNumber,
  }),
  caseController.getCaseByCaseNumber
);

/**
 * @route GET /api/cases/:id
 * @description Get case by ID
 * @access Protected - Requires READ permission on CASES
 */
router.get(
  "/getById/:id",
  requirePermission(RESOURCES.CASES, ACTIONS.READ, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.getCaseById
);

/**
 * @route PUT /api/cases/:id
 * @description Update case by ID
 * @access Protected - Requires UPDATE permission on CASES
 */
router.put(
  "/:id",
  requirePermission(RESOURCES.CASES, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.updateCase
);

/**
 * @route DELETE /api/cases/:id
 * @description Soft delete case by ID
 * @access Protected - Requires DELETE permission on CASES
 */
router.delete(
  "/:id",
  requirePermission(RESOURCES.CASES, ACTIONS.DELETE, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.softDeleteCase
);

// ============= CASE HISTORY ROUTES =============

/**
 * @route GET /api/cases/:id/history
 * @description Get case history by case ID
 * @access Protected - Requires READ permission on CASE_HISTORY
 */
router.get(
  "/:id/history",
  requirePermission(RESOURCES.CASE_HISTORY, ACTIONS.READ, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.getCaseHistory
);

/**
 * @route GET /api/cases/:id/history/summary
 * @description Get case history summary
 * @access Protected - Requires READ permission on CASE_HISTORY
 */
router.get(
  "/:id/history/summary",
  requirePermission(RESOURCES.CASE_HISTORY, ACTIONS.READ, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.getCaseHistorySummary
);

// ============= CASE COMMENTS ROUTES =============

/**
 * @route POST /api/cases/:id/comments
 * @description Add comment to case
 * @access Protected - Requires CREATE permission on CASE_COMMENTS
 */
router.post(
  "/:id/comments",
  requirePermission(RESOURCES.CASE_COMMENTS, ACTIONS.CREATE, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.addCaseComment
);

/**
 * @route GET /api/cases/:id/comments
 * @description Get case comments
 * @access Protected - Requires READ permission on CASE_COMMENTS
 */
router.get(
  "/:id/comments",
  requirePermission(RESOURCES.CASE_COMMENTS, ACTIONS.READ, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.getCaseComments
);

/**
 * @route GET /api/cases/:id/comments/count
 * @description Get case comment count
 * @access Protected - Requires READ permission on CASE_COMMENTS
 */
router.get(
  "/:id/comments/count",
  requirePermission(RESOURCES.CASE_COMMENTS, ACTIONS.READ, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.getCaseCommentCount
);

/**
 * @route GET /api/cases/comments/follow-up
 * @description Get comments requiring follow-up across all cases
 * @access Protected - Requires READ permission on CASE_COMMENTS
 * @note Must be before comment-specific routes to avoid conflict
 */
router.get(
  "/comments/follow-up",
  requirePermission(RESOURCES.CASE_COMMENTS, ACTIONS.READ),
  caseController.getCommentsRequiringFollowUp
);

/**
 * @route PUT /api/cases/:caseId/comments/:commentId
 * @description Update case comment
 * @access Protected - Requires UPDATE permission on CASE_COMMENTS
 */
router.put(
  "/:caseId/comments/:commentId",
  requirePermission(RESOURCES.CASE_COMMENTS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getCaseComment,
  }),
  caseController.updateCaseComment
);

/**
 * @route DELETE /api/cases/:caseId/comments/:commentId
 * @description Delete case comment
 * @access Protected - Requires DELETE permission on CASE_COMMENTS
 */
router.delete(
  "/:caseId/comments/:commentId",
  requirePermission(RESOURCES.CASE_COMMENTS, ACTIONS.DELETE, {
    getResource: ResourceHelpers.getCaseComment,
  }),
  caseController.deleteCaseComment
);

/**
 * @route PATCH /api/cases/:caseId/comments/:commentId/follow-up/complete
 * @description Mark comment follow-up as completed
 * @access Protected - Requires UPDATE permission on CASE_COMMENTS
 */
router.patch(
  "/:caseId/comments/:commentId/follow-up/complete",
  requirePermission(RESOURCES.CASE_COMMENTS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getCaseComment,
  }),
  caseController.markCommentFollowUpCompleted
);

// ============= CASE WORKFLOW ROUTES =============

/**
 * @route PATCH /api/cases/:id/assign
 * @description Assign case to user
 * @access Protected - Requires ASSIGN permission on CASES
 */
router.patch(
  "/:id/assign",
  requirePermission(RESOURCES.CASES, ACTIONS.ASSIGN, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.assignCase
);

/**
 * @route PATCH /api/cases/:id/status
 * @description Change case status
 * @access Protected - Requires UPDATE permission on CASES
 */
router.patch(
  "/:id/status",
  requirePermission(RESOURCES.CASES, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.changeCaseStatus
);

/**
 * @route PATCH /api/cases/:id/escalate
 * @description Escalate case
 * @access Protected - Requires UPDATE permission on CASES
 */
router.patch(
  "/:id/escalate",
  requirePermission(RESOURCES.CASES, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getCase,
  }),
  caseController.escalateCase
);

// ============= SUPPORTING DATA ROUTES =============

/**
 * @route GET /api/cases/categories
 * @description Get all case categories
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/categories",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getCaseCategories
);

/**
 * @route GET /api/cases/statuses
 * @description Get all case statuses
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/statuses",
  requirePermission(RESOURCES.CASE_STATUSES, ACTIONS.READ),
  caseController.getCaseStatuses
);

/**
 * @route GET /api/cases/priorities
 * @description Get all case priorities
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/priorities",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getCasePriorities
);

/**
 * @route GET /api/cases/channels
 * @description Get all case channels
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/channels",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getCaseChannels
);

/**
 * @route GET /api/cases/regions
 * @description Get all regions
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/regions",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getRegions
);

/**
 * @route GET /api/cases/regions/:regionId/governorates
 * @description Get governorates by region
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/regions/:regionId/governorates",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getGovernoratesByRegion
);

/**
 * @route GET /api/cases/governorates/:governorateId/communities
 * @description Get communities by governorate
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/governorates/:governorateId/communities",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getCommunitiesByGovernorate
);

/**
 * @route GET /api/cases/provider-types
 * @description Get all provider types
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/provider-types",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getProviderTypes
);

/**
 * @route GET /api/cases/programs
 * @description Get all programs
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/programs",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getPrograms
);

/**
 * @route GET /api/cases/programs/:programId/projects
 * @description Get projects by program
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/programs/:programId/projects",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getProjectsByProgram
);

/**
 * @route GET /api/cases/projects/:projectId/activities
 * @description Get activities by project
 * @access Protected - Requires READ permission on CATEGORIES
 */
router.get(
  "/projects/:projectId/activities",
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  caseController.getActivitiesByProject
);

export default router;
