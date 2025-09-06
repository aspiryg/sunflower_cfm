import { Router } from "express";
import { NotificationController } from "../controllers/notificationController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/autherization.js";
import { ResourceHelpers } from "../utils/resourceHelpers.js";
import { RESOURCES, ACTIONS } from "../config/rolesConfig.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ============= USER NOTIFICATION CRUD ROUTES =============

/**
 * @route GET /api/notifications
 * @description Get notifications for the authenticated user
 * @access Protected - All authenticated users can read their own notifications
 */
router.get(
  "/",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ),
  NotificationController.getUserNotifications
);

/**
 * @route GET /api/notifications/summary
 * @description Get notification summary/stats for authenticated user
 * @access Protected - All authenticated users can read their own notification summary
 */
router.get(
  "/summary",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ),
  NotificationController.getNotificationSummary
);

/**
 * @route GET /api/notifications/types
 * @description Get available notification types and priorities (for dropdowns/forms)
 * @access Protected - All authenticated users can read notification types
 */
router.get(
  "/types",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ),
  NotificationController.getNotificationTypes
);

/**
 * @route GET /api/notifications/:id
 * @description Get single notification by ID
 * @access Protected - Users can only read their own notifications
 */
router.get(
  "/:id",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ, {
    getResource: ResourceHelpers.getNotification,
  }),
  NotificationController.getNotificationById
);

/**
 * @route PATCH /api/notifications/:id/read
 * @description Mark notification as read
 * @access Protected - Users can only mark their own notifications as read
 */
router.patch(
  "/:id/read",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getNotification,
  }),
  NotificationController.markNotificationAsRead
);

/**
 * @route PATCH /api/notifications/mark-read
 * @description Mark multiple notifications as read
 * @access Protected - Users can only mark their own notifications as read
 */
router.patch(
  "/mark-read",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.UPDATE),
  NotificationController.markMultipleAsRead
);

/* DELETE /api/notifications/:notificationId
 * @description Delete a notification
 * @access Protected - Users can only delete their own notifications
 */
router.delete(
  "/delete/:notificationId",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.DELETE, {
    getResource: ResourceHelpers.getNotification,
  }),
  NotificationController.deleteNotification
);

// ============= CASE-SPECIFIC NOTIFICATION ROUTES =============

/**
 * @route GET /api/notifications/case/:caseId
 * @description Get notifications for a specific case
 * @access Protected - Requires READ permission on NOTIFICATIONS
 * @note Case access will be filtered by permission system
 */
router.get(
  "/case/:caseId",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.READ, {
    getResource: ResourceHelpers.getCase,
  }),
  NotificationController.getCaseNotifications
);

// ============= ADMIN/MANAGER NOTIFICATION MANAGEMENT =============

/**
 * @route POST /api/notifications
 * @description Create a manual notification (admin/manager only)
 * @access Protected - Requires CREATE permission on NOTIFICATIONS (admin/manager)
 */
router.post(
  "/",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.CREATE),
  NotificationController.createNotification
);

/**
 * @route POST /api/notifications/bulk
 * @description Send bulk notifications (admin/manager only)
 * @access Protected - Requires CREATE permission on NOTIFICATIONS (admin/manager)
 */
router.post(
  "/bulk",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.CREATE),
  NotificationController.sendBulkNotifications
);

// ============= EMAIL NOTIFICATION ROUTES =============

/**
 * @route POST /api/notifications/:id/resend-email
 * @description Resend email for a notification
 * @access Protected - Users can resend emails for their own notifications
 */
router.post(
  "/:id/resend-email",
  requirePermission(RESOURCES.NOTIFICATIONS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getNotification,
  }),
  NotificationController.resendNotificationEmail
);

/**
 * @route GET /api/notifications/email-status
 * @description Get email service status (admin only)
 * @access Protected - Requires admin role for system status
 */
router.get(
  "/email-status",
  requirePermission(RESOURCES.SYSTEM, ACTIONS.READ),
  NotificationController.getEmailServiceStatus
);

/**
 * @route POST /api/notifications/test-email
 * @description Test email service (admin only)
 * @access Protected - Requires admin role for system testing
 */
router.post(
  "/test-email",
  requirePermission(RESOURCES.SYSTEM, ACTIONS.UPDATE),
  NotificationController.testEmailService
);

// ============= ANALYTICS & REPORTING ROUTES =============

/**
 * @route GET /api/notifications/analytics
 * @description Get notification analytics (admin/manager only)
 * @access Protected - Requires READ permission on ANALYTICS (admin/manager)
 */
router.get(
  "/analytics",
  requirePermission(RESOURCES.ANALYTICS, ACTIONS.READ),
  NotificationController.getNotificationAnalytics
);

// ============= ROUTE DOCUMENTATION HELPER =============

/**
 * @route GET /api/notifications/docs/routes
 * @description Get documentation for all notification routes (development helper)
 * @access Protected - Admin only
 */
router.get(
  "/docs/routes",
  requirePermission(RESOURCES.SYSTEM, ACTIONS.READ),
  (req, res) => {
    const routes = [
      {
        method: "GET",
        path: "/api/notifications",
        description: "Get user notifications with filtering and pagination",
        access: "All authenticated users (own notifications)",
        queryParams: [
          "page",
          "limit",
          "caseId",
          "entityType",
          "type",
          "priority",
          "isRead",
          "dateFrom",
          "dateTo",
          "includeExpired",
          "orderBy",
          "sortOrder",
        ],
      },
      {
        method: "GET",
        path: "/api/notifications/summary",
        description: "Get notification summary/stats",
        access: "All authenticated users (own summary)",
      },
      {
        method: "GET",
        path: "/api/notifications/types",
        description: "Get available notification types and priorities",
        access: "All authenticated users",
      },
      {
        method: "GET",
        path: "/api/notifications/:id",
        description: "Get single notification by ID",
        access: "Users (own notifications only)",
      },
      {
        method: "PATCH",
        path: "/api/notifications/:id/read",
        description: "Mark notification as read",
        access: "Users (own notifications only)",
      },
      {
        method: "PATCH",
        path: "/api/notifications/mark-read",
        description: "Mark multiple notifications as read",
        access: "Users (own notifications only)",
        body: {
          notificationIds: "number[] (optional)",
          markAll: "boolean (optional)",
        },
      },
      {
        method: "GET",
        path: "/api/notifications/case/:caseId",
        description: "Get notifications for specific case",
        access: "Users with case access",
      },
      {
        method: "POST",
        path: "/api/notifications",
        description: "Create manual notification",
        access: "Admin/Manager only",
        body: {
          userId: "number (required)",
          caseId: "number (optional)",
          type: "string (required)",
          title: "string (required)",
          message: "string (required)",
          priority: "string (optional)",
          actionUrl: "string (optional)",
          actionText: "string (optional)",
          expiresAt: "datetime (optional)",
          metadata: "object (optional)",
        },
      },
      {
        method: "POST",
        path: "/api/notifications/bulk",
        description: "Send bulk notifications",
        access: "Admin/Manager only",
        body: {
          userIds: "number[] (required)",
          type: "string (required)",
          title: "string (required)",
          message: "string (required)",
          priority: "string (optional)",
          sendEmail: "boolean (optional)",
        },
      },
      {
        method: "POST",
        path: "/api/notifications/:id/resend-email",
        description: "Resend email for notification",
        access: "Users (own notifications only)",
      },
      {
        method: "GET",
        path: "/api/notifications/email-status",
        description: "Get email service status",
        access: "Admin only",
      },
      {
        method: "POST",
        path: "/api/notifications/test-email",
        description: "Test email service",
        access: "Admin only",
      },
      {
        method: "GET",
        path: "/api/notifications/analytics",
        description: "Get notification analytics",
        access: "Admin/Manager only",
        queryParams: ["dateFrom", "dateTo", "groupBy"],
      },
    ];

    return res.status(200).json({
      success: true,
      message: "Notification routes documentation",
      data: {
        routes,
        totalRoutes: routes.length,
        baseUrl: "/api/notifications",
        authentication: "All routes require authentication token",
        permissions:
          "Routes use role-based permissions via requirePermission middleware",
      },
    });
  }
);

export default router;
