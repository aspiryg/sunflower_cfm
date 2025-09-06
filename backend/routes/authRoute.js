import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUserProfile,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshAccessToken,
} from "../controllers/authController.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validateForgotPassword,
  validatePasswordReset,
  validateChangePassword,
  validateResendEmailVerification,
  handleValidationErrors,
} from "../middlewares/validation.js";
import {
  authenticateToken,
  validateRefreshToken,
} from "../middlewares/auth.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  validateUserRegistration(),
  handleValidationErrors,
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT tokens
 * @access  Public
 */
router.post("/login", validateUserLogin(), handleValidationErrors, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear cookies
 * @access  Private (optional - works with or without auth)
 */
router.post("/logout", logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticateToken, getCurrentUserProfile);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Private (refresh token required)
 */
router.post("/refresh", validateRefreshToken, refreshAccessToken);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email with token
 * @access  Public
 */
router.get("/verify-email/:token", verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post(
  "/resend-verification",
  validateResendEmailVerification(),
  handleValidationErrors,
  resendEmailVerification
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  "/forgot-password",
  validateForgotPassword(),
  handleValidationErrors,
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  "/reset-password/:token",
  validatePasswordReset(),
  handleValidationErrors,
  resetPassword
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password (requires current password)
 * @access  Private
 */
router.post(
  "/change-password",
  authenticateToken,
  validateChangePassword(),
  handleValidationErrors,
  changePassword
);

/**
 * @route   GET /api/auth/status
 * @desc    Check authentication status
 * @access  Public (but provides info based on auth status)
 */
router.get("/status", (req, res) => {
  // This endpoint doesn't require auth but will check if user is authenticated
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(200).json({
      success: true,
      authenticated: false,
      message: "No authentication token found",
    });
  }

  // Try to verify token without requiring authentication
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
        organization: decoded.organization,
        isEmailVerified: decoded.isEmailVerified,
      },
      message: "User is authenticated",
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      authenticated: false,
      message: "Invalid or expired token",
      error: "INVALID_TOKEN",
    });
  }
});

/**
 * @route   POST /api/auth/validate-token
 * @desc    Validate access token
 * @access  Private
 */
router.post("/validate-token", authenticateToken, (req, res) => {
  // If middleware passes, token is valid
  return res.status(200).json({
    success: true,
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      organization: req.user.organization,
      isEmailVerified: req.user.isEmailVerified,
    },
    message: "Token is valid",
  });
});

/**
 * @route   GET /api/auth/session-info
 * @desc    Get session information
 * @access  Private
 */
router.get("/session-info", authenticateToken, async (req, res) => {
  try {
    const { User } = await import("../models/User.js");

    // Get fresh user data
    const user = await User.findUserByIdAsync(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }

    // Calculate session info
    const tokenExp = req.user.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = Math.max(0, tokenExp - now);

    return res.status(200).json({
      success: true,
      session: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
        token: {
          expiresAt: new Date(tokenExp).toISOString(),
          timeUntilExpiry: Math.floor(timeUntilExpiry / 1000), // seconds
          isExpiringSoon: timeUntilExpiry < 300000, // less than 5 minutes
        },
        permissions: {
          canManageUsers: ["admin", "super_admin"].includes(user.role),
          canManageCases: ["staff", "manager", "admin", "super_admin"].includes(
            user.role
          ),
          canViewAnalytics: ["manager", "admin", "super_admin"].includes(
            user.role
          ),
          canAccessSystem: ["admin", "super_admin"].includes(user.role),
        },
      },
      message: "Session information retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting session info:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve session information",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});

export default router;
