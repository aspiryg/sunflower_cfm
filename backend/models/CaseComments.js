import { database, sql } from "../config/database.js";

export class CaseComments {
  /**
   * Add a new comment to a case
   * @param {number} caseId - The case ID
   * @param {number} userId - The user adding the comment
   * @param {string} comment - The comment text
   * @param {Object} [options={}] - Additional comment options
   * @returns {Promise<Object>} The created comment
   */
  static async addComment(caseId, userId, comment, options = {}) {
    const pool = database.getPool();

    try {
      // Validate required fields
      this._validateRequiredFields({ caseId, userId, comment }, [
        "caseId",
        "userId",
        "comment",
      ]);

      // Extract options with defaults based on schema
      const {
        commentType = "internal",
        isInternal = true,
        isPublic = false,
        confidentialityLevel = "internal",
        recipientType = null,
        recipientEmail = null,
        communicationMethod = null,
        communicationStatus = null,
        attachments = null,
        parentCommentId = null,
        responseToUserId = null,
        mentionedUsers = null,
        tags = null,
        requiresFollowUp = false,
        followUpDate = null,
      } = options;

      const commentData = {
        caseId: parseInt(caseId, 10),
        comment: comment.trim(),
        commentType,
        isInternal,
        isPublic,
        confidentialityLevel,
        recipientType,
        recipientEmail,
        communicationMethod,
        communicationStatus,
        attachments,
        attachmentCount: attachments
          ? Array.isArray(attachments)
            ? attachments.length
            : 0
          : 0,
        parentCommentId: parentCommentId ? parseInt(parentCommentId, 10) : null,
        isResponse: parentCommentId ? true : false,
        responseToUserId: responseToUserId
          ? parseInt(responseToUserId, 10)
          : null,
        mentionedUsers,
        tags,
        requiresFollowUp,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpCompleted: false,
        followUpCompletedAt: null,
        isEdited: false,
        editedAt: null,
        editedBy: null,
        editReason: null,
        originalComment: null,
        createdBy: parseInt(userId, 10),
        updatedBy: parseInt(userId, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        isActive: true,
      };

      // Build dynamic insert query
      const { query, parameters } = this._buildInsertQuery(commentData);

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);
      const insertedId = result.recordset?.[0]?.id;

      if (!insertedId) {
        throw new Error("Failed to get inserted comment ID");
      }

      console.log(`✅ Comment added successfully for case ${caseId}`);

      // Return the created comment with user details
      return await this.getCommentById(insertedId);
    } catch (error) {
      console.error("❌ Failed to add comment:", error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Get all comments for a specific case
   * @param {number} caseId - The case ID
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object>} Object with comments data and pagination info
   */
  static async getCommentsByCaseId(caseId, options = {}) {
    const pool = database.getPool();

    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const {
        includeInactive = false,
        includeDeleted = false,
        commentType = null,
        isInternal = null,
        confidentialityLevel = null,
        requiresFollowUp = null,
        limit = 50,
        offset = 0,
        orderBy = "cc.createdAt DESC",
      } = options;

      // Build dynamic WHERE clause
      const { whereClause, parameters } = this._buildFilterConditions({
        caseId,
        commentType,
        isInternal,
        confidentialityLevel,
        requiresFollowUp,
        includeInactive,
        includeDeleted,
      });

      // Build complete query with joins
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

      const comments = dataResult.recordset.map(this._transformCommentResult);

      const result = {
        data: comments,
        pagination: {
          page: currentPage,
          limit,
          offset,
          total,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
        summary: await this._getCommentsSummary(caseId),
      };

      console.log(
        `✅ Retrieved ${comments.length} comments for case ${caseId} from ${total} total`
      );
      return result;
    } catch (error) {
      console.error(`❌ Failed to get comments for case ${caseId}:`, error);
      throw new Error(`Failed to retrieve comments: ${error.message}`);
    }
  }

  /**
   * Get a single comment by ID
   * @param {number} commentId - The comment ID
   * @returns {Promise<Object|null>} The comment or null if not found
   */
  static async getCommentById(commentId) {
    const pool = database.getPool();

    try {
      if (!commentId) {
        throw new Error("Comment ID is required");
      }

      const query = this._buildSelectQuery({
        where: "cc.id = @commentId",
      });

      const result = await pool
        .request()
        .input("commentId", sql.Int, parseInt(commentId, 10))
        .query(query);

      if (result.recordset.length > 0) {
        return this._transformCommentResult(result.recordset[0]);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get comment ${commentId}:`, error);
      throw new Error(`Failed to retrieve comment: ${error.message}`);
    }
  }

  /**
   * Update a comment
   * @param {number} commentId - The comment ID
   * @param {string} newComment - The new comment text
   * @param {number} updatedBy - The user updating the comment
   * @param {Object} [options={}] - Additional update options
   * @returns {Promise<Object>} The updated comment
   */
  static async updateComment(commentId, newComment, updatedBy, options = {}) {
    const pool = database.getPool();

    try {
      // Validate inputs
      this._validateRequiredFields({ commentId, newComment, updatedBy }, [
        "commentId",
        "newComment",
        "updatedBy",
      ]);

      // Check if comment exists and is not deleted
      const existingComment = await this.getCommentById(commentId);
      if (!existingComment) {
        throw new Error(`Comment with ID ${commentId} not found`);
      }

      if (existingComment.isDeleted) {
        throw new Error(`Comment with ID ${commentId} has been deleted`);
      }

      const {
        editReason = "Comment updated",
        commentType = null,
        confidentialityLevel = null,
        requiresFollowUp = null,
        followUpDate = null,
      } = options;

      // Prepare update data
      const updateData = {
        comment: newComment.trim(),
        isEdited: true,
        editedAt: new Date(),
        editedBy: parseInt(updatedBy, 10),
        editReason,
        originalComment:
          existingComment.originalComment || existingComment.comment,
        updatedAt: new Date(),
        updatedBy: parseInt(updatedBy, 10),
      };

      // Add optional fields if provided
      if (commentType !== null) updateData.commentType = commentType;
      if (confidentialityLevel !== null)
        updateData.confidentialityLevel = confidentialityLevel;
      if (requiresFollowUp !== null)
        updateData.requiresFollowUp = requiresFollowUp;
      if (followUpDate !== null)
        updateData.followUpDate = new Date(followUpDate);

      // Build dynamic update query
      const { query, parameters } = this._buildUpdateQuery(
        commentId,
        updateData
      );

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        throw new Error("No comment was updated");
      }

      console.log(`✅ Comment ${commentId} updated successfully`);

      // Return the updated comment
      return await this.getCommentById(commentId);
    } catch (error) {
      console.error(`❌ Failed to update comment ${commentId}:`, error);
      throw new Error(`Failed to update comment: ${error.message}`);
    }
  }

  /**
   * Soft delete a comment
   * @param {number} commentId - The comment ID
   * @param {number} deletedBy - The user deleting the comment
   * @returns {Promise<boolean>} True if deletion was successful
   */
  static async deleteComment(commentId, deletedBy) {
    const pool = database.getPool();

    try {
      if (!commentId || !deletedBy) {
        throw new Error("Comment ID and deleted by user ID are required");
      }

      // Check if comment exists
      const existingComment = await this.getCommentById(commentId);
      if (!existingComment) {
        throw new Error(`Comment with ID ${commentId} not found`);
      }

      if (existingComment.isDeleted) {
        throw new Error(`Comment with ID ${commentId} is already deleted`);
      }

      const query = `
        UPDATE CaseComments 
        SET 
          isDeleted = 1,
          isActive = 0,
          deletedAt = @deletedAt,
          deletedBy = @deletedBy,
          updatedAt = @updatedAt,
          updatedBy = @updatedBy
        WHERE id = @commentId AND isDeleted = 0
      `;

      const now = new Date();
      const result = await pool
        .request()
        .input("commentId", sql.Int, parseInt(commentId, 10))
        .input("deletedAt", sql.DateTime, now)
        .input("deletedBy", sql.Int, parseInt(deletedBy, 10))
        .input("updatedAt", sql.DateTime, now)
        .input("updatedBy", sql.Int, parseInt(deletedBy, 10))
        .query(query);

      if (result.rowsAffected[0] === 0) {
        throw new Error("No comment was deleted");
      }

      console.log(`✅ Comment ${commentId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete comment ${commentId}:`, error);
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  /**
   * Mark follow-up as completed for a comment
   * @param {number} commentId - The comment ID
   * @param {number} completedBy - The user marking follow-up as completed
   * @returns {Promise<Object>} The updated comment
   */
  static async markFollowUpCompleted(commentId, completedBy) {
    const pool = database.getPool();

    try {
      if (!commentId || !completedBy) {
        throw new Error("Comment ID and completed by user ID are required");
      }

      const existingComment = await this.getCommentById(commentId);
      if (!existingComment) {
        throw new Error(`Comment with ID ${commentId} not found`);
      }

      if (!existingComment.requiresFollowUp) {
        throw new Error(
          `Comment with ID ${commentId} does not require follow-up`
        );
      }

      if (existingComment.followUpCompleted) {
        throw new Error(
          `Follow-up for comment ${commentId} is already completed`
        );
      }

      const query = `
        UPDATE CaseComments
        SET 
          followUpCompleted = 1,
          followUpCompletedAt = @completedAt,
          updatedAt = @updatedAt,
          updatedBy = @updatedBy
        WHERE id = @commentId AND isDeleted = 0
      `;

      const now = new Date();
      const result = await pool
        .request()
        .input("commentId", sql.Int, parseInt(commentId, 10))
        .input("completedAt", sql.DateTime, now)
        .input("updatedAt", sql.DateTime, now)
        .input("updatedBy", sql.Int, parseInt(completedBy, 10))
        .query(query);

      if (result.rowsAffected[0] === 0) {
        throw new Error("No comment was updated");
      }

      console.log(`✅ Follow-up completed for comment ${commentId}`);
      return await this.getCommentById(commentId);
    } catch (error) {
      console.error(
        `❌ Failed to mark follow-up completed for comment ${commentId}:`,
        error
      );
      throw new Error(`Failed to mark follow-up completed: ${error.message}`);
    }
  }

  /**
   * Get comment count for a case
   * @param {number} caseId - The case ID
   * @param {Object} [filters={}] - Optional filters
   * @returns {Promise<Object>} Comment counts by type
   */
  static async getCommentCount(caseId, filters = {}) {
    const pool = database.getPool();

    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const {
        commentType = null,
        isInternal = null,
        confidentialityLevel = null,
        activeOnly = true,
      } = filters;

      // Build WHERE conditions
      const conditions = ["caseId = @caseId"];
      const parameters = {
        caseId: { value: parseInt(caseId, 10), type: sql.Int },
      };

      if (activeOnly) {
        conditions.push("isActive = 1 AND isDeleted = 0");
      }

      if (commentType !== null) {
        conditions.push("commentType = @commentType");
        parameters.commentType = { value: commentType, type: sql.NVarChar };
      }

      if (isInternal !== null) {
        conditions.push("isInternal = @isInternal");
        parameters.isInternal = { value: isInternal, type: sql.Bit };
      }

      if (confidentialityLevel !== null) {
        conditions.push("confidentialityLevel = @confidentialityLevel");
        parameters.confidentialityLevel = {
          value: confidentialityLevel,
          type: sql.NVarChar,
        };
      }

      const whereClause = conditions.join(" AND ");

      // Get total count
      const totalQuery = `
        SELECT COUNT(*) as total
        FROM CaseComments
        WHERE ${whereClause}
      `;

      // Get count by type
      const typeQuery = `
        SELECT 
          commentType,
          COUNT(*) as count,
          SUM(CASE WHEN requiresFollowUp = 1 THEN 1 ELSE 0 END) as requiresFollowUpCount,
          SUM(CASE WHEN requiresFollowUp = 1 AND followUpCompleted = 0 THEN 1 ELSE 0 END) as pendingFollowUpCount
        FROM CaseComments
        WHERE ${whereClause}
        GROUP BY commentType
        ORDER BY commentType
      `;

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const [totalResult, typeResult] = await Promise.all([
        request.query(totalQuery),
        request.query(typeQuery),
      ]);

      return {
        total: totalResult.recordset[0].total,
        byType: typeResult.recordset,
        filters: filters,
      };
    } catch (error) {
      console.error(
        `❌ Failed to get comment count for case ${caseId}:`,
        error
      );
      throw new Error(`Failed to get comment count: ${error.message}`);
    }
  }

  /**
   * Get comments requiring follow-up
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object>} Comments requiring follow-up
   */
  static async getCommentsRequiringFollowUp(options = {}) {
    const pool = database.getPool();

    try {
      const {
        caseId = null,
        overdue = false,
        limit = 20,
        offset = 0,
        orderBy = "cc.followUpDate ASC",
      } = options;

      // Build filter conditions
      const conditions = [
        "cc.requiresFollowUp = 1",
        "cc.followUpCompleted = 0",
        "cc.isActive = 1",
        "cc.isDeleted = 0",
      ];

      const parameters = {};

      if (caseId) {
        conditions.push("cc.caseId = @caseId");
        parameters.caseId = { value: parseInt(caseId, 10), type: sql.Int };
      }

      if (overdue) {
        conditions.push("cc.followUpDate < GETDATE()");
      }

      const whereClause = conditions.join(" AND ");

      // Build main query
      const dataQuery = this._buildSelectQuery({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

      // Build count query
      const countQuery = this._buildCountQuery(whereClause);

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

      return {
        data: dataResult.recordset.map(this._transformCommentResult),
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
    } catch (error) {
      console.error("❌ Failed to get comments requiring follow-up:", error);
      throw new Error(
        `Failed to get comments requiring follow-up: ${error.message}`
      );
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Validate required fields in the data object
   * @param {Object} data - The data object to validate
   * @param {Array<string>} requiredFields - The list of required fields
   * @throws {Error} - If any required fields are missing
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
   * @param {Object} data - The data to insert
   * @returns {Object} Query and parameters
   * @private
   */
  static _buildInsertQuery(data) {
    const fieldMappings = this._getFieldMappings();
    const validFields = {};
    const parameters = {};

    Object.entries(fieldMappings).forEach(([field, config]) => {
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

    const fieldNames = Object.keys(validFields);
    const values = fieldNames.map((field) => `@${field}`);

    const query = `
      INSERT INTO CaseComments (${fieldNames.join(", ")})
      OUTPUT INSERTED.id
      VALUES (${values.join(", ")})
    `;

    return { query, parameters };
  }

  /**
   * Build dynamic UPDATE query
   * @param {number} commentId - Comment ID
   * @param {Object} data - Update data
   * @returns {Object} Query and parameters
   * @private
   */
  static _buildUpdateQuery(commentId, data) {
    const fieldMappings = this._getFieldMappings();
    const setClauses = [];
    const parameters = {};
    let paramCounter = 0;

    // Build SET clauses for provided fields
    Object.entries(data).forEach(([field, value]) => {
      if (fieldMappings[field] && value !== undefined && value !== null) {
        const paramName = `param${paramCounter++}`;
        const convertedValue = this._convertValueByType(
          value,
          fieldMappings[field].type,
          field
        );

        parameters[paramName] = {
          value: convertedValue,
          type: fieldMappings[field].type,
        };
        setClauses.push(`${field} = @${paramName}`);
      }
    });

    // Add comment ID parameter
    const idParamName = `commentId${paramCounter}`;
    parameters[idParamName] = { value: parseInt(commentId, 10), type: sql.Int };

    const query = `
      UPDATE CaseComments
      SET ${setClauses.join(", ")}
      WHERE id = @${idParamName} AND isDeleted = 0
    `;

    return { query, parameters };
  }

  /**
   * Build SELECT query with joins
   * @param {Object} [options={}] - Query options
   * @returns {string} Complete SELECT query
   * @private
   */
  static _buildSelectQuery(options = {}) {
    const baseQuery = `
      SELECT 
        cc.*,
        c.caseNumber,
        c.title as caseTitle,
        cb.username as createdByUsername,
        cb.firstName as createdByFirstName,
        cb.lastName as createdByLastName,
        cb.email as createdByEmail,
        cb.role as createdByRole,
        cb.profilePicture as createdByProfilePicture,
        ub.username as updatedByUsername,
        ub.firstName as updatedByFirstName,
        ub.lastName as updatedByLastName,
        ub.email as updatedByEmail,
        ub.role as updatedByRole,
        eb.username as editedByUsername,
        eb.firstName as editedByFirstName,
        eb.lastName as editedByLastName,
        eb.email as editedByEmail,
        eb.role as editedByRole,
        db.username as deletedByUsername,
        db.firstName as deletedByFirstName,
        db.lastName as deletedByLastName,
        db.email as deletedByEmail,
        db.role as deletedByRole,
        rt.username as responseToUsername,
        rt.firstName as responseToFirstName,
        rt.lastName as responseToLastName,
        rt.email as responseToEmail,
        rt.role as responseToRole,
        pc.comment as parentComment
      FROM CaseComments cc
      LEFT JOIN Cases c ON cc.caseId = c.id
      LEFT JOIN Users cb ON cc.createdBy = cb.id
      LEFT JOIN Users ub ON cc.updatedBy = ub.id
      LEFT JOIN Users eb ON cc.editedBy = eb.id
      LEFT JOIN Users db ON cc.deletedBy = db.id
      LEFT JOIN Users rt ON cc.responseToUserId = rt.id
      LEFT JOIN CaseComments pc ON cc.parentCommentId = pc.id
    `;

    const conditions = ["cc.isActive = 1"];

    if (options.where) {
      conditions.push(options.where);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    const orderClause = options.orderBy ? `ORDER BY ${options.orderBy}` : "";
    const limitClause = options.limit
      ? `OFFSET ${options.offset || 0} ROWS FETCH NEXT ${
          options.limit
        } ROWS ONLY`
      : "";

    return `${baseQuery} ${whereClause} ${orderClause} ${limitClause}`;
  }

  /**
   * Build count query for pagination
   * @param {string} whereClause - WHERE conditions
   * @returns {string} Count query
   * @private
   */
  static _buildCountQuery(whereClause) {
    return `
      SELECT COUNT(*) as total
      FROM CaseComments cc
      LEFT JOIN Cases c ON cc.caseId = c.id
      WHERE cc.isActive = 1 ${
        whereClause && whereClause !== "cc.isActive = 1"
          ? `AND ${whereClause.replace("cc.isActive = 1 AND ", "")}`
          : ""
      }
    `;
  }

  /**
   * Build filter conditions for WHERE clause
   * @param {Object} filters - Filter options
   * @returns {Object} WHERE clause and parameters
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
      conditions.push(`cc.caseId = @${paramName}`);
    }

    // Comment type filter
    if (filters.commentType) {
      const paramName = `commentType${paramCounter++}`;
      parameters[paramName] = {
        value: filters.commentType,
        type: sql.NVarChar,
      };
      conditions.push(`cc.commentType = @${paramName}`);
    }

    // Internal/External filter
    if (filters.isInternal !== null && filters.isInternal !== undefined) {
      const paramName = `isInternal${paramCounter++}`;
      parameters[paramName] = { value: filters.isInternal, type: sql.Bit };
      conditions.push(`cc.isInternal = @${paramName}`);
    }

    // Confidentiality level filter
    if (filters.confidentialityLevel) {
      const paramName = `confidentialityLevel${paramCounter++}`;
      parameters[paramName] = {
        value: filters.confidentialityLevel,
        type: sql.NVarChar,
      };
      conditions.push(`cc.confidentialityLevel = @${paramName}`);
    }

    // Follow-up filter
    if (
      filters.requiresFollowUp !== null &&
      filters.requiresFollowUp !== undefined
    ) {
      const paramName = `requiresFollowUp${paramCounter++}`;
      parameters[paramName] = {
        value: filters.requiresFollowUp,
        type: sql.Bit,
      };
      conditions.push(`cc.requiresFollowUp = @${paramName}`);
    }

    // Active/Inactive filter
    if (!filters.includeInactive) {
      conditions.push("cc.isActive = 1");
    }

    // Deleted filter
    if (!filters.includeDeleted) {
      conditions.push("cc.isDeleted = 0");
    }

    return {
      whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1=1",
      parameters,
    };
  }

  /**
   * Get field mappings with SQL types
   * @returns {Object} Field mappings
   * @private
   */
  static _getFieldMappings() {
    return {
      caseId: { type: sql.Int },
      comment: { type: sql.NVarChar },
      commentType: { type: sql.NVarChar },
      isInternal: { type: sql.Bit },
      isPublic: { type: sql.Bit },
      confidentialityLevel: { type: sql.NVarChar },
      recipientType: { type: sql.NVarChar },
      recipientEmail: { type: sql.NVarChar },
      communicationMethod: { type: sql.NVarChar },
      communicationStatus: { type: sql.NVarChar },
      attachments: { type: sql.NVarChar },
      attachmentCount: { type: sql.Int },
      parentCommentId: { type: sql.Int },
      isResponse: { type: sql.Bit },
      responseToUserId: { type: sql.Int },
      mentionedUsers: { type: sql.NVarChar },
      tags: { type: sql.NVarChar },
      requiresFollowUp: { type: sql.Bit },
      followUpDate: { type: sql.DateTime },
      followUpCompleted: { type: sql.Bit },
      followUpCompletedAt: { type: sql.DateTime },
      isEdited: { type: sql.Bit },
      editedAt: { type: sql.DateTime },
      editedBy: { type: sql.Int },
      editReason: { type: sql.NVarChar },
      originalComment: { type: sql.NVarChar },
      createdAt: { type: sql.DateTime },
      updatedAt: { type: sql.DateTime },
      createdBy: { type: sql.Int },
      updatedBy: { type: sql.Int },
      isDeleted: { type: sql.Bit },
      deletedAt: { type: sql.DateTime },
      deletedBy: { type: sql.Int },
      isActive: { type: sql.Bit },
    };
  }

  /**
   * Convert value by SQL type
   * @param {*} value - The value to convert
   * @param {*} sqlType - The SQL type
   * @param {string} fieldName - The field name for error reporting
   * @returns {*} The converted value
   * @private
   */
  static _convertValueByType(value, sqlType, fieldName) {
    try {
      switch (sqlType) {
        case sql.Int:
          const intValue = parseInt(value, 10);
          if (isNaN(intValue)) {
            throw new Error(
              `Invalid integer value for field ${fieldName}: ${value}`
            );
          }
          return intValue;
        case sql.Bit:
          return (
            value === true || value === "true" || value === 1 || value === "1"
          );
        case sql.DateTime:
          const dateValue = value instanceof Date ? value : new Date(value);
          if (isNaN(dateValue.getTime())) {
            throw new Error(
              `Invalid date value for field ${fieldName}: ${value}`
            );
          }
          return dateValue;
        case sql.NVarChar:
          return value ? String(value) : null;
        default:
          return value;
      }
    } catch (error) {
      console.error(`Error converting value for field ${fieldName}:`, error);
      throw new Error(
        `Type conversion error for field ${fieldName}: ${error.message}`
      );
    }
  }

  /**
   * Transform database result into comment object
   * @param {Object} result - Database result
   * @returns {Object} Transformed comment object
   * @private
   */
  static _transformCommentResult(result) {
    return {
      id: result.id,
      caseId: result.caseId,
      case: {
        number: result.caseNumber,
        title: result.caseTitle,
      },
      comment: result.comment,
      commentType: result.commentType,
      isInternal: result.isInternal,
      isPublic: result.isPublic,
      confidentialityLevel: result.confidentialityLevel,
      recipientType: result.recipientType,
      recipientEmail: result.recipientEmail,
      communicationMethod: result.communicationMethod,
      communicationStatus: result.communicationStatus,
      attachments: result.attachments ? JSON.parse(result.attachments) : null,
      attachmentCount: result.attachmentCount,
      parentCommentId: result.parentCommentId,
      parentComment: result.parentComment,
      isResponse: result.isResponse,
      responseToUser: result.responseToUserId
        ? {
            id: result.responseToUserId,
            username: result.responseToUsername,
            firstName: result.responseToFirstName,
            lastName: result.responseToLastName,
            email: result.responseToEmail,
            role: result.responseToRole,
          }
        : null,
      mentionedUsers: result.mentionedUsers
        ? JSON.parse(result.mentionedUsers)
        : null,
      tags: result.tags,
      requiresFollowUp: result.requiresFollowUp,
      followUpDate: result.followUpDate,
      followUpCompleted: result.followUpCompleted,
      followUpCompletedAt: result.followUpCompletedAt,
      isEdited: result.isEdited,
      editedAt: result.editedAt,
      editedBy: result.editedBy
        ? {
            id: result.editedBy,
            username: result.editedByUsername,
            firstName: result.editedByFirstName,
            lastName: result.editedByLastName,
            email: result.editedByEmail,
            role: result.editedByRole,
          }
        : null,
      editReason: result.editReason,
      originalComment: result.originalComment,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: {
        id: result.createdBy,
        username: result.createdByUsername,
        firstName: result.createdByFirstName,
        lastName: result.createdByLastName,
        email: result.createdByEmail,
        role: result.createdByRole,
        profilePicture: result.createdByProfilePicture,
      },
      updatedBy: {
        id: result.updatedBy,
        username: result.updatedByUsername,
        firstName: result.updatedByFirstName,
        lastName: result.updatedByLastName,
        email: result.updatedByEmail,
        role: result.updatedByRole,
      },
      isDeleted: result.isDeleted,
      deletedAt: result.deletedAt,
      deletedBy: result.deletedBy
        ? {
            id: result.deletedBy,
            username: result.deletedByUsername,
            firstName: result.deletedByFirstName,
            lastName: result.deletedByLastName,
            email: result.deletedByEmail,
            role: result.deletedByRole,
          }
        : null,
      isActive: result.isActive,
    };
  }

  /**
   * Get comments summary for a case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Comments summary
   * @private
   */
  static async _getCommentsSummary(caseId) {
    try {
      return await this.getCommentCount(caseId, { activeOnly: true });
    } catch (error) {
      console.error("Failed to get comments summary:", error);
      return {
        total: 0,
        byType: [],
        filters: {},
      };
    }
  }
}
