import { database, sql } from "../config/database.js";
import { EmailController } from "../controllers/emailController.js";

/**
 * Case Notification Model - Compliant with the Notifications table schema
 * Handles case-related notifications with comprehensive tracking
 */
export class CaseNotification {
  // ============= CORE NOTIFICATION METHODS =============

  /**
   * Creates a new case notification
   * @param {Object} notificationData - Notification data matching schema
   * @returns {Promise<Object>} Created notification
   */
  static async createCaseNotificationAsync(notificationData) {
    const pool = database.getPool();

    try {
      // Validate required fields according to schema
      this._validateRequiredFields(notificationData, [
        "userId",
        "type",
        "title",
        "message",
      ]);

      // Build notification data with schema compliance
      const notification = {
        // Target
        userId: parseInt(notificationData.userId, 10),

        // Related Entity
        caseId: notificationData.caseId
          ? parseInt(notificationData.caseId, 10)
          : null,
        entityType: notificationData.entityType || "case",
        entityId: notificationData.entityId
          ? parseInt(notificationData.entityId, 10)
          : null,

        // Content
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority || "normal",

        // Actions
        actionUrl: notificationData.actionUrl || null,
        actionText: notificationData.actionText || "View Case",

        // Status
        isRead: false,
        readAt: null,

        // Email
        isEmailSent: false,
        emailSentAt: null,
        emailError: null,

        // Push
        isPushSent: false,
        pushSentAt: null,
        pushError: null,

        // Metadata
        metadata: notificationData.metadata
          ? JSON.stringify(notificationData.metadata)
          : null,

        // Trigger
        triggerUserId: notificationData.triggerUserId
          ? parseInt(notificationData.triggerUserId, 10)
          : null,
        triggerAction: notificationData.triggerAction || null,

        // Expiration
        expiresAt: notificationData.expiresAt
          ? new Date(notificationData.expiresAt)
          : null,

        // Audit
        createdAt: new Date(),
        updatedAt: new Date(),

        // Status
        isActive: true,
      };

      // Build dynamic insert query
      const { query, parameters } = this._buildInsertQuery(notification);

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);
      const insertedId = result.recordset?.[0]?.id;

      if (!insertedId) {
        throw new Error("Failed to get inserted notification ID");
      }

      console.log(
        `✅ Case notification created for user ${notification.userId} - ${notification.type}`
      );

      // Send Email Notification
      EmailController.sendNotificationEmail(insertedId).catch((emailError) => {
        console.error(
          `❌ Failed to send notification email for notification ${insertedId}:`,
          emailError
        );
      });

      // Return the created notification
      return await this.getNotificationByIdAsync(insertedId);
    } catch (error) {
      console.error("❌ Failed to create case notification:", error);
      throw new Error(`Failed to create case notification: ${error.message}`);
    }
  }

  /**
   * Gets notifications for a user with case context
   * @param {number} userId - User ID
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object>} Notifications with pagination
   */
  static async getUserCaseNotificationsAsync(userId, options = {}) {
    const pool = database.getPool();

    // console.log(
    //   `🔍 Fetching case notifications for user ${userId}, options: ${JSON.stringify(
    //     options
    //   )}`
    // );
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        // Permission filters
        userId: permissionUserId,
        impossible,
        // Standard filters
        caseId,
        entityType,
        type,
        priority,
        isRead,
        dateFrom,
        dateTo,
        includeExpired = false,
        limit = 20,
        offset = 0,
        orderBy = "n.createdAt DESC",
      } = options;

      // Handle permission restrictions
      if (impossible) {
        return this._getEmptyNotificationResult(limit);
      }

      const effectiveUserId = permissionUserId || userId;

      // Build filter conditions
      const { whereClause, parameters } = this._buildUserNotificationsFilter({
        userId: effectiveUserId,
        caseId,
        entityType,
        type,
        priority,
        isRead,
        dateFrom,
        dateTo,
        includeExpired,
      });

      // Build queries
      const dataQuery = this._buildSelectQuery({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

      const countQuery = this._buildCountQuery(whereClause);

      // Execute queries
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const [dataResult, countResult] = await Promise.all([
        request.query(dataQuery),
        request.query(countQuery),
      ]);

      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / limit);
      const page = Math.floor(offset / limit) + 1;

      const result = {
        data: dataResult.recordset.map(this._transformNotificationResult),
        pagination: {
          page,
          limit,
          offset,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: await this._getUserNotificationsSummary(effectiveUserId),
      };

      console.log(
        `✅ Retrieved ${result.data.length} case notifications for user ${effectiveUserId}`
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to get case notifications for user ${userId}:`,
        error
      );
      throw new Error(
        `Failed to retrieve case notifications: ${error.message}`
      );
    }
  }

  /**
   * Gets single notification by ID
   * @param {number} notificationId - Notification ID
   * @param {number} [userId] - Optional user ID for security
   * @returns {Promise<Object|null>} Notification or null
   */
  static async getNotificationByIdAsync(notificationId, userId = null) {
    const pool = database.getPool();

    try {
      if (!notificationId) {
        throw new Error("Notification ID is required");
      }

      let whereClause = "n.id = @notificationId AND n.isActive = 1";
      const parameters = {
        notificationId: { value: parseInt(notificationId, 10), type: sql.Int },
      };

      if (userId) {
        whereClause += " AND n.userId = @userId";
        parameters.userId = { value: parseInt(userId, 10), type: sql.Int };
      }

      const query = this._buildSelectQuery({ where: whereClause });

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.recordset.length > 0) {
        return this._transformNotificationResult(result.recordset[0]);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get notification ${notificationId}:`, error);
      throw new Error(`Failed to retrieve notification: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} [userId] - Optional user ID for security
   * @returns {Promise<Object>} Updated notification
   */
  static async markAsReadAsync(notificationId, userId = null) {
    const pool = database.getPool();

    try {
      if (!notificationId) {
        throw new Error("Notification ID is required");
      }

      let whereClause = "id = @notificationId AND isActive = 1";
      const parameters = {
        notificationId: { value: parseInt(notificationId, 10), type: sql.Int },
        readAt: { value: new Date(), type: sql.DateTime },
        updatedAt: { value: new Date(), type: sql.DateTime },
      };

      if (userId) {
        whereClause += " AND userId = @userId";
        parameters.userId = { value: parseInt(userId, 10), type: sql.Int };
      }

      const query = `
        UPDATE Notifications 
        SET isRead = 1, readAt = @readAt, updatedAt = @updatedAt
        WHERE ${whereClause} AND isRead = 0
      `;

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(`✅ Notification ${notificationId} marked as read`);
        return await this.getNotificationByIdAsync(notificationId);
      } else {
        throw new Error("Notification not found or already read");
      }
    } catch (error) {
      console.error(`❌ Failed to mark notification as read:`, error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark multiple notifications as read
   * @param {number} userId - User ID
   * @param {Array<number>} [notificationIds] - Specific notification IDs or null for all
   * @returns {Promise<number>} Number of notifications marked as read
   */
  static async markMultipleAsReadAsync(userId, notificationIds = null) {
    const pool = database.getPool();

    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      let whereClause = "userId = @userId AND isRead = 0 AND isActive = 1";
      const parameters = {
        userId: { value: parseInt(userId, 10), type: sql.Int },
        readAt: { value: new Date(), type: sql.DateTime },
        updatedAt: { value: new Date(), type: sql.DateTime },
      };

      if (notificationIds && notificationIds.length > 0) {
        const idPlaceholders = notificationIds.map((id, index) => {
          const paramName = `notifId${index}`;
          parameters[paramName] = { value: parseInt(id, 10), type: sql.Int };
          return `@${paramName}`;
        });
        whereClause += ` AND id IN (${idPlaceholders.join(", ")})`;
      }

      const query = `
        UPDATE Notifications 
        SET isRead = 1, readAt = @readAt, updatedAt = @updatedAt
        WHERE ${whereClause}
      `;

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);
      const updatedCount = result.rowsAffected[0];

      console.log(
        `✅ Marked ${updatedCount} notifications as read for user ${userId}`
      );
      return updatedCount;
    } catch (error) {
      console.error(`❌ Failed to mark multiple notifications as read:`, error);
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  }

  /**
   * Delete notification
   * @param {number} notificationId - Notification ID
   * @param {number} [userId] - User ID (optional)
   * @returns {Promise<boolean>} Success status
   */
  static async deleteNotificationAsync(notificationId, userId = null) {
    const pool = database.getPool();

    try {
      if (!notificationId) {
        throw new Error("Notification ID is required");
      }

      const query = `
        DELETE FROM Notifications
        WHERE id = @notificationId
      `;

      const result = await pool
        .request()
        .input("notificationId", sql.Int, parseInt(notificationId, 10))
        .query(query);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(
        `❌ Failed to delete notification ${notificationId}:`,
        error
      );
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  /**
   * Update email status for a notification
   * @param {number} notificationId - Notification ID
   * @param {boolean} isEmailSent - Whether email was sent successfully
   * @param {string} [emailError] - Error message if email failed
   * @returns {Promise<boolean>} Success status
   */
  static async updateEmailStatusAsync(
    notificationId,
    isEmailSent,
    emailError = null
  ) {
    const pool = database.getPool();

    try {
      const query = `
        UPDATE Notifications 
        SET isEmailSent = @isEmailSent, 
            emailSentAt = @emailSentAt, 
            emailError = @emailError,
            updatedAt = @updatedAt
        WHERE id = @notificationId
      `;

      const result = await pool
        .request()
        .input("notificationId", sql.Int, parseInt(notificationId, 10))
        .input("isEmailSent", sql.Bit, isEmailSent)
        .input("emailSentAt", sql.DateTime, isEmailSent ? new Date() : null)
        .input("emailError", sql.NVarChar, emailError)
        .input("updatedAt", sql.DateTime, new Date())
        .query(query);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(
        `❌ Failed to update email status for notification ${notificationId}:`,
        error
      );
      throw new Error(`Failed to update email status: ${error.message}`);
    }
  }

  /**
   * Update push notification status
   * @param {number} notificationId - Notification ID
   * @param {boolean} isPushSent - Whether push was sent successfully
   * @param {string} [pushError] - Error message if push failed
   * @returns {Promise<boolean>} Success status
   */
  static async updatePushStatusAsync(
    notificationId,
    isPushSent,
    pushError = null
  ) {
    const pool = database.getPool();

    try {
      const query = `
        UPDATE Notifications 
        SET isPushSent = @isPushSent, 
            pushSentAt = @pushSentAt, 
            pushError = @pushError,
            updatedAt = @updatedAt
        WHERE id = @notificationId
      `;

      const result = await pool
        .request()
        .input("notificationId", sql.Int, parseInt(notificationId, 10))
        .input("isPushSent", sql.Bit, isPushSent)
        .input("pushSentAt", sql.DateTime, isPushSent ? new Date() : null)
        .input("pushError", sql.NVarChar, pushError)
        .input("updatedAt", sql.DateTime, new Date())
        .query(query);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(
        `❌ Failed to update push status for notification ${notificationId}:`,
        error
      );
      throw new Error(`Failed to update push status: ${error.message}`);
    }
  }

  // ============= CASE-SPECIFIC NOTIFICATION METHODS =============

  /**
   * Notify about case assignment
   * @param {Object} caseData - Case object
   * @param {number} newAssigneeId - New assignee ID
   * @param {number} assignedBy - User who made the assignment
   * @returns {Promise<Object>} Created notification
   */
  static async notifyCaseAssignedAsync(caseData, newAssigneeId, assignedBy) {
    try {
      if (!newAssigneeId || newAssigneeId === assignedBy) {
        return null;
      }

      return await this.createCaseNotificationAsync({
        userId: newAssigneeId,
        caseId: caseData.id,
        entityType: "case",
        entityId: caseData.id,
        type: "case_assigned",
        title: "Case Assigned to You",
        message: `Case "${caseData.title}" has been assigned to you.`,
        priority: this._determinePriority(
          caseData.priority?.level || caseData.urgencyLevel
        ),
        actionUrl: `/cases/view/${caseData.id}`,
        actionText: "View Case",
        triggerUserId: assignedBy,
        triggerAction: "case_assignment",
        metadata: {
          caseNumber: caseData.caseNumber,
          category: caseData.category?.name,
          priority: caseData.priority?.name,
          urgencyLevel: caseData.urgencyLevel,
          assignedBy: assignedBy,
        },
      });
    } catch (error) {
      console.error("❌ Failed to create case assignment notification:", error);
      throw error;
    }
  }

  /**
   * Notify about case status change
   * @param {Object} caseData - Case object
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @param {number} changedBy - User who changed the status
   * @returns {Promise<Array>} Created notifications
   */
  static async notifyCaseStatusChangeAsync(
    caseData,
    oldStatus,
    newStatus,
    changedBy
  ) {
    try {
      const notifications = [];
      const usersToNotify = new Set();

      // Add case submitter/creator
      if (caseData.submittedBy?.id && caseData.submittedBy.id !== changedBy) {
        usersToNotify.add(caseData.submittedBy.id);
      }

      // Add assigned user
      if (caseData.assignedTo?.id && caseData.assignedTo.id !== changedBy) {
        usersToNotify.add(caseData.assignedTo.id);
      }

      for (const userId of usersToNotify) {
        const notification = await this.createCaseNotificationAsync({
          userId,
          caseId: caseData.id,
          entityType: "case",
          entityId: caseData.id,
          type: "case_status_changed",
          title: "Case Status Updated",
          message: `Case "${caseData.title}" status changed from ${oldStatus} to ${newStatus}.`,
          priority: newStatus.toLowerCase().includes("resolved")
            ? "normal"
            : "normal",
          actionUrl: `/cases/view/${caseData.id}`,
          actionText: "View Update",
          triggerUserId: changedBy,
          triggerAction: "status_change",
          metadata: {
            caseNumber: caseData.caseNumber,
            oldStatus,
            newStatus,
            changedBy,
          },
        });
        notifications.push(notification);
      }

      console.log(
        `✅ Created ${notifications.length} notifications for case status change`
      );
      return notifications;
    } catch (error) {
      console.error(
        "❌ Failed to create case status change notifications:",
        error
      );
      throw error;
    }
  }

  /**
   * Notify about case escalation
   * @param {Object} caseData - Case object
   * @param {number} escalatedBy - User who escalated
   * @param {string} escalationReason - Reason for escalation
   * @returns {Promise<Array>} Created notifications
   */
  static async notifyCaseEscalationAsync(
    caseData,
    escalatedBy,
    escalationReason
  ) {
    try {
      const notifications = [];

      // Notify supervisors/managers
      const supervisors = await this._getSupervisorUsers();
      for (const supervisor of supervisors) {
        if (supervisor.id !== escalatedBy) {
          const notification = await this.createCaseNotificationAsync({
            userId: supervisor.id,
            caseId: caseData.id,
            entityType: "case",
            entityId: caseData.id,
            type: "escalation",
            title: "Case Escalated",
            message: `Case "${caseData.title}" has been escalated. Reason: ${escalationReason}`,
            priority: "high",
            actionUrl: `/cases/view/${caseData.id}`,
            actionText: "Review Case",
            triggerUserId: escalatedBy,
            triggerAction: "escalation",
            metadata: {
              caseNumber: caseData.caseNumber,
              escalationLevel: caseData.escalationLevel,
              escalationReason,
              escalatedBy,
            },
          });
          notifications.push(notification);
        }
      }

      // Notify new assignee if case was reassigned during escalation
      if (caseData.assignedTo?.id && caseData.assignedTo.id !== escalatedBy) {
        const notification = await this.createCaseNotificationAsync({
          userId: caseData.assignedTo.id,
          caseId: caseData.id,
          entityType: "case",
          entityId: caseData.id,
          type: "escalation",
          title: "Escalated Case Assigned",
          message: `Escalated case "${caseData.title}" has been assigned to you.`,
          priority: "high",
          actionUrl: `/cases/view/${caseData.id}`,
          actionText: "Handle Escalation",
          triggerUserId: escalatedBy,
          triggerAction: "escalation_assignment",
          metadata: {
            caseNumber: caseData.caseNumber,
            escalationLevel: caseData.escalationLevel,
            escalationReason,
          },
        });
        notifications.push(notification);
      }

      console.log(
        `✅ Created ${notifications.length} notifications for case escalation`
      );
      return notifications;
    } catch (error) {
      console.error(
        "❌ Failed to create case escalation notifications:",
        error
      );
      throw error;
    }
  }

  /**
   * Notify about case comments
   * @param {Object} caseData - Case object
   * @param {Object} comment - Comment object
   * @param {number} commentedBy - User who added comment
   * @returns {Promise<Array>} Created notifications
   */
  static async notifyCaseCommentAsync(caseData, comment, commentedBy) {
    try {
      const notifications = [];
      const usersToNotify = new Set();

      // Add case submitter (if it's not an internal comment)
      if (
        caseData.submittedBy?.id &&
        caseData.submittedBy.id !== commentedBy &&
        !comment.isInternal
      ) {
        usersToNotify.add(caseData.submittedBy.id);
      }

      // Add assigned user
      if (caseData.assignedTo?.id && caseData.assignedTo.id !== commentedBy) {
        usersToNotify.add(caseData.assignedTo.id);
      }

      // Add mentioned users
      if (comment.mentionedUsers) {
        const mentionedUserIds = Array.isArray(comment.mentionedUsers)
          ? comment.mentionedUsers
          : JSON.parse(comment.mentionedUsers);

        mentionedUserIds.forEach((userId) => {
          if (userId !== commentedBy) {
            usersToNotify.add(userId);
          }
        });
      }

      for (const userId of usersToNotify) {
        const notification = await this.createCaseNotificationAsync({
          userId,
          caseId: caseData.id,
          entityType: "comment",
          entityId: comment.id,
          type: "comment_added",
          title: `New ${comment.commentType} Comment`,
          message: `A new ${comment.commentType} comment has been added to case "${caseData.title}".`,
          priority: comment.requiresFollowUp ? "high" : "normal",
          actionUrl: `/cases/view/${caseData.id}#comments`,
          actionText: "View Comment",
          triggerUserId: commentedBy,
          triggerAction: "comment_added",
          metadata: {
            caseNumber: caseData.caseNumber,
            commentType: comment.commentType,
            requiresFollowUp: comment.requiresFollowUp,
            isInternal: comment.isInternal,
            commentId: comment.id,
          },
        });
        notifications.push(notification);
      }

      console.log(
        `✅ Created ${notifications.length} notifications for case comment`
      );
      return notifications;
    } catch (error) {
      console.error("❌ Failed to create case comment notifications:", error);
      throw error;
    }
  }

  /**
   * Send notification with optional email
   * @param {Object} notificationData - Notification data
   * @param {boolean} [sendEmail=true] - Whether to send email
   * @returns {Promise<Object>} Created notification
   */
  static async sendCaseNotificationAsync(notificationData, sendEmail = true) {
    try {
      // Create the notification
      const notification = await this.createCaseNotificationAsync(
        notificationData
      );

      // Send email if requested (non-blocking)
      if (sendEmail && notification) {
        console.log(
          `📧 Sending email notification for case ${notification.caseId}`
        );
        this._sendEmailNotificationAsync(notification.id).catch((error) => {
          console.error("⚠️ Failed to send email for notification:", error);
        });
      }

      return notification;
    } catch (error) {
      console.error("❌ Failed to send case notification:", error);
      throw error;
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Validate required fields
   * @private
   */
  static _validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ""
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }

  /**
   * Build dynamic INSERT query
   * @private
   */
  static _buildInsertQuery(data) {
    const fieldMappings = this._getFieldMappings();
    const validFields = {};
    const parameters = {};

    Object.entries(data).forEach(([field, value]) => {
      if (fieldMappings[field] && value !== null && value !== undefined) {
        validFields[field] = this._convertValueByType(
          value,
          fieldMappings[field].type,
          field
        );
        parameters[field] = {
          value: validFields[field],
          type: fieldMappings[field].type,
        };
      }
    });

    const fields = Object.keys(validFields);
    const values = fields.map((field) => `@${field}`);

    const query = `
      INSERT INTO Notifications (${fields.join(", ")})
      OUTPUT INSERTED.id
      VALUES (${values.join(", ")})
    `;

    return { query, parameters };
  }

  /**
   * Build SELECT query with joins
   * @private
   */
  static _buildSelectQuery(options = {}) {
    const baseQuery = `
      SELECT 
        n.*,
        u.username as userName,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        tu.username as triggerUserName,
        tu.firstName as triggerUserFirstName,
        tu.lastName as triggerUserLastName,
        c.caseNumber,
        c.title as caseTitle,
        c.urgencyLevel as caseUrgencyLevel,
        cs.name as caseStatusName,
        cc.name as caseCategoryName,
        cp.name as casePriorityName
      FROM Notifications n
      LEFT JOIN Users u ON n.userId = u.id
      LEFT JOIN Users tu ON n.triggerUserId = tu.id
      LEFT JOIN Cases c ON n.caseId = c.id
      LEFT JOIN CaseStatus cs ON c.statusId = cs.id
      LEFT JOIN CaseCategories cc ON c.categoryId = cc.id
      LEFT JOIN CasePriority cp ON c.priorityId = cp.id
    `;

    const conditions = ["n.isActive = 1"];

    if (options.where) {
      conditions.push(options.where);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderClause = options.orderBy ? `ORDER BY ${options.orderBy}` : "";
    const limitClause = options.limit
      ? `OFFSET ${options.offset || 0} ROWS FETCH NEXT ${
          options.limit
        } ROWS ONLY`
      : "";

    return `${baseQuery} ${whereClause} ${orderClause} ${limitClause}`;
  }

  /**
   * Build count query
   * @private
   */
  static _buildCountQuery(whereClause) {
    return `
      SELECT COUNT(*) as total
      FROM Notifications n
      LEFT JOIN Users u ON n.userId = u.id
      LEFT JOIN Cases c ON n.caseId = c.id
      WHERE n.isActive = 1 ${
        whereClause && whereClause !== "n.isActive = 1"
          ? `AND ${whereClause.replace("n.isActive = 1 AND ", "")}`
          : ""
      }
    `;
  }

  /**
   * Build user notifications filter
   * @private
   */
  static _buildUserNotificationsFilter(filters) {
    const conditions = ["n.userId = @userId", "n.isActive = 1"];
    const parameters = {
      userId: { value: parseInt(filters.userId, 10), type: sql.Int },
    };
    let paramCounter = 0;

    // Case ID filter
    if (filters.caseId) {
      const paramName = `caseId${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.caseId, 10),
        type: sql.Int,
      };
      conditions.push(`n.caseId = @${paramName}`);
    }

    // Entity type filter
    if (filters.entityType) {
      const paramName = `entityType${paramCounter++}`;
      parameters[paramName] = { value: filters.entityType, type: sql.NVarChar };
      conditions.push(`n.entityType = @${paramName}`);
    }

    // Type filter
    if (filters.type) {
      const paramName = `type${paramCounter++}`;
      parameters[paramName] = { value: filters.type, type: sql.NVarChar };
      conditions.push(`n.type = @${paramName}`);
    }

    // Priority filter
    if (filters.priority) {
      const paramName = `priority${paramCounter++}`;
      parameters[paramName] = { value: filters.priority, type: sql.NVarChar };
      conditions.push(`n.priority = @${paramName}`);
    }

    // Read status filter
    if (filters.isRead !== undefined) {
      const paramName = `isRead${paramCounter++}`;
      parameters[paramName] = {
        value: filters.isRead === "true" || filters.isRead === true,
        type: sql.Bit,
      };
      conditions.push(`n.isRead = @${paramName}`);
    }

    // Date range filters
    if (filters.dateFrom) {
      const paramName = `dateFrom${paramCounter++}`;
      parameters[paramName] = {
        value: new Date(filters.dateFrom),
        type: sql.DateTime,
      };
      conditions.push(`n.createdAt >= @${paramName}`);
    }

    if (filters.dateTo) {
      const paramName = `dateTo${paramCounter++}`;
      parameters[paramName] = {
        value: new Date(filters.dateTo),
        type: sql.DateTime,
      };
      conditions.push(`n.createdAt <= @${paramName}`);
    }

    // Expiration filter
    if (!filters.includeExpired) {
      conditions.push(`(n.expiresAt IS NULL OR n.expiresAt > GETDATE())`);
    }

    return {
      whereClause: conditions.join(" AND "),
      parameters,
    };
  }

  /**
   * Get field mappings with SQL types - Schema Compliant
   * @private
   */
  static _getFieldMappings() {
    return {
      // Target
      userId: { type: sql.Int },

      // Related Entity
      caseId: { type: sql.Int },
      entityType: { type: sql.NVarChar },
      entityId: { type: sql.Int },

      // Content
      type: { type: sql.NVarChar },
      title: { type: sql.NVarChar },
      message: { type: sql.NVarChar },
      priority: { type: sql.NVarChar },

      // Actions
      actionUrl: { type: sql.NVarChar },
      actionText: { type: sql.NVarChar },

      // Status
      isRead: { type: sql.Bit },
      readAt: { type: sql.DateTime },

      // Email
      isEmailSent: { type: sql.Bit },
      emailSentAt: { type: sql.DateTime },
      emailError: { type: sql.NVarChar },

      // Push
      isPushSent: { type: sql.Bit },
      pushSentAt: { type: sql.DateTime },
      pushError: { type: sql.NVarChar },

      // Metadata
      metadata: { type: sql.NVarChar },

      // Trigger
      triggerUserId: { type: sql.Int },
      triggerAction: { type: sql.NVarChar },

      // Expiration
      expiresAt: { type: sql.DateTime },

      // Audit
      createdAt: { type: sql.DateTime },
      updatedAt: { type: sql.DateTime },

      // Status
      isActive: { type: sql.Bit },
    };
  }

  /**
   * Convert value by SQL type
   * @private
   */
  static _convertValueByType(value, sqlType, fieldName) {
    try {
      if (sqlType === sql.Int) {
        const intValue = parseInt(value, 10);
        if (isNaN(intValue)) {
          throw new Error(
            `Invalid integer value for field ${fieldName}: ${value}`
          );
        }
        return intValue;
      } else if (sqlType === sql.Bit) {
        return (
          value === true || value === "true" || value === "1" || value === 1
        );
      } else if (sqlType === sql.DateTime) {
        const dateValue = value instanceof Date ? value : new Date(value);
        if (isNaN(dateValue.getTime())) {
          throw new Error(
            `Invalid date value for field ${fieldName}: ${value}`
          );
        }
        return dateValue;
      }
      return value;
    } catch (error) {
      throw new Error(
        `Type conversion error for field ${fieldName}: ${error.message}`
      );
    }
  }

  /**
   * Transform database result into notification object
   * @private
   */
  static _transformNotificationResult(result) {
    return {
      id: result.id,
      userId: result.userId,
      user: {
        username: result.userName,
        firstName: result.userFirstName,
        lastName: result.userLastName,
        email: result.userEmail,
      },
      caseId: result.caseId,
      case: result.caseId
        ? {
            id: result.caseId,
            number: result.caseNumber,
            title: result.caseTitle,
            urgencyLevel: result.caseUrgencyLevel,
            status: result.caseStatusName,
            category: result.caseCategoryName,
            priority: result.casePriorityName,
          }
        : null,
      entityType: result.entityType,
      entityId: result.entityId,
      type: result.type,
      title: result.title,
      message: result.message,
      priority: result.priority || "normal",
      actionUrl: result.actionUrl,
      actionText: result.actionText,
      isRead: result.isRead,
      readAt: result.readAt,
      isEmailSent: result.isEmailSent,
      emailSentAt: result.emailSentAt,
      emailError: result.emailError,
      isPushSent: result.isPushSent,
      pushSentAt: result.pushSentAt,
      pushError: result.pushError,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
      triggerUserId: result.triggerUserId,
      triggerUser: result.triggerUserId
        ? {
            username: result.triggerUserName,
            firstName: result.triggerUserFirstName,
            lastName: result.triggerUserLastName,
          }
        : null,
      triggerAction: result.triggerAction,
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      isActive: result.isActive,
    };
  }

  /**
   * Get user notifications summary
   * @private
   */
  static async _getUserNotificationsSummary(userId) {
    try {
      const pool = database.getPool();
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN isRead = 0 THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN isRead = 1 THEN 1 ELSE 0 END) as isRead,
          SUM(CASE WHEN priority = 'high' AND isRead = 0 THEN 1 ELSE 0 END) as unreadHigh,
          SUM(CASE WHEN priority = 'urgent' AND isRead = 0 THEN 1 ELSE 0 END) as unreadUrgent,
          SUM(CASE WHEN caseId IS NOT NULL THEN 1 ELSE 0 END) as caseNotifications,
          SUM(CASE WHEN type = 'case_assigned' AND isRead = 0 THEN 1 ELSE 0 END) as unreadAssignments,
          SUM(CASE WHEN type = 'escalation' AND isRead = 0 THEN 1 ELSE 0 END) as unreadEscalations
        FROM Notifications 
        WHERE userId = @userId AND isActive = 1 
        AND (expiresAt IS NULL OR expiresAt > GETDATE())
      `;

      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(query);

      return (
        result.recordset[0] || {
          total: 0,
          unread: 0,
          isRead: 0,
          unreadHigh: 0,
          unreadUrgent: 0,
          caseNotifications: 0,
          unreadAssignments: 0,
          unreadEscalations: 0,
        }
      );
    } catch (error) {
      console.error("Failed to get user notifications summary:", error);
      return {
        total: 0,
        unread: 0,
        read: 0,
        unreadHigh: 0,
        unreadUrgent: 0,
        caseNotifications: 0,
        unreadAssignments: 0,
        unreadEscalations: 0,
      };
    }
  }

  /**
   * Determine notification priority based on case priority
   * @private
   */
  static _determinePriority(casePriorityLevel) {
    if (!casePriorityLevel) return "normal";

    if (typeof casePriorityLevel === "string") {
      const level = casePriorityLevel.toLowerCase();
      if (level.includes("urgent") || level.includes("critical"))
        return "urgent";
      if (level.includes("high")) return "high";
      if (level.includes("low")) return "low";
      return "normal";
    }

    if (typeof casePriorityLevel === "number") {
      if (casePriorityLevel <= 2) return "urgent";
      if (casePriorityLevel <= 3) return "high";
      if (casePriorityLevel >= 5) return "low";
      return "normal";
    }

    return "normal";
  }

  /**
   * Get supervisor/manager users
   * @private
   */
  static async _getSupervisorUsers() {
    try {
      const pool = database.getPool();
      const query = `
        SELECT id, username, firstName, lastName, email 
        FROM Users 
        WHERE role IN ('manager', 'admin', 'super_admin') 
        AND isActive = 1
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error("Failed to get supervisor users:", error);
      return [];
    }
  }

  /**
   * Send email notification
   * @private
   */
  static async _sendEmailNotificationAsync(notificationId) {
    try {
      // Import EmailController dynamically to avoid circular dependency
      const { EmailController } = await import(
        "../controllers/emailController.js"
      );
      await EmailController.sendNotificationEmail(notificationId);

      // Update email sent status
      await this.updateEmailStatusAsync(notificationId, true);
    } catch (error) {
      console.error(
        `Failed to send email for notification ${notificationId}:`,
        error
      );
      await this.updateEmailStatusAsync(notificationId, false, error.message);
    }
  }

  /**
   * Get empty notification result for permission restrictions
   * @private
   */
  static _getEmptyNotificationResult(limit) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit,
        offset: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      summary: {
        total: 0,
        unread: 0,
        read: 0,
        unreadHigh: 0,
        unreadUrgent: 0,
        caseNotifications: 0,
        unreadAssignments: 0,
        unreadEscalations: 0,
      },
    };
  }
}
