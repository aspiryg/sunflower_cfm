import { database, sql } from "../config/database.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { returnUserWithoutPassword } from "../Helpers/returnUserWithoutPassword.js";

export class User {
  /**
   * Creates a new user in the database with enhanced validation and security.
   * @param {Object} userData - The user data to insert.
   * @returns {Promise<Object>} The created user object.
   */
  static async createUserAsync(userData) {
    const pool = database.getPool();

    try {
      // Validate required fields
      this._validateRequiredFields(userData, ["username", "email", "password"]);

      // Check for existing user
      const existingUser = await this._checkUserExistence(
        userData.email,
        userData.username
      );
      if (existingUser.emailExists) {
        throw new Error("Email already exists");
      }
      if (existingUser.usernameExists) {
        throw new Error("Username already exists");
      }

      // Prepare user data with defaults and security enhancements
      const userEntry = {
        username: userData.username.toLowerCase().trim(),
        email: userData.email.toLowerCase().trim(),
        password: await this._hashPassword(userData.password),
        firstName: userData.firstName?.trim() || null,
        lastName: userData.lastName?.trim() || null,
        profilePicture: userData.profilePicture || null,
        bio: userData.bio || null,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth)
          : null,
        phone: userData.phone || null,
        address: userData.address || null,
        city: userData.city || null,
        state: userData.state || null,
        country: userData.country || null,
        postalCode: userData.postalCode || null,
        role: userData.role || "user",
        organization: userData.organization || null,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        isEmailVerified: false,
        emailVerificationToken: crypto.randomBytes(32).toString("hex"),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        twoFactorEnabled: false,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Build dynamic insert query
      const { query, parameters } = this._buildInsertQuery(userEntry);

      // Execute the query
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);
      const insertedId = result.recordset?.[0]?.id;

      console.log(`✅ User created successfully: ${userEntry.email}`);

      // Return the created user
      return await this.findUserByIdAsync(insertedId);
    } catch (error) {
      console.error(" ❌ Failed to create user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Finds a user by email with optional password inclusion.
   * @param {string} email - The email to search for.
   * @param {boolean} [includePassword=false] - Whether to include password in result.
   * @returns {Promise<Object|null>} User object or null if not found.
   */
  static async findUserByEmailAsync(email, includePassword = false) {
    const pool = database.getPool();

    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const query = this._buildSelectQuery({
        where: "LOWER(u.email) = @email AND u.isActive = 1",
        includePassword,
      });

      const result = await pool
        .request()
        .input("email", sql.NVarChar, email.toLowerCase().trim())
        .query(query);

      if (result.recordset.length > 0) {
        const user = this._transformUserResult(result.recordset[0]);
        return includePassword ? user : returnUserWithoutPassword(user);
      }

      return null;
    } catch (error) {
      console.error(" ❌ Failed to find user by email:", error);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Finds a user by ID with optional password inclusion.
   * @param {number} userId - The user ID to search for.
   * @param {boolean} [includePassword=false] - Whether to include password in result.
   * @returns {Promise<Object|null>} User object or null if not found.
   */
  static async findUserByIdAsync(userId, includePassword = false) {
    const pool = database.getPool();

    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const query = this._buildSelectQuery({
        where: "u.id = @userId AND u.isActive = 1",
        includePassword,
      });

      const result = await pool
        .request()
        .input("userId", sql.Int, parseInt(userId, 10))
        .query(query);

      if (result.recordset.length > 0) {
        const user = this._transformUserResult(result.recordset[0]);
        return includePassword ? user : returnUserWithoutPassword(user);
      }

      return null;
    } catch (error) {
      console.error(" ❌ Failed to find user by ID:", error);
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  /**
   * Finds a user by username.
   * @param {string} username - The username to search for.
   * @param {boolean} [includePassword=false] - Whether to include password in result.
   * @returns {Promise<Object|null>} User object or null if not found.
   */
  static async findUserByUsernameAsync(username, includePassword = false) {
    const pool = database.getPool();

    try {
      if (!username) {
        throw new Error("Username is required");
      }

      const query = this._buildSelectQuery({
        where: "LOWER(u.username) = @username AND u.isActive = 1",
        includePassword,
      });

      const result = await pool
        .request()
        .input("username", sql.NVarChar, username.toLowerCase().trim())
        .query(query);

      if (result.recordset.length > 0) {
        const user = this._transformUserResult(result.recordset[0]);
        return includePassword ? user : returnUserWithoutPassword(user);
      }

      return null;
    } catch (error) {
      console.error(" ❌ Failed to find user by username:", error);
      throw new Error(`Failed to find user by username: ${error.message}`);
    }
  }

  /**
   * Retrieves all users with filtering, pagination, and search capabilities.
   * @param {Object} [options={}] - Query options.
   * @returns {Promise<Object>} Users data with pagination info.
   */
  static async getAllUsersAsync(options = {}) {
    const pool = database.getPool();

    try {
      const {
        // Extract potential permission filters
        id, // This could be from permission filtering for "own" access
        impossible, // Permission filter indicating no access
        // Standard options
        search,
        role,
        organization,
        isActive = true,
        isEmailVerified,
        limit = 20,
        offset = 0,
        orderBy = "u.createdAt DESC",
        // Capture other filters
        ...otherFilters
      } = options;

      // Short-circuit if permission filters indicate no access
      if (impossible) {
        console.warn(
          "⚠️ Permission filter indicates no access to users, returning empty result"
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
      // Build filter conditions
      const { whereClause, parameters } = this._buildUserFilterConditions({
        id, // Permission filter for "own" access
        search,
        role,
        organization,
        isActive,
        isEmailVerified,
        ...otherFilters,
      });

      // Build main query
      const dataQuery = this._buildSelectQuery({
        where: whereClause,
        orderBy,
        limit,
        offset,
        includePassword: false,
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
        data: dataResult.recordset.map((user) =>
          returnUserWithoutPassword(this._transformUserResult(user))
        ),
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
        `✅ Retrieved ${result.data.length} users from ${total} total (with permission filters)`
      );
      return result;
    } catch (error) {
      console.error(" ❌ Failed to retrieve users:", error);
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }

  /**
   * Updates a user with dynamic field handling and validation.
   * @param {number} userId - The user ID to update.
   * @param {Object} updateData - The data to update.
   * @param {number} [updatedBy] - The ID of the user performing the update.
   * @returns {Promise<Object>} The updated user object.
   */
  static async updateUserAsync(userId, updateData, updatedBy = null) {
    const pool = database.getPool();

    try {
      // Validate user exists
      const existingUser = await this.findUserByIdAsync(userId);
      if (!existingUser) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Filter and validate update data
      const filteredData = await this._filterAndValidateUpdateData(
        updateData,
        existingUser
      );

      if (Object.keys(filteredData).length === 0) {
        console.warn("⚠️ No valid data to update");
        return existingUser;
      }

      // Add audit fields
      filteredData.updatedAt = new Date();
      if (updatedBy) {
        filteredData.updatedBy = updatedBy;
      }

      // Build dynamic update query
      const { query, parameters } = this._buildUpdateQuery(
        userId,
        filteredData
      );

      // Execute the update
      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(`✅ User ${userId} updated successfully`);
        return await this.findUserByIdAsync(userId);
      } else {
        throw new Error("No rows were updated");
      }
    } catch (error) {
      console.error(` ❌ Failed to update user ${userId}:`, error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Soft deletes a user by setting isActive to false.
   * @param {number} userId - The user ID to delete.
   * @param {number} [deletedBy] - The ID of the user performing the deletion.
   * @returns {Promise<boolean>} True if deletion was successful.
   */
  static async deleteUserAsync(userId, deletedBy = null) {
    const pool = database.getPool();

    try {
      // Check if user exists
      const existingUser = await this.findUserByIdAsync(userId);
      if (!existingUser) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const updateData = {
        isActive: false,
        updatedAt: new Date(),
      };

      if (deletedBy) {
        updateData.updatedBy = deletedBy;
      }

      const { query, parameters } = this._buildUpdateQuery(userId, updateData);

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);

      if (result.rowsAffected[0] > 0) {
        console.log(`✅ User ${userId} deleted successfully`);
        return true;
      } else {
        throw new Error("No rows were affected during deletion");
      }
    } catch (error) {
      console.error(` ❌ Failed to delete user ${userId}:`, error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // ============= AUTHENTICATION METHODS =============

  /**
   * Validates a user's password with account lockout protection.
   * @param {string} email - The user's email.
   * @param {string} password - The password to validate.
   * @returns {Promise<Object>} Validation result with user data.
   */
  static async validateUserCredentialsAsync(email, password) {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Find user with password
      const user = await this.findUserByEmailAsync(email, true);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        const lockTimeRemaining = Math.ceil(
          (user.lockUntil - new Date()) / (1000 * 60)
        );
        throw new Error(
          `Account is locked. Try again in ${lockTimeRemaining} minutes.`
        );
      }

      // Validate password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        // Increment failed login attempts
        await this._handleFailedLogin(user.id);
        throw new Error("Invalid credentials");
      }

      // Reset login attempts on successful login
      await this._resetLoginAttempts(user.id);

      // Update last login
      await this.updateUserLoginDetailsAsync(user.id, {
        lastLogin: new Date(),
        isOnline: true,
      });

      return {
        user: returnUserWithoutPassword(user),
        isValid: true,
      };
    } catch (error) {
      console.error(" ❌ Failed to validate credentials:", error);
      throw error;
    }
  }

  /**
   * Updates user login details.
   * @param {number} userId - The user ID.
   * @param {Object} loginData - Login data to update.
   * @returns {Promise<boolean>} True if update was successful.
   */
  static async updateUserLoginDetailsAsync(userId, loginData) {
    const pool = database.getPool();

    try {
      const updateFields = {
        ...loginData,
        updatedAt: new Date(),
      };

      const { query, parameters } = this._buildUpdateQuery(
        userId,
        updateFields
      );

      const request = pool.request();
      Object.entries(parameters).forEach(([key, { value, type }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(query);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(" ❌ Failed to update login details:", error);
      throw new Error(`Failed to update login details: ${error.message}`);
    }
  }

  /**
   * Changes a user's password with validation.
   * @param {number} userId - The user ID.
   * @param {string} currentPassword - The current password.
   * @param {string} newPassword - The new password.
   * @returns {Promise<boolean>} True if password was changed successfully.
   */
  static async changePasswordAsync(userId, currentPassword, newPassword) {
    try {
      // Get user with password
      const user = await this.findUserByIdAsync(userId, true);
      if (!user) {
        throw new Error("User not found");
      }

      // Validate current password
      const isCurrentValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedNewPassword = await this._hashPassword(newPassword);

      // Update password
      const success = await this.updateUserAsync(userId, {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
      });

      if (success) {
        console.log(`✅ Password changed successfully for user ${userId}`);
        return true;
      }

      throw new Error("Failed to update password");
    } catch (error) {
      console.error(" ❌ Failed to change password:", error);
      throw error;
    }
  }

  // ============= EMAIL VERIFICATION METHODS =============

  /**
   * Verifies a user's email using verification token.
   * @param {string} token - The verification token.
   * @returns {Promise<Object>} The verified user object.
   */
  static async verifyEmailAsync(token) {
    const pool = database.getPool();

    try {
      if (!token) {
        throw new Error("Verification token is required");
      }

      const query = this._buildSelectQuery({
        where:
          "u.emailVerificationToken = @token AND u.emailVerificationExpires > @now AND u.isActive = 1",
        includePassword: false,
      });

      const result = await pool
        .request()
        .input("token", sql.NVarChar, token)
        .input("now", sql.DateTime, new Date())
        .query(query);

      if (result.recordset.length === 0) {
        throw new Error("Invalid or expired verification token");
      }

      const user = this._transformUserResult(result.recordset[0]);

      // Update user as verified
      await this.updateUserAsync(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerifiedAt: new Date(),
      });

      console.log(`✅ Email verified successfully for user ${user.email}`);
      return await this.findUserByIdAsync(user.id);
    } catch (error) {
      console.error(" ❌ Failed to verify email:", error);
      throw error;
    }
  }

  /**
   * Generates a new email verification token.
   * @param {number} userId - The user ID.
   * @returns {Promise<string>} The new verification token.
   */
  static async generateEmailVerificationTokenAsync(userId) {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.updateUserAsync(userId, {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      });

      console.log(`✅ Email verification token generated for user ${userId}`);
      return token;
    } catch (error) {
      console.error(" ❌ Failed to generate verification token:", error);
      throw error;
    }
  }

  // ============= PASSWORD RESET METHODS =============

  /**
   * Generates a password reset token.
   * @param {string} email - The user's email.
   * @returns {Promise<Object>} Object containing user info and reset token.
   */
  static async generatePasswordResetTokenAsync(email) {
    try {
      const user = await this.findUserByEmailAsync(email);
      if (!user) {
        throw new Error("User not found");
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.updateUserAsync(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      console.log(`✅ Password reset token generated for user ${email}`);
      return {
        user: returnUserWithoutPassword(user),
        resetToken,
      };
    } catch (error) {
      console.error(" ❌ Failed to generate reset token:", error);
      throw error;
    }
  }

  /**
   * Alternative password reset method with direct SQL update
   * @param {string} token - The reset token.
   * @param {string} newPassword - The new password.
   * @returns {Promise<Object>} The updated user object.
   */
  static async resetPasswordAsync(token, newPassword) {
    const pool = database.getPool();

    try {
      if (!token || !newPassword) {
        throw new Error("Reset token and new password are required");
      }

      console.log("🔍 Starting direct password reset process...");

      // First, find the user with the reset token
      const findUserQuery = `
      SELECT id, email, username, firstName, lastName 
      FROM Users 
      WHERE passwordResetToken = @token 
        AND passwordResetExpires > @now 
        AND isActive = 1
    `;

      const userResult = await pool
        .request()
        .input("token", sql.NVarChar, token)
        .input("now", sql.DateTime, new Date())
        .query(findUserQuery);

      if (userResult.recordset.length === 0) {
        throw new Error("Invalid or expired reset token");
      }

      const user = userResult.recordset[0];
      console.log("📋 User found for password reset:", user.email);

      // Hash the new password
      const hashedPassword = await this._hashPassword(newPassword);
      console.log("🔐 Password hashed successfully");

      // Direct SQL update
      const updateQuery = `
      UPDATE Users 
      SET 
        password = @password,
        passwordResetToken = NULL,
        passwordResetExpires = NULL,
        passwordChangedAt = @passwordChangedAt,
        loginAttempts = 0,
        lockUntil = NULL,
        updatedAt = @updatedAt
      WHERE id = @userId
    `;

      const updateResult = await pool
        .request()
        .input("password", sql.NVarChar, hashedPassword)
        .input("passwordChangedAt", sql.DateTime, new Date())
        .input("updatedAt", sql.DateTime, new Date())
        .input("userId", sql.Int, user.id)
        .query(updateQuery);

      if (updateResult.rowsAffected[0] === 0) {
        throw new Error("Failed to update password - no rows affected");
      }

      console.log("✅ Password updated successfully");

      // Verify the password was actually updated
      const verificationQuery = `SELECT password FROM Users WHERE id = @userId`;
      const verificationResult = await pool
        .request()
        .input("userId", sql.Int, user.id)
        .query(verificationQuery);

      const updatedPassword = verificationResult.recordset[0].password;
      const isPasswordCorrect = await bcrypt.compare(
        newPassword,
        updatedPassword
      );

      console.log(
        "🔍 Password verification after reset:",
        isPasswordCorrect ? "✅ SUCCESS" : "❌ FAILED"
      );

      if (!isPasswordCorrect) {
        throw new Error(
          "Password reset verification failed - password was not properly updated"
        );
      }

      console.log(`✅ Password reset successfully for user ${user.email}`);
      return await this.findUserByIdAsync(user.id);
    } catch (error) {
      console.error(" ❌ Failed to reset password:", error);
      throw error;
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
   * Checks if email or username already exists.
   * @private
   */
  static async _checkUserExistence(email, username) {
    const pool = database.getPool();

    const emailCheck = await pool
      .request()
      .input("email", sql.NVarChar, email.toLowerCase().trim())
      .query("SELECT COUNT(*) as count FROM Users WHERE LOWER(email) = @email");

    const usernameCheck = await pool
      .request()
      .input("username", sql.NVarChar, username.toLowerCase().trim())
      .query(
        "SELECT COUNT(*) as count FROM Users WHERE LOWER(username) = @username"
      );

    return {
      emailExists: emailCheck.recordset[0].count > 0,
      usernameExists: usernameCheck.recordset[0].count > 0,
    };
  }

  /**
   * Hashes a password using bcrypt.
   * @private
   */
  static async _hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Handles failed login attempts with account lockout.
   * @private
   */
  static async _handleFailedLogin(userId) {
    const pool = database.getPool();
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
    const lockDuration = parseInt(process.env.ACCOUNT_LOCK_DURATION) || 30; // minutes

    try {
      const user = await this.findUserByIdAsync(userId, true);
      const newAttempts = (user.loginAttempts || 0) + 1;

      if (newAttempts >= maxAttempts) {
        const lockUntil = new Date(Date.now() + lockDuration * 60 * 1000);
        await this.updateUserAsync(userId, {
          loginAttempts: newAttempts,
          lockUntil,
        });
        console.warn(
          `⚠️ User ${userId} account locked due to ${newAttempts} failed attempts`
        );
      } else {
        await this.updateUserAsync(userId, {
          loginAttempts: newAttempts,
        });
      }
    } catch (error) {
      console.error("Failed to handle failed login:", error);
    }
  }

  /**
   * Resets login attempts after successful login.
   * @private
   */
  static async _resetLoginAttempts(userId) {
    try {
      await this.updateUserAsync(userId, {
        loginAttempts: 0,
        lockUntil: null,
      });
    } catch (error) {
      console.error("Failed to reset login attempts:", error);
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
      INSERT INTO Users (${fields.join(", ")})
      OUTPUT INSERTED.id
      VALUES (${values.join(", ")})
    `;

    return { query, parameters };
  }

  /**
   * Builds dynamic UPDATE query.
   * @private
   */
  static _buildUpdateQuery(userId, data) {
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
    const idParamName = `userId${paramCounter}`;
    parameters[idParamName] = { value: parseInt(userId, 10), type: sql.Int };

    const query = `
      UPDATE Users 
      SET ${setClauses.join(", ")}
      WHERE id = @${idParamName}
    `;

    return { query, parameters };
  }

  /**
   * Builds SELECT query with optional joins.
   * @private
   */
  static _buildSelectQuery(options = {}) {
    const { where, orderBy, limit, offset, includePassword = false } = options;

    const passwordField = includePassword ? ", u.password" : "";

    const baseQuery = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.firstName,
        u.lastName,
        u.profilePicture,
        u.bio,
        u.dateOfBirth,
        u.phone,
        u.address,
        u.city,
        u.state,
        u.country,
        u.postalCode,
        u.role,
        u.organization,
        u.isActive,
        u.isEmailVerified,
        u.emailVerifiedAt,
        u.twoFactorEnabled,
        u.lastLogin,
        u.isOnline,
        u.loginAttempts,
        u.lockUntil,
        u.passwordChangedAt,
        u.emailVerificationToken,
        u.emailVerificationExpires,
        u.passwordResetToken,
        u.passwordResetExpires,
        u.createdAt,
        u.updatedAt,
        u.updatedBy${passwordField}
      FROM Users u
    `;

    const whereClause = where ? `WHERE ${where}` : "";
    const orderClause = orderBy ? `ORDER BY ${orderBy}` : "";
    const limitClause = limit
      ? `OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`
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
      FROM Users u
      ${whereClause && whereClause !== "1=1" ? `WHERE ${whereClause}` : ""}
    `;
  }

  /**
   * Builds filter conditions for user queries.
   * @private
   */
  static _buildUserFilterConditions(filters) {
    // console .log("🔍 Building user filter conditions:", filters)
    const conditions = [];
    const parameters = {};
    let paramCounter = 0;

    // Permission-based ID filter (for "own" access)
    if (filters.id) {
      const idParam = `permissionId${paramCounter++}`;
      parameters[idParam] = { value: parseInt(filters.id, 10), type: sql.Int };
      conditions.push(`u.id = @${idParam}`);
    }

    // Search filter (username, email, firstName, lastName)
    if (filters.search) {
      const searchParam = `search${paramCounter++}`;
      parameters[searchParam] = {
        value: `%${filters.search}%`,
        type: sql.NVarChar,
      };
      conditions.push(`(
        u.username LIKE @${searchParam} OR 
        u.email LIKE @${searchParam} OR 
        u.firstName LIKE @${searchParam} OR 
        u.lastName LIKE @${searchParam}
      )`);
    }

    // Role filter
    if (filters.role) {
      const roleParam = `role${paramCounter++}`;
      parameters[roleParam] = { value: filters.role, type: sql.NVarChar };
      conditions.push(`u.role = @${roleParam}`);
    }

    // Organization filter
    if (filters.organization) {
      const orgParam = `org${paramCounter++}`;
      parameters[orgParam] = {
        value: filters.organization,
        type: sql.NVarChar,
      };
      conditions.push(`u.organization = @${orgParam}`);
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      const activeParam = `active${paramCounter++}`;
      parameters[activeParam] = { value: filters.isActive, type: sql.Bit };
      conditions.push(`u.isActive = @${activeParam}`);
    }

    // Email verification filter
    if (filters.isEmailVerified !== undefined) {
      const verifiedParam = `verified${paramCounter++}`;
      parameters[verifiedParam] = {
        value: filters.isEmailVerified,
        type: sql.Bit,
      };
      conditions.push(`u.isEmailVerified = @${verifiedParam}`);
    }

    // // Handle any additional permission filters
    // Object.entries(filters).forEach(([key, value]) => {
    //   // Skip already handled fields and null/undefined values
    //   if (
    //     [
    //       "id",
    //       "search",
    //       "role",
    //       "organization",
    //       "isActive",
    //       "isEmailVerified",
    //       "limit",
    //       "offset",
    //       "orderBy",
    //     ].includes(key) ||
    //     value === null ||
    //     value === undefined
    //   ) {
    //     return;
    //   }

    //   const paramName = `filter${paramCounter++}`;

    //   // Determine the appropriate SQL type and field name
    //   const fieldType = this._getFieldTypeForFilter(key);
    //   parameters[paramName] = {
    //     value: this._convertValueByType(value, fieldType, key),
    //     type: fieldType,
    //   };
    //   conditions.push(`u.${key} = @${paramName}`);
    // });

    return {
      whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1=1",
      parameters,
    };
  }

  /**
   * Filters and validates update data.
   * @private
   */
  static async _filterAndValidateUpdateData(updateData, existingUser) {
    const fieldMappings = this._getFieldMappings();
    const filteredData = {};

    for (const [field, value] of Object.entries(updateData)) {
      // Skip invalid fields or unchanged values
      if (!fieldMappings[field] || value === undefined || value === "") {
        continue;
      }

      // Skip if value hasn't changed
      if (existingUser[field] === value) {
        continue;
      }

      // Special validation for unique fields
      if (field === "email" && value !== existingUser.email) {
        const emailExists = await this._checkUserExistence(value, null);
        if (emailExists.emailExists) {
          throw new Error("Email already exists");
        }
        filteredData[field] = value.toLowerCase().trim();
        filteredData.isEmailVerified = false; // Reset verification when email changes
        filteredData.emailVerificationToken = crypto
          .randomBytes(32)
          .toString("hex");
        filteredData.emailVerificationExpires = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );
      } else if (field === "username" && value !== existingUser.username) {
        const usernameExists = await this._checkUserExistence(null, value);
        if (usernameExists.usernameExists) {
          throw new Error("Username already exists");
        }
        filteredData[field] = value.toLowerCase().trim();
      } else if (field === "password") {
        // Hash password if being updated
        filteredData[field] = await this._hashPassword(value);
        filteredData.passwordChangedAt = new Date();
      } else {
        filteredData[field] = value;
      }
    }

    return filteredData;
  }

  /**
   * Gets field mappings with SQL types.
   * @private
   */
  static _getFieldMappings() {
    return {
      username: { type: sql.NVarChar },
      email: { type: sql.NVarChar },
      password: { type: sql.NVarChar },
      firstName: { type: sql.NVarChar },
      lastName: { type: sql.NVarChar },
      profilePicture: { type: sql.NVarChar },
      bio: { type: sql.NVarChar },
      dateOfBirth: { type: sql.DateTime },
      phone: { type: sql.NVarChar },
      address: { type: sql.NVarChar },
      city: { type: sql.NVarChar },
      state: { type: sql.NVarChar },
      country: { type: sql.NVarChar },
      postalCode: { type: sql.NVarChar },
      role: { type: sql.NVarChar },
      organization: { type: sql.NVarChar },
      isActive: { type: sql.Bit },
      isEmailVerified: { type: sql.Bit },
      emailVerifiedAt: { type: sql.DateTime },
      emailVerificationToken: { type: sql.NVarChar },
      emailVerificationExpires: { type: sql.DateTime },
      twoFactorEnabled: { type: sql.Bit },
      twoFactorSecret: { type: sql.NVarChar },
      lastLogin: { type: sql.DateTime },
      isOnline: { type: sql.Bit },
      loginAttempts: { type: sql.Int },
      lockUntil: { type: sql.DateTime },
      passwordChangedAt: { type: sql.DateTime },
      passwordResetToken: { type: sql.NVarChar },
      passwordResetExpires: { type: sql.DateTime },
      createdAt: { type: sql.DateTime },
      updatedAt: { type: sql.DateTime },
      updatedBy: { type: sql.Int },
    };
  }

  /**
   * Converts value to appropriate type.
   * @private
   */
  static _convertValueByType(value, sqlType, fieldName) {
    try {
      if (sqlType === sql.Int) {
        const intValue = parseInt(value, 10); // ✅ Add this missing line
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
   * Helper method to get SQL type for filter fields
   * @private
   */
  static _getFieldTypeForFilter(fieldName) {
    const fieldMappings = this._getFieldMappings();
    return fieldMappings[fieldName]?.type || sql.NVarChar;
  }

  /**
   * Transforms database result into structured user object.
   * @private
   */
  static _transformUserResult(result) {
    return {
      id: result.id,
      username: result.username,
      email: result.email,
      password: result.password, // Will be removed by returnUserWithoutPassword helper
      firstName: result.firstName,
      lastName: result.lastName,
      fullName:
        `${result.firstName || ""} ${result.lastName || ""}`.trim() || null,
      profilePicture: result.profilePicture,
      bio: result.bio,
      dateOfBirth: result.dateOfBirth,
      phone: result.phone,
      address: result.address,
      city: result.city,
      state: result.state,
      country: result.country,
      postalCode: result.postalCode,
      role: result.role,
      organization: result.organization,
      isActive: result.isActive,
      isEmailVerified: result.isEmailVerified,
      emailVerifiedAt: result.emailVerifiedAt,
      emailVerificationToken: result.emailVerificationToken, // TODO: Send it separately when registering
      twoFactorEnabled: result.twoFactorEnabled,
      lastLogin: result.lastLogin,
      isOnline: result.isOnline,
      loginAttempts: result.loginAttempts,
      lockUntil: result.lockUntil,
      passwordChangedAt: result.passwordChangedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      updatedBy: result.updatedBy,
    };
  }
}
