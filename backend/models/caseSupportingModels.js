import { database, sql } from "../config/database.js";

/**
 * Base class for supporting models with common CRUD operations
 */
class BaseSupportingModel {
  /**
   * Creates a new record
   * @param {Object} data - Record data
   * @param {number} createdBy - User ID creating the record
   * @returns {Promise<Object>} Created record
   */
  static async create(data, createdBy = 1) {
    const pool = database.getPool();

    try {
      // Add audit fields
      const enrichedData = {
        ...data,
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      // Build dynamic insert query
      const fields = Object.keys(enrichedData).filter(
        (field) =>
          enrichedData[field] !== undefined && enrichedData[field] !== null
      );
      const values = fields.map((field) => `@${field}`);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(", ")})
        OUTPUT INSERTED.*
        VALUES (${values.join(", ")})
      `;

      const request = pool.request();
      fields.forEach((field) => {
        const value = enrichedData[field];
        const sqlType = this._getSqlType(field, value);
        request.input(field, sqlType, value);
      });

      const result = await request.query(query);

      if (result.recordset.length > 0) {
        console.log(`✅ ${this.modelName} created successfully`);
        return result.recordset[0];
      } else {
        throw new Error(`Failed to create ${this.modelName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create ${this.modelName}:`, error);
      throw new Error(`Failed to create ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Gets all records
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  static async getAll(options = {}) {
    const pool = database.getPool();

    try {
      const {
        activeOnly = true,
        orderBy = "name ASC",
        limit,
        offset = 0,
      } = options;

      // Supporting tables only have isActive field for soft delete
      let whereClause = activeOnly ? "WHERE isActive = 1" : "";

      let query = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY ${orderBy}
      `;

      if (limit) {
        query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      }

      const result = await pool.request().query(query);

      console.log(
        `✅ Retrieved ${result.recordset.length} ${this.modelName} records`
      );
      return result.recordset;
    } catch (error) {
      console.error(`❌ Failed to retrieve ${this.modelName} records:`, error);
      throw new Error(
        `Failed to retrieve ${this.modelName} records: ${error.message}`
      );
    }
  }

  /**
   * Gets record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} Record or null
   */
  static async getById(id) {
    const pool = database.getPool();

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE id = @id
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
      console.error(`❌ Failed to retrieve ${this.modelName} by ID:`, error);
      throw new Error(`Failed to retrieve ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Updates a record
   * @param {number} id - Record ID
   * @param {Object} data - Update data
   * @param {number} updatedBy - User ID updating the record
   * @returns {Promise<Object>} Updated record
   */
  static async update(id, data, updatedBy) {
    const pool = database.getPool();

    try {
      // Check if record exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`${this.modelName} with ID ${id} not found`);
      }

      // Filter valid update data
      const updateData = { ...data };
      delete updateData.id; // Prevent ID updates
      delete updateData.createdAt; // Prevent creation date updates
      delete updateData.createdBy; // Prevent creator updates

      // Add audit fields
      updateData.updatedAt = new Date();
      updateData.updatedBy = updatedBy;

      // Build dynamic update query
      const fields = Object.keys(updateData).filter(
        (field) => updateData[field] !== undefined && updateData[field] !== null
      );

      if (fields.length === 0) {
        console.warn(`⚠️ No valid data to update for ${this.modelName}`);
        return existing;
      }

      const setClauses = fields.map(
        (field, index) => `${field} = @param${index}`
      );

      const query = `
        UPDATE ${this.tableName}
        SET ${setClauses.join(", ")}
        OUTPUT INSERTED.*
        WHERE id = @id
      `;

      const request = pool.request();
      request.input("id", sql.Int, parseInt(id, 10));

      fields.forEach((field, index) => {
        const value = updateData[field];
        const sqlType = this._getSqlType(field, value);
        request.input(`param${index}`, sqlType, value);
      });

      const result = await request.query(query);

      if (result.recordset.length > 0) {
        console.log(`✅ ${this.modelName} ${id} updated successfully`);
        return result.recordset[0];
      } else {
        throw new Error(`No rows were updated for ${this.modelName} ${id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to update ${this.modelName}:`, error);
      throw new Error(`Failed to update ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Soft deletes a record by setting isActive to false
   * @param {number} id - Record ID
   * @param {number} deletedBy - User ID deleting the record
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id, deletedBy) {
    const pool = database.getPool();

    try {
      // Check if record exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`${this.modelName} with ID ${id} not found`);
      }

      const query = `
        UPDATE ${this.tableName}
        SET isActive = 0,
            updatedAt = @updatedAt,
            updatedBy = @updatedBy
        WHERE id = @id
      `;

      const now = new Date();
      const result = await pool
        .request()
        .input("id", sql.Int, parseInt(id, 10))
        .input("updatedAt", sql.DateTime, now)
        .input("updatedBy", sql.Int, deletedBy)
        .query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(
          `✅ ${this.modelName} ${id} deleted successfully (deactivated)`
        );
        return true;
      } else {
        throw new Error(`No rows were deleted for ${this.modelName} ${id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete ${this.modelName}:`, error);
      throw new Error(`Failed to delete ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Gets SQL type for a field based on common patterns
   * @private
   */
  static _getSqlType(field, value) {
    // Common field patterns
    if (field.includes("Id") || field === "id") return sql.Int;
    if (field.includes("At") || field.includes("Date")) return sql.DateTime;
    if (
      field.includes("isActive") ||
      field.includes("Is") ||
      field.includes("has") ||
      field.includes("can") ||
      field.includes("allow")
    )
      return sql.Bit;
    if (field.includes("level") && typeof value === "number") return sql.Int;
    if (field.includes("score") && typeof value === "number") return sql.Int;
    if (field.includes("hours") && typeof value === "number") return sql.Int;
    if (field.includes("size") && typeof value === "number") return sql.Int;
    if (field.includes("sortOrder") || field.includes("Order")) return sql.Int;

    // Type-based detection
    if (typeof value === "number" && Number.isInteger(value)) return sql.Int;
    if (typeof value === "number") return sql.Float;
    if (typeof value === "boolean") return sql.Bit;
    if (value instanceof Date) return sql.DateTime;

    return sql.NVarChar; // Default to string
  }
}

/**
 * Case Categories Model
 */
export class CaseCategories extends BaseSupportingModel {
  static tableName = "CaseCategories";
  static modelName = "Case Category";

  /**
   * Validates category data before creation/update
   * @private
   */
  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Category name is required");
      }
    }

    // Validate color format if provided (CSS variable format)
    if (
      data.color &&
      !/^--color-[\w-]+$/.test(data.color) &&
      !/^#[0-9A-F]{6}$/i.test(data.color)
    ) {
      throw new Error(
        "Color must be a valid CSS variable (e.g., --color-blue-200) or hex color code"
      );
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }
}

/**
 * Case Status Model
 */
export class CaseStatus extends BaseSupportingModel {
  static tableName = "CaseStatus";
  static modelName = "Case Status";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Status name is required");
      }
      if (!data.color || data.color.trim() === "") {
        throw new Error("Status color is required");
      }
    }

    // Validate color format if provided
    if (
      data.color &&
      !/^--color-[\w-]+$/.test(data.color) &&
      !/^#[0-9A-F]{6}$/i.test(data.color)
    ) {
      throw new Error("Color must be a valid CSS variable or hex color code");
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }
}

/**
 * Case Priority Model
 */
export class CasePriority extends BaseSupportingModel {
  static tableName = "CasePriority";
  static modelName = "Case Priority";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Priority name is required");
      }
      if (data.level === undefined || data.level === null) {
        throw new Error("Priority level is required");
      }
      if (!data.color || data.color.trim() === "") {
        throw new Error("Priority color is required");
      }
    }

    // Validate level range (based on schema constraint)
    if (data.level !== undefined && (data.level < 1 || data.level > 10)) {
      throw new Error("Priority level must be between 1 and 10");
    }

    // Validate time fields (must be positive if provided)
    const timeFields = [
      "responseTimeHours",
      "resolutionTimeHours",
      "escalationTimeHours",
    ];
    timeFields.forEach((field) => {
      if (data[field] !== undefined && data[field] <= 0) {
        throw new Error(`${field} must be greater than 0`);
      }
    });
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }
}

/**
 * Case Channels Model
 */
export class CaseChannels extends BaseSupportingModel {
  static tableName = "CaseChannels";
  static modelName = "Case Channel";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate && (!data.name || data.name.trim() === "")) {
      throw new Error("Channel name is required");
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }
}

/**
 * Regions Model
 */
export class Regions extends BaseSupportingModel {
  static tableName = "Regions";
  static modelName = "Region";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Region name is required");
      }
      if (!data.code || data.code.trim() === "") {
        throw new Error("Region code is required");
      }
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }
}

/**
 * Governorates Model
 */
export class Governorates extends BaseSupportingModel {
  static tableName = "Governorates";
  static modelName = "Governorate";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Governorate name is required");
      }
      if (!data.regionId) {
        throw new Error("Region ID is required");
      }
      if (!data.code || data.code.trim() === "") {
        throw new Error("Governorate code is required");
      }
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }

  /**
   * Gets governorates by region
   * @param {number} regionId - Region ID
   * @returns {Promise<Array>} Governorates in the region
   */
  static async getByRegion(regionId) {
    const pool = database.getPool();

    try {
      const query = `
        SELECT g.*, r.name as regionName, r.arabicName as regionArabicName
        FROM ${this.tableName} g
        INNER JOIN Regions r ON g.regionId = r.id
        WHERE g.regionId = @regionId AND g.isActive = 1
        ORDER BY g.name ASC
      `;

      const result = await pool
        .request()
        .input("regionId", sql.Int, parseInt(regionId, 10))
        .query(query);

      return result.recordset;
    } catch (error) {
      console.error("❌ Failed to get governorates by region:", error);
      throw new Error(`Failed to get governorates by region: ${error.message}`);
    }
  }
}

/**
 * Communities Model
 */
export class Communities extends BaseSupportingModel {
  static tableName = "Communities";
  static modelName = "Community";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Community name is required");
      }
      if (!data.governorateId) {
        throw new Error("Governorate ID is required");
      }
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }

  /**
   * Gets communities by governorate
   * @param {number} governorateId - Governorate ID
   * @returns {Promise<Array>} Communities in the governorate
   */
  static async getByGovernorate(governorateId) {
    const pool = database.getPool();

    try {
      const query = `
        SELECT c.*, g.name as governorateName, g.arabicName as governorateArabicName,
               r.name as regionName, r.arabicName as regionArabicName
        FROM ${this.tableName} c
        INNER JOIN Governorates g ON c.governorateId = g.id
        INNER JOIN Regions r ON g.regionId = r.id
        WHERE c.governorateId = @governorateId AND c.isActive = 1
        ORDER BY c.name ASC
      `;

      const result = await pool
        .request()
        .input("governorateId", sql.Int, parseInt(governorateId, 10))
        .query(query);

      return result.recordset;
    } catch (error) {
      console.error("❌ Failed to get communities by governorate:", error);
      throw new Error(
        `Failed to get communities by governorate: ${error.message}`
      );
    }
  }
}

/**
 * Provider Types Model
 */
export class ProviderTypes extends BaseSupportingModel {
  static tableName = "ProviderTypes";
  static modelName = "Provider Type";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate && (!data.name || data.name.trim() === "")) {
      throw new Error("Provider type name is required");
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }
}

/**
 * Programs Model
 */
export class Programs extends BaseSupportingModel {
  static tableName = "Programs";
  static modelName = "Program";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Program name is required");
      }
      if (!data.code || data.code.trim() === "") {
        throw new Error("Program code is required");
      }
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }
}

/**
 * Projects Model
 */
export class Projects extends BaseSupportingModel {
  static tableName = "Projects";
  static modelName = "Project";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Project name is required");
      }
      if (!data.code || data.code.trim() === "") {
        throw new Error("Project code is required");
      }
      // Note: programId is optional according to schema (can be NULL)
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }

  /**
   * Gets projects by program
   * @param {number} programId - Program ID
   * @returns {Promise<Array>} Projects in the program
   */
  static async getByProgram(programId) {
    const pool = database.getPool();

    try {
      const query = `
        SELECT p.*, pr.name as programName, pr.arabicName as programArabicName, pr.code as programCode
        FROM ${this.tableName} p
        INNER JOIN Programs pr ON p.programId = pr.id
        WHERE p.programId = @programId AND p.isActive = 1
        ORDER BY p.name ASC
      `;

      const result = await pool
        .request()
        .input("programId", sql.Int, parseInt(programId, 10))
        .query(query);

      return result.recordset;
    } catch (error) {
      console.error("❌ Failed to get projects by program:", error);
      throw new Error(`Failed to get projects by program: ${error.message}`);
    }
  }

  /**
   * Gets standalone projects (without program)
   * @returns {Promise<Array>} Standalone projects
   */
  static async getStandaloneProjects() {
    const pool = database.getPool();

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE programId IS NULL AND isActive = 1
        ORDER BY name ASC
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error("❌ Failed to get standalone projects:", error);
      throw new Error(`Failed to get standalone projects: ${error.message}`);
    }
  }
}

/**
 * Activities Model
 */
export class Activities extends BaseSupportingModel {
  static tableName = "Activities";
  static modelName = "Activity";

  static _validateData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Activity name is required");
      }
      if (!data.code || data.code.trim() === "") {
        throw new Error("Activity code is required");
      }
      // Note: projectId is optional according to schema (can be NULL)
    }
  }

  static async create(data, createdBy = 1) {
    this._validateData(data);
    return super.create(data, createdBy);
  }

  static async update(id, data, updatedBy) {
    this._validateData(data, true);
    return super.update(id, data, updatedBy);
  }

  /**
   * Gets activities by project
   * @param {number} projectId - Project ID
   * @returns {Promise<Array>} Activities in the project
   */
  static async getByProject(projectId) {
    const pool = database.getPool();

    try {
      const query = `
        SELECT a.*, p.name as projectName, p.arabicName as projectArabicName, p.code as projectCode,
               pr.name as programName, pr.arabicName as programArabicName, pr.code as programCode
        FROM ${this.tableName} a
        INNER JOIN Projects p ON a.projectId = p.id
        LEFT JOIN Programs pr ON p.programId = pr.id
        WHERE a.projectId = @projectId AND a.isActive = 1
        ORDER BY a.name ASC
      `;

      const result = await pool
        .request()
        .input("projectId", sql.Int, parseInt(projectId, 10))
        .query(query);

      return result.recordset;
    } catch (error) {
      console.error("❌ Failed to get activities by project:", error);
      throw new Error(`Failed to get activities by project: ${error.message}`);
    }
  }

  /**
   * Gets standalone activities (without project)
   * @returns {Promise<Array>} Standalone activities
   */
  static async getStandaloneActivities() {
    const pool = database.getPool();

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE projectId IS NULL AND isActive = 1
        ORDER BY name ASC
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error("❌ Failed to get standalone activities:", error);
      throw new Error(`Failed to get standalone activities: ${error.message}`);
    }
  }
}

// Export all models
export {
  BaseSupportingModel,
  // CaseCategories,
  // CaseStatus,
  // CasePriority,
  // CaseChannels,
  // Regions,
  // Governorates,
  // Communities,
  // ProviderTypes,
  // Programs,
  // Projects,
  // Activities,
};
