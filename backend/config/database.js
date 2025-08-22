import sql from "mssql";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import {
  userTableScript,
  additionalScripts,
  feedbackCategoriesTableScript,
  regionsTableScript,
  governeratesTableScript,
  communitiesTableScript,
  feedbackChannelsTableScript,
  providerTypesTableScript,
  programmesTableScript,
  projectsTableScript,
  activitiesTableScript,
  feedbackTableScript,
  feedbackHistoryTableScript,
  commentsTableScript,
  notificationsTableScript,
  feedbackHistorySchemaUpdates,
  notificationSchemaUpdates,
  userSchemaUpdates,
  feedbackTableSchemaUpdates,
} from "./tablesScripts.js";
import {
  insertAdminUserScript,
  LogCreatedAdminUserScript,
  insertInitialCategoriesScript,
  insertInitialRegionsScript,
  insertInitialProviderTypesScript,
  insertInitialFeedbackChannelsScript,
} from "./insertInitialData.js";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 15000,
  },
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Idle timeout for connections in milliseconds
  },
};

class DatabaseInitializer {
  static async createUserTable(pool) {
    const query = userTableScript;
    try {
      await pool.request().query(query);
    } catch (error) {
      console.error(" ❌ Failed to create user table:", error);
    }
  }

  static async createAdditionalTables(pool) {
    const queries = additionalScripts;
    for (const query of queries) {
      try {
        await pool.request().query(query);
      } catch (error) {
        console.error(" ❌ Failed to create additional table:", error);
      }
    }
  }

  static async createFeedbackRelatedTables(pool) {
    try {
      await pool.request().query(feedbackCategoriesTableScript);
      await pool.request().query(regionsTableScript);
      await pool.request().query(governeratesTableScript);
      await pool.request().query(communitiesTableScript);
      await pool.request().query(feedbackChannelsTableScript);
      await pool.request().query(providerTypesTableScript);
      await pool.request().query(programmesTableScript);
      await pool.request().query(projectsTableScript);
      await pool.request().query(activitiesTableScript);
      // Feedback-related tables
      await pool.request().query(feedbackTableScript);
      await pool.request().query(feedbackHistoryTableScript);
      await pool.request().query(commentsTableScript);
      await pool.request().query(notificationsTableScript);
    } catch (error) {
      console.error(" ❌ Failed to create feedback-related tables:", error);
    }
  }

  static async insertInitialFeedbackRelatedData(pool) {
    try {
      await pool.request().query(insertInitialCategoriesScript);
      await pool.request().query(insertInitialRegionsScript);
      await pool.request().query(insertInitialProviderTypesScript);
      await pool.request().query(insertInitialFeedbackChannelsScript);
    } catch (error) {
      console.error(
        " ❌ Failed to insert initial feedback-related data:",
        error
      );
    }
  }

  static async applyFeedbackHistorySchemaUpdates(pool) {
    try {
      await pool.request().query(feedbackHistorySchemaUpdates);
    } catch (error) {
      console.error(
        " ❌ Failed to apply feedback history schema updates:",
        error
      );
    }
  }

  static async applyNotificationSchemaUpdates(pool) {
    try {
      await pool.request().query(notificationSchemaUpdates);
    } catch (error) {
      console.error(" ❌ Failed to apply notification schema updates:", error);
    }
  }

  static async applyUserSchemaUpdates(pool) {
    try {
      await pool.request().query(userSchemaUpdates);
      console.log("✅ User schema updates applied successfully");
    } catch (error) {
      console.error("❌ Failed to apply user schema updates:", error);
    }
  }

  static async applyFeedbackSchemaUpdates(pool) {
    try {
      await pool.request().query(feedbackTableSchemaUpdates);
      console.log("✅ Feedback schema updates applied successfully");
    } catch (error) {
      console.error("❌ Failed to apply feedback schema updates:", error);
    }
  }

  static async insertInitialData(pool) {
    try {
      const userCount = await pool
        .request()
        .query("SELECT COUNT(*) AS count FROM Users");
      if (userCount.recordset[0].count === 0) {
        // Insert initial user data if the table is empty
        const hashedPassword = await bcrypt.hash("admin123", 12);

        await pool
          .request()
          .input("username", sql.NVarChar, "admin")
          .input("email", sql.NVarChar, "admin@example.com")
          .input("password", sql.NVarChar, hashedPassword)
          .input("firstName", sql.NVarChar, "System")
          .input("lastName", sql.NVarChar, "Administrator")
          .input("role", sql.NVarChar, "admin")
          .input("organization", sql.NVarChar, "CFM")
          .input("isActive", sql.Bit, 1)
          .input("isVerified", sql.Bit, 1)
          .query(insertAdminUserScript);
        console.log(
          "📝 Initial admin user created (admin@example.com / admin123)"
        );

        // get the user ID of the newly created admin user
        const userIdResult = await pool
          .request()
          .query("SELECT id FROM Users WHERE email = 'admin@example.com'");
        const userId = userIdResult.recordset[0].id;

        // Log the creation of the initial admin user
        await pool
          .request()
          .input("userId", sql.Int, userId)
          .query(LogCreatedAdminUserScript);
      } else {
        console.log("ℹ️  Users table already has initial data.");
      }
    } catch (error) {
      console.error(" ❌ Failed to insert initial data:", error);
    }
  }

  /**
   * Initializes the database schema and data.
   * This method checks if the Users table exists and creates it if not.
   * @param {sql.ConnectionPool} pool - The database connection pool.
   * @returns {Promise<void>}
   * @throws {Error} If the database initialization fails.
   * @description This method is called during the database connection process to ensure the schema is ready.
   */
  static async initializeDatabase(pool) {
    console.log("🚀 Initializing database schema and data...");
    try {
      await this.createUserTable(pool);
      // await this.applyUserSchemaUpdates(pool);
      // await this.createAdditionalTables(pool);
      // await this.insertInitialData(pool);
      // await this.createFeedbackRelatedTables(pool);
      // await this.insertInitialFeedbackRelatedData(pool);
      // await this.applyFeedbackHistorySchemaUpdates(pool);
      await this.applyFeedbackSchemaUpdates(pool);
      // await this.applyNotificationSchemaUpdates(pool);
      console.log(" 🎉 Database initialization completed successfully.");
    } catch (error) {
      console.error(" ❌ Database initialization failed:", error);
    }
  }
}

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    if (!this.pool) {
      try {
        this.pool = await sql.connect(config);
        console.log(" ✅ Database connection established successfully.");

        // Initialize the database schema and data
        await DatabaseInitializer.initializeDatabase(this.pool);
      } catch (error) {
        console.error(" ❌ Database connection failed:", error);
        throw error; // Rethrow the error for handling in the application
      }
    }
  }

  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.close();
        console.log(" ✅ Database connection closed successfully.");
      } catch (error) {
        console.error(" ❌ Failed to close database connection:", error);
      } finally {
        this.pool = null; // Reset the pool to null after closing
      }
    }
  }

  getPool() {
    return this.pool;
  }
}
const database = new Database();
export { database, sql };
