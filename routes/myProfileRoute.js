import { Router } from "express";
import { myProfileController } from "../controllers/profileController.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  profilePictureUpload,
  handleUploadError,
} from "../middlewares/fileUpload.js";

const router = Router();

// Apply authentication to all profile routes
router.use(authenticateToken);

// ============= Profile Information Routes =============

/**
 * @route GET /api/profile/me
 * @description Get current user profile
 * @access Private
 */
router.get("/me", myProfileController.getMyProfile);

/**
 * @route PUT /api/profile/me
 * @description Update user profile information
 * @access Private
 */
router.put("/me", myProfileController.updateMyProfile);

/**
 * @route GET /api/profile/completion
 * @description Get profile completion status
 * @access Private
 */
router.get("/completion", myProfileController.getProfileCompletion);

// ============= Contact Information Routes =============

/**
 * @route PUT /api/profile/contact
 * @description Update contact information
 * @access Private
 */
router.put("/contact", myProfileController.updateContactInfo);

// ============= Account Security Routes =============

/**
 * @route PUT /api/profile/username
 * @description Update username
 * @access Private
 */
router.put("/username", myProfileController.updateUsername);

/**
 * @route PUT /api/profile/email
 * @description Update email address (requires verification)
 * @access Private
 */
router.put("/email", myProfileController.updateEmail);

/**
 * @route PUT /api/profile/password
 * @description Change password
 * @access Private
 */
router.put("/password", myProfileController.changePassword);

/**
 * @route PUT /api/profile/two-factor
 * @description Enable/disable two-factor authentication
 * @access Private
 */
router.put("/two-factor", myProfileController.updateTwoFactorAuth);

// ============= Profile Picture Routes =============

/**
 * @route POST /api/profile/picture
 * @description Upload profile picture
 * @access Private
 */
router.post(
  "/picture",
  profilePictureUpload.single("profilePicture"),
  handleUploadError,
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
 * @description Deactivate user account
 * @access Private
 */
router.post("/deactivate", myProfileController.deactivateAccount);

export default router;
