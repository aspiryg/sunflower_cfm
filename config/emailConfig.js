/**
 * Email configuration for different environments
 */

export const emailConfig = {
  // SMTP Configuration (can be Gmail, Outlook, Azure, etc.)
  smtp: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password for Gmail, or regular password for others
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  },

  // Default sender information
  defaultSender: {
    name: process.env.EMAIL_FROM_NAME || "Customer Feedback Management",
    email: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
  },

  // Email templates configuration
  templates: {
    authUrl: process.env.AUTH_REDIRECT_URL || "http://localhost:3000/api",
    baseUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    companyName: process.env.COMPANY_NAME || "Customer Feedback Management",
    supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    logoUrl: process.env.COMPANY_LOGO_URL || null,
  },

  // Rate limiting and retry configuration
  rateLimiting: {
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY) || 5000, // 5 seconds
    dailyLimit: parseInt(process.env.EMAIL_DAILY_LIMIT) || 1000,
  },

  // Development mode settings
  development: {
    preview: process.env.EMAIL_PREVIEW === "true" || false,
    saveToFile: process.env.EMAIL_SAVE_TO_FILE === "true" || false,
    logEmails: process.env.EMAIL_LOG === "true" || true,
  },
};

/**
 * Validates email configuration
 */
export const validateEmailConfig = () => {
  const requiredEnvVars = [
    "EMAIL_HOST",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM_ADDRESS",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing email configuration variables: ${missingVars.join(", ")}`
    );
    return false;
  }

  return true;
};
