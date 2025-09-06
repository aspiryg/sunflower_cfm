import { body, param, validationResult } from "express-validator";

/**
 * Middleware to handle validation errors.
 * @function handleValidationErrors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: "VALIDATION_ERROR",
      details: errorDetails,
    });
  }
  next();
};

/**
 * Validation rules for user registration
 * Updated to match new User schema
 */
export const validateUserRegistration = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage("Email must not exceed 100 characters"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),

    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
      .withMessage("First name can only contain letters and spaces"),

    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
      .withMessage("Last name can only contain letters and spaces"),

    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters")
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage(
        "Username can only contain letters, numbers, underscores, dots, and hyphens"
      ),

    body("organization")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Organization name must not exceed 100 characters"),

    body("role")
      .optional()
      .isIn(["user", "staff", "manager", "admin", "super_admin"])
      .withMessage("Invalid role specified"),

    body("phone")
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),

    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid date of birth")
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13 || age > 120) {
          throw new Error("Age must be between 13 and 120 years");
        }
        return true;
      }),
  ];
};

/**
 * Validation rules for user login
 */
export const validateUserLogin = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 1 })
      .withMessage("Password cannot be empty"),

    body("rememberMe")
      .optional()
      .isBoolean()
      .withMessage("Remember me must be a boolean value"),
  ];
};

/**
 * Validation rules for password reset request
 */
export const validateForgotPassword = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
  ];
};

/**
 * Validation rules for password reset
 */
export const validatePasswordReset = () => {
  return [
    param("token")
      .notEmpty()
      .withMessage("Reset token is required")
      .isLength({ min: 10 })
      .withMessage("Invalid reset token format"),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),

    body("confirmPassword")
      .notEmpty()
      .withMessage("Password confirmation is required")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Password confirmation does not match new password");
        }
        return true;
      }),
  ];
};

/**
 * Validation rules for changing password
 */
export const validateChangePassword = () => {
  return [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one lowercase letter, one uppercase letter, and one number"
      )
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error(
            "New password must be different from current password"
          );
        }
        return true;
      }),

    body("confirmPassword")
      .notEmpty()
      .withMessage("Password confirmation is required")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Password confirmation does not match new password");
        }
        return true;
      }),
  ];
};

/**
 * Validation rules for email verification resend
 */
export const validateResendEmailVerification = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
  ];
};

/**
 * Validation rules for profile updates
 */
export const validateProfileUpdate = () => {
  return [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
      .withMessage("First name can only contain letters and spaces"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
      .withMessage("Last name can only contain letters and spaces"),

    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must not exceed 500 characters"),

    body("phone")
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),

    body("address")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Address must not exceed 255 characters"),

    body("city")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("City must not exceed 100 characters"),

    body("state")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("State must not exceed 100 characters"),

    body("country")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Country must not exceed 100 characters"),

    body("postalCode")
      .optional()
      .trim()
      .matches(/^[A-Za-z0-9\s-]{3,10}$/)
      .withMessage("Please provide a valid postal code"),

    body("organization")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Organization name must not exceed 100 characters"),
  ];
};

/**
 * Validation rules for username update
 */
export const validateUsernameUpdate = () => {
  return [
    body("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters")
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage(
        "Username can only contain letters, numbers, underscores, dots, and hyphens"
      ),
  ];
};

/**
 * Validation rules for email update
 */
export const validateEmailUpdate = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage("Email must not exceed 100 characters"),

    body("password")
      .notEmpty()
      .withMessage("Current password is required to change email"),
  ];
};

/**
 * Validation rules for contact information update
 */
export const validateContactUpdate = () => {
  return [
    body("phone")
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),

    body("address")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Address must not exceed 255 characters"),

    body("city")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("City must not exceed 100 characters"),

    body("state")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("State must not exceed 100 characters"),

    body("country")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Country must not exceed 100 characters"),

    body("postalCode")
      .optional()
      .trim()
      .matches(/^[A-Za-z0-9\s-]{3,10}$/)
      .withMessage("Please provide a valid postal code"),
  ];
};

/**
 * Validation rules for two-factor authentication update
 */
export const validateTwoFactorUpdate = () => {
  return [
    body("enabled").isBoolean().withMessage("Enabled status must be a boolean"),

    body("password").notEmpty().withMessage("Current password is required"),
  ];
};

/**
 * Validation rules for account deactivation
 */
export const validateAccountDeactivation = () => {
  return [
    body("password")
      .notEmpty()
      .withMessage("Current password is required to deactivate account"),

    body("reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Reason must not exceed 500 characters"),
  ];
};

/**
 * Validation rules for user creation by admin
 */
export const validateUserCreation = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage("Email must not exceed 100 characters"),

    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
      .withMessage("First name can only contain letters and spaces"),

    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
      .withMessage("Last name can only contain letters and spaces"),

    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters")
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage(
        "Username can only contain letters, numbers, underscores, dots, and hyphens"
      ),

    body("role")
      .isIn(["user", "staff", "manager", "admin", "super_admin"])
      .withMessage("Invalid role specified"),

    body("organization")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Organization name must not exceed 100 characters"),

    body("sendWelcomeEmail")
      .optional()
      .isBoolean()
      .withMessage("Send welcome email must be a boolean"),

    body("temporaryPassword")
      .optional()
      .isBoolean()
      .withMessage("Temporary password flag must be a boolean"),
  ];
};

/**
 * Validation rules for role updates
 */
export const validateRoleUpdate = () => {
  return [
    body("role")
      .isIn(["user", "staff", "manager", "admin", "super_admin"])
      .withMessage("Invalid role specified"),

    body("reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Reason must not exceed 500 characters"),
  ];
};

/**
 * Custom validation for file uploads
 */
export const validateFileUpload = (fieldName, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  } = options;

  return (req, res, next) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        error: "NO_FILE_UPLOADED",
      });
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
        error: "FILE_TOO_LARGE",
      });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        error: "INVALID_FILE_TYPE",
      });
    }

    next();
  };
};
