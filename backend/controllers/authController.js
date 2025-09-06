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
    isEmailVerified: user.isEmailVerified,
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
 * Sets JWT tokens in cookies with enhanced security.
 * @function setTokenCookies
 */
export const setTokenCookies = (res, accessToken, refreshToken = null) => {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = process.env.COOKIE_DOMAIN || undefined;

  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    domain,
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
 * Registers a new user with comprehensive validation.
 * @function register
 */
export async function register(req, res) {
  try {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      organization,
      role,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, first name, and last name are required",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Create user data object with defaults
    const userData = {
      email: email.toLowerCase().trim(),
      password,
      username: username?.toLowerCase().trim() || email.split("@")[0],
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      organization: organization?.trim() || null,
      role: role || "user", // Default role
      isActive: true,
      isEmailVerified: false,
    };

    // Create new user using the updated model
    const newUser = await User.createUserAsync(userData);
    if (!newUser) {
      return res.status(400).json({
        success: false,
        message: "User registration failed",
        error: "REGISTRATION_FAILED",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(newUser);

    // Set tokens in cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Send verification email (don't fail registration if email fails)
    try {
      if (newUser.emailVerificationToken) {
        await EmailController.sendEmailVerification(
          newUser,
          newUser.emailVerificationToken
        );
        console.log(`📧 Verification email sent to ${newUser.email}`);
      }
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send verification email:",
        emailError.message
      );
      // Continue with registration success
    }

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: returnUserWithoutPassword(newUser),
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);

    // Handle specific database errors
    if (error.message.includes("Email already exists")) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
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
      message: "Registration failed due to server error",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Logs in a user with enhanced security checks.
 * @function login
 */
export async function login(req, res) {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: "MISSING_CREDENTIALS",
      });
    }

    // Validate credentials using the updated model
    const { user, isValid } = await User.validateUserCredentialsAsync(
      email.toLowerCase().trim(),
      password
    );

    if (!isValid || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Please contact support.",
        error: "ACCOUNT_DEACTIVATED",
      });
    }

    // Generate tokens with optional extended expiry for "remember me"
    const { accessToken, refreshToken } = generateToken(user);

    // Set tokens in cookies with appropriate expiry
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    if (rememberMe) {
      // Extended expiry for remember me (30 days)
      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    } else {
      setTokenCookies(res, accessToken, refreshToken);
    }

    // Update last login (handled in validateUserCredentialsAsync)
    console.log(`✅ User ${user.email} logged in successfully`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: returnUserWithoutPassword(user),
      tokens: {
        accessToken,
        refreshToken,
      },
      emailVerificationRequired: !user.isEmailVerified,
    });
  } catch (error) {
    console.error("❌ Error during login:", error);

    // Handle specific authentication errors
    if (error.message.includes("Account is locked")) {
      const lockTimeMatch = error.message.match(/(\d+) minutes/);
      const minutesRemaining = lockTimeMatch ? lockTimeMatch[1] : "unknown";

      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Try again in ${minutesRemaining} minutes.`,
        error: "ACCOUNT_LOCKED",
        retryAfter: minutesRemaining,
      });
    }

    if (error.message.includes("Invalid credentials")) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Login failed due to server error",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Refreshes the access token using the refresh token.
 * @function refreshAccessToken
 */
export async function refreshAccessToken(req, res) {
  try {
    const { userId } = req; // Set by validateRefreshToken middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        error: "INVALID_REFRESH_TOKEN",
      });
    }

    // Find user by ID using the updated model
    const user = await User.findUserByIdAsync(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }

    // Check if user is still active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated",
        error: "ACCOUNT_DEACTIVATED",
      });
    }

    // Generate new access token
    const { accessToken } = generateToken(user);

    // Set new access token in cookies
    setTokenCookies(res, accessToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
      user: returnUserWithoutPassword(user),
    });
  } catch (error) {
    console.error("❌ Error refreshing access token:", error);
    return res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Logs out a user by clearing cookies and updating online status.
 * @function logout
 */
export async function logout(req, res) {
  try {
    const userId = req.user?.id;

    // Update user's online status if user is authenticated
    if (userId) {
      try {
        await User.updateUserLoginDetailsAsync(userId, {
          isOnline: false,
        });
        console.log(`✅ User ${userId} logged out successfully`);
      } catch (updateError) {
        console.warn(
          "⚠️ Failed to update online status during logout:",
          updateError.message
        );
        // Don't fail logout if status update fails
      }
    }

    // Clear authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Error during logout:", error);

    // Even if there's an error, clear cookies and respond success
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

/**
 * Gets current user profile with fresh data.
 * @function getCurrentUserProfile
 */
export async function getCurrentUserProfile(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        error: "UNAUTHENTICATED",
      });
    }

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
      message: "Profile retrieved successfully",
      user: returnUserWithoutPassword(user),
    });
  } catch (error) {
    console.error("❌ Error fetching current user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Verifies user email using verification token.
 * @function verifyEmail
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
        error: "MISSING_TOKEN",
      });
    }

    const user = await User.verifyEmailAsync(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
        error: "INVALID_TOKEN",
      });
    }

    // Send welcome email (don't fail verification if email fails)
    try {
      await EmailController.sendWelcomeEmail(user);
      console.log(`📧 Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error("⚠️ Failed to send welcome email:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to the platform.",
      user: returnUserWithoutPassword(user),
    });
  } catch (error) {
    console.error("❌ Error verifying email:", error);

    if (error.message.includes("Invalid or expired")) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired verification token. Please request a new verification email.",
        error: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Email verification failed due to server error",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Resends email verification with rate limiting protection.
 * @function resendEmailVerification
 */
export async function resendEmailVerification(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
        error: "MISSING_EMAIL",
      });
    }

    const user = await User.findUserByEmailAsync(email.toLowerCase().trim());
    if (!user) {
      // Don't reveal if email exists - security best practice
      return res.status(200).json({
        success: true,
        message:
          "If an account with this email exists, a verification email will be sent.",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
        error: "EMAIL_ALREADY_VERIFIED",
      });
    }

    // Generate new verification token
    const token = await User.generateEmailVerificationTokenAsync(user.id);

    // Send verification email
    try {
      await EmailController.sendEmailVerification(user, token);
      console.log(`📧 Verification email resent to ${user.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
        error: "EMAIL_SEND_FAILED",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("❌ Error resending email verification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Initiates password reset process.
 * @function forgotPassword
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
        error: "MISSING_EMAIL",
      });
    }

    try {
      const { user, resetToken } = await User.generatePasswordResetTokenAsync(
        email.toLowerCase().trim()
      );

      // Send password reset email
      await EmailController.sendPasswordReset(user, resetToken);
      console.log(`📧 Password reset email sent to ${user.email}`);

      return res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (userError) {
      if (userError.message.includes("User not found")) {
        // Don't reveal if email exists - security best practice
        return res.status(200).json({
          success: true,
          message:
            "If an account with this email exists, a password reset email will be sent.",
        });
      }
      throw userError;
    }
  } catch (error) {
    console.error("❌ Error initiating password reset:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Resets password using token with comprehensive validation.
 * @function resetPassword
 */
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
        error: "MISSING_TOKEN",
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation are required",
        error: "MISSING_PASSWORD",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmation do not match",
        error: "PASSWORD_MISMATCH",
      });
    }

    // Reset password using the model
    const user = await User.resetPasswordAsync(token, newPassword);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        error: "INVALID_TOKEN",
      });
    }

    // Send password change confirmation email
    try {
      await EmailController.sendPasswordChanged(user);
      console.log(`📧 Password change confirmation sent to ${user.email}`);
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send password change confirmation:",
        emailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user: returnUserWithoutPassword(user),
    });
  } catch (error) {
    console.error("❌ Error resetting password:", error);

    if (error.message.includes("Invalid or expired")) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired reset token. Please request a new password reset.",
        error: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Password reset failed due to server error",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Changes user password with current password validation.
 * @function changePassword
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password, and confirmation are required",
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

    // Change password using the model
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
        console.log(`📧 Password change confirmation sent to ${user.email}`);
      } catch (emailError) {
        console.error(
          "⚠️ Failed to send password change confirmation:",
          emailError.message
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
      message: "Password change failed due to server error",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}
