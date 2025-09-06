import { User } from "../models/User.js";
import { PermissionService } from "../services/permissionService.js";
import { EmailController } from "./emailController.js";
import { azureStorageService } from "../services/azureStorageService.js";
import { returnUserWithoutPassword } from "../Helpers/returnUserWithoutPassword.js";
import { ACTIONS, RESOURCES } from "../config/rolesConfig.js";

export const myProfileController = {
  /**
   * Get current user profile with enhanced information
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

      // Calculate additional profile information
      const profileData = {
        ...returnUserWithoutPassword(user),
        accountAge: calculateAccountAge(user.createdAt),
        lastLoginFormatted: user.lastLogin ? formatDate(user.lastLogin) : null,
        isProfileComplete: checkProfileCompletion(user),
      };

      return res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: profileData,
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
   * Update user profile information with enhanced validation
   */
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Filter allowed fields for profile update (aligned with new schema)
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
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          // Handle null values properly
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

      // Update user profile using the updated model
      const updatedUser = await User.updateUserAsync(
        userId,
        filteredUpdateData,
        userId
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: returnUserWithoutPassword(updatedUser),
        updatedFields: Object.keys(filteredUpdateData),
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

      const contactData = {};

      // Only include fields that are provided
      if (phone !== undefined) contactData.phone = phone;
      if (address !== undefined) contactData.address = address;
      if (city !== undefined) contactData.city = city;
      if (state !== undefined) contactData.state = state;
      if (country !== undefined) contactData.country = country;
      if (postalCode !== undefined) contactData.postalCode = postalCode;

      if (Object.keys(contactData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No contact information provided for update",
          error: "NO_CONTACT_DATA",
        });
      }

      const updatedUser = await User.updateUserAsync(
        userId,
        contactData,
        userId
      );

      return res.json({
        success: true,
        message: "Contact information updated successfully",
        data: returnUserWithoutPassword(updatedUser),
        updatedFields: Object.keys(contactData),
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
   * Update username with enhanced validation
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

      const trimmedUsername = username.trim().toLowerCase();

      // Check if username is already taken (excluding current user)
      const existingUser = await User.findUserByUsernameAsync(trimmedUsername);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          message: "Username already taken",
          error: "USERNAME_TAKEN",
        });
      }

      const updatedUser = await User.updateUserAsync(
        userId,
        { username: trimmedUsername },
        userId
      );

      return res.json({
        success: true,
        message: "Username updated successfully",
        data: returnUserWithoutPassword(updatedUser),
      });
    } catch (error) {
      console.error("❌ Error updating username:", error);

      if (error.message.includes("Username already exists")) {
        return res.status(409).json({
          success: false,
          message: "Username already taken",
          error: "USERNAME_TAKEN",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update username",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Update email with verification process
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

      const trimmedEmail = email.trim().toLowerCase();

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

      // Check if email is already taken (excluding current user)
      const existingUser = await User.findUserByEmailAsync(trimmedEmail);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
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
          email: trimmedEmail,
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
        console.log(
          `📧 Email verification sent to new address: ${trimmedEmail}`
        );
      } catch (emailError) {
        console.error(
          "⚠️ Failed to send verification email:",
          emailError.message
        );
        // Don't fail the request if email fails
      }

      return res.json({
        success: true,
        message:
          "Email updated successfully. Please check your new email to verify.",
        data: returnUserWithoutPassword(updatedUser),
        requiresVerification: true,
      });
    } catch (error) {
      console.error("❌ Error updating email:", error);

      if (error.message.includes("Email already exists")) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
          error: "EMAIL_TAKEN",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update email",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  /**
   * Change password with enhanced security
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

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from current password",
          error: "SAME_PASSWORD",
        });
      }

      // Additional password strength validation
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
          console.log(`📧 Password change confirmation sent to ${user.email}`);
        } catch (emailError) {
          console.error(
            "⚠️ Failed to send password change confirmation:",
            emailError.message
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
   * Upload profile picture with enhanced validation
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
          allowedTypes,
        });
      }

      // Validate file size (5MB max)
      const maxSize =
        parseInt(process.env.MAX_PROFILE_PICTURE_SIZE) || 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${Math.round(
            maxSize / (1024 * 1024)
          )}MB`,
          error: "FILE_TOO_LARGE",
          maxSize: Math.round(maxSize / (1024 * 1024)),
        });
      }

      // Get current user to check for existing profile picture
      const currentUser = await User.findUserByIdAsync(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        });
      }

      // Upload new profile picture to Azure Storage
      const uploadResult = await azureStorageService.uploadProfilePicture(
        userId,
        req.file
      );

      // Update user with the new profile picture URL
      const updatedUser = await User.updateUserAsync(
        userId,
        {
          profilePicture: uploadResult.url,
        },
        userId
      );

      // Delete old profile picture if it exists (do this after successful update)
      if (currentUser.profilePicture) {
        try {
          await azureStorageService.deleteFile(currentUser.profilePicture);
          console.log("🗑️ Old profile picture deleted successfully");
        } catch (deleteError) {
          console.warn(
            "⚠️ Failed to delete old profile picture:",
            deleteError.message
          );
          // Don't fail the request if old file deletion fails
        }
      }

      return res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          user: returnUserWithoutPassword(updatedUser),
          uploadInfo: {
            fileName: uploadResult.fileName,
            size: uploadResult.size,
            originalSize: uploadResult.originalSize,
            hasSasUrl: uploadResult.hasSasUrl,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to upload profile picture";
      let errorCode = "UPLOAD_FAILED";

      if (error.message.includes("not configured")) {
        errorMessage = "File upload service is not configured";
        errorCode = "SERVICE_NOT_CONFIGURED";
      } else if (error.message.includes("PublicAccessNotPermitted")) {
        errorMessage = "Storage configuration issue - please contact support";
        errorCode = "STORAGE_CONFIG_ERROR";
      } else if (error.message.includes("BlobNotFound")) {
        errorMessage = "Storage container not found";
        errorCode = "CONTAINER_NOT_FOUND";
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: errorCode,
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
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        });
      }

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
        console.log("🗑️ Profile picture deleted from storage");
      } catch (deleteError) {
        console.warn(
          "⚠️ Failed to delete profile picture from storage:",
          deleteError.message
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
        data: returnUserWithoutPassword(updatedUser),
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

      console.log(
        `🔐 Two-factor authentication ${
          enabled ? "enabled" : "disabled"
        } for user ${userId}`
      );

      return res.json({
        success: true,
        message: `Two-factor authentication ${
          enabled ? "enabled" : "disabled"
        } successfully`,
        data: returnUserWithoutPassword(updatedUser),
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
   * Get enhanced profile completion status
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

      const completion = calculateProfileCompletion(user);

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
   * Deactivate account with enhanced security
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

      // Get user info before deactivation for logging
      const user = await User.findUserByIdAsync(userId);

      // Deactivate account (soft delete)
      const success = await User.deleteUserAsync(userId, userId);

      if (success) {
        // Log deactivation with reason
        console.log(
          `👤 Account deactivated: User ${userId} (${
            user.email
          }) deactivated their own account. Reason: ${reason || "Not provided"}`
        );

        // Clear authentication cookies
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        };

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.json({
          success: true,
          message: "Account deactivated successfully",
          deactivatedAt: new Date().toISOString(),
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

  /**
   * Get user activity summary
   */
  getActivitySummary: async (req, res) => {
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

      const summary = {
        accountCreated: user.createdAt,
        lastLogin: user.lastLogin,
        isOnline: user.isOnline,
        emailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        accountAge: calculateAccountAge(user.createdAt),
        profileCompletion: calculateProfileCompletion(user),
        securityScore: calculateSecurityScore(user),
      };

      return res.json({
        success: true,
        message: "Activity summary retrieved successfully",
        data: summary,
      });
    } catch (error) {
      console.error("❌ Error getting activity summary:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get activity summary",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },
};

// Helper functions
function calculateAccountAge(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function checkProfileCompletion(user) {
  const requiredFields = ["firstName", "lastName", "email", "phone"];
  const completed = requiredFields.filter(
    (field) => user[field] && user[field].toString().trim() !== ""
  );
  return completed.length === requiredFields.length;
}

function calculateProfileCompletion(user) {
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
    "dateOfBirth",
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

  const requiredPercentage = (completedRequired / requiredFields.length) * 100;
  const optionalPercentage = (completedOptional / optionalFields.length) * 100;
  const overallPercentage = Math.round(
    requiredPercentage * 0.7 + optionalPercentage * 0.3
  );

  const missingRequired = requiredFields.filter(
    (field) => !user[field] || user[field].toString().trim() === ""
  );

  const suggestions = [];
  if (missingRequired.length > 0) {
    suggestions.push(`Complete required fields: ${missingRequired.join(", ")}`);
  }
  if (!user.profilePicture) {
    suggestions.push("Add a profile picture");
  }
  if (!user.bio) {
    suggestions.push("Add a bio to tell others about yourself");
  }
  if (!user.isEmailVerified) {
    suggestions.push("Verify your email address");
  }

  return {
    overall: overallPercentage,
    required: Math.round(requiredPercentage),
    optional: Math.round(optionalPercentage),
    missingRequired,
    isComplete: completedRequired === requiredFields.length,
    suggestions,
    completedFields: {
      required: completedRequired,
      optional: completedOptional,
      total: completedRequired + completedOptional,
    },
    totalFields: {
      required: requiredFields.length,
      optional: optionalFields.length,
      total: requiredFields.length + optionalFields.length,
    },
  };
}

function calculateSecurityScore(user) {
  let score = 0;
  const maxScore = 100;

  // Email verification (25 points)
  if (user.isEmailVerified) score += 25;

  // Strong password (we can't check this directly, so assume 20 points if account is active)
  if (user.isActive) score += 20;

  // Two-factor authentication (30 points)
  if (user.twoFactorEnabled) score += 30;

  // Recent activity (15 points if logged in within last 30 days)
  if (user.lastLogin) {
    const daysSinceLogin =
      (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin <= 30) score += 15;
  }

  // Profile completion (10 points)
  if (checkProfileCompletion(user)) score += 10;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    level: score >= 80 ? "High" : score >= 60 ? "Medium" : "Low",
  };
}
