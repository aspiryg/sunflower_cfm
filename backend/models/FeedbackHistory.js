import { database, sql } from "../config/database.js";

export class FeedbackHistory {
  /**
   * Adds a new history entry to track feedback changes.
   * @param {Object} historyData - The history data to insert.
   * @returns {Promise<Object>} The created history entry.
   */
  static async addHistoryEntryAsync(historyData) {
    const pool = database.getPool();

    try {
      // Validate required fields based on your existing schema
      this._validateRequiredFields(historyData, [
        "feedbackId",
        "status",
        "updatedBy",
      ]);

      // Build history entry data with defaults
      const historyEntry = {
        feedbackId: historyData.feedbackId,
        status: historyData.status,
        assignedTo: historyData.assignedTo || null,
        updatedBy: historyData.updatedBy,
        updatedAt: historyData.updatedAt || new Date(),
        comments: historyData.comments || null,
        // Enhanced fields (if columns exist)
        actionType: historyData.actionType || "STATUS_CHANGE",
        fieldName: historyData.fieldName || "status",
        oldValue: historyData.oldValue || null,
        newValue: historyData.newValue || historyData.status,
        isActive:
          historyData.isActive !== undefined ? historyData.isActive : true,
      };

      // Build dynamic insert query
      const { query, parameters } = this._buildInsertQuery(historyEntry);

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);
      const insertedId = result.recordset?.[0]?.id;

      console.log(
        `✅ History entry created successfully for feedback ${historyEntry.feedbackId}`
      );

      // Return the created history entry
      return await this.getHistoryEntryAsync(insertedId);
    } catch (error) {
      console.error(" ❌ Failed to add history entry:", error);
      throw new Error(`Failed to add history entry: ${error.message}`);
    }
  }

  /**
   * Retrieves all history entries with optional filtering and pagination.
   * @param {Object} [options={}] - Options for filtering and pagination.
   * @returns {Promise<Array>} Array of history objects.
   */
  static async getAllHistoryEntriesAsync(options = {}) {
    const pool = database.getPool();

    try {
      const {
        feedbackId,
        status,
        assignedTo,
        updatedBy,
        actionType,
        dateFrom,
        dateTo,
        limit,
        offset,
        orderBy = "fh.updatedAt DESC",
      } = options;

      // Build dynamic WHERE clause
      const { whereClause, parameters } = this._buildFilterConditions({
        feedbackId,
        status,
        assignedTo,
        updatedBy,
        actionType,
        dateFrom,
        dateTo,
      });

      // Build the complete query
      const query = this._buildSelectQuery({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      console.log(`✅ Retrieved ${result.recordset.length} history entries`);
      return result.recordset.map(this._transformHistoryResult);
    } catch (error) {
      console.error(" ❌ Failed to retrieve history entries:", error);
      throw new Error(`Failed to retrieve history entries: ${error.message}`);
    }
  }

  /**
   * Retrieves a single history entry by ID.
   * @param {number} id - The ID of the history entry to retrieve.
   * @returns {Promise<Object|null>} The history entry if found, null otherwise.
   */
  static async getHistoryEntryAsync(id) {
    const pool = database.getPool();

    try {
      if (!id) {
        throw new Error("History entry ID is required");
      }

      const query = this._buildSelectQuery({
        where: "fh.id = @id",
      });

      const result = await pool
        .request()
        .input("id", sql.Int, parseInt(id, 10))
        .query(query);

      if (result.recordset.length > 0) {
        return this._transformHistoryResult(result.recordset[0]);
      }

      return null;
    } catch (error) {
      console.error(" ❌ Failed to retrieve history entry:", error);
      throw new Error(`Failed to retrieve history entry: ${error.message}`);
    }
  }

  /**
   * Retrieves all history entries for a specific feedback.
   * @param {number} feedbackId - The ID of the feedback.
   * @param {Object} [options={}] - Additional options for filtering and pagination.
   * @returns {Promise<Array>} Array of history entries for the feedback.
   */
  static async getHistoryByFeedbackIdAsync(feedbackId, options = {}) {
    const pool = database.getPool();

    try {
      if (!feedbackId) {
        throw new Error("Feedback ID is required");
      }

      const {
        status,
        assignedTo,
        updatedBy,
        actionType,
        dateFrom,
        dateTo,
        limit,
        offset,
        orderBy = "fh.updatedAt DESC",
      } = options;

      // Build filter conditions with feedbackId as primary filter
      const { whereClause, parameters } = this._buildFilterConditions({
        feedbackId,
        status,
        assignedTo,
        updatedBy,
        actionType,
        dateFrom,
        dateTo,
      });

      // Build the complete query
      const query = this._buildSelectQuery({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      console.log(
        `✅ Retrieved ${result.recordset.length} history entries for feedback ${feedbackId}`
      );
      return result.recordset.map(this._transformHistoryResult);
    } catch (error) {
      console.error(
        ` ❌ Failed to retrieve history for feedback ${feedbackId}:`,
        error
      );
      throw new Error(`Failed to retrieve feedback history: ${error.message}`);
    }
  }

  /**
   * Soft deletes a history entry by ID.
   * @param {number} id - The ID of the history entry to delete.
   * @returns {Promise<boolean>} True if deletion was successful.
   */
  static async deleteHistoryEntryAsync(id) {
    const pool = database.getPool();

    try {
      if (!id) {
        throw new Error("History entry ID is required");
      }

      // Check if history entry exists
      const existingEntry = await this.getHistoryEntryAsync(id);
      if (!existingEntry) {
        throw new Error(`History entry with ID ${id} not found`);
      }

      // Check if isActive column exists, if not just delete the record
      const checkColumnQuery = `
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'FeedbackHistory' AND COLUMN_NAME = 'isActive'
      `;

      const columnCheck = await pool.request().query(checkColumnQuery);
      const hasIsActiveColumn = columnCheck.recordset[0].count > 0;

      let query;
      if (hasIsActiveColumn) {
        // Soft delete by updating isActive flag
        query = `UPDATE FeedbackHistory SET isActive = 0 WHERE id = @id`;
      } else {
        // Hard delete if no isActive column
        query = `DELETE FROM FeedbackHistory WHERE id = @id`;
      }

      const result = await pool
        .request()
        .input("id", sql.Int, parseInt(id, 10))
        .query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(`✅ History entry ${id} deleted successfully`);
        return true;
      } else {
        throw new Error("No rows were affected during deletion");
      }
    } catch (error) {
      console.error(` ❌ Failed to delete history entry ${id}:`, error);
      throw new Error(`Failed to delete history entry: ${error.message}`);
    }
  }

  /**
   * Gets history summary for a feedback (counts by status).
   * @param {number} feedbackId - The ID of the feedback.
   * @returns {Promise<Object>} Summary of history actions.
   */
  static async getHistorySummaryAsync(feedbackId) {
    const pool = database.getPool();

    try {
      if (!feedbackId) {
        throw new Error("Feedback ID is required");
      }

      const query = `
        SELECT 
          status,
          COUNT(*) as count,
          MIN(updatedAt) as firstUpdate,
          MAX(updatedAt) as lastUpdate
        FROM FeedbackHistory 
        WHERE feedbackId = @feedbackId
        ${(await this._hasColumn("isActive")) ? "AND isActive = 1" : ""}
        GROUP BY status
        ORDER BY lastUpdate DESC
      `;

      const result = await pool
        .request()
        .input("feedbackId", sql.Int, feedbackId)
        .query(query);

      return {
        feedbackId,
        summary: result.recordset,
        totalChanges: result.recordset.reduce(
          (sum, item) => sum + item.count,
          0
        ),
      };
    } catch (error) {
      console.error(
        ` ❌ Failed to get history summary for feedback ${feedbackId}:`,
        error
      );
      throw new Error(`Failed to get history summary: ${error.message}`);
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
   * Builds dynamic INSERT query that adapts to existing schema.
   * @private
   */
  static _buildInsertQuery(data) {
    // Core fields that definitely exist in your schema
    const coreFields = {
      feedbackId: { type: sql.Int },
      status: { type: sql.NVarChar },
      assignedTo: { type: sql.Int },
      updatedBy: { type: sql.Int },
      updatedAt: { type: sql.DateTime },
      comments: { type: sql.NVarChar },
    };

    // Enhanced fields that might exist
    const enhancedFields = {
      actionType: { type: sql.NVarChar },
      fieldName: { type: sql.NVarChar },
      oldValue: { type: sql.NVarChar },
      newValue: { type: sql.NVarChar },
      isActive: { type: sql.Bit },
    };

    const validFields = {};
    const parameters = {};

    // Always include core fields
    Object.entries(coreFields).forEach(([field, config]) => {
      if (data[field] !== undefined && data[field] !== null) {
        validFields[field] = this._convertValueByType(
          data[field],
          config.type,
          field
        );
        parameters[field] = {
          value: validFields[field],
          type: config.type,
        };
      }
    });

    // Include enhanced fields if they exist in the data
    Object.entries(enhancedFields).forEach(([field, config]) => {
      if (data[field] !== undefined && data[field] !== null) {
        validFields[field] = this._convertValueByType(
          data[field],
          config.type,
          field
        );
        parameters[field] = {
          value: validFields[field],
          type: config.type,
        };
      }
    });

    const fields = Object.keys(validFields);
    const values = fields.map((field) => `@${field}`);

    const query = `
      INSERT INTO FeedbackHistory (${fields.join(", ")})
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
        fh.*,
        f.feedbackNumber,
        f.title as feedbackTitle,
        ub.username as updatedByUsername,
        ub.firstName as updatedByFirstName,
        ub.lastName as updatedByLastName,
        ub.email as updatedByEmail,
        ub.role as updatedByRole,
        ub.profilePicture as updatedByProfilePicture,
        at.username as assignedToUsername,
        at.firstName as assignedToFirstName,
        at.lastName as assignedToLastName,
        at.email as assignedToEmail,
        at.role as assignedToRole,
        at.profilePicture as assignedToProfilePicture
      FROM FeedbackHistory fh
      LEFT JOIN Feedback f ON fh.feedbackId = f.id
      LEFT JOIN Users ub ON fh.updatedBy = ub.id
      LEFT JOIN Users at ON fh.assignedTo = at.id
    `;

    const conditions = [];

    // Add isActive filter if column exists
    conditions.push(`(fh.isActive = 1 OR fh.isActive IS NULL)`);

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
   * Builds filter conditions for WHERE clause.
   * @private
   */
  static _buildFilterConditions(filters) {
    const conditions = [];
    const parameters = {};
    let paramCounter = 0;

    // Feedback ID filter
    if (filters.feedbackId) {
      const paramName = `feedbackId${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.feedbackId, 10),
        type: sql.Int,
      };
      conditions.push(`fh.feedbackId = @${paramName}`);
    }

    // Status filter
    if (filters.status) {
      const paramName = `status${paramCounter++}`;
      parameters[paramName] = { value: filters.status, type: sql.NVarChar };
      conditions.push(`fh.status = @${paramName}`);
    }

    // Assigned to filter
    if (filters.assignedTo) {
      const paramName = `assignedTo${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.assignedTo, 10),
        type: sql.Int,
      };
      conditions.push(`fh.assignedTo = @${paramName}`);
    }

    // Updated by filter
    if (filters.updatedBy) {
      const paramName = `updatedBy${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.updatedBy, 10),
        type: sql.Int,
      };
      conditions.push(`fh.updatedBy = @${paramName}`);
    }

    // Action type filter (if column exists)
    if (filters.actionType) {
      const paramName = `actionType${paramCounter++}`;
      parameters[paramName] = { value: filters.actionType, type: sql.NVarChar };
      conditions.push(`fh.actionType = @${paramName}`);
    }

    // Date range filters
    if (filters.dateFrom) {
      const paramName = `dateFrom${paramCounter++}`;
      parameters[paramName] = {
        value: new Date(filters.dateFrom),
        type: sql.DateTime,
      };
      conditions.push(`fh.updatedAt >= @${paramName}`);
    }

    if (filters.dateTo) {
      const paramName = `dateTo${paramCounter++}`;
      parameters[paramName] = {
        value: new Date(filters.dateTo),
        type: sql.DateTime,
      };
      conditions.push(`fh.updatedAt <= @${paramName}`);
    }

    return {
      whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1=1",
      parameters,
    };
  }

  /**
   * Converts value to appropriate type based on SQL type.
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
   * Transforms database result into structured history object.
   * @private
   */
  static _transformHistoryResult(result) {
    return {
      id: result.id,
      feedbackId: result.feedbackId,
      feedback: {
        number: result.feedbackNumber,
        title: result.feedbackTitle,
      },
      status: result.status,
      assignedTo: result.assignedTo
        ? {
            id: result.assignedTo,
            username: result.assignedToUsername,
            firstName: result.assignedToFirstName,
            lastName: result.assignedToLastName,
            email: result.assignedToEmail,
            role: result.assignedToRole,
            profilePicture: result.assignedToProfilePicture,
          }
        : null,
      updatedBy: {
        id: result.updatedBy,
        username: result.updatedByUsername,
        firstName: result.updatedByFirstName,
        lastName: result.updatedByLastName,
        email: result.updatedByEmail,
        role: result.updatedByRole,
        profilePicture: result.updatedByProfilePicture,
      },
      updatedAt: result.updatedAt,
      comments: result.comments,
      // Enhanced fields (if they exist)
      actionType: result.actionType || null,
      fieldName: result.fieldName || null,
      oldValue: result.oldValue || null,
      newValue: result.newValue || null,
      isActive: result.isActive !== undefined ? result.isActive : true,
    };
  }

  /**
   * Checks if a column exists in the table.
   * @private
   */
  static async _hasColumn(columnName) {
    try {
      const pool = database.getPool();
      const query = `
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'FeedbackHistory' AND COLUMN_NAME = @columnName
      `;
      const result = await pool
        .request()
        .input("columnName", sql.NVarChar, columnName)
        .query(query);
      return result.recordset[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  // ============= CONVENIENCE METHODS =============

  /**
   * Records a status change for feedback.
   * @param {number} feedbackId - Feedback ID.
   * @param {string} newStatus - New status.
   * @param {string} oldStatus - Previous status.
   * @param {number} updatedBy - User who made the change.
   * @param {string} [comments] - Optional comments.
   * @param {number} [assignedTo] - Optional assignment.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordStatusChangeAsync(
    feedbackId,
    newStatus,
    oldStatus,
    updatedBy,
    comments = null,
    assignedTo = null
  ) {
    // TODO: Check if the new status is "closed" or "resolved"
    if (newStatus === "closed" || newStatus === "resolved") {
      // Creating a closure for the feedback
      return await this.addHistoryEntryAsync({
        feedbackId,
        status: newStatus,
        updatedBy,
        assignedTo,
        comments: comments || `Feedback ${newStatus}`,
        actionType: "CLOSURE",
        fieldName: "status",
        oldValue: oldStatus,
        newValue: newStatus,
      });
    }
    return await this.addHistoryEntryAsync({
      feedbackId,
      status: newStatus,
      updatedBy,
      assignedTo,
      comments: comments || `Status changed from ${oldStatus} to ${newStatus}`,
      actionType: "STATUS_CHANGE",
      fieldName: "status",
      oldValue: oldStatus,
      newValue: newStatus,
    });
  }

  /**
   * Records an assignment change for feedback.
   * @param {number} feedbackId - Feedback ID.
   * @param {number} newAssignedTo - New assignee ID.
   * @param {number} oldAssignedTo - Previous assignee ID.
   * @param {number} updatedBy - User who made the assignment.
   * @param {string} status - Current status.
   * @param {string} [comments] - Optional comments.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordAssignmentChangeAsync(
    feedbackId,
    newAssignedTo,
    oldAssignedTo,
    updatedBy,
    status,
    comments = null
  ) {
    return await this.addHistoryEntryAsync({
      feedbackId,
      status,
      assignedTo: newAssignedTo,
      updatedBy,
      comments: comments || `Assignment changed`,
      actionType: "ASSIGNMENT_CHANGE",
      fieldName: "assignedTo",
      oldValue: oldAssignedTo?.toString() || null,
      newValue: newAssignedTo?.toString(),
    });
  }

  /**
   * Records a feedback creation event.
   * @param {number} feedbackId - Feedback ID.
   * @param {string} status - Initial status.
   * @param {number} createdBy - User who created the feedback.
   * @param {string} [comments] - Optional comments.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordFeedbackCreationAsync(
    feedbackId,
    status = "CREATED",
    assignedTo = null,
    createdBy,
    comments = null
  ) {
    return await this.addHistoryEntryAsync({
      feedbackId,
      status,
      assignedTo,
      updatedBy: createdBy,
      comments: comments || "Feedback created",
      actionType: "CREATION",
      fieldName: "status",
      oldValue: null,
      newValue: status,
    });
  }
}
