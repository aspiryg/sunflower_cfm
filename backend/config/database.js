import sql from "mssql";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Import all table creation scripts
import {
  userTableScript,
  caseCategoriesTableScript,
  caseStatusTableScript,
  casePriorityTableScript,
  regionsTableScript,
  governoratesTableScript,
  communitiesTableScript,
  caseChannelsTableScript,
  providerTypesTableScript,
  programsTableScript,
  projectsTableScript,
  activitiesTableScript,
  casesTableScript,
  caseHistoryTableScript,
  caseCommentsTableScript,
  caseAssignmentsTableScript,
  caseAttachmentsTableScript,
  notificationsTableScript,
  systemSettingsTableScript,
  userSessionsTableScript,
  auditLogsTableScript,
} from "./databaseSchema.js";

// Import initial data insertion scripts
import {
  insertAdminUserScript,
  logCreatedAdminUserScript,
  insertInitialCategoriesScript,
  insertInitialStatusScript,
  insertInitialPriorityScript,
  insertInitialRegionsScript,
  insertInitialChannelsScript,
  insertInitialProviderTypesScript,
  insertInitialSystemSettingsScript,
} from "./databaseSchema.js";

dotenv.config();

// Enhanced database configuration with connection pooling and retry logic
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true" || true,
    trustServerCertificate: process.env.DB_TRUST_CERT === "true" || true,
    enableArithAbort: true,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000, // 30 seconds
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT) || 60000, // 60 seconds
    cancelTimeout: parseInt(process.env.DB_CANCEL_TIMEOUT) || 5000, // 5 seconds
    packetSize: parseInt(process.env.DB_PACKET_SIZE) || 4096,
    useUTC: process.env.DB_USE_UTC === "true" || false,
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 20, // Maximum connections
    min: parseInt(process.env.DB_POOL_MIN) || 0, // Minimum connections
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 300000, // 5 minutes
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000, // 1 minute
    createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT) || 30000, // 30 seconds
    destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT) || 5000, // 5 seconds
    reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL) || 1000, // 1 second
    createRetryIntervalMillis:
      parseInt(process.env.DB_CREATE_RETRY_INTERVAL) || 200, // 200ms
  },
  stream: false,
  parseJSON: true,
  arrayRowMode: false,
};

/**
 * Enhanced Database Initializer with comprehensive schema management
 */
class DatabaseInitializer {
  static initializationSteps = [
    { name: "Core Tables", category: "core" },
    { name: "Supporting Tables", category: "supporting" },
    { name: "Case Management Tables", category: "case_management" },
    { name: "Processing Tables", category: "processing" },
    { name: "System Tables", category: "system" },
    { name: "Initial Data", category: "data" },
  ];

  /**
   * Creates core authentication and user management tables
   */
  static async createCoreTables(pool) {
    console.log("📋 Creating core tables...");
    const coreTableScripts = [
      { name: "Users", script: userTableScript },
      { name: "UserSessions", script: userSessionsTableScript },
      { name: "AuditLogs", script: auditLogsTableScript },
    ];

    for (const table of coreTableScripts) {
      try {
        await pool.request().query(table.script);
      } catch (error) {
        console.error(
          `❌ Failed to create ${table.name} table:`,
          error.message
        );
        throw new Error(`Core table creation failed: ${table.name}`);
      }
    }
  }

  /**
   * Creates supporting classification and reference tables
   */
  static async createSupportingTables(pool) {
    console.log("📋 Creating supporting tables...");
    const supportingTableScripts = [
      { name: "CaseCategories", script: caseCategoriesTableScript },
      { name: "CaseStatus", script: caseStatusTableScript },
      { name: "CasePriority", script: casePriorityTableScript },
      { name: "Regions", script: regionsTableScript },
      { name: "Governorates", script: governoratesTableScript },
      { name: "Communities", script: communitiesTableScript },
      { name: "CaseChannels", script: caseChannelsTableScript },
      { name: "ProviderTypes", script: providerTypesTableScript },
      { name: "Programs", script: programsTableScript },
      { name: "Projects", script: projectsTableScript },
      { name: "Activities", script: activitiesTableScript },
    ];

    for (const table of supportingTableScripts) {
      try {
        await pool.request().query(table.script);
      } catch (error) {
        console.error(
          `❌ Failed to create ${table.name} table:`,
          error.message
        );
        throw new Error(`Supporting table creation failed: ${table.name}`);
      }
    }
  }

  /**
   * Creates main case management tables
   */
  static async createCaseManagementTables(pool) {
    console.log("📋 Creating case management tables...");
    const caseTableScripts = [{ name: "Cases", script: casesTableScript }];

    for (const table of caseTableScripts) {
      try {
        await pool.request().query(table.script);
      } catch (error) {
        console.error(
          `❌ Failed to create ${table.name} table:`,
          error.message
        );
        throw new Error(`Case management table creation failed: ${table.name}`);
      }
    }
  }

  /**
   * Creates case processing and workflow tables
   */
  static async createProcessingTables(pool) {
    console.log("📋 Creating processing tables...");
    const processingTableScripts = [
      { name: "CaseHistory", script: caseHistoryTableScript },
      { name: "CaseComments", script: caseCommentsTableScript },
      { name: "CaseAssignments", script: caseAssignmentsTableScript },
      { name: "CaseAttachments", script: caseAttachmentsTableScript },
    ];

    for (const table of processingTableScripts) {
      try {
        await pool.request().query(table.script);
      } catch (error) {
        console.error(
          `❌ Failed to create ${table.name} table:`,
          error.message
        );
        throw new Error(`Processing table creation failed: ${table.name}`);
      }
    }
  }

  /**
   * Creates system configuration and notification tables
   */
  static async createSystemTables(pool) {
    console.log("📋 Creating system tables...");
    const systemTableScripts = [
      { name: "Notifications", script: notificationsTableScript },
      { name: "SystemSettings", script: systemSettingsTableScript },
    ];

    for (const table of systemTableScripts) {
      try {
        await pool.request().query(table.script);
      } catch (error) {
        console.error(
          `❌ Failed to create ${table.name} table:`,
          error.message
        );
        throw new Error(`System table creation failed: ${table.name}`);
      }
    }
  }

  /**
   * Inserts initial system data and admin user
   */
  static async insertInitialData(pool) {
    console.log("📋 Inserting initial data...");

    try {
      // Check if admin user already exists
      const userCount = await pool
        .request()
        .query(
          "SELECT COUNT(*) AS count FROM Users WHERE role = 'super_admin'"
        );

      if (userCount.recordset[0].count === 0) {
        // Create initial admin user
        await this.createInitialAdminUser(pool);
      } else {
        console.log("ℹ️  Admin user already exists, skipping creation");
      }

      // Insert reference data
      await this.insertReferenceData(pool);
    } catch (error) {
      console.error("❌ Failed to insert initial data:", error.message);
      throw new Error("Initial data insertion failed");
    }
  }

  /**
   * Creates the initial admin user
   */
  static async createInitialAdminUser(pool) {
    try {
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const result = await pool
        .request()
        .input("username", sql.NVarChar, "admin")
        .input(
          "email",
          sql.NVarChar,
          process.env.ADMIN_EMAIL || "admin@sunflower-cfm.org"
        )
        .input("password", sql.NVarChar, hashedPassword)
        .input("firstName", sql.NVarChar, "System")
        .input("lastName", sql.NVarChar, "Administrator")
        .input("role", sql.NVarChar, "super_admin")
        .input("organization", sql.NVarChar, "Sunflower CFM")
        .input("isActive", sql.Bit, 1)
        .input("isEmailVerified", sql.Bit, 1)
        .input("emailVerifiedAt", sql.DateTime, new Date())
        .query(insertAdminUserScript);

      // Get the created user ID
      const userResult = await pool
        .request()
        .input(
          "email",
          sql.NVarChar,
          process.env.ADMIN_EMAIL || "admin@sunflower-cfm.org"
        )
        .query("SELECT id FROM Users WHERE email = @email");

      const userId = userResult.recordset[0].id;

      // Update the admin user to set createdBy and updatedBy to itself (self-reference)
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(
          "UPDATE Users SET createdBy = @userId, updatedBy = @userId WHERE id = @userId"
        );

      // Log the admin user creation
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(logCreatedAdminUserScript);

      console.log(`📝 Initial admin user created successfully`);
      console.log(
        `   Email: ${process.env.ADMIN_EMAIL || "admin@sunflower-cfm.org"}`
      );
      console.log(`   Password: ${adminPassword}`);
      console.log(
        `   ⚠️  Please change the default password after first login!`
      );
    } catch (error) {
      console.error("❌ Failed to create admin user:", error.message);
      throw error;
    }
  }

  /**
   * Inserts reference data for categories, status, priorities, etc.
   */
  static async insertReferenceData(pool) {
    const referenceDataScripts = [
      { name: "Case Categories", script: insertInitialCategoriesScript },
      { name: "Case Status", script: insertInitialStatusScript },
      { name: "Case Priorities", script: insertInitialPriorityScript },
      { name: "Regions", script: insertInitialRegionsScript },
      { name: "Case Channels", script: insertInitialChannelsScript },
      { name: "Provider Types", script: insertInitialProviderTypesScript },
      { name: "System Settings", script: insertInitialSystemSettingsScript },
    ];

    for (const data of referenceDataScripts) {
      try {
        await pool.request().query(data.script);
      } catch (error) {
        console.error(`❌ Failed to insert ${data.name}:`, error.message);
        // Don't throw here - reference data failures shouldn't stop the system
        console.warn(`⚠️  Continuing without ${data.name}`);
      }
    }
  }

  /**
   * Validates database schema integrity
   */
  static async validateSchema(pool) {
    console.log("🔍 Validating database schema...");

    const requiredTables = [
      "Users",
      "Cases",
      "CaseCategories",
      "CaseStatus",
      "CasePriority",
      "CaseHistory",
      "CaseComments",
      "CaseAssignments",
      "CaseAttachments",
      "Notifications",
      "SystemSettings",
      "UserSessions",
      "AuditLogs",
    ];

    const missingTables = [];

    for (const tableName of requiredTables) {
      try {
        const result = await pool
          .request()
          .query(
            `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${tableName}'`
          );

        if (result.recordset[0].count === 0) {
          missingTables.push(tableName);
        }
      } catch (error) {
        missingTables.push(tableName);
      }
    }

    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(", ")}`);
    }

    console.log("✅ Database schema validation completed successfully");
  }

  /**
   * Main initialization method with comprehensive error handling
   */
  static async initializeDatabase(pool) {
    console.log("🚀 Starting database initialization...");
    console.log("━".repeat(60));

    const startTime = Date.now();

    try {
      // Create tables in dependency order
      await this.createCoreTables(pool);
      await this.createSupportingTables(pool);
      await this.createCaseManagementTables(pool);
      await this.createProcessingTables(pool);
      await this.createSystemTables(pool);

      // Insert initial data
      await this.insertInitialData(pool);

      // Validate schema integrity
      await this.validateSchema(pool);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log("━".repeat(60));
      console.log(
        `🎉 Database initialization completed successfully in ${duration}s`
      );
      console.log("✅ All tables created and initial data inserted");
      console.log("✅ Schema validation passed");
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log("━".repeat(60));
      console.error(`❌ Database initialization failed after ${duration}s`);
      console.error("Error details:", error.message);
      throw error;
    }
  }
}

/**
 * Enhanced Database class with connection management and health checks
 */
class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = parseInt(process.env.DB_MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.DB_RETRY_DELAY) || 5000; // 5 seconds
  }

  /**
   * Establishes database connection with retry logic
   */
  async connect() {
    if (this.isConnected && this.pool) {
      console.log("ℹ️  Database already connected");
      return this.pool;
    }

    while (this.connectionAttempts < this.maxRetries) {
      try {
        console.log(
          `🔌 Attempting database connection (${this.connectionAttempts + 1}/${
            this.maxRetries
          })...`
        );

        this.pool = await sql.connect(config);
        this.isConnected = true;
        this.connectionAttempts = 0; // Reset on successful connection

        console.log("✅ Database connection established successfully");
        console.log(`   Server: ${config.server}`);
        console.log(`   Database: ${config.database}`);
        console.log(`   User: ${config.user}`);

        // Set up connection event handlers
        this.setupConnectionHandlers();

        // Initialize database schema and data
        await DatabaseInitializer.initializeDatabase(this.pool);

        return this.pool;
      } catch (error) {
        this.connectionAttempts++;
        this.isConnected = false;

        console.error(
          `❌ Database connection attempt ${this.connectionAttempts} failed:`,
          error.message
        );

        if (this.connectionAttempts >= this.maxRetries) {
          console.error("💀 Maximum connection retries exceeded");
          throw new Error(
            `Database connection failed after ${this.maxRetries} attempts: ${error.message}`
          );
        }

        console.log(`⏳ Retrying in ${this.retryDelay / 1000}s...`);
        await this.delay(this.retryDelay);
      }
    }
  }

  /**
   * Sets up connection event handlers for monitoring
   */
  setupConnectionHandlers() {
    if (!this.pool) return;

    this.pool.on("connect", () => {
      console.log("🔗 Database pool connected");
    });

    this.pool.on("close", () => {
      console.log("🔌 Database pool closed");
      this.isConnected = false;
    });

    this.pool.on("error", (error) => {
      console.error("🚨 Database pool error:", error.message);
      this.isConnected = false;
    });
  }

  /**
   * Performs database health check
   */
  async healthCheck() {
    if (!this.pool || !this.isConnected) {
      throw new Error("Database not connected");
    }

    try {
      const result = await this.pool
        .request()
        .query("SELECT 1 as health_check");
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        responseTime: Date.now(),
        database: config.database,
        server: config.server,
      };
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  /**
   * Gracefully closes database connection
   */
  async disconnect() {
    if (this.pool && this.isConnected) {
      try {
        await this.pool.close();
        this.pool = null;
        this.isConnected = false;
        console.log("✅ Database connection closed successfully");
      } catch (error) {
        console.error("❌ Failed to close database connection:", error.message);
        throw error;
      }
    } else {
      console.log("ℹ️  Database already disconnected");
    }
  }

  /**
   * Gets the database connection pool
   */
  getPool() {
    if (!this.pool || !this.isConnected) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.pool;
  }

  /**
   * Executes a query with error handling and logging
   */
  async executeQuery(queryText, inputs = {}, options = {}) {
    if (!this.pool || !this.isConnected) {
      throw new Error("Database not connected");
    }

    const { logQuery = false, timeout = 30000 } = options;

    if (logQuery) {
      console.log("🔍 Executing query:", queryText.substring(0, 100) + "...");
    }

    try {
      const request = this.pool.request();

      // Set timeout
      request.timeout = timeout;

      // Add input parameters
      Object.entries(inputs).forEach(([key, value]) => {
        request.input(key, value);
      });

      const result = await request.query(queryText);
      return result;
    } catch (error) {
      console.error("❌ Query execution failed:", error.message);
      if (logQuery) {
        console.error("   Query:", queryText);
        console.error("   Inputs:", inputs);
      }
      throw error;
    }
  }

  /**
   * Begins a database transaction
   */
  async beginTransaction() {
    if (!this.pool || !this.isConnected) {
      throw new Error("Database not connected");
    }

    const transaction = new sql.Transaction(this.pool);
    await transaction.begin();
    return transaction;
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gets database statistics
   */
  async getStats() {
    if (!this.pool) {
      return { connected: false };
    }

    return {
      connected: this.isConnected,
      totalConnections: this.pool.pool?.totalConnections || 0,
      idleConnections: this.pool.pool?.idleCount || 0,
      activeConnections: this.pool.pool?.activeCount || 0,
      waitingClients: this.pool.pool?.waitingCount || 0,
      config: {
        min: config.pool.min,
        max: config.pool.max,
        idleTimeoutMillis: config.pool.idleTimeoutMillis,
      },
    };
  }
}

// Create singleton instance
const database = new Database();

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error.message);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error.message);
    process.exit(1);
  }
});

export { database, sql, Database, DatabaseInitializer };
