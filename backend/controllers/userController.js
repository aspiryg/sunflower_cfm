import { User } from "../models/User.js";
import { PermissionService } from "../services/permissionService.js";
import { EmailController } from "./emailController.js";
import { returnUserWithoutPassword } from "../Helpers/returnUserWithoutPassword.js";

/**
 * Creates a new user (Admin functionality).
 * @function createUserAsync
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function createUserAsync(req, res) {
  try {
    const userData = req.body;
    const currentUser = req.user;

    // Validate required fields
    if (
      !userData ||
      !userData.email ||
      !userData.firstName ||
      !userData.lastName
    ) {
      return res.status(400).json({
        success: false,
        message: "Email, first name, and last name are required",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Validate role assignment permissions
    if (userData.role) {
      const allowedRoles = PermissionService.getAssignableRoles(currentUser);
      if (!allowedRoles.includes(userData.role)) {
        return res.status(403).json({
          success: false,
          message: `Cannot assign role '${userData.role}'`,
          error: "INVALID_ROLE_ASSIGNMENT",
          allowedRoles,
        });
      }
    }

    // Generate temporary password if not provided
    const temporaryPassword = userData.password || generateTemporaryPassword();
    const userDataWithPassword = {
      ...userData,
      password: temporaryPassword,
      // Admin-created users should be active but need email verification
      isActive: true,
      isEmailVerified: false,
    };

    // Create user using the updated model
    const newUser = await User.createUserAsync(userDataWithPassword);
    if (!newUser) {
      return res.status(400).json({
        success: false,
        message: "User creation failed",
        error: "USER_CREATION_FAILED",
      });
    }

    // Send welcome email with temporary password (if applicable)
    try {
      if (userData.sendWelcomeEmail !== false) {
        await EmailController.sendWelcomeEmail(newUser, {
          isAdminCreated: true,
          temporaryPassword: userData.password ? null : temporaryPassword,
          emailVerificationToken: newUser.emailVerificationToken,
        });
        console.log(`📧 Welcome email sent to ${newUser.email}`);
      }
    } catch (emailError) {
      console.error("⚠️ Failed to send welcome email:", emailError.message);
      // Don't fail user creation if email fails
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: returnUserWithoutPassword(newUser),
      temporaryPassword: userData.password ? null : temporaryPassword,
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);

    // Handle specific errors
    if (error.message.includes("Email already exists")) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
        error: "DUPLICATE_EMAIL",
      });
    }

    if (error.message.includes("Username already exists")) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken",
        error: "DUPLICATE_USERNAME",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Fetches all users with proper permission filtering.
 * @function getAllUsersAsync
 */
export async function getAllUsersAsync(req, res) {
  try {
    const currentUser = req.user;

    // Merge query parameters with permission filters
    const options = {
      ...req.query,
      ...req.permissionFilters, // Injected by requirePermission middleware
    };

    // If permission filter indicates impossible condition, return empty array
    if (options.impossible) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: parseInt(req.query.limit) || 20,
          offset: 0,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        message: "No users found matching your access permissions",
      });
    }

    // Parse pagination parameters
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;

    // Add pagination to options
    options.limit = limit;
    options.offset = offset;

    const result = await User.getAllUsersAsync(options);

    return res.status(200).json({
      success: true,
      message: `Retrieved ${result.data.length} users successfully`,
      ...result,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Get user by ID with proper access control.
 * @function getUserByIdAsync
 */
export async function getUserByIdAsync(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const currentUser = req.user;

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        error: "INVALID_USER_ID",
      });
    }

    // Check permissions - this is handled by middleware, but double-check for clarity
    const targetUser = req.targetResource; // Set by permission middleware
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user: returnUserWithoutPassword(targetUser),
    });
  } catch (error) {
    console.error("❌ Error fetching user by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Updates a user by ID with comprehensive validation.
 * @function updateUserAsync
 */
export async function updateUserAsync(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const updateData = req.body;
    const currentUser = req.user;
    const targetUser = req.targetResource; // Set by middleware

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        error: "INVALID_USER_ID",
      });
    }

    // Remove sensitive fields that shouldn't be updated through this endpoint
    const restrictedFields = [
      "password",
      "emailVerificationToken",
      "passwordResetToken",
      "twoFactorSecret",
      "loginAttempts",
      "lockUntil",
      "createdAt",
      "createdBy",
      "deletedAt",
      "deletedBy",
    ];
    restrictedFields.forEach((field) => delete updateData[field]);

    // Validate role changes if role is being updated
    if (updateData.role && updateData.role !== targetUser.role) {
      const canManage = PermissionService.canManageUser(
        currentUser,
        targetUser
      );
      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: "Cannot change role for this user",
          error: "CANNOT_MANAGE_USER",
        });
      }

      const allowedRoles = PermissionService.getAssignableRoles(currentUser);
      if (!allowedRoles.includes(updateData.role)) {
        return res.status(403).json({
          success: false,
          message: `Cannot assign role '${updateData.role}'`,
          error: "INVALID_ROLE_ASSIGNMENT",
          allowedRoles,
        });
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
        error: "NO_VALID_FIELDS",
      });
    }

    const updatedUser = await User.updateUserAsync(
      userId,
      updateData,
      currentUser.id
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: returnUserWithoutPassword(updatedUser),
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }

    if (error.message.includes("Email already exists")) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
        error: "DUPLICATE_EMAIL",
      });
    }

    if (error.message.includes("Username already exists")) {
      return res.status(409).json({
        success: false,
        message: "Username already taken",
        error: "DUPLICATE_USERNAME",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Updates a user's role with audit logging.
 * @function updateUserRoleAsync
 */
export async function updateUserRoleAsync(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role, reason } = req.body;
    const currentUser = req.user;

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        error: "INVALID_USER_ID",
      });
    }

    // Validate role
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
        error: "MISSING_ROLE",
      });
    }

    // Prevent self role change
    if (currentUser.id === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot change your own role",
        error: "CANNOT_CHANGE_OWN_ROLE",
      });
    }

    // Get target user
    const targetUser = await User.findUserByIdAsync(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }

    // Check permissions
    const canManage = PermissionService.canManageUser(currentUser, targetUser);
    if (!canManage) {
      return res.status(403).json({
        success: false,
        message: "Cannot manage this user",
        error: "CANNOT_MANAGE_USER",
      });
    }

    // Validate role assignment
    const allowedRoles = PermissionService.getAssignableRoles(currentUser);
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Cannot assign role '${role}'`,
        error: "INVALID_ROLE_ASSIGNMENT",
        allowedRoles,
      });
    }

    // Update role
    const updatedUser = await User.updateUserAsync(
      userId,
      { role },
      currentUser.id
    );

    // Log the role change
    console.log(
      `✅ Role changed: User ${userId} (${
        targetUser.email
      }) role updated from '${targetUser.role}' to '${role}' by ${
        currentUser.id
      } (${currentUser.email}). Reason: ${reason || "Not provided"}`
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: returnUserWithoutPassword(updatedUser),
      change: {
        previousRole: targetUser.role,
        newRole: role,
        reason: reason || null,
        changedBy: currentUser.id,
        changedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Soft deletes a user (deactivates account).
 * @function deleteUserAsync
 */
export async function deleteUserAsync(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const currentUser = req.user;
    const targetUser = req.targetResource; // Set by middleware

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        error: "INVALID_USER_ID",
      });
    }

    // Prevent self deletion
    if (currentUser.id === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account",
        error: "CANNOT_DELETE_SELF",
      });
    }

    // Check if current user can delete the target user
    if (!PermissionService.canManageUser(currentUser, targetUser)) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete this user",
        error: "CANNOT_DELETE_USER",
      });
    }

    const result = await User.deleteUserAsync(userId, currentUser.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
        error: "USER_NOT_FOUND",
      });
    }

    // Log the deletion
    console.log(
      `✅ User deleted: User ${userId} (${targetUser.email}) deactivated by ${currentUser.id} (${currentUser.email})`
    );

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      deletedUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser.id,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

// Helper function to generate temporary password
function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
