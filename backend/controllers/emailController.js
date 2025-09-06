import { emailService } from "../services/emailService.js";
import { EmailTemplates } from "../services/emailTemplates.js";
import { emailConfig } from "../config/emailConfig.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { CaseNotification } from "../models/CaseNotification.js";
import { Case } from "../models/Case.js";

/**
 * High-level email operations controller
 */
export class EmailController {
  /**
   * Send email verification
   */
  static async sendEmailVerification(user, verificationToken) {
    try {
      const emailData = {
        to: user.email,
        subject: `Verify your email address - ${emailConfig.templates.companyName}`,
        html: EmailTemplates.emailVerification(
          user,
          verificationToken, // Pass just the token
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Email verification sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send email verification to ${user.email}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(user, resetToken) {
    try {
      const emailData = {
        to: user.email,
        subject: `Reset your password - ${emailConfig.templates.companyName}`,
        html: EmailTemplates.passwordReset(
          user,
          resetToken, // Pass just the token
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Password reset email sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send password reset to ${user.email}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send password change confirmation
   */
  static async sendPasswordChanged(user) {
    try {
      const emailData = {
        to: user.email,
        subject: `Password changed - ${emailConfig.templates.companyName}`,
        html: EmailTemplates.passwordChanged(user, emailConfig.templates),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Password change confirmation sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send password change confirmation to ${user.email}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(user) {
    try {
      const emailData = {
        to: user.email,
        subject: `Welcome to ${emailConfig.templates.companyName}!`,
        html: EmailTemplates.welcome(user, emailConfig.templates),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Welcome email sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Send feedback submission notification
   */
  static async sendFeedbackSubmittedNotification(userId, feedback) {
    try {
      const user = await User.findUserByIdAsync(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const emailData = {
        to: user.email,
        subject: `New Feedback Submitted - ${feedback.feedbackNumber}`,
        html: EmailTemplates.feedbackSubmitted(
          user,
          feedback,
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Feedback submission notification sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send feedback submission notification:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send feedback status change notification
   */
  static async sendFeedbackStatusChangeNotification(
    userId,
    feedback,
    oldStatus,
    newStatus,
    changedBy
  ) {
    try {
      const user = await User.findUserByIdAsync(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const emailData = {
        to: user.email,
        subject: `Feedback Status Updated - ${feedback.feedbackNumber}`,
        html: EmailTemplates.feedbackStatusChanged(
          user,
          feedback,
          oldStatus,
          newStatus,
          changedBy,
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(
        `✅ Feedback status change notification sent to ${user.email}`
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send feedback status change notification:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send feedback assignment notification
   */
  static async sendFeedbackAssignmentNotification(
    userId,
    feedback,
    assignedBy
  ) {
    try {
      const user = await User.findUserByIdAsync(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const emailData = {
        to: user.email,
        subject: `Feedback Assigned - ${feedback.feedbackNumber}`,
        html: EmailTemplates.feedbackAssigned(
          user,
          feedback,
          assignedBy,
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Feedback assignment notification sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send feedback assignment notification:`,
        error
      );
      throw error;
    }
  }

  // ...existing code above...

  /**
   * Send case resolution notification
   */
  static async sendCaseResolutionNotification(
    userId,
    caseData,
    resolvedBy,
    resolutionSummary
  ) {
    try {
      const user = await User.findUserByIdAsync(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const emailData = {
        to: user.email,
        subject: `Case Resolved - ${caseData.caseNumber || caseData.number}`,
        html: EmailTemplates.caseResolved(
          user,
          caseData,
          resolvedBy,
          resolutionSummary,
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Case resolution notification sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send case resolution notification:`, error);
      throw error;
    }
  }

  /**
   * Send weekly summary report
   */
  static async sendWeeklySummaryReport(userId, summaryData, weekInfo) {
    try {
      const user = await User.findUserByIdAsync(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const emailData = {
        to: user.email,
        subject: `Weekly Report - ${weekInfo.startDate} to ${weekInfo.endDate}`,
        html: EmailTemplates.weeklySummaryReport(
          user,
          summaryData,
          weekInfo,
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ Weekly summary report sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send weekly summary report:`, error);
      throw error;
    }
  }

  /**
   * Send system notification
   */
  static async sendSystemNotification(userId, notification) {
    try {
      const user = await User.findUserByIdAsync(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const emailData = {
        to: user.email,
        subject: notification.title || "System Notification",
        html: EmailTemplates.systemNotification(
          user,
          notification,
          emailConfig.templates
        ),
      };

      const result = await emailService.sendEmail(emailData);

      console.log(`✅ System notification sent to ${user.email}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send system notification:`, error);
      throw error;
    }
  }

  /**
   * Send bulk weekly reports to all eligible users
   */
  static async sendBulkWeeklyReports(summaryData, weekInfo) {
    try {
      // Get all active users who should receive weekly reports
      const users = await User.getUsersForWeeklyReports();

      const results = [];
      for (const user of users) {
        try {
          // Customize summary data based on user role/access
          const userSummaryData = await this._customizeSummaryForUser(
            user,
            summaryData
          );

          const result = await this.sendWeeklySummaryReport(
            user.id,
            userSummaryData,
            weekInfo
          );
          results.push({ userId: user.id, success: true, result });

          // Add delay between emails to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          results.push({
            userId: user.id,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(
        `✅ Weekly reports sent to ${results.filter((r) => r.success).length}/${
          users.length
        } users`
      );
      return results;
    } catch (error) {
      console.error(`❌ Failed to send bulk weekly reports:`, error);
      throw error;
    }
  }

  /**
   * Send system notification to all users
   */
  static async broadcastSystemNotification(notification) {
    try {
      const users = await User.getAllActiveUsers();

      const results = [];
      for (const user of users) {
        try {
          const result = await this.sendSystemNotification(
            user.id,
            notification
          );
          results.push({ userId: user.id, success: true, result });

          // Add delay between emails
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          results.push({
            userId: user.id,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(
        `✅ System notification broadcast to ${
          results.filter((r) => r.success).length
        }/${users.length} users`
      );
      return results;
    } catch (error) {
      console.error(`❌ Failed to broadcast system notification:`, error);
      throw error;
    }
  }

  /**
   * Customize summary data based on user permissions and role
   * @private
   */
  static async _customizeSummaryForUser(user, summaryData) {
    // Customize based on user role and permissions
    const customizedData = { ...summaryData };

    // Staff members see only their own cases
    if (user.role === "staff") {
      customizedData.personalCases = summaryData.userSpecific?.[user.id] || {};
      customizedData.topPerformers = null; // Hide performance comparisons
    }

    // Managers see team performance
    if (user.role === "manager") {
      customizedData.teamPerformance = summaryData.teamData || {};
    }

    // Admins see full system data
    if (["admin", "super_admin"].includes(user.role)) {
      customizedData.systemMetrics = summaryData.systemWide || {};
    }

    return customizedData;
  }

  /**
   * Send notification email based on notification data
   */
  static async sendNotificationEmail(notificationId) {
    try {
      const { CaseNotification } = await import(
        "../models/CaseNotification.js"
      );

      const notification = await CaseNotification.getNotificationByIdAsync(
        notificationId
      );
      if (!notification) {
        throw new Error("Notification not found");
      }

      if (notification.isEmailSent) {
        console.log(`ℹ️ Email already sent for notification ${notificationId}`);
        return;
      }

      const user = await User.findUserByIdAsync(notification.userId);
      if (!user) {
        throw new Error("User not found for notification");
      }

      let emailData;

      // Determine email content based on notification type
      switch (notification.type) {
        case "case_assigned":
          // Get assignedBy user details
          const assignedBy = notification.triggerUserId
            ? await User.findUserByIdAsync(notification.triggerUserId)
            : { firstName: "System", lastName: "Admin" };

          emailData = {
            to: user.email,
            subject: notification.title,
            html: EmailTemplates.caseAssigned(
              user,
              notification.case,
              assignedBy,
              emailConfig.templates
            ),
          };
          break;

        case "case_status_changed":
          // Extract old and new status from metadata
          const oldStatus =
            notification.metadata?.oldStatus || "Previous Status";
          const newStatus = notification.metadata?.newStatus || "New Status";
          const changedBy = notification.triggerUserId
            ? await User.findUserByIdAsync(notification.triggerUserId)
            : { firstName: "System", lastName: "Admin" };

          emailData = {
            to: user.email,
            subject: notification.title,
            html: EmailTemplates.caseStatusChanged(
              user,
              notification.case,
              oldStatus,
              newStatus,
              changedBy,
              emailConfig.templates
            ),
          };
          break;

        case "escalation":
          const escalatedBy = notification.triggerUserId
            ? await User.findUserByIdAsync(notification.triggerUserId)
            : { firstName: "System", lastName: "Admin" };
          const escalationReason =
            notification.metadata?.escalationReason ||
            "Case escalated for priority handling";

          emailData = {
            to: user.email,
            subject: notification.title,
            html: EmailTemplates.caseEscalated(
              user,
              notification.case,
              escalatedBy,
              escalationReason,
              emailConfig.templates
            ),
          };
          break;

        case "comment_added":
          const commentBy = notification.triggerUserId
            ? await User.findUserByIdAsync(notification.triggerUserId)
            : { firstName: "System", lastName: "User" };
          const comment = {
            id: notification.entityId,
            comment: notification.message,
            commentType: notification.metadata?.commentType || "General",
            requiresFollowUp: notification.metadata?.requiresFollowUp || false,
            createdAt: notification.createdAt,
          };

          emailData = {
            to: user.email,
            subject: notification.title,
            html: EmailTemplates.caseCommentAdded(
              user,
              notification.case,
              comment,
              commentBy,
              emailConfig.templates
            ),
          };
          break;

        case "case_resolved":
          const resolvedBy = notification.triggerUserId
            ? await User.findUserByIdAsync(notification.triggerUserId)
            : { firstName: "System", lastName: "Admin" };
          const resolutionSummary =
            notification.metadata?.resolutionSummary || null;

          emailData = {
            to: user.email,
            subject: notification.title,
            html: EmailTemplates.caseResolved(
              user,
              notification.case,
              resolvedBy,
              resolutionSummary,
              emailConfig.templates
            ),
          };
          break;

        // Legacy notification types (keep for backward compatibility)
        case "FEEDBACK_SUBMITTED":
          emailData = {
            to: user.email,
            subject: notification.title,
            html: EmailTemplates.feedbackSubmitted(
              user,
              notification.feedback,
              emailConfig.templates
            ),
          };
          break;

        default:
          // Generic case notification email
          emailData = {
            to: user.email,
            subject: notification.title,
            html: EmailTemplates.caseNotification(
              user,
              notification,
              emailConfig.templates
            ),
          };
      }

      const result = await emailService.sendEmail(emailData);

      // Update notification email status
      await CaseNotification.updateEmailStatusAsync(notificationId, true);

      console.log(
        `✅ Notification email sent for notification ${notificationId}`
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send notification email for ${notificationId}:`,
        error
      );

      // Update notification email status to false
      const { CaseNotification } = await import(
        "../models/CaseNotification.js"
      );
      await CaseNotification.updateEmailStatusAsync(
        notificationId,
        false,
        error.message
      );

      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  static async sendBulkNotificationEmails(notificationIds) {
    const results = [];

    for (const notificationId of notificationIds) {
      try {
        const result = await this.sendNotificationEmail(notificationId);
        results.push({ notificationId, success: true, result });

        // Add delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ notificationId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get email service status
   */
  static getEmailServiceStatus() {
    return emailService.getStatus();
  }

  /**
   * Test email service
   */
  static async testEmailService() {
    return await emailService.testConnection();
  }
}
