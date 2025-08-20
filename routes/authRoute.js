import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUserProfile,
  refreshAccessToken,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import {
  authenticateToken,
  validateRefreshToken,
  requireEmailVerification,
} from "../middlewares/auth.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validateChangePassword,
  validateForgotPassword,
  handleValidationErrors,
} from "../middlewares/validation.js";

const router = Router();

/**
 * @route POST /auth/register
 * @description Register a new user
 * @access Public
 */
router.post(
  "/register",
  validateUserRegistration(),
  handleValidationErrors,
  register
);

/**
 * @route POST /auth/login
 * @description Login an existing user
 * @access Public
 */
router.post("/login", validateUserLogin(), handleValidationErrors, login);

/**
 * @route POST /auth/logout
 * @description Logout the user by clearing cookies
 * @access Private
 */
router.post("/logout", authenticateToken, logout);

/**
 * @route GET /auth/profile
 * @description Get the current user's profile
 * @access Private
 */
router.get("/profile", authenticateToken, getCurrentUserProfile);

/**
 * @route POST /auth/refresh
 * @description Refresh the access token
 * @access Public
 */
router.post("/refresh", validateRefreshToken, refreshAccessToken);

/**
 * @route GET /auth/verify-email/:token
 * @description Verify user email
 * @access Public
 */
router.get("/verify-email/:token", verifyEmail);

/**
 * @route POST /auth/resend-verification
 * @description Resend email verification
 * @access Private
 */
router.post("/resend-verification", resendEmailVerification);

/**
 * @route POST /auth/forgot-password
 * @description Initiate password reset
 * @access Public
 */
router.post(
  "/forgot-password",
  validateForgotPassword(),
  handleValidationErrors,
  forgotPassword
);

/**
 * @route POST /auth/reset-password/:token
 * @description Reset password using token
 * @access Public
 */
router.post(
  "/reset-password/:token",
  validatePasswordReset(),
  handleValidationErrors,
  resetPassword
);

/**
 * @route POST /auth/change-password
 * @description Change user password
 * @access Private
 */
router.post(
  "/change-password",
  authenticateToken,
  requireEmailVerification,
  validateChangePassword(),
  handleValidationErrors,
  changePassword
);

export default router;
