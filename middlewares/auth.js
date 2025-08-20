import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import {
  generateToken,
  setTokenCookies,
} from "../controllers/authController.js";

/**
 * Middleware to authenticate JWT tokens.
 * @function authenticateToken
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
      // Try to verify access Token
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await User.findUserByIdAsync(decoded.id);

      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found or inactive",
          error: "USER_NOT_FOUND",
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } else {
      // Access token is invalid/expired, try refresh token
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token not found, please provide a valid token",
          error: "MISSING_TOKEN",
        });
      }

      try {
        const refreshTokenDecoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        const user = await User.findUserByIdAsync(refreshTokenDecoded.id);

        if (!user || !user.isActive) {
          return res.status(404).json({
            success: false,
            message: "User not found or inactive",
            error: "USER_NOT_FOUND",
          });
        }

        // Generate new access token
        const { accessToken: newAccessToken } = generateToken(user);

        // set new access token in cookies
        setTokenCookies(res, newAccessToken);

        // Attach user to request object
        req.user = user;
        next();
      } catch (refreshTokenError) {
        // Both tokens are invalid
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        console.error("❌ Refresh token error:", refreshTokenError);
        return res.status(401).json({
          success: false,
          message: "Session expired, please log in again.",
          error: "SESSION_EXPIRED",
        });
      }
    }
  } catch (error) {
    console.error("❌ Token authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Middleware to validate refresh tokens.
 * @function validateRefreshToken
 */
export const validateRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is required",
      error: "MISSING_REFRESH_TOKEN",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        error: "INVALID_REFRESH_TOKEN",
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
        error: "REFRESH_TOKEN_EXPIRED",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        error: "INVALID_REFRESH_TOKEN",
      });
    } else {
      console.error("❌ Refresh token validation error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

/**
 * Middleware to check if user email is verified.
 * @function requireEmailVerification
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required",
      error: "EMAIL_NOT_VERIFIED",
    });
  }
  next();
};
