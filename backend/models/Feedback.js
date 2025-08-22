import { database, sql } from "../config/database.js";
import {
  transformFeedbackResult,
  selectFeedbackQueryFn,
} from "../scripts/feedbackModelScripts.js";
import { FeedbackHistory } from "./FeedbackHistory.js";
import { Notification } from "./Notification.js";

export class Feedback {
  /**
   * Creates a new feedback entry in the database with dynamic field handling.
   * @param {Object} feedbackData - The feedback data to insert.
   * @param {number} [createdBy=1] - The ID of the user creating the feedback.
   * @returns {Promise<Object>} The created feedback object.
   */
  static async createFeedbackAsync(feedbackData, createdBy = 1) {
    // By default, if submittedBy and assignedBy are not provided, use createdBy
    feedbackData.submittedBy = feedbackData.submittedBy || createdBy;
    feedbackData.assignedBy = feedbackData.assignedBy || createdBy;

    // By default, if submittedAt is not provided, set it to now
    feedbackData.submittedAt = feedbackData.submittedAt || new Date();

    // If assignedAt is not provided, set it to now if assignedTo is set
    if (feedbackData.assignedTo && !feedbackData.assignedAt) {
      feedbackData.assignedAt = new Date();
    }

    const pool = database.getPool();

    try {
      // Generate feedback number if not provided
      if (!feedbackData.feedbackNumber) {
        feedbackData.feedbackNumber = await this._generateFeedbackNumber();
      }

      // Validate required fields
      this._validateRequiredFields(feedbackData, [
        "title",
        "description",
        "category",
        "priority",
        "status",
        "feedbackChannel",
      ]);

      // Add audit fields
      const enrichedData = {
        ...feedbackData,
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
        isActive:
          feedbackData.isActive !== undefined ? feedbackData.isActive : true,
      };

      // Build dynamic insert query
      const { query, parameters } = this._buildInsertQuery(enrichedData);

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      await request.query(query);

      console.log(
        `✅ Feedback created successfully with number: ${enrichedData.feedbackNumber}`
      );

      // Return the created feedback
      const createdFeedback = await this.findFeedbackByIdAsync(
        null,
        enrichedData.feedbackNumber
      );

      // Create history entry for the new feedback without awaiting
      this._createCreationHistoryEntries(
        createdFeedback.id,
        createdFeedback.status,
        createdFeedback.assignedTo.id || null,
        createdFeedback.createdBy.id,
        createdFeedback.comments
      );

      // Create initial notification for the new feedback without awaiting
      Notification.createFeedbackSubmissionNotificationAsync(
        createdFeedback,
        createdBy
      );

      return createdFeedback;
    } catch (error) {
      console.error(" ❌ Failed to create feedback:", error);
      throw new Error(`Failed to create feedback: ${error.message}`);
    }
  }

  /**
   * Updates an existing feedback entry with dynamic field handling.
   * @param {number} id - The ID of the feedback to update.
   * @param {Object} updateData - The data to update.
   * @param {number} updatedBy - The ID of the user performing the update.
   * @returns {Promise<Object>} The updated feedback object with change tracking.
   */
  static async updateFeedbackAsync(id, updateData, updatedBy, metadata = {}) {
    const pool = database.getPool();

    try {
      // Validate feedback exists
      const existingFeedback = await this.findFeedbackByIdFlatAsync(id); // TODO: retrieve pure feedback object without relations
      if (!existingFeedback) {
        throw new Error(`Feedback with ID ${id} not found`);
      }

      // Filter out null/undefined/empty values
      const filteredData = this._filterValidUpdateData(updateData);

      if (Object.keys(filteredData).length === 0) {
        console.warn("⚠️ No valid data to update");
        return {
          feedback: existingFeedback,
          changes: {},
          message: "No changes were made",
        };
      }

      // Track changes for audit purposes
      const changes = this._trackChanges(existingFeedback, filteredData);
      console.log(`🔍 Changes detected for feedback ${id}:`, changes);

      // Add audit fields
      filteredData.updatedAt = new Date();
      filteredData.updatedBy = updatedBy;

      // Build dynamic update query
      const { query, parameters } = this._buildUpdateQuery(id, filteredData);

      // Execute the update
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(`✅ Feedback ${id} updated successfully`);

        // Create history entry for changes without awaiting
        this._createHistoryEntries(
          id,
          updatedBy,
          changes,
          existingFeedback,
          filteredData,
          metadata
        );

        const updatedFeedback = await this.findFeedbackByIdAsync(id);
        return {
          feedback: updatedFeedback,
          changes,
          message: "Feedback updated successfully",
        };
      } else {
        throw new Error("No rows were updated");
      }
    } catch (error) {
      console.error(` ❌ Failed to update feedback ${id}:`, error);
      throw new Error(`Failed to update feedback: ${error.message}`);
    }
  }

  /**
   * Retrieves all feedback entries with optional filtering for ownership/roles.
   * @param {Object} [options={}] - Options for filtering and pagination.
   * @param {number} [options.userId] - Filter by user ownership (for future role-based access).
   * @param {string} [options.userRole] - User role for permission-based filtering.
   * @param {boolean} [options.activeOnly=true] - Whether to return only active feedback.
   * @param {number} [options.limit] - Maximum number of records to return.
   * @param {number} [options.offset] - Offset for pagination.
   * @returns {Promise<Array>} Array of feedback objects.
   */
  static async getAllFeedbackAsync(options = {}) {
    const pool = database.getPool();

    try {
      const {
        // Extract potential permission filters
        submittedBy,
        assignedTo,
        createdBy,
        impossible,
        // Standard options
        userId,
        userRole,
        activeOnly = true,
        limit,
        offset,
        orderBy = "f.createdAt DESC",
        // Capture other filters
        ...otherFilters
      } = options;

      // Short-circuit if permission filters indicate no access
      if (impossible) {
        console.warn(
          "⚠️ Permission filter indicates no access, returning empty result"
        );
        return [];
      }
      // Build conditional WHERE clause for ownership/role filtering
      const conditions = [];
      const parameters = {};
      let paramCounter = 0;

      // Active filter
      if (activeOnly) {
        conditions.push("f.isActive = 1");
      }

      // Apply permission-based filters directly from options
      if (submittedBy) {
        conditions.push("f.submittedBy = @submittedBy");
        parameters.submittedBy = { value: submittedBy, type: sql.Int };
      }

      if (assignedTo) {
        conditions.push("f.assignedTo = @assignedTo");
        parameters.assignedTo = { value: assignedTo, type: sql.Int };
      }
      if (createdBy) {
        conditions.push("f.createdBy = @createdBy");
        parameters.createdBy = { value: createdBy, type: sql.Int };
      }

      // Apply any remaining filters from the options Object
      Object.entries(otherFilters).forEach(([key, value]) => {
        // Skip undefined/null/empty values and non-filter fields
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          key.includes("sort") ||
          key === "limit" ||
          key === "offset"
        ) {
          return;
        }
        // Use parameterized queries to prevent SQL injection
        const paramName = `param${++paramCounter}`;
        parameters[paramName] = {
          value: this._convertValueByType(value, this._getFieldType(key), key),
          type: this._getFieldType(key),
        };
        conditions.push(`f.${key} = @${paramName}`);
      });

      // // Role-based filtering (future implementation)
      // if (userId && userRole) {
      //   switch (userRole.toLowerCase()) {
      //     case "admin":
      //     case "super_admin":
      //       // Admins see all feedback
      //       break;
      //     case "manager":
      //       // Managers see feedback in their region/area
      //       conditions.push(
      //         "(f.assignedTo = @userId OR f.createdBy = @userId)"
      //       );
      //       parameters[`userId`] = { value: userId, type: sql.Int };
      //       break;
      //     case "user":
      //     default:
      //       // Regular users see only their own feedback
      //       conditions.push("f.createdBy = @userIdOwner");
      //       parameters[`userIdOwner`] = { value: userId, type: sql.Int };
      //       break;
      //   }
      // }

      const whereClause =
        conditions.length > 0 ? conditions.join(" AND ") : "1=1";

      // Build the query
      const query = selectFeedbackQueryFn({
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

      console.log(`✅ Retrieved ${result.recordset.length} feedback entries`);
      return result.recordset.map(transformFeedbackResult);
    } catch (error) {
      console.error(" ❌ Failed to retrieve all feedback:", error);
      throw new Error(`Failed to retrieve feedback: ${error.message}`);
    }
  }

  /**
   * Finds a feedback entry by ID or feedback number.
   * @param {number} [id] - The ID of the feedback to retrieve.
   * @param {string} [feedbackNumber] - The feedback number to search for.
   * @returns {Promise<Object|null>} The feedback object if found, null otherwise.
   */
  static async findFeedbackByIdAsync(id, feedbackNumber) {
    const pool = database.getPool();

    try {
      if (!id && !feedbackNumber) {
        throw new Error("Either ID or feedback number must be provided");
      }

      let whereClause, paramName, paramValue, paramType;

      if (id) {
        whereClause = "f.id = @id";
        paramName = "id";
        paramValue = parseInt(id, 10);
        paramType = sql.Int;
      } else {
        whereClause = "f.feedbackNumber = @feedbackNumber";
        paramName = "feedbackNumber";
        paramValue = feedbackNumber;
        paramType = sql.NVarChar;
      }

      const query = selectFeedbackQueryFn({ where: whereClause });

      const result = await pool
        .request()
        .input(paramName, paramType, paramValue)
        .query(query);

      if (result.recordset.length > 0) {
        return transformFeedbackResult(result.recordset[0]);
      }

      return null;
    } catch (error) {
      console.error(" ❌ Failed to retrieve feedback:", error);
      throw new Error(`Failed to retrieve feedback: ${error.message}`);
    }
  }

  // find Feedback By ID function that returns pure flat Feedback object without transformation
  static async findFeedbackByIdFlatAsync(id) {
    const pool = database.getPool();

    try {
      const query = selectFeedbackQueryFn({
        where: "f.id = @id",
      });

      const result = await pool.request().input("id", sql.Int, id).query(query);

      if (result.recordset.length > 0) {
        return result.recordset[0];
      }

      return null;
    } catch (error) {
      console.error(" ❌ Failed to retrieve feedback:", error);
      throw new Error(`Failed to retrieve feedback: ${error.message}`);
    }
  }

  /**
   * Advanced search functionality with full-text search, filtering, and sorting.
   * @param {Object} [queryParams={}] - Search parameters from request query.
   * @returns {Promise<Object>} Search results with data, pagination, and filters info.
   */
  static async searchFeedbackAsync(queryParams = {}) {
    const pool = database.getPool();

    try {
      // Extract pagination parameters
      const page = Math.max(1, parseInt(queryParams.page) || 1);
      const limit = Math.min(
        10000,
        Math.max(1, parseInt(queryParams.limit) || 10)
      );
      const offset = (page - 1) * limit;

      // console.log(`Searching feedback with params:`, {
      //   page,
      //   limit,
      //   offset,
      //   filters: queryParams,
      // });

      // Short-circuit if permission filters indicate no access.

      if (queryParams.impossible) {
        console.warn(
          "⚠️ Permission filter indicates no access, returning empty result"
        );
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
            offset,
          },
          filters: this._getAppliedFilters(queryParams),
          search: {
            query: queryParams.search || null,
            fields: this._getSearchableFields(),
            resultsCount: 0,
          },
        };
      }

      // Extract permission filters for special handling
      const { submittedBy, assignedTo, createdBy, ...standardQueryParams } =
        queryParams;

      // Build dynamic search conditions
      let { whereClause, parameters } =
        this._buildSearchConditions(standardQueryParams);

      // Add permission-based filters conditions
      if (submittedBy) {
        parameters.submittedBy = {
          value: submittedBy,
          type: sql.Int,
        };
        whereClause += ` AND f.submittedBy = @submittedBy`;
      }

      if (assignedTo) {
        parameters.assignedTo = {
          value: assignedTo,
          type: sql.Int,
        };
        whereClause += ` AND f.assignedTo = @assignedTo`;
      }

      if (createdBy) {
        parameters.createdBy = {
          value: createdBy,
          type: sql.Int,
        };
        whereClause += ` AND f.createdBy = @createdBy`;
      }

      // // Build dynamic search conditions
      // const { whereClause, parameters } =
      //   this._buildSearchConditions(queryParams);

      // Build sorting
      const orderBy = this._buildOrderByClause(
        queryParams.sortBy,
        queryParams.sortOrder
      );

      // Build main query
      const dataQuery = selectFeedbackQueryFn({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

      // Build count query for pagination
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

      const result = {
        data: dataResult.recordset.map(transformFeedbackResult),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          offset,
        },
        filters: this._getAppliedFilters(queryParams),
        search: {
          query: queryParams.search || null,
          fields: this._getSearchableFields(),
          resultsCount: dataResult.recordset.length,
        },
      };

      console.log(
        `✅ Search completed: ${result.data.length} results from ${total} total records`
      );
      return result;
    } catch (error) {
      console.error(" ❌ Failed to search feedback:", error);
      throw new Error(`Failed to search feedback: ${error.message}`);
    }
  }

  /**
   * Soft deletes feedback by calling updateFeedback function and setting the deletedAt timestamp.
   * @param {number} id - Feedback ID.
   * @returns {Promise<void>}
   */
  static async softDeleteFeedback(id, deletedBy) {
    try {
      // Validate feedback exists
      const existingFeedback = await this.findFeedbackByIdFlatAsync(id);
      if (!existingFeedback) {
        throw new Error(`Feedback with ID ${id} not found`);
      }

      // Set deletedAt to now and isActive to false
      const updateData = {
        deletedAt: new Date(),
        isDeleted: true,
        isActive: false,
        updatedAt: new Date(),
        updatedBy: deletedBy,
      };

      // Call updateFeedback with the soft delete data
      await this.updateFeedbackAsync(id, updateData, deletedBy);
      console.log(`✅ Feedback ${id} soft deleted successfully`);
    } catch (error) {
      console.error(` ❌ Failed to soft delete feedback ${id}:`, error);
      throw new Error(`Failed to soft delete feedback: ${error.message}`);
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Generates a unique feedback number.
   * @private
   * @returns {Promise<string>} Generated feedback number.
   */
  static async _generateFeedbackNumber() {
    const pool = database.getPool();
    const query = `
      SELECT COUNT(*) AS count FROM Feedback
      WHERE CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE)
    `;

    try {
      const result = await pool.request().query(query);
      const todayCount = (result.recordset[0]?.count || 0) + 1;
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      return `FB-${datePart}-${todayCount.toString().padStart(3, "0")}`;
    } catch (error) {
      throw new Error(`Failed to generate feedback number: ${error.message}`);
    }
  }

  /**
   * Validates required fields for feedback creation.
   * @private
   * @param {Object} data - Data to validate.
   * @param {Array} requiredFields - Array of required field names.
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
   * @param {Object} data - Data to insert.
   * @returns {Object} Query and parameters.
   */
  static _buildInsertQuery(data) {
    const fieldMappings = this._getFieldMappings();
    const validFields = {};
    const parameters = {};

    // if feedback is assigned to a user, and assignedAt is not provided, set it to now
    if (data.assignedTo && !data.assignedAt) {
      data.assignedAt = new Date();
    }

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
      INSERT INTO Feedback (${fields.join(", ")})
      VALUES (${values.join(", ")})
    `;

    return { query, parameters };
  }

  /**
   * Builds dynamic UPDATE query.
   * @private
   * @param {number} id - Feedback ID.
   * @param {Object} data - Data to update.
   * @returns {Object} Query and parameters.
   */
  static _buildUpdateQuery(id, data) {
    const fieldMappings = this._getFieldMappings();
    const setClauses = [];
    const parameters = {};
    let paramCounter = 0;

    // if feedback is assigned to a user, and assignedAt is not provided, set it to now
    if (data.assignedTo && !data.assignedAt) {
      data.assignedAt = new Date();
    }

    // Build SET clauses
    Object.entries(data).forEach(([field, value]) => {
      if (fieldMappings[field]) {
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

    // Add ID parameter
    const idParamName = `id${paramCounter}`;
    parameters[idParamName] = { value: id, type: sql.Int };

    const query = `
      UPDATE Feedback 
      SET ${setClauses.join(", ")}
      WHERE id = @${idParamName}
    `;

    return { query, parameters };
  }

  /**
   * Builds search conditions for dynamic querying.
   * @private
   * @param {Object} queryParams - Query parameters.
   * @returns {Object} Where clause and parameters.
   */
  static _buildSearchConditions(queryParams) {
    const conditions = [];
    const parameters = {};
    let paramCounter = 0;

    // Full-text search
    if (queryParams.search) {
      const searchFields = this._getSearchableFields();
      const searchConditions = searchFields.map((field) => {
        const paramName = `search${paramCounter++}`;
        parameters[paramName] = {
          value: `%${queryParams.search}%`,
          type: sql.NVarChar,
        };
        return `${field} LIKE @${paramName}`;
      });
      conditions.push(`(${searchConditions.join(" OR ")})`);
    }

    // Exact match filters
    const filterMappings = this._getFilterMappings();
    Object.entries(filterMappings).forEach(([param, config]) => {
      if (queryParams[param] !== undefined && queryParams[param] !== "") {
        const paramName = `filter${paramCounter++}`;
        const value = this._convertValueByType(
          queryParams[param],
          config.type,
          param
        );

        parameters[paramName] = { value, type: config.type };
        conditions.push(`${config.field} = @${paramName}`);
      }
    });

    // Date range filters
    this._addDateRangeFilters(
      queryParams,
      conditions,
      parameters,
      paramCounter
    );

    // Array filters (comma-separated values)
    this._addArrayFilters(queryParams, conditions, parameters, paramCounter);

    return {
      whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1=1",
      parameters,
    };
  }

  /**
   * Builds ORDER BY clause for sorting.
   * @private
   * @param {string} sortBy - Field to sort by.
   * @param {string} sortOrder - Sort order (ASC/DESC).
   * @returns {string} ORDER BY clause.
   */
  static _buildOrderByClause(sortBy, sortOrder = "ASC") {
    const validSortFields = {
      id: "f.id",
      feedbackNumber: "f.feedbackNumber",
      feedbackDate: "f.feedbackDate",
      title: "f.title",
      priority: "f.priority",
      status: "f.status",
      createdAt: "f.createdAt",
      updatedAt: "f.updatedAt",
      categoryName: "fc.name",
      communityName: "c.name",
    };

    if (!sortBy || !validSortFields[sortBy]) {
      return "f.createdAt DESC";
    }

    const order = ["ASC", "DESC"].includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "ASC";

    return `${validSortFields[sortBy]} ${order}`;
  }

  /**
   * Builds count query for pagination.
   * @private
   * @param {string} whereClause - WHERE conditions.
   * @returns {string} Count query.
   */
  static _buildCountQuery(whereClause) {
    return `
      SELECT COUNT(*) as total
      FROM Feedback f
      LEFT JOIN FeedbackCategories fc ON f.category = fc.id
      LEFT JOIN FeedbackChannels fch ON f.feedbackChannel = fch.id
      LEFT JOIN Communities c ON f.community = c.id
      LEFT JOIN Governerates g ON c.governerateId = g.id
      LEFT JOIN Regions r ON g.regionId = r.id
      ${whereClause && whereClause !== "1=1" ? `WHERE ${whereClause}` : ""}
    `;
  }

  /**
   * Gets field mappings with SQL types.
   * @private
   * @returns {Object} Field mappings.
   */
  static _getFieldMappings() {
    return {
      // Basic fields
      feedbackNumber: { type: sql.NVarChar },
      feedbackDate: { type: sql.DateTime },
      title: { type: sql.NVarChar },
      description: { type: sql.NVarChar },
      category: { type: sql.Int },
      priority: { type: sql.NVarChar },
      status: { type: sql.NVarChar },
      feedbackChannel: { type: sql.Int },
      impactDescription: { type: sql.NVarChar },

      // Programme/Project fields
      programmeId: { type: sql.Int },
      isProjectRelated: { type: sql.Bit },
      projectId: { type: sql.Int },
      activityId: { type: sql.Int },

      // Provider fields
      providerType: { type: sql.Int },
      individualProviderGender: { type: sql.NVarChar },
      individualProviderAgeGroup: { type: sql.NVarChar },
      individualProviderDisabilityStatus: { type: sql.NVarChar },
      groupProviderNumberOfIndividuals: { type: sql.Int },
      groupProviderGenderComposition: { type: sql.NVarChar },
      dataSharingConsent: { type: sql.Bit },
      consentToFollowUp: { type: sql.Bit },
      followUpContactMethod: { type: sql.NVarChar },
      providerName: { type: sql.NVarChar },
      providerEmail: { type: sql.NVarChar },
      providerPhone: { type: sql.NVarChar },
      providerOrganization: { type: sql.NVarChar },
      providerAddress: { type: sql.NVarChar },

      // Submission fields
      submittedBy: { type: sql.Int },
      submittedAt: { type: sql.DateTime },
      submittedByInitials: { type: sql.NVarChar },
      submittedByConfirmation: { type: sql.Bit },
      submittedByComments: { type: sql.NVarChar },

      // Assignment fields
      assignedTo: { type: sql.Int },
      assignedBy: { type: sql.Int },
      assignedAt: { type: sql.DateTime },

      // Location fields
      community: { type: sql.Int },
      location: { type: sql.NVarChar },
      latitude: { type: sql.Float },
      longitude: { type: sql.Float },

      // Additional fields
      tags: { type: sql.NVarChar },
      attachments: { type: sql.NVarChar },

      // Privacy fields
      isSensitive: { type: sql.Bit },
      isAnonymized: { type: sql.Bit },
      isPublic: { type: sql.Bit },
      privacyPolicyAccepted: { type: sql.Bit },

      // Audit fields
      createdAt: { type: sql.DateTime },
      createdBy: { type: sql.Int },
      updatedAt: { type: sql.DateTime },
      updatedBy: { type: sql.Int },
      isDeleted: { type: sql.Bit },
      deletedAt: { type: sql.DateTime },
      isActive: { type: sql.Bit },
    };
  }

  /**
   * Gets searchable fields for full-text search.
   * @private
   * @returns {Array} Array of searchable field names.
   */
  static _getSearchableFields() {
    return [
      "f.title",
      "f.description",
      "f.feedbackNumber",
      "f.providerName",
      "f.providerEmail",
      "f.tags",
      "fc.name",
      "fch.name",
      "c.name",
      "g.name",
      "r.name",
    ];
  }

  /**
   * Gets filter mappings for exact match filtering.
   * @private
   * @returns {Object} Filter mappings.
   */
  static _getFilterMappings() {
    return {
      id: { field: "f.id", type: sql.Int },
      feedbackNumber: { field: "f.feedbackNumber", type: sql.NVarChar },
      category: { field: "f.category", type: sql.Int },
      priority: { field: "f.priority", type: sql.NVarChar },
      status: { field: "f.status", type: sql.NVarChar },
      feedbackChannel: { field: "f.feedbackChannel", type: sql.Int },
      programmeId: { field: "f.programmeId", type: sql.Int },
      projectId: { field: "f.projectId", type: sql.Int },
      activityId: { field: "f.activityId", type: sql.Int },
      community: { field: "f.community", type: sql.Int },
      submittedBy: { field: "f.submittedBy", type: sql.Int },
      assignedTo: { field: "f.assignedTo", type: sql.Int },
      assignedBy: { field: "f.assignedBy", type: sql.Int },
      providerType: { field: "f.providerType", type: sql.Int },
      isProjectRelated: { field: "f.isProjectRelated", type: sql.Bit },
      dataSharingConsent: { field: "f.dataSharingConsent", type: sql.Bit },
      consentToFollowUp: { field: "f.consentToFollowUp", type: sql.Bit },
      isSensitive: { field: "f.isSensitive", type: sql.Bit },
      isAnonymized: { field: "f.isAnonymized", type: sql.Bit },
      isPublic: { field: "f.isPublic", type: sql.Bit },
      isActive: { field: "f.isActive", type: sql.Bit },
      isDeleted: { field: "f.isDeleted", type: sql.Bit },
    };
  }

  /**
   * Converts value to appropriate type based on SQL type.
   * @private
   * @param {any} value - Value to convert.
   * @param {Object} sqlType - SQL type object.
   * @param {string} fieldName - Field name for error messages.
   * @returns {any} Converted value.
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
      } else if (sqlType === sql.Float) {
        const floatValue = parseFloat(value);
        if (isNaN(floatValue)) {
          throw new Error(
            `Invalid float value for field ${fieldName}: ${value}`
          );
        }
        return floatValue;
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
   * Gets the SQL type for a specific field.
   * @private
   * @param {string} field - Field name.
   * @returns {Object} SQL type object.
   */
  static _getFieldType(fieldName) {
    const fieldMappings = this._getFieldMappings();
    return fieldMappings[fieldName]?.type || sql.NVarChar;
  }

  /**
   * Filters out invalid update data.
   * @private
   * @param {Object} updateData - Data to filter.
   * @returns {Object} Filtered data.
   */
  static _filterValidUpdateData(updateData) {
    return Object.fromEntries(
      Object.entries(updateData).filter(
        ([key, value]) =>
          value !== null && value !== undefined && value !== "" && key !== "id" // Prevent ID updates
      )
    );
  }

  /**
   * Tracks changes between existing and new data.
   * @private
   * @param {Object} existing - Existing feedback data.
   * @param {Object} newData - New data.
   * @returns {Object} Changes object.
   */
  static _trackChanges(existing, newData) {
    const changes = {};

    Object.entries(newData).forEach(([field, newValue]) => {
      const oldValue = existing[field];
      // skip date fields comparison precision issues by converting to ISO strings

      if (oldValue instanceof Date && newValue instanceof Date) {
        // console.log("1- Date fields changed:", field);
        if (
          oldValue.toISOString().substring(0, 10) !==
          newValue.toISOString().substring(0, 10)
        ) {
          changes[field] = {
            from: oldValue,
            to: newValue,
          };
        }
      } else if (oldValue instanceof Date) {
        // console.log("2- Date fields changed:", field);
        if (
          oldValue.toISOString().substring(0, 10) !== newValue.substring(0, 10)
        ) {
          changes[field] = {
            from: oldValue,
            to: newValue,
          };
        }
      } else if (oldValue !== newValue) {
        // console.log("3- Non-date fields changed:", field);
        changes[field] = {
          from: oldValue,
          to: newValue,
        };
      }
    });
    return changes;
  }

  /**
   * Adds date range filters to search conditions.
   * @private
   * @param {Object} queryParams - Query parameters.
   * @param {Array} conditions - Conditions array.
   * @param {Object} parameters - Parameters object.
   * @param {number} paramCounter - Parameter counter.
   */
  static _addDateRangeFilters(
    queryParams,
    conditions,
    parameters,
    paramCounter
  ) {
    const dateFields = [
      "feedbackDate",
      "submittedAt",
      "assignedAt",
      "createdAt",
      "updatedAt",
    ];

    dateFields.forEach((field) => {
      if (queryParams[`${field}From`]) {
        const paramName = `${field}From${paramCounter++}`;
        parameters[paramName] = {
          value: new Date(queryParams[`${field}From`]),
          type: sql.DateTime,
        };
        conditions.push(`f.${field} >= @${paramName}`);
      }

      if (queryParams[`${field}To`]) {
        const paramName = `${field}To${paramCounter++}`;
        parameters[paramName] = {
          value: new Date(queryParams[`${field}To`]),
          type: sql.DateTime,
        };
        conditions.push(`f.${field} <= @${paramName}`);
      }
    });
  }

  /**
   * Adds array filters for comma-separated values.
   * @private
   * @param {Object} queryParams - Query parameters.
   * @param {Array} conditions - Conditions array.
   * @param {Object} parameters - Parameters object.
   * @param {number} paramCounter - Parameter counter.
   */
  static _addArrayFilters(queryParams, conditions, parameters, paramCounter) {
    const arrayFilters = {
      categories: { field: "f.category", type: sql.Int },
      priorities: { field: "f.priority", type: sql.NVarChar },
      statuses: { field: "f.status", type: sql.NVarChar },
      channels: { field: "f.feedbackChannel", type: sql.Int },
    };

    Object.entries(arrayFilters).forEach(([filterName, config]) => {
      if (queryParams[filterName]) {
        const values = queryParams[filterName].split(",").map((v) => v.trim());
        const inConditions = values.map((value) => {
          const paramName = `${filterName}${paramCounter++}`;
          const convertedValue =
            config.type === sql.Int ? parseInt(value, 10) : value;
          parameters[paramName] = { value: convertedValue, type: config.type };
          return `@${paramName}`;
        });

        conditions.push(`${config.field} IN (${inConditions.join(", ")})`);
      }
    });
  }

  /**
   * Gets applied filters from query parameters.
   * @private
   * @param {Object} queryParams - Query parameters.
   * @returns {Object} Applied filters.
   */
  static _getAppliedFilters(queryParams) {
    const filterKeys = [
      "search",
      "category",
      "priority",
      "status",
      "feedbackChannel",
      "programmeId",
      "projectId",
      "activityId",
      "community",
      "submittedBy",
      "assignedTo",
      "providerType",
      "isProjectRelated",
      "dataSharingConsent",
      "consentToFollowUp",
      "isSensitive",
      "isActive",
      "isDeleted",
    ];

    return Object.fromEntries(
      filterKeys
        .filter((key) => queryParams[key] !== undefined)
        .map((key) => [key, queryParams[key]])
    );
  }

  /**
   * Creates appropriate history entries based on the changes made.
   * @private
   */
  static async _createHistoryEntries(
    feedbackId,
    updatedBy,
    changes,
    existingFeedback,
    newData,
    metadata
  ) {
    try {
      // Record status changes
      if (changes.status) {
        await FeedbackHistory.recordStatusChangeAsync(
          feedbackId,
          changes.status.to,
          changes.status.from,
          updatedBy,
          metadata.comments,
          newData.assignedTo?.id || existingFeedback.assignedTo
        );

        // Create status change notification
        await Notification.createStatusChangeNotificationAsync(
          existingFeedback,
          changes.status.from,
          changes.status.to,
          updatedBy
        );
      }

      // Record assignment changes
      if (changes.assignedTo) {
        await FeedbackHistory.recordAssignmentChangeAsync(
          feedbackId,
          changes.assignedTo.to,
          changes.assignedTo.from || null,
          updatedBy,
          newData.status || existingFeedback.status,
          metadata.comments
        );

        // Create assignment change notification
        await Notification.createAssignmentNotificationAsync(
          existingFeedback,
          changes.assignedTo.from || changes.assignedTo.from || null,
          changes.assignedTo.to,
          updatedBy
        );
      }
      // TODO: Implement soft delete history recording
      // if (changes.isDeleted) {
      //   await FeedbackHistory.recordDeletionAsync(
      //     feedbackId,
      //     changes.isDeleted.from,
      //     changes.isDeleted.to,
      //     updatedBy
      //   );

      //  // Create deletion notification
      //   await Notification.createDeletionNotificationAsync(
      //     existingFeedback,
      //     changes.isDeleted.from,
      //     changes.isDeleted.to,
      //     updatedBy
      //   );
      // }

      // Record general updates for other significant changes
      const otherChanges = Object.fromEntries(
        Object.entries(changes).filter(
          ([key]) =>
            !["status", "assignedTo", "updatedAt", "updatedBy"].includes(key)
        )
      );

      if (Object.keys(otherChanges).length > 0) {
        await FeedbackHistory.addHistoryEntryAsync({
          feedbackId,
          status: newData.status || existingFeedback.status,
          assignedTo:
            newData.assignedTo ||
            existingFeedback.assignedTo?.id ||
            existingFeedback.assignedTo,
          updatedBy,
          comments:
            metadata.comments ||
            `Updated: ${Object.keys(otherChanges).join(", ")}`,
          actionType: "UPDATE",
          fieldName: Object.keys(otherChanges).join(","),
          oldValue: JSON.stringify(
            Object.fromEntries(
              Object.entries(otherChanges).map(([k, v]) => [k, v.from])
            )
          ),
          newValue: JSON.stringify(
            Object.fromEntries(
              Object.entries(otherChanges).map(([k, v]) => [k, v.to])
            )
          ),
        });
      }
    } catch (error) {
      console.error("⚠️ Failed to create history entries:", error);
      // Don't throw error to avoid breaking the main update operation
    }
  }

  // create history entries for feedback creation
  static async _createCreationHistoryEntries(
    feedbackId,
    status,
    createdBy,
    comments = null
  ) {
    try {
      await FeedbackHistory.recordFeedbackCreationAsync(
        feedbackId,
        status,
        createdBy,
        comments
      );
    } catch (error) {
      console.error("⚠️ Failed to create creation history entries:", error);
      // Don't throw error to avoid breaking the main create operation
    }
  }
}
