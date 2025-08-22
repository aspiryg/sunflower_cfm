import { Router } from "express";
import { feedbackController } from "../controllers/feedbackController.js";
import { commentsController } from "../controllers/commentsController.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  requirePermission,
  // applyResourceFilter,
} from "../middlewares/autherization.js";
import { ResourceHelpers } from "../utils/resourceHelpers.js";
import { RESOURCES, ACTIONS } from "../config/rolesConfig.js";

const router = Router();

router.use(authenticateToken);

// ============= Main Feedback Routes =============

/** * @route POST /feedback
 * @description Create new feedback
 * @access Public
 */
router.post(
  "/",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.CREATE),
  feedbackController.createFeedback
);

/** * @route GET /feedback
 * @description Get all feedback
 * @access Public
 */
router.get(
  "/",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.READ),
  feedbackController.getAllFeedback
);

/** * @route GET /feedback/search
 * @description Search feedback based on query parameters
 * @access Public
 */
router.get(
  "/search",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.READ),
  feedbackController.searchFeedback
);

/** * @route GET /feedback/:id
 * @description Get feedback by ID
 * @access Public
 */
router.get(
  "/:id",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.READ, {
    getResource: ResourceHelpers.getFeedback,
  }),
  feedbackController.getFeedback
);

/** * @route GET /feedback/number/:feedbackNumber
 * @description Get feedback by feedback number
 * @access Public
 */
router.get("/number/:feedbackNumber", feedbackController.getFeedbackByNumber);

/** * @route PUT /feedback/:id
 * @description Update feedback by ID
 * @access Public
 */
router.put(
  "/:id",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getFeedback,
  }),
  feedbackController.updateFeedback
);

/** @route DELETE /feedback/:id
 * @description Soft delete feedback by ID
 * @access Public
 */
router.delete(
  "/:id",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.DELETE, {
    getResource: ResourceHelpers.getFeedback,
  }),
  feedbackController.softDeleteFeedback
);

// ============= Feedback History Routes =============

/** * @route GET /feedback/:id/history
 * @description Get feedback history by feedback ID
 * @access Public
 */
router.get("/:id/history", feedbackController.getFeedbackHistory);

// feedback history summary route
/** * @route GET /feedback/history/summary
 * @description Get feedback history summary
 * @access Public
 */
router.get(
  "/:id/history/summary",
  feedbackController.getFeedbackHistorySummary
);

// ============= Feedback Comments Routes =============

/** @route POST /feedback/:feedbackId/comments
 * @description Create a new comment for feedback
 * @access Protected
 */
router.post(
  "/:feedbackId/comments",
  requirePermission(RESOURCES.COMMENTS, ACTIONS.CREATE),
  commentsController.createComment
);

/** @route GET /feedback/:feedbackId/comments
 * @description Get all comments for feedback
 * @access Protected
 */
router.get(
  "/:feedbackId/comments",
  requirePermission(RESOURCES.COMMENTS, ACTIONS.READ),
  commentsController.getCommentsByFeedback
);

/** @route GET /feedback/:feedbackId/comments/count
 * @description Get comment count for feedback
 * @access Protected
 */
router.get(
  "/:feedbackId/comments/count",
  requirePermission(RESOURCES.COMMENTS, ACTIONS.READ),
  commentsController.getCommentCount
);

/** @route GET /feedback/:feedbackId/comments/:commentId
 * @description Get a specific comment
 * @access Protected
 */
router.get(
  "/:feedbackId/comments/:commentId",
  requirePermission(RESOURCES.COMMENTS, ACTIONS.READ),
  commentsController.getComment
);

/** @route PUT /feedback/:feedbackId/comments/:commentId
 * @description Update a comment
 * @access Protected
 */
router.put(
  "/:feedbackId/comments/:commentId",
  requirePermission(RESOURCES.COMMENTS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getComment,
  }),
  commentsController.updateComment
);

/** @route DELETE /feedback/:feedbackId/comments/:commentId
 * @description Delete a comment (soft delete)
 * @access Protected
 */
router.delete(
  "/:feedbackId/comments/:commentId",
  requirePermission(RESOURCES.COMMENTS, ACTIONS.DELETE, {
    getResource: ResourceHelpers.getComment,
  }),
  commentsController.deleteComment
);

// ============= Specific Feedback Actions =========================

router.patch(
  "/:id/assign",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getFeedback,
  }),
  feedbackController.assignFeedback
);

router.patch(
  "/:id/status",
  requirePermission(RESOURCES.FEEDBACK, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getFeedback,
  }),
  feedbackController.updateFeedbackStatus
);

export default router;
