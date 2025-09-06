import { Router } from "express";
import { myProfileController } from "../controllers/profileController.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  profilePictureUpload,
  handleUploadError,
} from "../middlewares/fileUpload.js";
import {
  validateProfileUpdate,
  validateContactUpdate,
  validateUsernameUpdate,
  validateEmailUpdate,
  validateChangePassword,
  validateTwoFactorUpdate,
  validateAccountDeactivation,
  validateFileUpload,
  handleValidationErrors,
} from "../middlewares/validation.js";

const router = Router();

// Apply authentication to all profile routes
router.use(authenticateToken);

// ============= Profile Information Routes =============

/**
 * @route GET /api/profile/me
 * @description Get current user profile with enhanced information
 * @access Private
 */
router.get("/me", myProfileController.getMyProfile);

/**
 * @route PUT /api/profile/me
 * @description Update user profile information
 * @access Private
 */
router.put(
  "/me",
  validateProfileUpdate(),
  handleValidationErrors,
  myProfileController.updateMyProfile
);

/**
 * @route GET /api/profile/completion
 * @description Get profile completion status with suggestions
 * @access Private
 */
router.get("/completion", myProfileController.getProfileCompletion);

/**
 * @route GET /api/profile/activity
 * @description Get user activity summary
 * @access Private
 */
router.get("/activity", myProfileController.getActivitySummary);

// ============= Contact Information Routes =============

/**
 * @route PUT /api/profile/contact
 * @description Update contact information
 * @access Private
 */
router.put(
  "/contact",
  validateContactUpdate(),
  handleValidationErrors,
  myProfileController.updateContactInfo
);

// ============= Account Security Routes =============

/**
 * @route PUT /api/profile/username
 * @description Update username with validation
 * @access Private
 */
router.put(
  "/username",
  validateUsernameUpdate(),
  handleValidationErrors,
  myProfileController.updateUsername
);

/**
 * @route PUT /api/profile/email
 * @description Update email address (requires verification)
 * @access Private
 */
router.put(
  "/email",
  validateEmailUpdate(),
  handleValidationErrors,
  myProfileController.updateEmail
);

/**
 * @route PUT /api/profile/password
 * @description Change password with current password verification
 * @access Private
 */
router.put(
  "/password",
  validateChangePassword(),
  handleValidationErrors,
  myProfileController.changePassword
);

/**
 * @route PUT /api/profile/two-factor
 * @description Enable/disable two-factor authentication
 * @access Private
 */
router.put(
  "/two-factor",
  validateTwoFactorUpdate(),
  handleValidationErrors,
  myProfileController.updateTwoFactorAuth
);

// ============= Profile Picture Routes =============

/**
 * @route POST /api/profile/picture
 * @description Upload profile picture with enhanced validation
 * @access Private
 */
router.post(
  "/picture",
  profilePictureUpload.single("profilePicture"),
  handleUploadError,
  validateFileUpload("profilePicture", {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  }),
  myProfileController.uploadProfilePicture
);

/**
 * @route DELETE /api/profile/picture
 * @description Delete profile picture
 * @access Private
 */
router.delete("/picture", myProfileController.deleteProfilePicture);

// ============= Account Management Routes =============

/**
 * @route POST /api/profile/deactivate
 * @description Deactivate user account with password confirmation
 * @access Private
 */
router.post(
  "/deactivate",
  validateAccountDeactivation(),
  handleValidationErrors,
  myProfileController.deactivateAccount
);

export default router;
