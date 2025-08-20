import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { emailConfig, validateEmailConfig } from "../config/emailConfig.js";

/**
 * Core email service using Nodemailer
 */
export class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.sentToday = 0;
    this.lastResetDate = new Date().toDateString();

    this._initializeTransporter();
  }

  /**
   * Initialize email transporter
   * @private
   */
  async _initializeTransporter() {
    try {
      if (!validateEmailConfig()) {
        console.warn(
          "⚠️ Email service not configured properly. Emails will be logged only."
        );
        return;
      }

      // Create transporter
      this.transporter = nodemailer.createTransport(emailConfig.smtp);

      // Verify connection
      await this.transporter.verify();
      this.isConfigured = true;

      console.log("✅ Email service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email with retry mechanism
   */
  async sendEmail(emailData) {
    try {
      // Validate email data
      this._validateEmailData(emailData);

      // Check rate limiting
      if (!this._checkRateLimit()) {
        throw new Error("Daily email limit exceeded");
      }

      // Prepare email options
      const mailOptions = {
        from: {
          name: emailData.fromName || emailConfig.defaultSender.name,
          address: emailData.fromEmail || emailConfig.defaultSender.email,
        },
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this._stripHtml(emailData.html),
        ...(emailData.cc && { cc: emailData.cc }),
        ...(emailData.bcc && { bcc: emailData.bcc }),
        ...(emailData.replyTo && { replyTo: emailData.replyTo }),
        ...(emailData.attachments && { attachments: emailData.attachments }),
      };

      // Send email with retry mechanism
      const result = await this._sendWithRetry(mailOptions);

      // Log successful send
      this._logEmailSent(emailData, result);

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };
    } catch (error) {
      console.error("❌ Failed to send email:", error);

      // Log failed send
      this._logEmailFailed(emailData, error);

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send email with retry mechanism
   * @private
   */
  async _sendWithRetry(mailOptions, attempt = 1) {
    try {
      if (!this.isConfigured) {
        // If not configured, log email instead of sending
        return await this._handleDevelopmentMode(mailOptions);
      }

      const result = await this.transporter.sendMail(mailOptions);
      this.sentToday++;

      return result;
    } catch (error) {
      if (attempt < emailConfig.rateLimiting.maxRetries) {
        console.warn(`⚠️ Email send attempt ${attempt} failed, retrying...`);

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, emailConfig.rateLimiting.retryDelay * attempt)
        );

        return this._sendWithRetry(mailOptions, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Handle development mode (logging/preview instead of sending)
   * @private
   */
  async _handleDevelopmentMode(mailOptions) {
    const emailLog = {
      timestamp: new Date().toISOString(),
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from,
      html: mailOptions.html,
      text: mailOptions.text,
    };

    // Log to console
    if (emailConfig.development.logEmails) {
      console.log("📧 Email would be sent (Development Mode):");
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log("From:", mailOptions.from);
      console.log("---");
    }

    // Save to file if configured
    if (emailConfig.development.saveToFile) {
      await this._saveEmailToFile(emailLog);
    }

    // Return mock result
    return {
      messageId: `dev-${Date.now()}@${emailConfig.defaultSender.email}`,
      response: "Development mode - email logged",
    };
  }

  /**
   * Save email to file for development
   * @private
   */
  async _saveEmailToFile(emailLog) {
    try {
      const emailDir = path.join(process.cwd(), "logs", "emails");
      await fs.mkdir(emailDir, { recursive: true });

      const filename = `email-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;
      const filepath = path.join(emailDir, filename);

      await fs.writeFile(filepath, JSON.stringify(emailLog, null, 2));
      console.log(`📁 Email saved to: ${filepath}`);
    } catch (error) {
      console.error("Failed to save email to file:", error);
    }
  }

  /**
   * Validate email data
   * @private
   */
  _validateEmailData(emailData) {
    const required = ["to", "subject"];
    const missing = required.filter((field) => !emailData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required email fields: ${missing.join(", ")}`);
    }

    if (!emailData.html && !emailData.text) {
      throw new Error("Email must have either HTML or text content");
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(emailData.to)
      ? emailData.to
      : [emailData.to];

    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  }

  /**
   * Check rate limiting
   * @private
   */
  _checkRateLimit() {
    const today = new Date().toDateString();

    // Reset counter if it's a new day
    if (this.lastResetDate !== today) {
      this.sentToday = 0;
      this.lastResetDate = today;
    }

    return this.sentToday < emailConfig.rateLimiting.dailyLimit;
  }

  /**
   * Strip HTML tags for text version
   * @private
   */
  _stripHtml(html) {
    if (!html) return "";

    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Log successful email send
   * @private
   */
  _logEmailSent(emailData, result) {
    console.log(`✅ Email sent successfully to ${emailData.to}`);
    console.log(`   Subject: ${emailData.subject}`);
    console.log(`   Message ID: ${result.messageId}`);
  }

  /**
   * Log failed email send
   * @private
   */
  _logEmailFailed(emailData, error) {
    console.error(`❌ Failed to send email to ${emailData.to}`);
    console.error(`   Subject: ${emailData.subject}`);
    console.error(`   Error: ${error.message}`);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      sentToday: this.sentToday,
      dailyLimit: emailConfig.rateLimiting.dailyLimit,
      remainingToday: emailConfig.rateLimiting.dailyLimit - this.sentToday,
      lastResetDate: this.lastResetDate,
    };
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        throw new Error("Email service not configured");
      }

      await this.transporter.verify();
      return { success: true, message: "Email service is working correctly" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Create singleton instance
export const emailService = new EmailService();
