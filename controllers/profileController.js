import { User } from "../models/User.js";
import { PermissionService } from "../services/permissionService.js";
import { EmailController } from "./emailController.js";
import { azureStorageService } from "../services/azureStorageService.js";
import { ACTIONS, RESOURCES } from "../config/rolesConfig.js";

export const myProfileController = {
  /**
   * Get current user profile
   */
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findUserByIdAsync(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        });
      }

      return res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user profile",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Update user profile information
   */
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Validate user can update their own profile
      const authResult = PermissionService.authorize(
        req.user,
        RESOURCES.USERS,
        ACTIONS.UPDATE,
        { id: userId, createdBy: userId }
      );

      if (!authResult.allowed) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to update profile",
          error: "INSUFFICIENT_PERMISSIONS",
        });
      }

      // Filter allowed fields for profile update
      const allowedFields = [
        "firstName",
        "lastName",
        "bio",
        "dateOfBirth",
        "phone",
        "address",
        "city",
        "state",
        "country",
        "postalCode",
        "organization",
      ];

      const filteredUpdateData = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredUpdateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
          error: "NO_VALID_FIELDS",
        });
      }

      // Update user profile
      const updatedUser = await User.updateUserAsync(
        userId,
        filteredUpdateData,
        userId
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating user profile:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update user profile",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Update user contact information
   */
  updateContactInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      const { phone, address, city, state, country, postalCode } = req.body;

      const contactData = {
        phone,
        address,
        city,
        state,
        country,
        postalCode,
      };

      // Remove undefined/null values
      Object.keys(contactData).forEach((key) => {
        if (contactData[key] === undefined || contactData[key] === null) {
          delete contactData[key];
        }
      });

      const updatedUser = await User.updateUserAsync(
        userId,
        contactData,
        userId
      );

      return res.json({
        success: true,
        message: "Contact information updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating contact info:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update contact information",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Update username (with validation)
   */
  updateUsername: async (req, res) => {
    try {
      const userId = req.user.id;
      const { username } = req.body;

      if (!username || username.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username must be at least 3 characters long",
          error: "INVALID_USERNAME",
        });
      }

      // Check if username is already taken
      const existingUser = await User.findUserByUsernameAsync(username.trim());
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
          error: "USERNAME_TAKEN",
        });
      }

      const updatedUser = await User.updateUserAsync(
        userId,
        { username: username.trim() },
        userId
      );

      return res.json({
        success: true,
        message: "Username updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating username:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update username",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Update email (with verification required)
   */
  updateEmail: async (req, res) => {
    try {
      const userId = req.user.id;
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and current password are required",
          error: "MISSING_REQUIRED_FIELDS",
        });
      }

      // Verify current password
      const { isValid } = await User.validateUserCredentialsAsync(
        req.user.email,
        password
      );
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
          error: "INVALID_PASSWORD",
        });
      }

      // Check if email is already taken
      const existingUser = await User.findUserByEmailAsync(email.trim());
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
          error: "EMAIL_TAKEN",
        });
      }

      // Generate new verification token
      const verificationToken = await User.generateEmailVerificationTokenAsync(
        userId
      );

      // Update email and reset verification status
      const updatedUser = await User.updateUserAsync(
        userId,
        {
          email: email.trim().toLowerCase(),
          isEmailVerified: false,
        },
        userId
      );

      // Send verification email to new address
      try {
        await EmailController.sendEmailVerification(
          updatedUser,
          verificationToken
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail the request if email fails
      }

      return res.json({
        success: true,
        message:
          "Email updated successfully. Please check your new email to verify.",
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update email",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Change password
   */
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All password fields are required",
          error: "MISSING_REQUIRED_FIELDS",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirmation do not match",
          error: "PASSWORD_MISMATCH",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters long",
          error: "PASSWORD_TOO_SHORT",
        });
      }

      // Change password using User model method
      const success = await User.changePasswordAsync(
        userId,
        currentPassword,
        newPassword
      );

      if (success) {
        // Send password change confirmation email
        const user = await User.findUserByIdAsync(userId);
        try {
          await EmailController.sendPasswordChanged(user);
        } catch (emailError) {
          console.error(
            "Failed to send password change confirmation:",
            emailError
          );
        }

        return res.json({
          success: true,
          message: "Password changed successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Failed to change password",
          error: "PASSWORD_CHANGE_FAILED",
        });
      }
    } catch (error) {
      console.error("❌ Error changing password:", error);

      if (error.message.includes("Current password is incorrect")) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
          error: "INCORRECT_CURRENT_PASSWORD",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
          error: "NO_FILE_UPLOADED",
        });
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
          error: "INVALID_FILE_TYPE",
        });
      }

      // Validate file size (5MB max)
      const maxSize = process.env.MAX_PROFILE_PICTURE_SIZE || 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${
            maxSize / (1024 * 1024)
          }MB`,
          error: "FILE_TOO_LARGE",
        });
      }

      // Get current user to check for existing profile picture
      const currentUser = await User.findUserByIdAsync(userId);

      // Upload new profile picture to Azure Storage
      const uploadResult = await azureStorageService.uploadProfilePicture(
        userId,
        req.file
      );

      // Update user with the access URL (either SAS URL or direct URL)
      const updatedUser = await User.updateUserAsync(
        userId,
        {
          profilePicture: uploadResult.url,
        },
        userId
      );

      // Delete old profile picture if it exists
      if (currentUser.profilePicture) {
        try {
          await azureStorageService.deleteFile(currentUser.profilePicture);
          console.log("🗑️ Old profile picture deleted successfully");
        } catch (deleteError) {
          console.warn(
            "⚠️ Failed to delete old profile picture:",
            deleteError.message
          );
          // Don't fail the request if deletion fails
        }
      }

      return res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          user: updatedUser,
          uploadInfo: {
            fileName: uploadResult.fileName,
            size: uploadResult.size,
            originalSize: uploadResult.originalSize,
            hasSasUrl: uploadResult.hasSasUrl,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to upload profile picture";
      if (error.message.includes("not configured")) {
        errorMessage = "File upload service is not configured";
      } else if (error.message.includes("PublicAccessNotPermitted")) {
        errorMessage = "Storage configuration issue - please contact support";
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Delete profile picture
   */
  deleteProfilePicture: async (req, res) => {
    try {
      const userId = req.user.id;

      const currentUser = await User.findUserByIdAsync(userId);
      if (!currentUser.profilePicture) {
        return res.status(400).json({
          success: false,
          message: "No profile picture to delete",
          error: "NO_PROFILE_PICTURE",
        });
      }

      // Delete from Azure Storage
      try {
        await azureStorageService.deleteFile(currentUser.profilePicture);
      } catch (deleteError) {
        console.warn(
          "Failed to delete profile picture from storage:",
          deleteError
        );
        // Continue with database update even if storage deletion fails
      }

      // Update user to remove profile picture URL
      const updatedUser = await User.updateUserAsync(
        userId,
        { profilePicture: null },
        userId
      );

      return res.json({
        success: true,
        message: "Profile picture deleted successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error deleting profile picture:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete profile picture",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Enable/disable two-factor authentication
   */
  updateTwoFactorAuth: async (req, res) => {
    try {
      const userId = req.user.id;
      const { enabled, password } = req.body;

      if (enabled === undefined || !password) {
        return res.status(400).json({
          success: false,
          message: "Enabled status and password are required",
          error: "MISSING_REQUIRED_FIELDS",
        });
      }

      // Verify current password
      const { isValid } = await User.validateUserCredentialsAsync(
        req.user.email,
        password
      );
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
          error: "INVALID_PASSWORD",
        });
      }

      // Update two-factor authentication status
      const updateData = { twoFactorEnabled: enabled };

      // If disabling, clear the secret
      if (!enabled) {
        updateData.twoFactorSecret = null;
      }

      const updatedUser = await User.updateUserAsync(
        userId,
        updateData,
        userId
      );

      return res.json({
        success: true,
        message: `Two-factor authentication ${
          enabled ? "enabled" : "disabled"
        } successfully`,
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating two-factor auth:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update two-factor authentication",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Get profile completion status
   */
  getProfileCompletion: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findUserByIdAsync(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        });
      }

      // Calculate profile completion
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "city",
        "country",
      ];

      const optionalFields = [
        "profilePicture",
        "bio",
        "address",
        "state",
        "postalCode",
        "organization",
      ];

      let completedRequired = 0;
      let completedOptional = 0;

      requiredFields.forEach((field) => {
        if (user[field] && user[field].toString().trim() !== "") {
          completedRequired++;
        }
      });

      optionalFields.forEach((field) => {
        if (user[field] && user[field].toString().trim() !== "") {
          completedOptional++;
        }
      });

      const requiredPercentage =
        (completedRequired / requiredFields.length) * 100;
      const optionalPercentage =
        (completedOptional / optionalFields.length) * 100;
      const overallPercentage = Math.round(
        requiredPercentage * 0.7 + optionalPercentage * 0.3
      );

      const missingRequired = requiredFields.filter(
        (field) => !user[field] || user[field].toString().trim() === ""
      );

      const completion = {
        overall: overallPercentage,
        required: Math.round(requiredPercentage),
        optional: Math.round(optionalPercentage),
        missingRequired,
        isComplete: completedRequired === requiredFields.length,
        suggestions: [],
      };

      // Add suggestions
      if (missingRequired.length > 0) {
        completion.suggestions.push(
          `Complete required fields: ${missingRequired.join(", ")}`
        );
      }
      if (!user.profilePicture) {
        completion.suggestions.push("Add a profile picture");
      }
      if (!user.bio) {
        completion.suggestions.push("Add a bio to tell others about yourself");
      }
      if (!user.isEmailVerified) {
        completion.suggestions.push("Verify your email address");
      }

      return res.json({
        success: true,
        message: "Profile completion retrieved successfully",
        data: completion,
      });
    } catch (error) {
      console.error("❌ Error getting profile completion:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get profile completion",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Deactivate account
   */
  deactivateAccount: async (req, res) => {
    try {
      const userId = req.user.id;
      const { password, reason } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required to deactivate account",
          error: "MISSING_PASSWORD",
        });
      }

      // Verify current password
      const { isValid } = await User.validateUserCredentialsAsync(
        req.user.email,
        password
      );
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
          error: "INVALID_PASSWORD",
        });
      }

      // Deactivate account
      const success = await User.deleteUserAsync(userId, userId);

      if (success) {
        // Log deactivation reason if provided
        if (reason) {
          console.log(`User ${userId} deactivated account. Reason: ${reason}`);
        }

        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.json({
          success: true,
          message: "Account deactivated successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Failed to deactivate account",
          error: "DEACTIVATION_FAILED",
        });
      }
    } catch (error) {
      console.error("❌ Error deactivating account:", error);
      res.status(500).json({
        success: false,
        message: "Failed to deactivate account",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },
};
