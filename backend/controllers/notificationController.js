import { CaseNotification } from "../models/CaseNotification.js";
import { PermissionService } from "../services/permissionService.js";
import { RESOURCES, ACTIONS } from "../config/rolesConfig.js";

/**
 * Notification Controller - Handles case notification operations
 * Integrates with existing permission system and email services
 */
export class NotificationController {
  // ============= MAIN NOTIFICATION CRUD OPERATIONS =============

  /**
   * Get notifications for the authenticated user
   * @route GET /api/notifications
   */
  static async getUserNotifications(req, res) {
    try {
      const user = req.user;
      const {
        // Pagination
        page = 1,
        limit = 20,

        // Filters
        caseId,
        entityType,
        type,
        priority,
        isRead,
        dateFrom,
        dateTo,
        includeExpired = false,

        // Sorting
        orderBy = "createdAt",
        sortOrder = "DESC",
      } = req.query;

      // Convert pagination to offset
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      // Build sort clause
      const validSortFields = {
        createdAt: "n.createdAt",
        updatedAt: "n.updatedAt",
        priority: "n.priority",
        type: "n.type",
        isRead: "n.isRead",
      };

      const sortField = validSortFields[orderBy] || "n.createdAt";
      const sortDirection = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
      const orderByClause = `${sortField} ${sortDirection}`;

      // Use permission filters from middleware
      const options = {
        ...req.permissionFilters, // Applied by requirePermission middleware
        caseId: caseId ? parseInt(caseId) : undefined,
        entityType,
        type,
        priority,
        isRead: isRead !== undefined ? isRead === "true" : undefined,
        dateFrom,
        dateTo,
        includeExpired: includeExpired === "true",
        limit: limitNum,
        offset,
        orderBy: orderByClause,
      };

      const result = await CaseNotification.getUserCaseNotificationsAsync(
        user.id,
        options
      );

      return res.status(200).json({
        success: true,
        message: `Retrieved ${result.data.length} notifications`,
        data: result.data,
        pagination: result.pagination,
        summary: result.summary,
        filters: {
          caseId,
          entityType,
          type,
          priority,
          isRead,
          dateFrom,
          dateTo,
          includeExpired,
        },
      });
    } catch (error) {
      console.error("❌ Failed to get user notifications:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notifications",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Get single notification by ID
   * @route GET /api/notifications/:id
   */
  static async getNotificationById(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Valid notification ID is required",
          error: "Notification ID must be a valid number",
        });
      }

      const notification = await CaseNotification.getNotificationByIdAsync(
        parseInt(id),
        user.id // Security: only get user's own notifications
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
          error: `No notification found with ID ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification retrieved successfully",
        data: notification,
      });
    } catch (error) {
      console.error("❌ Failed to get notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notification",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Mark notification as read
   * @route PATCH /api/notifications/:id/read
   */
  static async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // console.log("Marking notification as read:", id);
      // console.log("User:", user);

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Valid notification ID is required",
          error: "Notification ID must be a valid number",
        });
      }

      const updatedNotification = await CaseNotification.markAsReadAsync(
        parseInt(id),
        user.id // Security: only mark user's own notifications
      );

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: updatedNotification,
      });
    } catch (error) {
      console.error("❌ Failed to mark notification as read:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Notification not found or already read",
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Mark multiple notifications as read
   * @route PATCH /api/notifications/mark-read
   */
  static async markMultipleAsRead(req, res) {
    try {
      const user = req.user;
      const { notificationIds, markAll = false } = req.body;

      // Validate request
      if (!markAll && (!notificationIds || !Array.isArray(notificationIds))) {
        return res.status(400).json({
          success: false,
          message: "Either set markAll=true or provide notificationIds array",
          error: "Invalid request body",
        });
      }

      // Convert to integers if provided
      const ids = markAll
        ? null
        : notificationIds.map((id) => {
            const numId = parseInt(id);
            if (isNaN(numId)) {
              throw new Error(`Invalid notification ID: ${id}`);
            }
            return numId;
          });

      const updatedCount = await CaseNotification.markMultipleAsReadAsync(
        user.id,
        ids
      );

      return res.status(200).json({
        success: true,
        message: `${updatedCount} notifications marked as read`,
        data: {
          updatedCount,
          markAll,
          notificationIds: ids,
        },
      });
    } catch (error) {
      console.error("❌ Failed to mark multiple notifications as read:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notifications as read",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Get notification summary/stats for user
   * @route GET /api/notifications/summary
   */
  static async getNotificationSummary(req, res) {
    try {
      const user = req.user;

      // Get basic summary by calling the method with minimal options
      const result = await CaseNotification.getUserCaseNotificationsAsync(
        user.id,
        { ...req.permissionFilters, limit: 0 } // limit: 0 to get just summary
      );

      return res.status(200).json({
        success: true,
        message: "Notification summary retrieved successfully",
        data: result.summary,
      });
    } catch (error) {
      console.error("❌ Failed to get notification summary:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notification summary",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Delete notification
   * @route DELETE /api/notifications/:notificationId
   */
  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const user = req.user;

      // Validate request
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required",
          error: "Invalid request",
        });
      }

      const deleted = await CaseNotification.deleteNotificationAsync(
        notificationId,
        user.id
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
          error: "Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("❌ Failed to delete notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // ============= CASE-SPECIFIC NOTIFICATION OPERATIONS =============

  /**
   * Get notifications for a specific case
   * @route GET /api/notifications/case/:caseId
   */
  static async getCaseNotifications(req, res) {
    try {
      const { caseId } = req.params;
      const user = req.user;
      const { page = 1, limit = 20 } = req.query;

      if (!caseId || isNaN(parseInt(caseId))) {
        return res.status(400).json({
          success: false,
          message: "Valid case ID is required",
          error: "Case ID must be a valid number",
        });
      }

      // Check if user can access this case (will be handled by middleware if case routes are protected)
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const options = {
        ...req.permissionFilters,
        caseId: parseInt(caseId),
        limit: limitNum,
        offset,
        orderBy: "n.createdAt DESC",
      };

      const result = await CaseNotification.getUserCaseNotificationsAsync(
        user.id,
        options
      );

      return res.status(200).json({
        success: true,
        message: `Retrieved ${result.data.length} notifications for case ${caseId}`,
        data: result.data,
        pagination: result.pagination,
        caseId: parseInt(caseId),
      });
    } catch (error) {
      console.error("❌ Failed to get case notifications:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve case notifications",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Create a manual notification (admin/manager only)
   * @route POST /api/notifications
   */
  static async createNotification(req, res) {
    try {
      const user = req.user;
      const {
        userId,
        caseId,
        entityType = "case",
        entityId,
        type,
        title,
        message,
        priority = "normal",
        actionUrl,
        actionText,
        expiresAt,
        metadata,
      } = req.body;

      // Validate required fields
      if (!userId || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "userId, type, title, and message are required",
          error: "Missing required fields",
        });
      }

      // Validate notification type from schema
      const validTypes = [
        "case_assigned",
        "case_updated",
        "case_status_changed",
        "comment_added",
        "escalation",
        "due_date_reminder",
        "case_resolved",
        "assignment_transferred",
        "quality_review_required",
      ];

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid notification type. Valid types: ${validTypes.join(
            ", "
          )}`,
          error: "Invalid notification type",
        });
      }

      // Validate priority
      const validPriorities = ["low", "normal", "high", "urgent"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: `Invalid priority. Valid priorities: ${validPriorities.join(
            ", "
          )}`,
          error: "Invalid priority level",
        });
      }

      // Prepare notification data
      const notificationData = {
        userId: parseInt(userId),
        caseId: caseId ? parseInt(caseId) : null,
        entityType,
        entityId: entityId ? parseInt(entityId) : null,
        type,
        title,
        message,
        priority,
        actionUrl,
        actionText,
        triggerUserId: user.id,
        triggerAction: "manual_creation",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata: metadata ? metadata : null,
      };

      const notification = await CaseNotification.createCaseNotificationAsync(
        notificationData
      );

      // Send email if notification created successfully (non-blocking)
      if (notification) {
        // Dynamic import to avoid circular dependency
        import("./emailController.js")
          .then(({ EmailController }) => {
            EmailController.sendNotificationEmail(notification.id).catch(
              (error) => {
                console.error(
                  "⚠️ Failed to send email for manual notification:",
                  error
                );
              }
            );
          })
          .catch((error) => {
            console.error("⚠️ Failed to import EmailController:", error);
          });
      }

      return res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notification,
      });
    } catch (error) {
      console.error("❌ Failed to create notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create notification",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // ============= EMAIL NOTIFICATION OPERATIONS =============

  /**
   * Resend email for a notification
   * @route POST /api/notifications/:id/resend-email
   */
  static async resendNotificationEmail(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Valid notification ID is required",
          error: "Notification ID must be a valid number",
        });
      }

      // Get notification (ensure user can access it)
      const notification = await CaseNotification.getNotificationByIdAsync(
        parseInt(id),
        user.id
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
          error: `No notification found with ID ${id}`,
        });
      }

      // Reset email status and resend
      await CaseNotification.updateEmailStatusAsync(parseInt(id), false);

      // Send email using dynamic import
      const { EmailController } = await import("./emailController.js");
      await EmailController.sendNotificationEmail(parseInt(id));

      return res.status(200).json({
        success: true,
        message: "Email resent successfully",
        data: {
          notificationId: parseInt(id),
          resentAt: new Date(),
        },
      });
    } catch (error) {
      console.error("❌ Failed to resend notification email:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to resend email",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Get email service status (admin only)
   * @route GET /api/notifications/email-status
   */
  static async getEmailServiceStatus(req, res) {
    try {
      const { EmailController } = await import("./emailController.js");
      const status = EmailController.getEmailServiceStatus();

      return res.status(200).json({
        success: true,
        message: "Email service status retrieved",
        data: status,
      });
    } catch (error) {
      console.error("❌ Failed to get email service status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get email service status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Test email service (admin only)
   * @route POST /api/notifications/test-email
   */
  static async testEmailService(req, res) {
    try {
      const { EmailController } = await import("./emailController.js");
      const result = await EmailController.testEmailService();

      return res.status(200).json({
        success: true,
        message: "Email service test completed",
        data: result,
      });
    } catch (error) {
      console.error("❌ Failed to test email service:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to test email service",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // ============= BULK OPERATIONS =============

  /**
   * Send bulk notifications (admin/manager only)
   * @route POST /api/notifications/bulk
   */
  static async sendBulkNotifications(req, res) {
    try {
      const user = req.user;
      const {
        userIds,
        type,
        title,
        message,
        priority = "normal",
        actionUrl,
        actionText,
        caseId,
        sendEmail = true,
      } = req.body;

      // Validate required fields
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "userIds array is required and cannot be empty",
          error: "Invalid userIds array",
        });
      }

      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "type, title, and message are required",
          error: "Missing required fields",
        });
      }

      // Limit bulk operations
      if (userIds.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Maximum 100 users allowed per bulk operation",
          error: "Too many users in bulk operation",
        });
      }

      const results = [];
      const errors = [];

      // Create notifications for each user
      for (const userId of userIds) {
        try {
          const notificationData = {
            userId: parseInt(userId),
            caseId: caseId ? parseInt(caseId) : null,
            entityType: "case",
            entityId: caseId ? parseInt(caseId) : null,
            type,
            title,
            message,
            priority,
            actionUrl,
            actionText,
            triggerUserId: user.id,
            triggerAction: "bulk_creation",
          };

          const notification = await CaseNotification.sendCaseNotificationAsync(
            notificationData,
            sendEmail
          );

          results.push({
            userId: parseInt(userId),
            notificationId: notification.id,
            success: true,
          });

          // Add small delay to avoid overwhelming the system
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          errors.push({
            userId: parseInt(userId),
            error: error.message,
            success: false,
          });
        }
      }

      return res.status(201).json({
        success: true,
        message: `Bulk notifications sent: ${results.length} successful, ${errors.length} failed`,
        data: {
          successful: results,
          failed: errors,
          summary: {
            total: userIds.length,
            successful: results.length,
            failed: errors.length,
          },
        },
      });
    } catch (error) {
      console.error("❌ Failed to send bulk notifications:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send bulk notifications",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // ============= ANALYTICS & REPORTING =============

  /**
   * Get notification analytics (admin/manager only)
   * @route GET /api/notifications/analytics
   */
  static async getNotificationAnalytics(req, res) {
    try {
      const {
        dateFrom,
        dateTo = new Date().toISOString(),
        groupBy = "day",
      } = req.query;

      // Default to last 30 days if no dateFrom provided
      const fromDate = dateFrom
        ? new Date(dateFrom)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const toDate = new Date(dateTo);

      // Validate dates
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
          error: "Dates must be in valid ISO format",
        });
      }

      // This would require additional analytics methods in CaseNotification
      // For now, return basic structure
      const analytics = {
        period: {
          from: fromDate,
          to: toDate,
          days: Math.ceil((toDate - fromDate) / (24 * 60 * 60 * 1000)),
        },
        summary: {
          totalNotifications: 0,
          emailsSent: 0,
          readRate: 0,
          averageReadTime: 0,
        },
        byType: {},
        byPriority: {},
        timeline: [],
      };

      return res.status(200).json({
        success: true,
        message: "Notification analytics retrieved",
        data: analytics,
      });
    } catch (error) {
      console.error("❌ Failed to get notification analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notification analytics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Get available notification types for client
   * @route GET /api/notifications/types
   */
  static async getNotificationTypes(req, res) {
    try {
      const types = [
        {
          value: "case_assigned",
          label: "Case Assigned",
          description: "When a case is assigned to a user",
        },
        {
          value: "case_updated",
          label: "Case Updated",
          description: "When case details are updated",
        },
        {
          value: "case_status_changed",
          label: "Case Status Changed",
          description: "When case status changes",
        },
        {
          value: "comment_added",
          label: "Comment Added",
          description: "When a comment is added to a case",
        },
        {
          value: "escalation",
          label: "Case Escalated",
          description: "When a case is escalated",
        },
        {
          value: "due_date_reminder",
          label: "Due Date Reminder",
          description: "Reminder for approaching due dates",
        },
        {
          value: "case_resolved",
          label: "Case Resolved",
          description: "When a case is marked as resolved",
        },
        {
          value: "assignment_transferred",
          label: "Assignment Transferred",
          description: "When case assignment is transferred",
        },
        {
          value: "quality_review_required",
          label: "Quality Review Required",
          description: "When quality review is needed",
        },
      ];

      const priorities = [
        {
          value: "low",
          label: "Low",
          description: "Low priority notification",
        },
        {
          value: "normal",
          label: "Normal",
          description: "Normal priority notification",
        },
        {
          value: "high",
          label: "High",
          description: "High priority notification",
        },
        {
          value: "urgent",
          label: "Urgent",
          description: "Urgent priority notification",
        },
      ];

      return res.status(200).json({
        success: true,
        message: "Notification types and priorities retrieved",
        data: {
          types,
          priorities,
        },
      });
    } catch (error) {
      console.error("❌ Failed to get notification types:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notification types",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}
