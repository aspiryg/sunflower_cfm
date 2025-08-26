import { User } from "../models/User.js";
import { PermissionService } from "../services/permissionService.js";
import { EmailController } from "./emailController.js";

/**
 * Creates a new user.
 * @function createUserAsync
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function createUserAsync(req, res) {
  const userData = req.body;
  if (!userData || !userData.email || !userData.password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const newUser = await User.createUser(userData);
    if (!newUser) {
      return res.status(400).json({ message: "User creation failed" });
    }

    // Send a welcome email or perform other post-creation tasks here
    await EmailController.sendWelcomeEmail(newUser);

    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Fetches all users.
 * @function getAllUsersAsync
 */
export async function getAllUsersAsync(req, res) {
  try {
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
      });
    }

    const result = await User.getAllUsersAsync(options);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Updates a user by ID.
 * @function updateUserAsync
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function updateUserAsync(req, res) {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const currentUser = req.user;
    const targetUser = req.targetResource; // Set by middleware

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

    const updatedUser = await User.updateUserAsync(
      userId,
      updateData,
      currentUser.id
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// getUserByIdAsync (findUserById)
export async function getUserByIdAsync(req, res) {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Check if this is accessing own profile or if user has broader permissions
    const isOwnProfile = currentUser.id === parseInt(userId);
    const hasAdminAccess = ["admin", "super_admin"].includes(currentUser.role);

    if (!isOwnProfile && !hasAdminAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: can only view own profile",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const user = await User.findUserByIdAsync(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// ... existing imports and functions ...

/**
 * Updates a user's role - simplified version using existing User.updateUserAsync
 * @function updateUserRoleAsync
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export async function updateUserRoleAsync(req, res) {
  try {
    const userId = req.params.id;
    const { role, reason } = req.body;
    const currentUser = req.user;

    // Basic security check - prevent self role change
    if (currentUser.id === parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    // Use existing updateUserAsync function
    const updatedUser = await User.updateUserAsync(
      userId,
      { role },
      currentUser.id
    );

    console.log(
      `✅ Role changed: User ${userId} role updated to ${role} by ${currentUser.id}. Reason: ${reason}`
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// deleteUserAsync
export async function deleteUserAsync(req, res) {
  const userId = req.params.id;
  try {
    const currentUser = req.user;
    const targetUser = req.targetResource; // Set by middleware

    // Check if current user can delete the target user
    if (!PermissionService.canManageUser(currentUser, targetUser)) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete this user",
        error: "CANNOT_DELETE_USER",
      });
    }

    const result = await User.deleteUserAsync(userId);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
