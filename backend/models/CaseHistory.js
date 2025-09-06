import { database, sql } from "../config/database.js";

export class CaseHistory {
  /**
   * Adds a new history entry to track case changes.
   * @param {Object} historyData - The history data to insert.
   * @returns {Promise<Object>} The created history entry.
   */
  static async addHistoryEntryAsync(historyData) {
    const pool = database.getPool();

    try {
      // Validate required fields
      this._validateRequiredFields(historyData, [
        "caseId",
        "actionType",
        "createdBy",
      ]);

      // Build history entry data with defaults
      const historyEntry = {
        caseId: historyData.caseId,
        actionType: historyData.actionType,
        fieldName: historyData.fieldName || null,
        oldValue: historyData.oldValue || null,
        newValue: historyData.newValue || null,
        changeDescription: historyData.changeDescription || null,
        comments: historyData.comments || null,

        // Assignment specific fields
        assignedTo: historyData.assignedTo || null,
        assignedBy: historyData.assignedBy || null,
        assignmentComments: historyData.assignmentComments || null,

        // Status specific fields
        statusId: historyData.statusId || null,
        statusReason: historyData.statusReason || null,

        // System tracking
        ipAddress: historyData.ipAddress || null,
        userAgent: historyData.userAgent || null,

        // Audit fields
        createdAt: historyData.createdAt || new Date(),
        createdBy: historyData.createdBy,
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

      if (!insertedId) {
        throw new Error("Failed to get inserted history entry ID");
      }

      console.log(
        `✅ History entry created successfully for case ${historyEntry.caseId} - ${historyEntry.actionType}`
      );

      // Return the created history entry
      return await this.getHistoryEntryAsync(insertedId);
    } catch (error) {
      console.error("❌ Failed to add history entry:", error);
      throw new Error(`Failed to add history entry: ${error.message}`);
    }
  }

  /**
   * Retrieves all history entries with optional filtering and pagination.
   * @param {Object} [options={}] - Options for filtering and pagination.
   * @returns {Promise<Object>} Object with data and pagination info.
   */
  static async getAllHistoryEntriesAsync(options = {}) {
    const pool = database.getPool();

    try {
      const {
        caseId,
        actionType,
        fieldName,
        assignedTo,
        createdBy,
        statusId,
        dateFrom,
        dateTo,
        limit = 20,
        offset = 0,
        orderBy = "ch.createdAt DESC",
      } = options;

      // Build dynamic WHERE clause
      const { whereClause, parameters } = this._buildFilterConditions({
        caseId,
        actionType,
        fieldName,
        assignedTo,
        createdBy,
        statusId,
        dateFrom,
        dateTo,
      });

      // Build the complete query
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
      const currentPage = Math.floor(offset / limit) + 1;

      const result = {
        data: dataResult.recordset.map(this._transformHistoryResult),
        pagination: {
          page: currentPage,
          limit,
          offset,
          total,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      };

      console.log(
        `✅ Retrieved ${result.data.length} history entries from ${total} total`
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to retrieve history entries:", error);
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
        where: "ch.id = @id",
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
      console.error("❌ Failed to retrieve history entry:", error);
      throw new Error(`Failed to retrieve history entry: ${error.message}`);
    }
  }

  /**
   * Retrieves all history entries for a specific case.
   * @param {number} caseId - The ID of the case.
   * @param {Object} [options={}] - Additional options for filtering and pagination.
   * @returns {Promise<Object>} Object with history data and pagination info.
   */
  static async getHistoryByCaseIdAsync(caseId, options = {}) {
    const pool = database.getPool();

    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const {
        actionType,
        fieldName,
        assignedTo,
        createdBy,
        statusId,
        dateFrom,
        dateTo,
        limit = 50,
        offset = 0,
        orderBy = "ch.createdAt DESC",
      } = options;

      // Build filter conditions with caseId as primary filter
      const { whereClause, parameters } = this._buildFilterConditions({
        caseId,
        actionType,
        fieldName,
        assignedTo,
        createdBy,
        statusId,
        dateFrom,
        dateTo,
      });

      // Build the complete query
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
      const currentPage = Math.floor(offset / limit) + 1;

      const result = {
        data: dataResult.recordset.map(this._transformHistoryResult),
        pagination: {
          page: currentPage,
          limit,
          offset,
          total,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
        summary: await this._getCaseHistorySummary(caseId),
      };

      console.log(
        `✅ Retrieved ${result.data.length} history entries for case ${caseId} from ${total} total`
      );
      return result;
    } catch (error) {
      console.error(`❌ Failed to retrieve history for case ${caseId}:`, error);
      throw new Error(`Failed to retrieve case history: ${error.message}`);
    }
  }

  /**
   * Soft deletes a history entry by ID.
   * @param {number} id - The ID of the history entry to delete.
   * @param {number} deletedBy - The user performing the deletion.
   * @returns {Promise<boolean>} True if deletion was successful.
   */
  static async deleteHistoryEntryAsync(id, deletedBy) {
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

      // Soft delete by updating isActive flag
      const query = `UPDATE CaseHistory SET isActive = 0 WHERE id = @id`;

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
      console.error(`❌ Failed to delete history entry ${id}:`, error);
      throw new Error(`Failed to delete history entry: ${error.message}`);
    }
  }

  /**
   * Gets history summary for a case (counts by action type).
   * @param {number} caseId - The ID of the case.
   * @returns {Promise<Object>} Summary of history actions.
   */
  static async getCaseHistorySummaryAsync(caseId) {
    const pool = database.getPool();

    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const query = `
        SELECT 
          actionType,
          COUNT(*) as count,
          MIN(createdAt) as firstOccurrence,
          MAX(createdAt) as lastOccurrence
        FROM CaseHistory 
        WHERE caseId = @caseId AND isActive = 1
        GROUP BY actionType
        ORDER BY lastOccurrence DESC
      `;

      const result = await pool
        .request()
        .input("caseId", sql.Int, parseInt(caseId, 10))
        .query(query);

      return {
        caseId,
        summary: result.recordset,
        totalChanges: result.recordset.reduce(
          (sum, item) => sum + item.count,
          0
        ),
      };
    } catch (error) {
      console.error(
        `❌ Failed to get history summary for case ${caseId}:`,
        error
      );
      throw new Error(`Failed to get history summary: ${error.message}`);
    }
  }

  // ============= CONVENIENCE METHODS FOR DIFFERENT ACTION TYPES =============

  /**
   * Records a case creation event.
   * @param {number} caseId - Case ID.
   * @param {number} statusId - Initial status ID.
   * @param {number} assignedTo - Initial assignee (optional).
   * @param {number} createdBy - User who created the case.
   * @param {string} [comments] - Optional comments.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordCaseCreationAsync(
    caseId,
    statusId,
    assignedTo = null,
    createdBy,
    comments = null
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "CREATION",
      fieldName: "status",
      oldValue: null,
      newValue: statusId?.toString(),
      changeDescription: "Case created",
      comments: comments || "Case created in the system",
      assignedTo,
      assignedBy: createdBy,
      statusId,
      createdBy,
    });
  }

  /**
   * Records a status change for case.
   * @param {number} caseId - Case ID.
   * @param {number} newStatusId - New status ID.
   * @param {number} oldStatusId - Previous status ID.
   * @param {number} updatedBy - User who made the change.
   * @param {string} [statusReason] - Reason for status change.
   * @param {string} [comments] - Optional comments.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordStatusChangeAsync(
    caseId,
    newStatusId,
    oldStatusId,
    updatedBy,
    statusReason = null,
    comments = null
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "STATUS_CHANGE",
      fieldName: "statusId",
      oldValue: oldStatusId?.toString(),
      newValue: newStatusId?.toString(),
      changeDescription: `Status changed from ${oldStatusId} to ${newStatusId}`,
      comments: comments || statusReason,
      statusId: newStatusId,
      statusReason,
      createdBy: updatedBy,
    });
  }

  /**
   * Records an assignment change for case.
   * @param {number} caseId - Case ID.
   * @param {number} newAssignedTo - New assignee ID.
   * @param {number} oldAssignedTo - Previous assignee ID.
   * @param {number} assignedBy - User who made the assignment.
   * @param {string} [assignmentComments] - Comments about assignment.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordAssignmentChangeAsync(
    caseId,
    newAssignedTo,
    oldAssignedTo,
    assignedBy,
    assignmentComments = null
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "ASSIGNMENT_CHANGE",
      fieldName: "assignedTo",
      oldValue: oldAssignedTo?.toString(),
      newValue: newAssignedTo?.toString(),
      changeDescription: "Case assignment changed",
      comments: assignmentComments || "Case reassigned",
      assignedTo: newAssignedTo,
      assignedBy,
      assignmentComments,
      createdBy: assignedBy,
    });
  }

  /**
   * Records a priority change for case.
   * @param {number} caseId - Case ID.
   * @param {number} newPriorityId - New priority ID.
   * @param {number} oldPriorityId - Previous priority ID.
   * @param {number} updatedBy - User who made the change.
   * @param {string} [comments] - Optional comments.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordPriorityChangeAsync(
    caseId,
    newPriorityId,
    oldPriorityId,
    updatedBy,
    comments = null
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "PRIORITY_CHANGE",
      fieldName: "priorityId",
      oldValue: oldPriorityId?.toString(),
      newValue: newPriorityId?.toString(),
      changeDescription: `Priority changed from ${oldPriorityId} to ${newPriorityId}`,
      comments: comments || "Case priority updated",
      createdBy: updatedBy,
    });
  }

  /**
   * Records a category change for case.
   * @param {number} caseId - Case ID.
   * @param {number} newCategoryId - New category ID.
   * @param {number} oldCategoryId - Previous category ID.
   * @param {number} updatedBy - User who made the change.
   * @param {string} [comments] - Optional comments.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordCategoryChangeAsync(
    caseId,
    newCategoryId,
    oldCategoryId,
    updatedBy,
    comments = null
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "CATEGORY_CHANGE",
      fieldName: "categoryId",
      oldValue: oldCategoryId?.toString(),
      newValue: newCategoryId?.toString(),
      changeDescription: `Category changed from ${oldCategoryId} to ${newCategoryId}`,
      comments: comments || "Case category updated",
      createdBy: updatedBy,
    });
  }

  /**
   * Records an escalation event.
   * @param {number} caseId - Case ID.
   * @param {number} escalationLevel - New escalation level.
   * @param {number} escalatedBy - User who escalated.
   * @param {string} escalationReason - Reason for escalation.
   * @param {number} [escalatedTo] - User escalated to (optional).
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordEscalationAsync(
    caseId,
    escalationLevel,
    escalatedBy,
    escalationReason,
    escalatedTo = null
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "ESCALATION",
      fieldName: "escalationLevel",
      oldValue: (escalationLevel - 1).toString(),
      newValue: escalationLevel.toString(),
      changeDescription: `Case escalated to level ${escalationLevel}`,
      comments: escalationReason,
      assignedTo: escalatedTo,
      assignedBy: escalatedBy,
      createdBy: escalatedBy,
    });
  }

  /**
   * Records a case resolution.
   * @param {number} caseId - Case ID.
   * @param {number} statusId - Resolution status ID.
   * @param {string} resolutionSummary - Summary of resolution.
   * @param {number} resolvedBy - User who resolved the case.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordResolutionAsync(
    caseId,
    statusId,
    resolutionSummary,
    resolvedBy
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "RESOLUTION",
      fieldName: "statusId",
      newValue: statusId?.toString(),
      changeDescription: "Case resolved",
      comments: resolutionSummary,
      statusId,
      createdBy: resolvedBy,
    });
  }

  /**
   * Records when a comment is added to a case.
   * @param {number} caseId - Case ID.
   * @param {number} commentId - ID of the added comment.
   * @param {number} createdBy - User who added the comment.
   * @param {string} [commentType] - Type of comment added.
   * @returns {Promise<Object>} Created history entry.
   */
  static async recordCommentAddedAsync(
    caseId,
    commentId,
    createdBy,
    commentType = "internal"
  ) {
    return await this.addHistoryEntryAsync({
      caseId,
      actionType: "COMMENT_ADDED",
      fieldName: "comments",
      newValue: commentId?.toString(),
      changeDescription: `${commentType} comment added`,
      comments: `New ${commentType} comment added to case`,
      createdBy,
    });
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
      INSERT INTO CaseHistory (${fields.join(", ")})
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
        ch.*,
        c.caseNumber,
        c.title as caseTitle,
        cb.username as createdByUsername,
        cb.firstName as createdByFirstName,
        cb.lastName as createdByLastName,
        cb.email as createdByEmail,
        cb.role as createdByRole,
        cb.profilePicture as createdByProfilePicture,
        at.username as assignedToUsername,
        at.firstName as assignedToFirstName,
        at.lastName as assignedToLastName,
        at.email as assignedToEmail,
        at.role as assignedToRole,
        at.profilePicture as assignedToProfilePicture,
        ab.username as assignedByUsername,
        ab.firstName as assignedByFirstName,
        ab.lastName as assignedByLastName,
        ab.email as assignedByEmail,
        ab.role as assignedByRole,
        st.name as statusName,
        st.arabicName as statusArabicName,
        st.color as statusColor
      FROM CaseHistory ch
      LEFT JOIN Cases c ON ch.caseId = c.id
      LEFT JOIN Users cb ON ch.createdBy = cb.id
      LEFT JOIN Users at ON ch.assignedTo = at.id
      LEFT JOIN Users ab ON ch.assignedBy = ab.id
      LEFT JOIN CaseStatus st ON ch.statusId = st.id
    `;

    const conditions = ["ch.isActive = 1"];

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
      FROM CaseHistory ch
      LEFT JOIN Cases c ON ch.caseId = c.id
      LEFT JOIN Users cb ON ch.createdBy = cb.id
      LEFT JOIN Users at ON ch.assignedTo = at.id
      LEFT JOIN Users ab ON ch.assignedBy = ab.id
      LEFT JOIN CaseStatus st ON ch.statusId = st.id
      WHERE ch.isActive = 1 ${
        whereClause && whereClause !== "ch.isActive = 1"
          ? `AND ${whereClause.replace("ch.isActive = 1 AND ", "")}`
          : ""
      }
    `;
  }

  /**
   * Builds filter conditions for WHERE clause.
   * @private
   */
  static _buildFilterConditions(filters) {
    const conditions = [];
    const parameters = {};
    let paramCounter = 0;

    // Case ID filter
    if (filters.caseId) {
      const paramName = `caseId${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.caseId, 10),
        type: sql.Int,
      };
      conditions.push(`ch.caseId = @${paramName}`);
    }

    // Action type filter
    if (filters.actionType) {
      const paramName = `actionType${paramCounter++}`;
      parameters[paramName] = { value: filters.actionType, type: sql.NVarChar };
      conditions.push(`ch.actionType = @${paramName}`);
    }

    // Field name filter
    if (filters.fieldName) {
      const paramName = `fieldName${paramCounter++}`;
      parameters[paramName] = { value: filters.fieldName, type: sql.NVarChar };
      conditions.push(`ch.fieldName = @${paramName}`);
    }

    // Assigned to filter
    if (filters.assignedTo) {
      const paramName = `assignedTo${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.assignedTo, 10),
        type: sql.Int,
      };
      conditions.push(`ch.assignedTo = @${paramName}`);
    }

    // Created by filter
    if (filters.createdBy) {
      const paramName = `createdBy${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.createdBy, 10),
        type: sql.Int,
      };
      conditions.push(`ch.createdBy = @${paramName}`);
    }

    // Status ID filter
    if (filters.statusId) {
      const paramName = `statusId${paramCounter++}`;
      parameters[paramName] = {
        value: parseInt(filters.statusId, 10),
        type: sql.Int,
      };
      conditions.push(`ch.statusId = @${paramName}`);
    }

    // Date range filters
    if (filters.dateFrom) {
      const paramName = `dateFrom${paramCounter++}`;
      parameters[paramName] = {
        value: new Date(filters.dateFrom),
        type: sql.DateTime,
      };
      conditions.push(`ch.createdAt >= @${paramName}`);
    }

    if (filters.dateTo) {
      const paramName = `dateTo${paramCounter++}`;
      parameters[paramName] = {
        value: new Date(filters.dateTo),
        type: sql.DateTime,
      };
      conditions.push(`ch.createdAt <= @${paramName}`);
    }

    return {
      whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1=1",
      parameters,
    };
  }

  /**
   * Gets field mappings with SQL types.
   * @private
   */
  static _getFieldMappings() {
    return {
      caseId: { type: sql.Int },
      actionType: { type: sql.NVarChar },
      fieldName: { type: sql.NVarChar },
      oldValue: { type: sql.NVarChar },
      newValue: { type: sql.NVarChar },
      changeDescription: { type: sql.NVarChar },
      comments: { type: sql.NVarChar },
      assignedTo: { type: sql.Int },
      assignedBy: { type: sql.Int },
      assignmentComments: { type: sql.NVarChar },
      statusId: { type: sql.Int },
      statusReason: { type: sql.NVarChar },
      ipAddress: { type: sql.NVarChar },
      userAgent: { type: sql.NVarChar },
      createdAt: { type: sql.DateTime },
      createdBy: { type: sql.Int },
      isActive: { type: sql.Bit },
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
      caseId: result.caseId,
      case: {
        number: result.caseNumber,
        title: result.caseTitle,
      },
      actionType: result.actionType,
      fieldName: result.fieldName,
      oldValue: result.oldValue,
      newValue: result.newValue,
      changeDescription: result.changeDescription,
      comments: result.comments,
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
      assignedBy: result.assignedBy
        ? {
            id: result.assignedBy,
            username: result.assignedByUsername,
            firstName: result.assignedByFirstName,
            lastName: result.assignedByLastName,
            email: result.assignedByEmail,
            role: result.assignedByRole,
          }
        : null,
      assignmentComments: result.assignmentComments,
      status: result.statusId
        ? {
            id: result.statusId,
            name: result.statusName,
            arabicName: result.statusArabicName,
            color: result.statusColor,
          }
        : null,
      statusReason: result.statusReason,
      ipAddress: result.ipAddress,
      userAgent: result.userAgent,
      createdAt: result.createdAt,
      createdBy: {
        id: result.createdBy,
        username: result.createdByUsername,
        firstName: result.createdByFirstName,
        lastName: result.createdByLastName,
        email: result.createdByEmail,
        role: result.createdByRole,
        profilePicture: result.createdByProfilePicture,
      },
      isActive: result.isActive,
    };
  }

  /**
   * Gets case history summary.
   * @private
   */
  static async _getCaseHistorySummary(caseId) {
    try {
      return await this.getCaseHistorySummaryAsync(caseId);
    } catch (error) {
      console.error("Failed to get case history summary:", error);
      return {
        caseId,
        summary: [],
        totalChanges: 0,
      };
    }
  }
}
