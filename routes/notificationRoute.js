import { Router } from "express";
import { notificationController } from "../controllers/notificationController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/autherization.js";
import { RESOURCES, ACTIONS } from "../config/rolesConfig.js";

const router = Router();

router.use(authenticateToken);

/**
 * @route GET /notifications
 * @description Get all notifications (admin/staff only, filtered by permissions)
 * @access Private
 */
router.get(
  "/",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ),
  notificationController.getAllNotifications
);

/**
 * @route GET /notifications/user
 * @description Get user notifications (filtered by permissions)
 * @access Private
 */
router.get(
  "/user",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ),
  notificationController.getUserNotifications
);
/**
 * @route GET /notifications/:id
 * @description Get notification by ID
 * @access Private
 */
router.get(
  "/getById/:id",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ),
  notificationController.getNotification
);
/**
 * @route PUT /notifications/:id/read
 * @description Mark notification as read
 * @access Private
 */
router.put(
  "/markAsRead/:id",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.UPDATE),
  notificationController.markAsRead
);
/**
 * @route PUT /notifications/read-multiple
 * @description Mark multiple notifications as read
 * @access Private
 */
router.put(
  "/markMultipleAsRead",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.UPDATE),
  notificationController.markMultipleAsRead
);

/**
 * @route DELETE /notifications/:id
 * @description Delete notification
 * @access Private
 */
router.delete(
  "/delete/:id",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.DELETE),
  notificationController.deleteNotification
);
export default router;
