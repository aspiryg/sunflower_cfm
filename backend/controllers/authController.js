import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { EmailController } from "./emailController.js";
import { returnUserWithoutPassword } from "../Helpers/returnUserWithoutPassword.js";

/**
 * Generates JWT tokens for user authentication.
 * @function generateToken
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    organization: user.organization,
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
  return { accessToken, refreshToken };
};

/**
 * Sets JWT tokens in cookies.
 * @function setTokenCookies
 * @param {Object} res - The response object.
 * @param {string} accessToken - The access token to set in cookies.
 * @param {string} [refreshToken] - The refresh token to set in cookies (optional).
 * @return {void}
 */
export const setTokenCookies = (res, accessToken, refreshToken = null) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };
  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: 3600000, // 1 hour
  });
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 604800000, // 7 days
    });
  }
};

/**
 * Registers a new user.
 * @function register
 */
export async function register(req, res) {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    // Create user data object
    const userData = {
      email,
      password,
      username: username || email.split("@")[0],
      firstName,
      lastName,
    };

    // Create new user using the updated model
    const newUser = await User.createUserAsync(userData);

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(newUser);

    // Set tokens in cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Send verification email
    try {
      await EmailController.sendEmailVerification(
        newUser,
        newUser.emailVerificationToken
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: newUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);

    // Handle specific errors
    if (error.message.includes("Email already exists")) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        error: "DUPLICATE_EMAIL",
      });
    }

    if (error.message.includes("Username already exists")) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
        error: "DUPLICATE_USERNAME",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Logs in a user.
 * @function login
 */
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    // Validate credentials using the updated model
    const { user, isValid } = await User.validateUserCredentialsAsync(
      email,
      password
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS",
      });
    }

    // Check email verification before proceeding
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in",
        error: "EMAIL_NOT_VERIFIED",
        userEmail: user.email, // Include email for frontend
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user);

    // Set tokens in cookies
    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("❌ Error logging in user:", error);
    const { lockUntil, loginAttempts } = await User.findUserByEmailAsync(email);
    // Handle specific errors
    if (error.message.includes("Account is locked")) {
      return res.status(423).json({
        success: false,
        message: error.message,
        error: "ACCOUNT_LOCKED",
        lockUntil: lockUntil, // e.g., "2023-10-10T10:00:00Z"
      });
    }

    if (error.message.includes("Invalid credentials")) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS",
        loginAttempts: loginAttempts + 1, // Incremented attempt count
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Refreshes the access token using the refresh token.
 * @function refreshAccessToken
 */
export async function refreshAccessToken(req, res) {
  try {
    const { userId } = req; // userId is set by validateRefreshToken middleware

    // Find user by ID using the updated model
    const user = await User.findUserByIdAsync(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for the provided refresh token",
        error: "INVALID_REFRESH_TOKEN",
      });
    }

    // Generate new access token
    const { accessToken } = generateToken(user);

    // Set new access token in cookies
    setTokenCookies(res, accessToken);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.error("❌ Error refreshing access token:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Logs out a user by clearing cookies.
 * @function logout
 */
export async function logout(req, res) {
  try {
    const userId = req.user?.id;

    // Update user's online status
    if (userId) {
      await User.updateUserLoginDetailsAsync(userId, {
        isOnline: false,
      });
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("❌ Error logging out user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Gets current user profile.
 * @function getCurrentUserProfile
 */
export async function getCurrentUserProfile(req, res) {
  try {
    const userId = req.user.id;

    // Find user by ID using the updated model
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
    console.error("❌ Error fetching current user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Verifies user email.
 * @function verifyEmail
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const user = await User.verifyEmailAsync(token);

    // Send welcome email
    try {
      await EmailController.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: user,
    });
  } catch (error) {
    console.error("❌ Error verifying email:", error);
    if (error.message.includes("Invalid or expired")) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
        error: "INVALID_TOKEN",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error during email verification",
      error: "SERVER_ERROR",
    });
  }
}

/**
 * Resends email verification.
 * @function resendEmailVerification
 */
export async function resendEmailVerification(req, res) {
  try {
    const { email } = req.body;
    // console.log("Resending email verification for:", email);
    const user = await User.findUserByEmailAsync(email);

    const token = await User.generateEmailVerificationTokenAsync(user.id);

    // Send verification email
    await EmailController.sendEmailVerification(user, token);

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("❌ Error resending email verification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Initiates password reset.
 * @function forgotPassword
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const { user, resetToken } = await User.generatePasswordResetTokenAsync(
      email
    );

    // TODO: Send password reset email with resetToken
    // Send password reset email
    await EmailController.sendPasswordReset(user, resetToken);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("❌ Error initiating password reset:", error);

    if (error.message.includes("User not found")) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Resets password using token.
 * @function resetPassword
 */
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.resetPasswordAsync(token, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error resetting password:", error);

    if (error.message.includes("Invalid or expired")) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        error: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Changes user password.
 * @function changePassword
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const success = await User.changePasswordAsync(
      userId,
      currentPassword,
      newPassword
    );

    if (success) {
      // Send password change confirmation
      const user = await User.findUserByIdAsync(userId);
      try {
        await EmailController.sendPasswordChanged(user);
      } catch (emailError) {
        console.error(
          "Failed to send password change confirmation:",
          emailError
        );
      }

      return res.status(200).json({
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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
