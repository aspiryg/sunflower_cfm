import { database, sql } from "../config/database.js";
import {
  transformCaseResult,
  selectCaseQueryFn,
  getSearchableFields,
  getFilterMappings,
  getValidSortFields,
  getArrayFilters,
  getDateRangeFields,
} from "../scripts/caseModelScripts.js";
// Import related models (will be created next)
import { CaseHistory } from "./CaseHistory.js";
import { CaseComments } from "./CaseComments.js";
import { CaseNotification } from "./CaseNotification.js";
// import { Notification } from "./Notification.js";

export class Case {
  /**
   * Creates a new case entry in the database with dynamic field handling.
   * @param {Object} caseData - The case data to insert.
   * @param {number} [createdBy=1] - The ID of the user creating the case.
   * @returns {Promise<Object>} The created case object.
   */
  static async createCaseAsync(caseData, createdBy = 1) {
    const pool = database.getPool();

    try {
      // Set default values for required fields
      caseData.submittedBy = caseData.submittedBy || createdBy;
      caseData.assignedBy = caseData.assignedBy || createdBy;
      caseData.submittedAt = caseData.submittedAt || new Date();
      caseData.caseDate = caseData.caseDate || new Date();

      // Set assignment timestamp if case is assigned
      if (caseData.assignedTo && !caseData.assignedAt) {
        caseData.assignedAt = new Date();
      }

      // Generate case number if not provided
      if (!caseData.caseNumber) {
        caseData.caseNumber = await this._generateCaseNumber();
      }

      // Validate required fields
      this._validateRequiredFields(caseData, [
        "title",
        "description",
        "categoryId",
        "priorityId",
        "statusId",
        "channelId",
      ]);

      // Add audit fields
      const enrichedData = {
        ...caseData,
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
        isActive: caseData.isActive !== undefined ? caseData.isActive : true,
        isDeleted: false,
        lastActivityDate: new Date(),
      };

      // Build dynamic insert query
      const { query, parameters } = this._buildInsertQuery(enrichedData);

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);
      const insertedId = result.recordset?.[0]?.id;

      if (!insertedId) {
        throw new Error("Failed to get inserted case ID");
      }

      console.log(
        `✅ Case created successfully with number: ${enrichedData.caseNumber}`
      );

      // Return the created case
      const createdCase = await this.findCaseByIdAsync(insertedId);

      // Create history entry for the new case (non-blocking)
      this._createCreationHistoryEntries(
        createdCase.id,
        createdCase.status.id,
        createdCase.assignedTo?.id || null,
        createdCase.createdBy.id,
        caseData.submittedByComments
      );

      // Create initial notification for the new case (non-blocking)
      this._createCaseCreationNotifications(createdCase, createdBy).catch(
        (error) => {
          console.error(
            "⚠️ Failed to create case creation notifications:",
            error
          );
        }
      );

      return createdCase;
    } catch (error) {
      console.error("❌ Failed to create case:", error);
      throw new Error(`Failed to create case: ${error.message}`);
    }
  }

  /**
   * Updates an existing case entry with dynamic field handling.
   * @param {number} id - The ID of the case to update.
   * @param {Object} updateData - The data to update.
   * @param {number} updatedBy - The ID of the user performing the update.
   * @param {Object} metadata - Additional metadata like comments.
   * @returns {Promise<Object>} The updated case object with change tracking.
   */
  static async updateCaseAsync(id, updateData, updatedBy, metadata = {}) {
    const pool = database.getPool();

    try {
      // Validate case exists
      const existingCase = await this.findCaseByIdFlatAsync(id);
      if (!existingCase) {
        throw new Error(`Case with ID ${id} not found`);
      }

      // Filter out null/undefined/empty values
      const filteredData = this._filterValidUpdateData(updateData);

      if (Object.keys(filteredData).length === 0) {
        console.warn("⚠️ No valid data to update");
        return {
          case: await this.findCaseByIdAsync(id),
          changes: {},
          message: "No changes were made",
        };
      }

      // Track changes for audit purposes
      const changes = this._trackChanges(existingCase, filteredData);
      console.log(`🔍 Changes detected for case ${id}:`, changes);

      // Add audit fields
      filteredData.updatedAt = new Date();
      filteredData.updatedBy = updatedBy;
      filteredData.lastActivityDate = new Date();

      // Set assignment timestamp if assignedTo is being changed
      if (filteredData.assignedTo && !filteredData.assignedAt) {
        filteredData.assignedAt = new Date();
      }

      // Build dynamic update query
      const { query, parameters } = this._buildUpdateQuery(id, filteredData);

      // Execute the update
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(`✅ Case ${id} updated successfully`);

        // Create history entry for changes (non-blocking)
        this._createHistoryEntries(
          id,
          updatedBy,
          changes,
          existingCase,
          filteredData,
          metadata
        );

        const updatedCase = await this.findCaseByIdAsync(id);
        return {
          case: updatedCase,
          changes,
          message: "Case updated successfully",
        };
      } else {
        throw new Error("No rows were updated");
      }
    } catch (error) {
      console.error(`❌ Failed to update case ${id}:`, error);
      throw new Error(`Failed to update case: ${error.message}`);
    }
  }

  /**
   * Retrieves all cases with optional filtering for ownership/roles.
   * @param {Object} [options={}] - Options for filtering and pagination.
   * @returns {Promise<Object>} Object with data and pagination info.
   */
  static async getAllCasesAsync(options = {}) {
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
        limit = 20,
        offset = 0,
        orderBy = "c.createdAt DESC",
        // Capture other filters
        ...otherFilters
      } = options;

      // Short-circuit if permission filters indicate no access
      if (impossible) {
        console.warn(
          "⚠️ Permission filter indicates no access, returning empty result"
        );
        return {
          data: [],
          pagination: {
            limit,
            offset,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      // Build conditional WHERE clause
      const conditions = [];
      const parameters = {};
      let paramCounter = 0;

      // Active filter
      if (activeOnly) {
        conditions.push("c.isActive = 1 AND c.isDeleted = 0");
      }

      // Apply permission-based filters
      if (submittedBy) {
        conditions.push("c.submittedBy = @submittedBy");
        parameters.submittedBy = { value: submittedBy, type: sql.Int };
      }

      if (assignedTo) {
        conditions.push("c.assignedTo = @assignedTo");
        parameters.assignedTo = { value: assignedTo, type: sql.Int };
      }

      if (createdBy) {
        conditions.push("c.createdBy = @createdBy");
        parameters.createdBy = { value: createdBy, type: sql.Int };
      }

      // Apply other filters
      Object.entries(otherFilters).forEach(([key, value]) => {
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

        const paramName = `param${++paramCounter}`;
        const fieldMapping = this._getFieldMappings()[key];

        if (fieldMapping) {
          parameters[paramName] = {
            value: this._convertValueByType(value, fieldMapping.type, key),
            type: fieldMapping.type,
          };
          conditions.push(`c.${key} = @${paramName}`);
        }
      });

      const whereClause =
        conditions.length > 0 ? conditions.join(" AND ") : "1=1";

      // Get total count for pagination
      const countQuery = this._buildCountQuery(whereClause);

      // Build main data query
      const dataQuery = selectCaseQueryFn({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });

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
        data: dataResult.recordset.map(transformCaseResult),
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
        `✅ Retrieved ${result.data.length} cases from ${total} total`
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to retrieve all cases:", error);
      throw new Error(`Failed to retrieve cases: ${error.message}`);
    }
  }

  /**
   * Finds a case entry by ID or case number.
   * @param {number} [id] - The ID of the case to retrieve.
   * @param {string} [caseNumber] - The case number to search for.
   * @returns {Promise<Object|null>} The case object if found, null otherwise.
   */
  static async findCaseByIdAsync(id, caseNumber) {
    const pool = database.getPool();

    try {
      if (!id && !caseNumber) {
        throw new Error("Either ID or case number must be provided");
      }

      let whereClause, paramName, paramValue, paramType;

      if (id) {
        whereClause = "c.id = @id AND c.isDeleted = 0";
        paramName = "id";
        paramValue = parseInt(id, 10);
        paramType = sql.Int;
      } else {
        whereClause = "c.caseNumber = @caseNumber AND c.isDeleted = 0";
        paramName = "caseNumber";
        paramValue = caseNumber;
        paramType = sql.NVarChar;
      }

      const query = selectCaseQueryFn({ where: whereClause });

      const result = await pool
        .request()
        .input(paramName, paramType, paramValue)
        .query(query);

      if (result.recordset.length > 0) {
        return transformCaseResult(result.recordset[0]);
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to retrieve case:", error);
      throw new Error(`Failed to retrieve case: ${error.message}`);
    }
  }

  /**
   * Find case by ID - returns flat database result without transformation.
   * @param {number} id - Case ID.
   * @returns {Promise<Object|null>} Raw case data or null.
   */
  static async findCaseByIdFlatAsync(id) {
    const pool = database.getPool();

    try {
      const query = `
        SELECT c.* FROM Cases c 
        WHERE c.id = @id AND c.isDeleted = 0
      `;

      const result = await pool
        .request()
        .input("id", sql.Int, parseInt(id, 10))
        .query(query);

      if (result.recordset.length > 0) {
        return result.recordset[0];
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to retrieve flat case:", error);
      throw new Error(`Failed to retrieve case: ${error.message}`);
    }
  }

  /**
   * Advanced search functionality with full-text search, filtering, and sorting.
   * @param {Object} [queryParams={}] - Search parameters from request query.
   * @returns {Promise<Object>} Search results with data, pagination, and filters info.
   */
  static async searchCasesAsync(queryParams = {}) {
    const pool = database.getPool();

    try {
      // Extract pagination parameters
      const page = Math.max(1, parseInt(queryParams.page) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(queryParams.limit) || 20)
      );
      const offset = (page - 1) * limit;

      // Short-circuit if permission filters indicate no access
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
            fields: getSearchableFields(),
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

      // Add permission-based filter conditions
      if (submittedBy) {
        parameters.submittedBy = { value: submittedBy, type: sql.Int };
        whereClause += ` AND c.submittedBy = @submittedBy`;
      }

      if (assignedTo) {
        parameters.assignedTo = { value: assignedTo, type: sql.Int };
        whereClause += ` AND c.assignedTo = @assignedTo`;
      }

      if (createdBy) {
        parameters.createdBy = { value: createdBy, type: sql.Int };
        whereClause += ` AND c.createdBy = @createdBy`;
      }

      // Add default filters
      whereClause += ` AND c.isDeleted = 0`;

      // Build sorting
      const orderBy = this._buildOrderByClause(
        queryParams.sortBy,
        queryParams.sortOrder
      );

      // Build main query
      const dataQuery = selectCaseQueryFn({
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
        data: dataResult.recordset.map(transformCaseResult),
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
          fields: getSearchableFields(),
          resultsCount: dataResult.recordset.length,
        },
      };

      console.log(
        `✅ Search completed: ${result.data.length} results from ${total} total records`
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to search cases:", error);
      throw new Error(`Failed to search cases: ${error.message}`);
    }
  }

  /**
   * Soft deletes a case by setting deletedAt timestamp.
   * @param {number} id - Case ID.
   * @param {number} deletedBy - User ID who deleted the case.
   * @returns {Promise<boolean>} Success status.
   */
  static async softDeleteCaseAsync(id, deletedBy) {
    try {
      // Validate case exists
      const existingCase = await this.findCaseByIdFlatAsync(id);
      if (!existingCase) {
        throw new Error(`Case with ID ${id} not found`);
      }

      // Set deletion fields
      const updateData = {
        deletedAt: new Date(),
        deletedBy,
        isDeleted: true,
        isActive: false,
        updatedAt: new Date(),
        updatedBy: deletedBy,
      };

      // Call updateCase with the soft delete data
      await this.updateCaseAsync(id, updateData, deletedBy, {
        comments: "Case deleted",
      });

      console.log(`✅ Case ${id} soft deleted successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to soft delete case ${id}:`, error);
      throw new Error(`Failed to soft delete case: ${error.message}`);
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Generates a unique case number.
   * @private
   * @returns {Promise<string>} Generated case number.
   */
  static async _generateCaseNumber() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateString = `${year}${month}${day}`;

    // console.log("Generating case number for date:", currentDate);
    const pool = database.getPool();
    const request = pool
      .request()
      .input("currentDate", sql.DateTime, currentDate);
    // Count cases created today
    const query = `
      SELECT COUNT(*) AS count FROM Cases
      WHERE CAST(createdAt AS DATE) = CAST(@currentDate AS DATE)
    `;

    try {
      const result = await request.query(query);
      console.log("Generated case number:", result.recordset[0]);
      const todayCount = (result.recordset[0]?.count || 0) + 1;
      // const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      return `CS-${dateString}-${todayCount.toString().padStart(4, "0")}`;
    } catch (error) {
      throw new Error(`Failed to generate case number: ${error.message}`);
    }
  }

  /**
   * Validates required fields for case creation.
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
      INSERT INTO Cases (${fields.join(", ")})
      OUTPUT INSERTED.id
      VALUES (${values.join(", ")})
    `;

    return { query, parameters };
  }

  /**
   * Builds dynamic UPDATE query.
   * @private
   */
  static _buildUpdateQuery(id, data) {
    const fieldMappings = this._getFieldMappings();
    const setClauses = [];
    const parameters = {};
    let paramCounter = 0;

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
      UPDATE Cases 
      SET ${setClauses.join(", ")}
      WHERE id = @${idParamName} AND isDeleted = 0
    `;

    return { query, parameters };
  }

  /**
   * Builds search conditions for dynamic querying.
   * @private
   */
  static _buildSearchConditions(queryParams) {
    const conditions = [];
    const parameters = {};
    let paramCounter = 0;

    // Full-text search
    if (queryParams.search) {
      const searchFields = getSearchableFields();

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
    const filterMappings = getFilterMappings();
    Object.entries(filterMappings).forEach(([param, config]) => {
      if (queryParams[param] !== undefined && queryParams[param] !== "") {
        const paramName = `filter${paramCounter++}`;
        const value = this._convertValueByType(
          queryParams[param],
          this._getSqlTypeFromString(config.type),
          param
        );

        parameters[paramName] = {
          value,
          type: this._getSqlTypeFromString(config.type),
        };
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
   */
  static _buildOrderByClause(sortBy, sortOrder = "DESC") {
    const validSortFields = getValidSortFields();

    if (!sortBy || !validSortFields[sortBy]) {
      return "c.createdAt DESC";
    }

    const order = ["ASC", "DESC"].includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    return `${validSortFields[sortBy]} ${order}`;
  }

  /**
   * Builds count query for pagination.
   * @private
   */
  static _buildCountQuery(whereClause) {
    return `
      SELECT COUNT(*) as total
      FROM Cases c
      LEFT JOIN CaseCategories cat ON c.categoryId = cat.id
      LEFT JOIN CasePriority pri ON c.priorityId = pri.id
      LEFT JOIN CaseStatus st ON c.statusId = st.id
      LEFT JOIN CaseChannels ch ON c.channelId = ch.id
      LEFT JOIN Programs prog ON c.programId = prog.id
      LEFT JOIN Projects proj ON c.projectId = proj.id
      LEFT JOIN Activities act ON c.activityId = act.id
      LEFT JOIN ProviderTypes pt ON c.providerTypeId = pt.id
      LEFT JOIN Communities com ON c.communityId = com.id
      LEFT JOIN Governorates gov ON com.governorateId = gov.id
      LEFT JOIN Regions reg ON gov.regionId = reg.id
      ${whereClause && whereClause !== "1=1" ? `WHERE ${whereClause}` : ""}
    `;
  }

  /**
   * Gets field mappings with SQL types.
   * @private
   */
  static _getFieldMappings() {
    return {
      // Core fields
      caseNumber: { type: sql.NVarChar },
      title: { type: sql.NVarChar },
      description: { type: sql.NVarChar },
      caseDate: { type: sql.DateTime },
      dueDate: { type: sql.DateTime },
      resolvedDate: { type: sql.DateTime },

      // Classification
      categoryId: { type: sql.Int },
      priorityId: { type: sql.Int },
      statusId: { type: sql.Int },
      channelId: { type: sql.Int },

      // Impact & Urgency
      impactDescription: { type: sql.NVarChar },
      urgencyLevel: { type: sql.NVarChar },
      affectedBeneficiaries: { type: sql.Int },

      // Related Programme/Project/Activity
      programId: { type: sql.Int },
      projectId: { type: sql.Int },
      activityId: { type: sql.Int },
      isProjectRelated: { type: sql.Bit },

      // Provider Information
      providerTypeId: { type: sql.Int },
      individualProviderGender: { type: sql.NVarChar },
      individualProviderAgeGroup: { type: sql.NVarChar },
      individualProviderDisabilityStatus: { type: sql.NVarChar },
      groupProviderSize: { type: sql.Int },
      groupProviderGenderComposition: { type: sql.NVarChar },

      // Contact Information
      providerName: { type: sql.NVarChar },
      providerEmail: { type: sql.NVarChar },
      providerPhone: { type: sql.NVarChar },
      providerOrganization: { type: sql.NVarChar },
      providerAddress: { type: sql.NVarChar },

      // Consent & Privacy
      dataSharingConsent: { type: sql.Bit },
      followUpConsent: { type: sql.Bit },
      followUpContactMethod: { type: sql.NVarChar },
      privacyPolicyAccepted: { type: sql.Bit },
      isSensitive: { type: sql.Bit },
      isAnonymized: { type: sql.Bit },
      isPublic: { type: sql.Bit },
      confidentialityLevel: { type: sql.NVarChar },

      // Location
      communityId: { type: sql.Int },
      location: { type: sql.NVarChar },
      coordinates: { type: sql.NVarChar },

      // Assignment Information
      assignedTo: { type: sql.Int },
      assignedBy: { type: sql.Int },
      assignedAt: { type: sql.DateTime },
      assignmentComments: { type: sql.NVarChar },

      // Submission Information
      submittedBy: { type: sql.Int },
      submittedAt: { type: sql.DateTime },
      submittedByInitials: { type: sql.NVarChar },
      submittedByConfirmation: { type: sql.Bit },
      submittedByComments: { type: sql.NVarChar },

      // Processing Information
      firstResponseDate: { type: sql.DateTime },
      lastActivityDate: { type: sql.DateTime },
      escalationLevel: { type: sql.Int },
      escalatedAt: { type: sql.DateTime },
      escalatedBy: { type: sql.Int },
      escalationReason: { type: sql.NVarChar },

      // Resolution Information
      resolutionSummary: { type: sql.NVarChar },
      resolutionCategory: { type: sql.NVarChar },
      resolutionSatisfaction: { type: sql.Int },

      // Follow-up & Monitoring
      followUpRequired: { type: sql.Bit },
      followUpDate: { type: sql.DateTime },
      monitoringRequired: { type: sql.Bit },
      monitoringDate: { type: sql.DateTime },

      // Quality Assurance
      qualityReviewed: { type: sql.Bit },
      qualityReviewedBy: { type: sql.Int },
      qualityReviewedAt: { type: sql.DateTime },
      qualityScore: { type: sql.Int },
      qualityComments: { type: sql.NVarChar },

      // Metadata
      tags: { type: sql.NVarChar },
      attachments: { type: sql.NVarChar },
      externalReferences: { type: sql.NVarChar },

      // Audit Information
      createdAt: { type: sql.DateTime },
      createdBy: { type: sql.Int },
      updatedAt: { type: sql.DateTime },
      updatedBy: { type: sql.Int },
      isActive: { type: sql.Bit },
      isDeleted: { type: sql.Bit },
      deletedAt: { type: sql.DateTime },
      deletedBy: { type: sql.Int },
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
   * Gets SQL type object from string representation.
   * @private
   */
  static _getSqlTypeFromString(typeString) {
    const typeMap = {
      Int: sql.Int,
      NVarChar: sql.NVarChar,
      Bit: sql.Bit,
      DateTime: sql.DateTime,
      Float: sql.Float,
    };
    return typeMap[typeString] || sql.NVarChar;
  }

  /**
   * Filters out invalid update data.
   * @private
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
   */
  static _trackChanges(existing, newData) {
    const changes = {};

    Object.entries(newData).forEach(([field, newValue]) => {
      const oldValue = existing[field];

      // Handle date fields with precision issues
      if (oldValue instanceof Date && newValue instanceof Date) {
        if (
          oldValue.toISOString().substring(0, 10) !==
          newValue.toISOString().substring(0, 10)
        ) {
          changes[field] = { from: oldValue, to: newValue };
        }
      } else if (oldValue instanceof Date) {
        if (
          oldValue.toISOString().substring(0, 10) !== newValue.substring(0, 10)
        ) {
          changes[field] = { from: oldValue, to: newValue };
        }
      } else if (oldValue !== newValue) {
        changes[field] = { from: oldValue, to: newValue };
      }
    });

    return changes;
  }

  /**
   * Adds date range filters to search conditions.
   * @private
   */
  static _addDateRangeFilters(
    queryParams,
    conditions,
    parameters,
    paramCounter
  ) {
    const dateFields = getDateRangeFields();

    dateFields.forEach((field) => {
      if (queryParams[`${field}From`]) {
        const paramName = `${field}From${paramCounter++}`;
        parameters[paramName] = {
          value: new Date(queryParams[`${field}From`]),
          type: sql.DateTime,
        };
        conditions.push(`c.${field} >= @${paramName}`);
      }

      if (queryParams[`${field}To`]) {
        const paramName = `${field}To${paramCounter++}`;
        parameters[paramName] = {
          value: new Date(queryParams[`${field}To`]),
          type: sql.DateTime,
        };
        conditions.push(`c.${field} <= @${paramName}`);
      }
    });
  }

  /**
   * Adds array filters for comma-separated values.
   * @private
   */
  static _addArrayFilters(queryParams, conditions, parameters, paramCounter) {
    const arrayFilters = getArrayFilters();

    Object.entries(arrayFilters).forEach(([filterName, config]) => {
      if (queryParams[filterName]) {
        const values = queryParams[filterName].split(",").map((v) => v.trim());
        const inConditions = values.map((value) => {
          const paramName = `${filterName}${paramCounter++}`;
          const convertedValue =
            this._getSqlTypeFromString(config.type) === sql.Int
              ? parseInt(value, 10)
              : value;
          parameters[paramName] = {
            value: convertedValue,
            type: this._getSqlTypeFromString(config.type),
          };
          return `@${paramName}`;
        });

        conditions.push(`${config.field} IN (${inConditions.join(", ")})`);
      }
    });
  }

  /**
   * Gets applied filters from query parameters.
   * @private
   */
  static _getAppliedFilters(queryParams) {
    const filterKeys = [
      "search",
      "categoryId",
      "priorityId",
      "statusId",
      "channelId",
      "urgencyLevel",
      "confidentialityLevel",
      "programId",
      "projectId",
      "activityId",
      "communityId",
      "submittedBy",
      "assignedTo",
      "providerTypeId",
      "isProjectRelated",
      "dataSharingConsent",
      "followUpConsent",
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
    caseId,
    updatedBy,
    changes,
    existingCase,
    newData,
    metadata
  ) {
    try {
      // Create history entries for each significant change
      const historyPromises = [];
      const processedFields = new Set(); // Track which fields we've handled

      // Handle significant changes - one record per change
      Object.entries(changes).forEach(([field, change]) => {
        let historyEntry;

        switch (field) {
          case "statusId":
            historyEntry = CaseHistory.recordStatusChangeAsync(
              caseId,
              change.to,
              change.from,
              updatedBy,
              metadata.statusReason || null,
              metadata.comments || null
            );
            processedFields.add(field);
            // Create status change notification (non-blocking)
            this._createStatusChangeNotifications(
              caseId,
              change.from,
              change.to,
              updatedBy,
              metadata
            ).catch((error) => {
              console.error(
                "⚠️ Failed to create status change notifications:",
                error
              );
            });

            break;

          case "assignedTo":
            historyEntry = CaseHistory.recordAssignmentChangeAsync(
              caseId,
              change.to,
              change.from,
              updatedBy,
              metadata.assignmentComments || metadata.comments || null
            );
            processedFields.add(field);
            // Create assignment notification (non-blocking)
            this._createAssignmentNotifications(
              caseId,
              change.from,
              change.to,
              updatedBy,
              metadata
            ).catch((error) => {
              console.error(
                "⚠️ Failed to create assignment notifications:",
                error
              );
            });
            break;

          case "priorityId":
            historyEntry = CaseHistory.recordPriorityChangeAsync(
              caseId,
              change.to,
              change.from,
              updatedBy,
              metadata.comments || null
            );
            processedFields.add(field);
            break;

          case "categoryId":
            historyEntry = CaseHistory.recordCategoryChangeAsync(
              caseId,
              change.to,
              change.from,
              updatedBy,
              metadata.comments || null
            );
            processedFields.add(field);
            break;

          case "escalationLevel":
            if (change.to > change.from) {
              historyEntry = CaseHistory.recordEscalationAsync(
                caseId,
                change.to,
                updatedBy,
                metadata.escalationReason ||
                  metadata.comments ||
                  "Case escalated",
                newData.assignedTo || null
              );
              processedFields.add(field);
              // Create escalation notification (non-blocking)
              this._createEscalationNotifications(
                caseId,
                change.to,
                updatedBy,
                metadata
              ).catch((error) => {
                console.error(
                  "⚠️ Failed to create escalation notifications:",
                  error
                );
              });
            }
            break;

          case "resolvedDate":
            if (change.to && !change.from) {
              historyEntry = CaseHistory.recordResolutionAsync(
                caseId,
                newData.statusId,
                metadata.resolutionSummary ||
                  metadata.comments ||
                  "Case resolved",
                updatedBy
              );
              processedFields.add(field);
              // Create resolution notification (non-blocking)
              this._createResolutionNotifications(
                caseId,
                updatedBy,
                metadata
              ).catch((error) => {
                console.error(
                  "⚠️ Failed to create resolution notifications:",
                  error
                );
              });
            }
            break;
        }

        if (historyEntry) {
          historyPromises.push(historyEntry);
        }
      });

      // Handle all other changes in one generic history record
      const otherChanges = Object.fromEntries(
        Object.entries(changes).filter(([field]) => !processedFields.has(field))
      );

      if (Object.keys(otherChanges).length > 0) {
        // Build change descriptions for generic entry
        const changeDescriptions = [];
        const fieldChanges = {};

        Object.entries(otherChanges).forEach(([field, change]) => {
          changeDescriptions.push(`${field}: ${change.from} → ${change.to}`);
          fieldChanges[field] = {
            from: change.from,
            to: change.to,
          };
        });

        // Create one generic history entry for all other changes
        const genericHistoryEntry = CaseHistory.addHistoryEntryAsync({
          caseId,
          actionType: "UPDATE",
          fieldName: Object.keys(otherChanges).join(", "), // List all changed fields
          oldValue: JSON.stringify(
            Object.fromEntries(
              Object.entries(otherChanges).map(([field, change]) => [
                field,
                change.from,
              ])
            )
          ),
          newValue: JSON.stringify(
            Object.fromEntries(
              Object.entries(otherChanges).map(([field, change]) => [
                field,
                change.to,
              ])
            )
          ),
          changeDescription: `Updated fields: ${changeDescriptions.join("; ")}`,
          comments:
            metadata.comments ||
            `${Object.keys(otherChanges).length} field(s) updated`,
          createdBy: updatedBy,
        });

        historyPromises.push(genericHistoryEntry);

        console.log(
          `📝 Generic history entry will include ${
            Object.keys(otherChanges).length
          } field changes: ${Object.keys(otherChanges).join(", ")}`
        );
      }

      // Execute all history entries in parallel (non-blocking)
      if (historyPromises.length > 0) {
        Promise.all(historyPromises)
          .then(() => {
            const significantChanges = processedFields.size;
            const otherChangesCount = Object.keys(otherChanges).length;
            const totalEntries =
              significantChanges + (otherChangesCount > 0 ? 1 : 0);

            console.log(
              `📝 ${totalEntries} history entries created for case ${caseId} (${significantChanges} significant + ${
                otherChangesCount > 0 ? "1 generic" : "0 generic"
              })`
            );
          })
          .catch((error) => {
            console.error("⚠️ Some history entries failed to create:", error);
          });
      }

      console.log(`📝 Case ${caseId} changes recorded:`, Object.keys(changes));
    } catch (error) {
      console.error("⚠️ Failed to create history entries:", error);
      // Don't throw error - history failure shouldn't block case update
    }
  }

  /**
   * Creates history entries for case creation.
   * @private
   */
  static async _createCreationHistoryEntries(
    caseId,
    statusId,
    assignedTo,
    createdBy,
    comments = null
  ) {
    try {
      // Record case creation (non-blocking)
      CaseHistory.recordCaseCreationAsync(
        caseId,
        statusId,
        assignedTo,
        createdBy,
        comments
      )
        .then(() => {
          console.log(`📝 Case ${caseId} creation history recorded`);
        })
        .catch((error) => {
          console.error("⚠️ Failed to create case creation history:", error);
        });
    } catch (error) {
      console.error("⚠️ Failed to create creation history entries:", error);
      // Don't throw error - history failure shouldn't block case creation
    }
  }

  // Add these methods before the final closing brace of the Case class:

  // ============= CASE HISTORY INTEGRATION METHODS =============

  /**
   * Gets case history with optional filtering.
   * @param {number} caseId - Case ID.
   * @param {Object} [options={}] - History query options.
   * @returns {Promise<Object>} Case history with pagination.
   */
  static async getCaseHistoryAsync(caseId, options = {}) {
    try {
      return await CaseHistory.getHistoryByCaseIdAsync(caseId, options);
    } catch (error) {
      console.error(`❌ Failed to get case history for ${caseId}:`, error);
      throw new Error(`Failed to get case history: ${error.message}`);
    }
  }

  /**
   * Gets case history summary (counts by action type).
   * @param {number} caseId - Case ID.
   * @returns {Promise<Object>} History summary.
   */
  static async getCaseHistorySummaryAsync(caseId) {
    try {
      return await CaseHistory.getCaseHistorySummaryAsync(caseId);
    } catch (error) {
      console.error(
        `❌ Failed to get case history summary for ${caseId}:`,
        error
      );
      throw new Error(`Failed to get case history summary: ${error.message}`);
    }
  }

  // ============= CASE COMMENTS INTEGRATION METHODS =============

  /**
   * Adds a comment to a case and records it in history.
   * @param {number} caseId - Case ID.
   * @param {number} userId - User adding the comment.
   * @param {string} comment - Comment text.
   * @param {Object} [options={}] - Comment options.
   * @returns {Promise<Object>} Created comment.
   */
  static async addCaseCommentAsync(caseId, userId, comment, options = {}) {
    try {
      // Validate case exists
      const existingCase = await this.findCaseByIdFlatAsync(caseId);
      if (!existingCase) {
        throw new Error(`Case with ID ${caseId} not found`);
      }

      // Create the comment
      const createdComment = await CaseComments.addComment(
        caseId,
        userId,
        comment,
        options
      );

      // Create comment notification (non-blocking)
      this._createCommentNotifications(caseId, createdComment, userId).catch(
        (error) => {
          console.error("⚠️ Failed to create comment notifications:", error);
        }
      );

      // Record comment addition in case history (non-blocking)
      CaseHistory.recordCommentAddedAsync(
        caseId,
        createdComment.id,
        userId,
        options.commentType || "internal"
      ).catch((error) => {
        console.error(
          "⚠️ Failed to record comment addition in history:",
          error
        );
      });

      // Update case lastActivityDate
      this.updateCaseAsync(caseId, { lastActivityDate: new Date() }, userId, {
        comments: "Comment added",
      }).catch((error) => {
        console.error("⚠️ Failed to update case last activity:", error);
      });

      console.log(`✅ Comment added to case ${caseId} by user ${userId}`);
      return createdComment;
    } catch (error) {
      console.error(`❌ Failed to add comment to case ${caseId}:`, error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Gets comments for a case with optional filtering.
   * @param {number} caseId - Case ID.
   * @param {Object} [options={}] - Comment query options.
   * @returns {Promise<Object>} Case comments with pagination.
   */
  static async getCaseCommentsAsync(caseId, options = {}) {
    try {
      return await CaseComments.getCommentsByCaseId(caseId, options);
    } catch (error) {
      console.error(`❌ Failed to get case comments for ${caseId}:`, error);
      throw new Error(`Failed to get case comments: ${error.message}`);
    }
  }

  /**
   * Gets comment count summary for a case.
   * @param {number} caseId - Case ID.
   * @param {Object} [filters={}] - Comment filters.
   * @returns {Promise<Object>} Comment count summary.
   */
  static async getCaseCommentCountAsync(caseId, filters = {}) {
    try {
      return await CaseComments.getCommentCount(caseId, filters);
    } catch (error) {
      console.error(
        `❌ Failed to get case comment count for ${caseId}:`,
        error
      );
      throw new Error(`Failed to get case comment count: ${error.message}`);
    }
  }

  /**
   * Updates a case comment.
   * @param {number} commentId - Comment ID.
   * @param {string} newComment - New comment text.
   * @param {number} updatedBy - User updating the comment.
   * @param {Object} [options={}] - Update options.
   * @returns {Promise<Object>} Updated comment.
   */
  static async updateCaseCommentAsync(
    commentId,
    newComment,
    updatedBy,
    options = {}
  ) {
    try {
      return await CaseComments.updateComment(
        commentId,
        newComment,
        updatedBy,
        options
      );
    } catch (error) {
      console.error(`❌ Failed to update comment ${commentId}:`, error);
      throw new Error(`Failed to update comment: ${error.message}`);
    }
  }

  /**
   * Deletes a case comment.
   * @param {number} commentId - Comment ID.
   * @param {number} deletedBy - User deleting the comment.
   * @returns {Promise<boolean>} Success status.
   */
  static async deleteCaseCommentAsync(commentId, deletedBy) {
    try {
      return await CaseComments.deleteComment(commentId, deletedBy);
    } catch (error) {
      console.error(`❌ Failed to delete comment ${commentId}:`, error);
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  /**
   * Marks a comment's follow-up as completed.
   * @param {number} commentId - Comment ID.
   * @param {number} completedBy - User completing the follow-up.
   * @returns {Promise<Object>} Updated comment.
   */
  static async markCommentFollowUpCompletedAsync(commentId, completedBy) {
    try {
      return await CaseComments.markFollowUpCompleted(commentId, completedBy);
    } catch (error) {
      console.error(
        `❌ Failed to mark follow-up completed for comment ${commentId}:`,
        error
      );
      throw new Error(`Failed to mark follow-up completed: ${error.message}`);
    }
  }

  /**
   * Gets comments requiring follow-up.
   * @param {Object} [options={}] - Query options.
   * @returns {Promise<Object>} Comments requiring follow-up.
   */
  static async getCommentsRequiringFollowUpAsync(options = {}) {
    try {
      return await CaseComments.getCommentsRequiringFollowUp(options);
    } catch (error) {
      console.error("❌ Failed to get comments requiring follow-up:", error);
      throw new Error(
        `Failed to get comments requiring follow-up: ${error.message}`
      );
    }
  }

  // ============= CASE WORKFLOW METHODS =============

  /**
   * Assigns a case to a user with history tracking.
   * @param {number} caseId - Case ID.
   * @param {number} assignedTo - User to assign to.
   * @param {number} assignedBy - User making the assignment.
   * @param {Object} [options={}] - Assignment options.
   * @returns {Promise<Object>} Updated case.
   */
  static async assignCaseAsync(caseId, assignedTo, assignedBy, options = {}) {
    try {
      const { comments, expectedCompletionDate } = options;

      const updateData = {
        assignedTo,
        assignedBy,
        assignedAt: new Date(),
      };

      if (expectedCompletionDate) {
        updateData.dueDate = new Date(expectedCompletionDate);
      }

      const metadata = {
        assignmentComments: comments,
        comments: comments || `Case assigned to user ${assignedTo}`,
      };

      return await this.updateCaseAsync(
        caseId,
        updateData,
        assignedBy,
        metadata
      );
    } catch (error) {
      console.error(`❌ Failed to assign case ${caseId}:`, error);
      throw new Error(`Failed to assign case: ${error.message}`);
    }
  }

  /**
   * Changes case status with history tracking.
   * @param {number} caseId - Case ID.
   * @param {number} newStatusId - New status ID.
   * @param {number} updatedBy - User making the change.
   * @param {Object} [options={}] - Status change options.
   * @returns {Promise<Object>} Updated case.
   */
  static async changeCaseStatusAsync(
    caseId,
    newStatusId,
    updatedBy,
    options = {}
  ) {
    try {
      const { reason, comments, resolutionSummary } = options;

      const updateData = { statusId: newStatusId };

      // If marking as resolved, set resolved date
      if (options.isResolved) {
        updateData.resolvedDate = new Date();
        updateData.resolutionSummary = resolutionSummary;
      }

      const metadata = {
        statusReason: reason,
        comments: comments || reason,
        resolutionSummary,
      };

      return await this.updateCaseAsync(
        caseId,
        updateData,
        updatedBy,
        metadata
      );
    } catch (error) {
      console.error(`❌ Failed to change case status for ${caseId}:`, error);
      throw new Error(`Failed to change case status: ${error.message}`);
    }
  }

  /**
   * Escalates a case with history tracking.
   * @param {number} caseId - Case ID.
   * @param {number} escalatedBy - User escalating the case.
   * @param {string} escalationReason - Reason for escalation.
   * @param {Object} [options={}] - Escalation options.
   * @returns {Promise<Object>} Updated case.
   */
  static async escalateCaseAsync(
    caseId,
    escalatedBy,
    escalationReason,
    options = {}
  ) {
    try {
      const { escalatedTo, newPriorityId } = options;

      // Get current case to determine escalation level
      const currentCase = await this.findCaseByIdFlatAsync(caseId);
      if (!currentCase) {
        throw new Error(`Case with ID ${caseId} not found`);
      }

      const updateData = {
        escalationLevel: (currentCase.escalationLevel || 0) + 1,
        escalatedAt: new Date(),
        escalatedBy,
        escalationReason,
      };

      if (escalatedTo) {
        updateData.assignedTo = escalatedTo;
        updateData.assignedBy = escalatedBy;
        updateData.assignedAt = new Date();
      }

      if (newPriorityId) {
        updateData.priorityId = newPriorityId;
      }

      const metadata = {
        escalationReason,
        comments: `Case escalated: ${escalationReason}`,
      };

      return await this.updateCaseAsync(
        caseId,
        updateData,
        escalatedBy,
        metadata
      );
    } catch (error) {
      console.error(`❌ Failed to escalate case ${caseId}:`, error);
      throw new Error(`Failed to escalate case: ${error.message}`);
    }
  }

  // ============= PRIVATE NOTIFICATION METHODS =============

  /**
   * Creates notifications for case creation
   * @private
   */
  static async _createCaseCreationNotifications(caseData, createdBy) {
    try {
      const notifications = [];

      // Notify assigned user (if different from creator)
      if (caseData.assignedTo?.id && caseData.assignedTo.id !== createdBy) {
        const notification = await CaseNotification.notifyCaseAssignedAsync(
          caseData,
          caseData.assignedTo.id,
          createdBy
        );
        if (notification) notifications.push(notification);
      }

      // Notify supervisors/managers about new case creation
      const supervisors = await this._getSupervisorUsers();
      for (const supervisor of supervisors) {
        if (
          supervisor.id !== createdBy &&
          supervisor.id !== caseData.assignedTo?.id
        ) {
          const notification =
            await CaseNotification.createCaseNotificationAsync({
              userId: supervisor.id,
              caseId: caseData.id,
              entityType: "case",
              entityId: caseData.id,
              type: "case_updated", // Using available type from schema
              title: "New Case Submitted",
              message: `New case "${caseData.title}" has been submitted and requires attention.`,
              priority: CaseNotification._determinePriority(
                caseData.priority?.level || caseData.urgencyLevel
              ),
              actionUrl: `/cases/${caseData.id}`,
              actionText: "Review Case",
              triggerUserId: createdBy,
              triggerAction: "case_creation",
              metadata: {
                caseNumber: caseData.caseNumber,
                category: caseData.category?.name,
                submittedBy: caseData.submittedBy?.firstName,
                urgencyLevel: caseData.urgencyLevel,
              },
            });
          notifications.push(notification);
        }
      }

      console.log(
        `✅ Created ${notifications.length} notifications for case creation`
      );
      return notifications;
    } catch (error) {
      console.error("❌ Failed to create case creation notifications:", error);
      throw error;
    }
  }

  /**
   * Creates notifications for status changes
   * @private
   */
  static async _createStatusChangeNotifications(
    caseId,
    oldStatusId,
    newStatusId,
    changedBy,
    metadata
  ) {
    try {
      // Get case data with status names
      const caseData = await this.findCaseByIdAsync(caseId);
      if (!caseData) return [];

      // Get status names (you'll need to implement this or get from lookup)
      const oldStatus = await this._getStatusName(oldStatusId);
      const newStatus = await this._getStatusName(newStatusId);

      return await CaseNotification.notifyCaseStatusChangeAsync(
        caseData,
        oldStatus,
        newStatus,
        changedBy
      );
    } catch (error) {
      console.error("❌ Failed to create status change notifications:", error);
      throw error;
    }
  }

  /**
   * Creates notifications for assignment changes
   * @private
   */
  static async _createAssignmentNotifications(
    caseId,
    oldAssigneeId,
    newAssigneeId,
    assignedBy,
    metadata
  ) {
    try {
      // Get case data
      const caseData = await this.findCaseByIdAsync(caseId);
      if (!caseData) return [];

      const notifications = [];

      // Notify new assignee
      if (newAssigneeId && newAssigneeId !== assignedBy) {
        const notification = await CaseNotification.notifyCaseAssignedAsync(
          caseData,
          newAssigneeId,
          assignedBy
        );
        if (notification) notifications.push(notification);
      }

      // Notify old assignee about reassignment
      if (
        oldAssigneeId &&
        oldAssigneeId !== newAssigneeId &&
        oldAssigneeId !== assignedBy
      ) {
        const notification = await CaseNotification.createCaseNotificationAsync(
          {
            userId: oldAssigneeId,
            caseId: caseData.id,
            entityType: "case",
            entityId: caseData.id,
            type: "assignment_transferred", // Using available type from schema
            title: "Case Reassigned",
            message: `Case "${caseData.title}" has been reassigned to another user.`,
            priority: "normal",
            actionUrl: `/cases/${caseData.id}`,
            actionText: "View Case",
            triggerUserId: assignedBy,
            triggerAction: "case_reassignment",
            metadata: {
              caseNumber: caseData.caseNumber,
              newAssignee: newAssigneeId,
              reassignedBy: assignedBy,
            },
          }
        );
        notifications.push(notification);
      }

      console.log(
        `✅ Created ${notifications.length} notifications for assignment change`
      );
      return notifications;
    } catch (error) {
      console.error("❌ Failed to create assignment notifications:", error);
      throw error;
    }
  }

  /**
   * Creates notifications for case escalation
   * @private
   */
  static async _createEscalationNotifications(
    caseId,
    escalationLevel,
    escalatedBy,
    metadata
  ) {
    try {
      // Get case data
      const caseData = await this.findCaseByIdAsync(caseId);
      if (!caseData) return [];

      const escalationReason =
        metadata.escalationReason || metadata.comments || "Case escalated";

      return await CaseNotification.notifyCaseEscalationAsync(
        caseData,
        escalatedBy,
        escalationReason
      );
    } catch (error) {
      console.error("❌ Failed to create escalation notifications:", error);
      throw error;
    }
  }

  /**
   * Creates notifications for case resolution
   * @private
   */
  static async _createResolutionNotifications(caseId, resolvedBy, metadata) {
    try {
      // Get case data
      const caseData = await this.findCaseByIdAsync(caseId);
      if (!caseData) return [];

      const notifications = [];
      const usersToNotify = new Set();

      // Add case submitter
      if (caseData.submittedBy?.id && caseData.submittedBy.id !== resolvedBy) {
        usersToNotify.add(caseData.submittedBy.id);
      }

      // Add assigned user
      if (caseData.assignedTo?.id && caseData.assignedTo.id !== resolvedBy) {
        usersToNotify.add(caseData.assignedTo.id);
      }

      for (const userId of usersToNotify) {
        const notification = await CaseNotification.createCaseNotificationAsync(
          {
            userId,
            caseId: caseData.id,
            entityType: "case",
            entityId: caseData.id,
            type: "case_resolved",
            title: "Case Resolved",
            message: `Case "${caseData.title}" has been resolved.`,
            priority: "normal",
            actionUrl: `/cases/${caseData.id}`,
            actionText: "View Resolution",
            triggerUserId: resolvedBy,
            triggerAction: "case_resolution",
            metadata: {
              caseNumber: caseData.caseNumber,
              resolutionSummary: metadata.resolutionSummary,
              resolvedBy,
            },
          }
        );
        notifications.push(notification);
      }

      console.log(
        `✅ Created ${notifications.length} notifications for case resolution`
      );
      return notifications;
    } catch (error) {
      console.error("❌ Failed to create resolution notifications:", error);
      throw error;
    }
  }

  /**
   * Creates notifications for case comments
   * @private
   */
  static async _createCommentNotifications(caseId, comment, commentedBy) {
    try {
      // Get case data
      const caseData = await this.findCaseByIdAsync(caseId);
      if (!caseData) return [];

      return await CaseNotification.notifyCaseCommentAsync(
        caseData,
        comment,
        commentedBy
      );
    } catch (error) {
      console.error("❌ Failed to create comment notifications:", error);
      throw error;
    }
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
   * Get status name by ID
   * @private
   */
  static async _getStatusName(statusId) {
    try {
      const pool = database.getPool();
      const query = `SELECT name FROM CaseStatus WHERE id = @statusId`;

      const result = await pool
        .request()
        .input("statusId", sql.Int, statusId)
        .query(query);

      return result.recordset[0]?.name || `Status ${statusId}`;
    } catch (error) {
      console.error(`Failed to get status name for ID ${statusId}:`, error);
      return `Status ${statusId}`;
    }
  }
}
