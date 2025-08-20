import { database, sql } from "../config/database.js";

export class FeedbackComments {
  /**
   * Add a new comment to feedback
   * @param {number} feedbackId - The feedback ID
   * @param {number} userId - The user adding the comment
   * @param {string} comment - The comment text
   * @param {boolean} isInternal - Whether the comment is internal (default: true)
   * @returns {Promise<Object>} The created comment
   */
  static async addComment(feedbackId, userId, comment, isInternal = true) {
    const pool = database.getPool();

    try {
      // Validate required fields
      this._validateRequiredFields({ feedbackId, userId, comment }, [
        "feedbackId",
        "userId",
        "comment",
      ]);

      const commentData = {
        feedbackId: parseInt(feedbackId, 10),
        comment: comment.trim(),
        isInternal: isInternal,
        createdBy: parseInt(userId, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
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

      console.log(`✅ Comment added successfully for feedback ${feedbackId}`);

      // Return the created comment with user details
      return await this.getCommentById(insertedId);
    } catch (error) {
      console.error("❌ Failed to add comment:", error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Get all comments for a specific feedback
   * @param {number} feedbackId - The feedback ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of comments
   */
  static async getCommentsByFeedbackId(feedbackId, options = {}) {
    const pool = database.getPool();

    try {
      if (!feedbackId) {
        throw new Error("Feedback ID is required");
      }

      const {
        includeInactive = false,
        limit,
        offset,
        orderBy = "c.createdAt DESC",
      } = options;

      // Build WHERE clause
      const conditions = ["c.feedbackId = @feedbackId"];

      if (!includeInactive) {
        conditions.push("c.isActive = 1");
      }

      const whereClause = conditions.join(" AND ");

      // Build complete query with joins
      const query = `
        SELECT 
          c.*,
          u.username,
          u.firstName,
          u.lastName,
          u.email,
          u.profilePicture
        FROM Comments c
        LEFT JOIN Users u ON c.createdBy = u.id
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        ${
          limit
            ? `OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`
            : ""
        }
      `;

      const result = await pool
        .request()
        .input("feedbackId", sql.Int, parseInt(feedbackId, 10))
        .query(query);

      const comments = result.recordset.map(this._transformCommentResult);

      console.log(
        `✅ Retrieved ${comments.length} comments for feedback ${feedbackId}`
      );
      return comments;
    } catch (error) {
      console.error(
        `❌ Failed to get comments for feedback ${feedbackId}:`,
        error
      );
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

      const query = `
        SELECT 
          c.*,
          u.username,
          u.firstName,
          u.lastName,
          u.email,
          u.profilePicture
        FROM Comments c
        LEFT JOIN Users u ON c.createdBy = u.id
        WHERE c.id = @commentId
      `;

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
   * @returns {Promise<Object>} The updated comment
   */
  static async updateComment(commentId, newComment, updatedBy) {
    const pool = database.getPool();

    try {
      // Validate inputs
      this._validateRequiredFields({ commentId, newComment, updatedBy }, [
        "commentId",
        "newComment",
        "updatedBy",
      ]);

      // Check if comment exists
      const existingComment = await this.getCommentById(commentId);
      if (!existingComment) {
        throw new Error(`Comment with ID ${commentId} not found`);
      }

      const query = `
        UPDATE Comments 
        SET 
          comment = @newComment,
          updatedAt = @updatedAt
        WHERE id = @commentId AND isActive = 1
      `;

      const result = await pool
        .request()
        .input("commentId", sql.Int, parseInt(commentId, 10))
        .input("newComment", sql.NVarChar, newComment.trim())
        .input("updatedAt", sql.DateTime, new Date())
        .query(query);

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

      const query = `
        UPDATE Comments 
        SET 
          isActive = 0,
          updatedAt = @updatedAt
        WHERE id = @commentId AND isActive = 1
      `;

      const result = await pool
        .request()
        .input("commentId", sql.Int, parseInt(commentId, 10))
        .input("updatedAt", sql.DateTime, new Date())
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
   * Get comment count for a feedback
   * @param {number} feedbackId - The feedback ID
   * @returns {Promise<number>} The comment count
   */
  static async getCommentCount(feedbackId) {
    const pool = database.getPool();

    try {
      if (!feedbackId) {
        throw new Error("Feedback ID is required");
      }

      const query = `
        SELECT COUNT(*) as count
        FROM Comments
        WHERE feedbackId = @feedbackId AND isActive = 1
      `;

      const result = await pool
        .request()
        .input("feedbackId", sql.Int, parseInt(feedbackId, 10))
        .query(query);

      return result.recordset[0].count;
    } catch (error) {
      console.error(
        `❌ Failed to get comment count for feedback ${feedbackId}:`,
        error
      );
      throw new Error(`Failed to get comment count: ${error.message}`);
    }
  }

  //======== Private Methods ========

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
    const fields = {
      feedbackId: { type: sql.Int },
      comment: { type: sql.NVarChar },
      isInternal: { type: sql.Bit },
      createdBy: { type: sql.Int },
      createdAt: { type: sql.DateTime },
      updatedAt: { type: sql.DateTime },
      isActive: { type: sql.Bit },
    };

    const validFields = {};
    const parameters = {};

    Object.entries(fields).forEach(([field, config]) => {
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
      INSERT INTO Comments (${fieldNames.join(", ")})
      OUTPUT INSERTED.id
      VALUES (${values.join(", ")})
    `;

    return { query, parameters };
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
          return String(value);
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
      feedbackId: result.feedbackId,
      comment: result.comment,
      isInternal: result.isInternal,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      isActive: result.isActive,
      createdBy: {
        id: result.createdBy,
        username: result.username,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        profilePicture: result.profilePicture,
      },
    };
  }
}
