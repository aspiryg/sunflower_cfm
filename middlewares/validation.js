import { body, validationResult } from "express-validator";

/**
 * Middleware to handle validation errors.
 * @function handleValidationErrors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Middleware to validate user registration data.
 * @function validateUserRegistration
 */
export const validateUserRegistration = () => {
  return [
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters long")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name must not exceed 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name must not exceed 50 characters"),
    body("profilePicture").optional().isURL().withMessage("Invalid URL format"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must not exceed 500 characters"),
    body("dateOfBirth").optional().isISO8601().toDate(),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
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
    body("postalCode").optional().isPostalCode("any"),
    body("organization")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Organization must not exceed 100 characters"),
  ];
};

/**
 * Middleware to validate user login data.
 * @function validateUserLogin
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
  ];
};

/**
 * Middleware to validate forgot password data.
 * @function validateForgotPassword
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
 * Middleware to validate password reset data.
 * @function validatePasswordReset
 */
export const validatePasswordReset = () => {
  return [
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ];
};

/**
 * Middleware to validate change password data.
 * @function validateChangePassword
 */
export const validateChangePassword = () => {
  return [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error(
            "New password must be different from current password"
          );
        }
        return true;
      }),
  ];
};
