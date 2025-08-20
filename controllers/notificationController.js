import { Notification } from "../models/Notification.js";
import {
  ROLE_PERMISSIONS,
  RESOURCES,
  ACTIONS,
  ACTION_RESTRICTIONS,
} from "../config/rolesConfig.js";

export const notificationController = {
  // Get user notifications
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user?.id || parseInt(req.params.userId, 10);

      // Merge query parameters with permission filters
      const options = {
        ...req.query,
        ...req.permissionFilters, // Applied by middleware
      };

      // If permission filter indicates impossible condition, return empty result
      if (options.impossible) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: parseInt(req.query.limit) || 20,
            offset: 0,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          summary: {
            total: 0,
            unread: 0,
            isRead: 0,
            unreadHigh: 0,
            unreadUrgent: 0,
          },
        });
      }

      const result = await Notification.getNotificationsByUserIdAsync(
        userId,
        options
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get all notifications (for admin/staff use) with permission filtering
  getAllNotifications: async (req, res) => {
    try {
      // Merge query parameters with permission filters
      const options = {
        ...req.query,
        ...req.permissionFilters, // Applied by middleware
      };

      // If permission filter indicates impossible condition, return empty result
      if (options.impossible) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: parseInt(req.query.limit) || 20,
            offset: 0,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      }

      const result = await Notification.getAllNotificationsAsync(options);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get single notification
  getNotification: async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Determine if user has all access
      const userPermission =
        ROLE_PERMISSIONS[userRole]?.[RESOURCES.NOTIFICATIONS][ACTIONS.READ];
      const userIdForCheck =
        userPermission === ACTION_RESTRICTIONS.ALL ? null : userId;

      const notification = await Notification.getNotificationByIdAsync(
        notificationId,
        userIdForCheck
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const userId = req.user?.id;

      // Determine if user has all access
      const userPermission =
        ROLE_PERMISSIONS[req.user?.role]?.[RESOURCES.NOTIFICATIONS][
          ACTIONS.UPDATE
        ];
      const userIdForCheck =
        userPermission === ACTION_RESTRICTIONS.ALL ? null : userId;

      const notification = await Notification.markAsReadAsync(
        notificationId,
        userIdForCheck
      );

      res.json({
        success: true,
        data: notification,
        message: "Notification marked as read",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid notification IDs",
        });
      }

      const userPermission =
        ROLE_PERMISSIONS[req.user?.role]?.[RESOURCES.NOTIFICATIONS][
          ACTIONS.UPDATE
        ];
      const userIdForCheck =
        userPermission === ACTION_RESTRICTIONS.ALL ? null : userId;

      const updatedCount = await Notification.markMultipleAsReadAsync(
        userIdForCheck,
        notificationIds
      );

      res.json({
        success: true,
        message: `${updatedCount} notifications marked as read`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const userId = req.user?.id;

      // Determine if user has all access
      const userPermission =
        ROLE_PERMISSIONS[req.user?.role]?.[RESOURCES.NOTIFICATIONS][
          ACTIONS.DELETE
        ];
      const userIdForCheck =
        userPermission === ACTION_RESTRICTIONS.ALL ? null : userId;

      const success = await Notification.deleteNotificationAsync(
        notificationId,
        userIdForCheck
      );

      res.json({
        success,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
