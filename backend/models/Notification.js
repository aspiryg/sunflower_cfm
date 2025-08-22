import { database, sql } from "../config/database.js";
import { EmailController } from "../controllers/emailController.js";

export class Notification {
  /**
   * Creates a new notification in the database.
   * @param {Object} notificationData - The notification data to insert.
   * @returns {Promise<Object>} The created notification object.
   */
  static async createNotificationAsync(notificationData) {
    const pool = database.getPool();

    try {
      // Validate required fields
      this._validateRequiredFields(notificationData, [
        "userId",
        "type",
        "title",
        "message",
      ]);

      // Build notification entry data with defaults
      const notification = {
        userId: notificationData.userId,
        feedbackId: notificationData.feedbackId || null,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority || "normal",
        actionUrl: notificationData.actionUrl || null,
        actionText: notificationData.actionText || null,
        metadata: notificationData.metadata
          ? JSON.stringify(notificationData.metadata)
          : null,
        triggerUserId: notificationData.triggerUserId || null,
        isRead: false,
        isEmailSent: false,
        isActive: true,
        createdAt: new Date(),
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

      console.log(
        `✅ Notification created successfully for user ${notification.userId}`
      );

      // Return the created notification
      return await this.getNotificationByIdAsync(insertedId);
    } catch (error) {
      console.error(" ❌ Failed to create notification:", error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Marks a notification as read.
   * @param {number} notificationId - The ID of the notification to mark as read.
   * @param {number} [userId] - Optional user ID for additional security check.
   * @returns {Promise<Object>} The updated notification object.
   */
  static async markAsReadAsync(notificationId, userId = null) {
    const pool = database.getPool();

    try {
      if (!notificationId) {
        throw new Error("Notification ID is required");
      }

      // Build WHERE clause with optional user check
      let whereClause = "id = @notificationId";
      const parameters = {
        notificationId: { value: parseInt(notificationId, 10), type: sql.Int },
        readAt: { value: new Date(), type: sql.DateTime },
      };

      if (userId) {
        whereClause += " AND userId = @userId";
        parameters.userId = { value: parseInt(userId, 10), type: sql.Int };
      }

      const query = `
        UPDATE Notifications 
        SET isRead = 1, readAt = @readAt
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
      console.error(
        ` ❌ Failed to mark notification ${notificationId} as read:`,
        error
      );
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Marks multiple notifications as read for a user.
   * @param {number} userId - The user ID.
   * @param {Array<number>} [notificationIds] - Optional array of specific notification IDs to mark as read.
   * @returns {Promise<number>} Number of notifications marked as read.
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
        SET isRead = 1, readAt = @readAt
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
      console.error(
        ` ❌ Failed to mark multiple notifications as read for user ${userId}:`,
        error
      );
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  }

  /**
   * Retrieves notifications for a specific user with optional filtering and pagination.
   * @param {number} userId - The user ID.
   * @param {Object} [options={}] - Options for filtering and pagination.
   * @returns {Promise<Object>} Object containing notifications and pagination info.
   */
  static async getNotificationsByUserIdAsync(userId, options = {}) {
    const pool = database.getPool();

    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        // Extract potential permission filters
        userId: permissionUserId, // From permission filtering
        impossible, // Permission filter indicating no access
        // Standard options
        isRead,
        type,
        priority,
        feedbackId,
        dateFrom,
        dateTo,
        limit = 20,
        offset = 0,
        orderBy = "n.createdAt DESC",
        // // Capture other filters
        ...otherFilters
      } = options;

      // Short-circuit if permission filters indicate no access
      if (impossible) {
        console.log(
          "Permission filter indicates no access to notifications, returning empty result"
        );
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
            isRead: 0,
            unreadHigh: 0,
            unreadUrgent: 0,
          },
        };
      }

      // Use permission filter userId if provided, otherwise use the passed userId
      const effectiveUserId = permissionUserId || userId;

      // Build filter conditions including permission filters
      const { whereClause, parameters } = this._buildUserNotificationsFilter({
        userId: effectiveUserId,
        isRead,
        type,
        priority,
        feedbackId,
        dateFrom,
        dateTo,
        ...otherFilters,
      });

      // Build main query
      const dataQuery = this._buildSelectQuery({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

      // Build count query
      const countQuery = this._buildCountQuery(whereClause);

      // Execute both queries
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
        `✅ Retrieved ${result.data.length} notifications for user ${effectiveUserId} (with permission filters)`
      );
      return result;
    } catch (error) {
      console.error(
        ` ❌ Failed to retrieve notifications for user ${userId}:`,
        error
      );
      throw new Error(`Failed to retrieve notifications: ${error.message}`);
    }
  }

  /**
   * Gets all notifications with permission filtering support
   * @param {Object} [options={}] - Query options including permission filters
   * @returns {Promise<Object>} Notifications data with pagination info
   */
  static async getAllNotificationsAsync(options = {}) {
    const pool = database.getPool();

    try {
      const {
        // Extract potential permission filters
        userId, // From permission filtering for "own" access
        impossible, // Permission filter indicating no access
        // Standard options
        isRead,
        type,
        priority,
        feedbackId,
        dateFrom,
        dateTo,
        limit = 20,
        offset = 0,
        orderBy = "n.createdAt DESC",
        // Capture other filters
        ...otherFilters
      } = options;

      // Short-circuit if permission filters indicate no access
      if (impossible) {
        console.log(
          "Permission filter indicates no access to notifications, returning empty result"
        );
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
        };
      }

      // Build filter conditions including permission filters
      const { whereClause, parameters } =
        this._buildNotificationFilterConditions({
          userId, // Permission filter
          isRead,
          type,
          priority,
          feedbackId,
          dateFrom,
          dateTo,
          ...otherFilters,
        });

      // Build main query
      const dataQuery = this._buildSelectQuery({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

      // Build count query
      const countQuery = this._buildCountQuery(whereClause);

      // Execute both queries
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
      };

      console.log(
        `✅ Retrieved ${result.data.length} notifications from ${total} total (with permission filters)`
      );
      return result;
    } catch (error) {
      console.error(" ❌ Failed to retrieve all notifications:", error);
      throw new Error(`Failed to retrieve notifications: ${error.message}`);
    }
  }

  /**
   * Retrieves a single notification by ID.
   * @param {number} notificationId - The notification ID.
   * @param {number} [userId] - Optional user ID for security check.
   * @returns {Promise<Object|null>} The notification object if found, null otherwise.
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
      console.error(
        ` ❌ Failed to retrieve notification ${notificationId}:`,
        error
      );
      throw new Error(`Failed to retrieve notification: ${error.message}`);
    }
  }

  /**
   * Deletes a notification (soft delete).
   * @param {number} notificationId - The notification ID.
   * @param {number} [userId] - Optional user ID for security check.
   * @returns {Promise<boolean>} True if deletion was successful.
   */
  static async deleteNotificationAsync(notificationId, userId = null) {
    const pool = database.getPool();

    try {
      if (!notificationId) {
        throw new Error("Notification ID is required");
      }

      let whereClause = "id = @notificationId";
      const parameters = {
        notificationId: { value: parseInt(notificationId, 10), type: sql.Int },
      };

      if (userId) {
        whereClause += " AND userId = @userId";
        parameters.userId = { value: parseInt(userId, 10), type: sql.Int };
      }

      const query = `UPDATE Notifications SET isActive = 0 WHERE ${whereClause}`;

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(`✅ Notification ${notificationId} deleted successfully`);
        return true;
      } else {
        throw new Error("Notification not found or already deleted");
      }
    } catch (error) {
      console.error(
        ` ❌ Failed to delete notification ${notificationId}:`,
        error
      );
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  /**
   * Updates email sent status for a notification.
   * @param {number} notificationId - The notification ID.
   * @param {boolean} [isEmailSent=true] - Whether email was sent successfully.
   * @returns {Promise<boolean>} True if update was successful.
   */
  static async updateEmailStatusAsync(notificationId, isEmailSent = true) {
    const pool = database.getPool();

    try {
      if (!notificationId) {
        throw new Error("Notification ID is required");
      }

      const query = `
        UPDATE Notifications 
        SET isEmailSent = @isEmailSent, emailSentAt = @emailSentAt
        WHERE id = @notificationId
      `;

      const result = await pool
        .request()
        .input("notificationId", sql.Int, parseInt(notificationId, 10))
        .input("isEmailSent", sql.Bit, isEmailSent)
        .input("emailSentAt", sql.DateTime, isEmailSent ? new Date() : null)
        .query(query);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(
        ` ❌ Failed to update email status for notification ${notificationId}:`,
        error
      );
      throw new Error(`Failed to update email status: ${error.message}`);
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Validates required fields.
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
   * Builds dynamic INSERT query.
   * @private
   */
  static _buildInsertQuery(data) {
    const fieldMappings = this._getFieldMappings();
    const validFields = {};
    const parameters = {};

    // Filter and validate fields
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
   * Builds SELECT query with joins.
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
        f.feedbackNumber,
        f.title as feedbackTitle,
        f.status as feedbackStatus,
        fc.name as feedbackCategory
      FROM Notifications n
      LEFT JOIN Users u ON n.userId = u.id
      LEFT JOIN Users tu ON n.triggerUserId = tu.id
      LEFT JOIN Feedback f ON n.feedbackId = f.id
      LEFT JOIN FeedbackCategories fc ON f.category = fc.id
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
   * Builds count query for pagination.
   * @private
   */
  static _buildCountQuery(whereClause) {
    return `
      SELECT COUNT(*) as total
      FROM Notifications n
      LEFT JOIN Users u ON n.userId = u.id
      LEFT JOIN Users tu ON n.triggerUserId = tu.id
      LEFT JOIN Feedback f ON n.feedbackId = f.id
      WHERE n.isActive = 1 ${
        whereClause && whereClause !== "n.isActive = 1"
          ? `AND ${whereClause.replace("n.isActive = 1 AND ", "")}`
          : ""
      }
    `;
  }

  /**
   * Builds filter conditions for all notifications queries including permission filters.
   * @private
   */
  static _buildNotificationFilterConditions(filters) {
    const conditions = [`n.isActive = 1`];
    const parameters = {};
    let paramCounter = 0;

    // Permission-based user filter (for "own" access)
    if (filters.userId !== undefined) {
      const userParam = `permissionUserId${paramCounter++}`;
      parameters[userParam] = {
        value: parseInt(filters.userId, 10),
        type: sql.Int,
      };
      conditions.push(`n.userId = @${userParam}`);
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

    // Feedback ID filter
    if (filters.feedbackId) {
      const paramName = `feedbackId${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.feedbackId, 10),
        type: sql.Int,
      };
      conditions.push(`n.feedbackId = @${paramName}`);
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

    // Handle any additional permission filters
    Object.entries(filters).forEach(([key, value]) => {
      // Skip already handled fields and null/undefined values
      if (
        [
          "userId",
          "isRead",
          "type",
          "priority",
          "feedbackId",
          "dateFrom",
          "dateTo",
          "limit",
          "offset",
          "orderBy",
        ].includes(key) ||
        value === null ||
        value === undefined
      ) {
        return;
      }

      const paramName = `filter${paramCounter++}`;

      // Determine the appropriate SQL type
      const fieldType = this._getFieldTypeForFilter(key);
      parameters[paramName] = {
        value: this._convertValueByType(value, fieldType, key),
        type: fieldType,
      };
      conditions.push(`n.${key} = @${paramName}`);
    });

    return {
      whereClause: conditions.join(" AND "),
      parameters,
    };
  }

  /**
   * Builds filter conditions for user notifications.
   * @private
   */
  static _buildUserNotificationsFilter(filters) {
    const conditions = [`n.userId = @userId`, `n.isActive = 1`];
    const parameters = {};
    let paramCounter = 0;

    // User ID
    parameters.userId = { value: parseInt(filters.userId, 10), type: sql.Int };

    // Read status filter
    if (filters.isRead !== undefined) {
      const paramName = `isRead${paramCounter++}`;
      parameters[paramName] = {
        value: filters.isRead === "true" || filters.isRead === true,
        type: sql.Bit,
      };
      conditions.push(`n.isRead = @${paramName}`);
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

    // Feedback ID filter
    if (filters.feedbackId) {
      const paramName = `feedbackId${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.feedbackId, 10),
        type: sql.Int,
      };
      conditions.push(`n.feedbackId = @${paramName}`);
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

    return {
      whereClause: conditions.join(" AND "),
      parameters,
    };
  }

  /**
   * Gets field mappings with SQL types.
   * @private
   */
  static _getFieldMappings() {
    return {
      userId: { type: sql.Int },
      feedbackId: { type: sql.Int },
      type: { type: sql.NVarChar },
      title: { type: sql.NVarChar },
      message: { type: sql.NVarChar },
      priority: { type: sql.NVarChar },
      actionUrl: { type: sql.NVarChar },
      actionText: { type: sql.NVarChar },
      metadata: { type: sql.NVarChar },
      triggerUserId: { type: sql.Int },
      isRead: { type: sql.Bit },
      isEmailSent: { type: sql.Bit },
      isActive: { type: sql.Bit },
      createdAt: { type: sql.DateTime },
      readAt: { type: sql.DateTime },
      emailSentAt: { type: sql.DateTime },
    };
  }

  /**
   * Converts value to appropriate type.
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
   * Transforms database result into structured notification object.
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
      feedbackId: result.feedbackId,
      feedback: result.feedbackId
        ? {
            id: result.feedbackId,
            number: result.feedbackNumber,
            title: result.feedbackTitle,
            status: result.feedbackStatus,
            category: {
              name: result.feedbackCategory ? result.feedbackCategory : null,
            },
          }
        : null,
      type: result.type,
      title: result.title,
      message: result.message,
      priority: result.priority || "normal",
      actionUrl: result.actionUrl,
      actionText: result.actionText,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
      triggerUserId: result.triggerUserId,
      triggerUser: result.triggerUserId
        ? {
            username: result.triggerUserName,
            firstName: result.triggerUserFirstName,
            lastName: result.triggerUserLastName,
          }
        : null,
      isRead: result.isRead,
      isEmailSent: result.isEmailSent,
      createdAt: result.createdAt,
      readAt: result.readAt,
      emailSentAt: result.emailSentAt,
      isActive: result.isActive,
    };
  }

  /**
   * Gets notification summary for a user.
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
          SUM(CASE WHEN priority = 'urgent' AND isRead = 0 THEN 1 ELSE 0 END) as unreadUrgent
        FROM Notifications 
        WHERE userId = @userId AND isActive = 1
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
        }
      );
    } catch (error) {
      console.error("Failed to get user notifications summary:", error);
      return { total: 0, unread: 0, isRead: 0, unreadHigh: 0, unreadUrgent: 0 };
    }
  }

  /**
   * Helper method to get SQL type for filter fields
   * @private
   */
  static _getFieldTypeForFilter(fieldName) {
    const fieldMappings = this._getFieldMappings();
    return fieldMappings[fieldName]?.type || sql.NVarChar;
  }

  // ============= CONVENIENCE METHODS FOR FEEDBACK NOTIFICATIONS =============

  /**
   * Creates a notification for new feedback submission.
   * @param {Object} feedback - Feedback object.
   * @param {number} triggerUserId - User who created the feedback.
   * @returns {Promise<Array>} Array of created notifications.
   */
  static async createFeedbackSubmissionNotificationAsync(
    feedback,
    triggerUserId
  ) {
    try {
      const notifications = [];

      // Notify assigned user (if any)
      if (feedback.assignedTo.id && feedback.assignedTo.id !== triggerUserId) {
        const notification = await this.sendNotificationAsync({
          userId: feedback.assignedTo.id,
          feedbackId: feedback.id,
          type: "FEEDBACK_ASSIGNED",
          title: "New Feedback Assigned",
          message: `A new feedback "${feedback.title}" has been assigned to you.`,
          priority: feedback.priority === "urgent" ? "high" : "normal",
          actionUrl: `/feedback/${feedback.id}`,
          actionText: "View Feedback",
          triggerUserId,
          metadata: {
            feedbackNumber: feedback.feedbackNumber,
            category: feedback.category?.name,
            status: feedback.status,
          },
        });
        notifications.push(notification);
      }

      // Notify supervisors/managers (you can implement role-based logic here)
      // Example: Get all users with 'manager' role
      const managers = await this._getManagerUsers();
      console.warn(
        `⚠️ Notifying ${managers.length} managers for feedback submission`
      );
      for (const manager of managers) {
        if (manager.id !== triggerUserId) {
          const notification = await this.createNotificationAsync({
            userId: manager.id,
            feedbackId: feedback.id,
            type: "FEEDBACK_SUBMITTED",
            title: "New Feedback Submitted",
            message: `New feedback "${feedback.title}" has been submitted.`,
            priority: feedback.priority === "urgent" ? "high" : "normal",
            actionUrl: `/feedback/${feedback.id}`,
            actionText: "Review Feedback",
            triggerUserId,
            metadata: {
              feedbackNumber: feedback.feedbackNumber,
              category: feedback.category?.name,
              submitterName: feedback.submittedBy?.firstName,
            },
          });
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error(
        "Failed to create feedback submission notifications:",
        error
      );
      throw error;
    }
  }

  /**
   * Creates a notification for feedback status change.
   * @param {Object} feedback - Feedback object.
   * @param {string} oldStatus - Previous status.
   * @param {string} newStatus - New status.
   * @param {number} triggerUserId - User who changed the status.
   * @returns {Promise<Array>} Array of created notifications.
   */
  static async createStatusChangeNotificationAsync(
    feedback,
    oldStatus,
    newStatus,
    triggerUserId
  ) {
    try {
      const notifications = [];
      const usersToNotify = new Set();

      // Add feedback submitter
      if (feedback.submittedBy && feedback.submittedBy.id !== triggerUserId) {
        usersToNotify.add(feedback.submittedBy);
      }

      // Add assigned user
      if (feedback.assignedTo && feedback.assignedTo.id !== triggerUserId) {
        usersToNotify.add(feedback.assignedTo);
      }

      for (const userId of usersToNotify) {
        const notification = await this.sendNotificationAsync({
          userId,
          feedbackId: feedback.id,
          type: "FEEDBACK_STATUS_CHANGED",
          title: "Feedback Status Updated",
          message: `Feedback "${feedback.title}" status changed from ${oldStatus} to ${newStatus}.`,
          priority:
            newStatus === "resolved" || newStatus === "closed"
              ? "normal"
              : "normal",
          actionUrl: `/feedback/${feedback.id}`,
          actionText: "View Update",
          triggerUserId,
          metadata: {
            feedbackNumber: feedback.feedbackNumber,
            oldStatus,
            newStatus,
            changedBy: triggerUserId,
          },
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Failed to create status change notifications:", error);
      throw error;
    }
  }

  /**
   * Creates a notification for feedback assignment change.
   * @param {Object} feedback - Feedback object.
   * @param {number} oldAssigneeId - Previous assignee ID.
   * @param {number} newAssigneeId - New assignee ID.
   * @param {number} triggerUserId - User who made the assignment.
   * @returns {Promise<Array>} Array of created notifications.
   */
  static async createAssignmentNotificationAsync(
    feedback,
    oldAssigneeId,
    newAssigneeId,
    triggerUserId
  ) {
    try {
      const notifications = [];

      // Notify new assignee
      if (newAssigneeId && newAssigneeId !== triggerUserId) {
        const notification = await this.sendNotificationAsync({
          userId: newAssigneeId,
          feedbackId: feedback.id,
          type: "FEEDBACK_ASSIGNED",
          title: "Feedback Assigned to You",
          message: `Feedback "${feedback.title}" has been assigned to you.`,
          priority: feedback.priority === "urgent" ? "high" : "normal",
          actionUrl: `/feedback/${feedback.id}`,
          actionText: "View Feedback",
          triggerUserId,
          metadata: {
            feedbackNumber: feedback.feedbackNumber,
            category: feedback.category?.name,
            assignedBy: triggerUserId,
          },
        });
        notifications.push(notification);
      }

      // Notify old assignee (if different from new one)
      if (
        oldAssigneeId &&
        oldAssigneeId !== newAssigneeId &&
        oldAssigneeId !== triggerUserId
      ) {
        const notification = await this.sendNotificationAsync({
          userId: oldAssigneeId,
          feedbackId: feedback.id,
          type: "FEEDBACK_UNASSIGNED",
          title: "Feedback Reassigned",
          message: `Feedback "${feedback.title}" has been reassigned to another user.`,
          priority: "normal",
          actionUrl: `/feedback/${feedback.id}`,
          actionText: "View Feedback",
          triggerUserId,
          metadata: {
            feedbackNumber: feedback.feedbackNumber,
            previousAssignee: oldAssigneeId,
            newAssignee: newAssigneeId,
          },
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Failed to create assignment notifications:", error);
      throw error;
    }
  }

  /**
   * Gets manager users for notification purposes.
   * @private
   */
  static async _getManagerUsers() {
    try {
      const pool = database.getPool();
      const query = `
        SELECT id, username, firstName, lastName, email 
        FROM Users 
        WHERE role IN ('manager', 'admin', 'supervisor') 
        AND isActive = 1
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error("Failed to get manager users:", error);
      return [];
    }
  }

  // TODO : -----
  static async sendNotificationAsync(notificationData, sendEmail = true) {
    try {
      // Create notification using existing logic
      const notification = await this.createNotificationAsync(notificationData);
      // console.log(notification);

      // Send email notification if requested
      if (sendEmail && notification) {
        try {
          await EmailController.sendNotificationEmail(notification.id);
        } catch (emailError) {
          console.error("Failed to send email for notification:", emailError);
          // Don't fail notification creation if email fails
        }
      }

      return notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }
}
