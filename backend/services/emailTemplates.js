/**
 * Email template builder with responsive HTML templates
 */
export class EmailTemplates {
  /**
   * Base template wrapper for all emails
   * @private
   */
  static _getBaseTemplate(content, title, config) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .email-content {
            padding: 40px 30px;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .alert {
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .alert-info {
            background-color: #e7f3ff;
            border-left-color: #0066cc;
            color: #004085;
        }
        .alert-warning {
            background-color: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .alert-success {
            background-color: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        .details-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .logo {
            max-height: 50px;
            margin-bottom: 20px;
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .email-content { padding: 20px; }
            .email-header { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            ${
              config.logoUrl
                ? `<img src="${config.logoUrl}" alt="${config.companyName}" class="logo">`
                : ""
            }
            <h1>${config.companyName}</h1>
        </div>
        <div class="email-content">
            ${content}
        </div>
        <div class="email-footer">
            <p>© ${new Date().getFullYear()} ${
      config.companyName
    }. All rights reserved.</p>
            <p>If you have any questions, please contact us at <a href="mailto:${
              config.supportEmail
            }">${config.supportEmail}</a></p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Email verification template
   */
  static emailVerification(user, verificationToken, config) {
    // Change this to point to client-side verification page
    const verificationUrl = `${config.baseUrl}/verify-email/${verificationToken}`;

    const content = `
      <h2>Welcome to ${config.companyName}!</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>Thank you for registering with us. To complete your account setup, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="btn">Verify Email Address</a>
      </div>
      
      <div class="alert alert-info">
        <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
      </div>
      
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
      
      <p>If you didn't create an account with us, please ignore this email.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Verify Your Email Address", config);
  }

  /**
   * Password reset template
   */
  static passwordReset(user, resetToken, config) {
    // Change this to point to client-side reset password page
    const resetUrl = `${config.baseUrl}/reset-password/${resetToken}`;

    const content = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>We received a request to reset your password for your ${
        config.companyName
      } account.</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      
      <div class="alert alert-warning">
        <strong>Security Notice:</strong> This reset link will expire in 1 hour for your security.
      </div>
      
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
      
      <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
      
      <p>For security reasons, we recommend:</p>
      <ul>
        <li>Using a strong, unique password</li>
        <li>Enabling two-factor authentication if available</li>
        <li>Not sharing your login credentials</li>
      </ul>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Reset Your Password", config);
  }

  /**
   * Password changed confirmation template
   */
  static passwordChanged(user, config) {
    const content = `
      <h2>Password Changed Successfully</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>Your password has been successfully changed.</p>
      
      <div class="alert alert-success">
        <strong>Confirmed:</strong> Your password was updated on ${new Date().toLocaleString()}.
      </div>
      
      <div class="details-box">
        <h4>Account Details:</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Last Login:</strong> ${
          user.lastLogin
            ? new Date(user.lastLogin).toLocaleString()
            : "Not available"
        }</p>
      </div>
      
      <div class="alert alert-warning">
        <strong>Didn't make this change?</strong> If you didn't change your password, please contact our support team immediately at <a href="mailto:${
          config.supportEmail
        }">${config.supportEmail}</a>.
      </div>
      
      <p>For your security, you've been logged out of all devices. Please log in again with your new password.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Password Changed", config);
  }

  /**
   * Feedback submission notification template
   */
  static feedbackSubmitted(user, feedback, config) {
    const feedbackUrl = `${config.baseUrl}/feedback/${feedback.id}`;

    const content = `
      <h2>New Feedback Submitted</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>A new feedback has been submitted${
        feedback.assignedTo?.id === user.id ? " and assigned to you" : ""
      }.</p>
      
      <div class="details-box">
        <h4>Feedback Details:</h4>
        <p><strong>Feedback Number:</strong> ${feedback.feedbackNumber}</p>
        <p><strong>Title:</strong> ${feedback.title}</p>
        <p><strong>Category:</strong> ${
          feedback.category?.name || "Not specified"
        }</p>
        <p><strong>Priority:</strong> <span style="color: ${
          feedback.priority === "urgent"
            ? "#dc3545"
            : feedback.priority === "high"
            ? "#fd7e14"
            : "#28a745"
        };">${feedback.priority || "Normal"}</span></p>
        <p><strong>Status:</strong> ${feedback.status}</p>
        <p><strong>Submitted By:</strong> ${feedback.submittedBy?.firstName} ${
      feedback.submittedBy?.lastName
    } (${feedback.submittedBy?.email})</p>
        <p><strong>Submitted On:</strong> ${new Date(
          feedback.createdAt
        ).toLocaleString()}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${feedbackUrl}" class="btn">View Feedback</a>
      </div>
      
      ${
        feedback.priority === "urgent"
          ? `
        <div class="alert alert-warning">
          <strong>Urgent Priority:</strong> This feedback requires immediate attention.
        </div>
      `
          : ""
      }
      
      <p>Please review and take appropriate action as needed.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "New Feedback Submitted", config);
  }

  /**
   * Feedback status change notification template
   */
  static feedbackStatusChanged(
    user,
    feedback,
    oldStatus,
    newStatus,
    changedBy,
    config
  ) {
    const feedbackUrl = `${config.baseUrl}/feedback/${feedback.id}`;

    const content = `
      <h2>Feedback Status Updated</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>The status of feedback "${feedback.title}" has been updated.</p>
      
      <div class="details-box">
        <h4>Status Change Details:</h4>
        <p><strong>Feedback Number:</strong> ${feedback.number}</p>
        <p><strong>Title:</strong> ${feedback.title}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> <span style="color: ${
          newStatus === "resolved"
            ? "#28a745"
            : newStatus === "in_progress"
            ? "#fd7e14"
            : "#6c757d"
        };">${newStatus}</span></p>
        <p><strong>Changed By:</strong> ${changedBy.firstName} ${
      changedBy.lastName
    }</p>
        <p><strong>Changed On:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${feedbackUrl}" class="btn">View Feedback</a>
      </div>
      
      ${
        newStatus === "resolved"
          ? `
        <div class="alert alert-success">
          <strong>Great News!</strong> This feedback has been resolved. Please review the resolution.
        </div>
      `
          : ""
      }
      
      <p>You can view the complete feedback details and history using the link above.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Feedback Status Updated", config);
  }

  /**
   * Feedback assignment notification template
   */
  static feedbackAssigned(user, feedback, assignedBy, config) {
    const feedbackUrl = `${config.baseUrl}/feedback/${feedback.id}`;

    const content = `
      <h2>Feedback Assigned to You</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>A feedback has been assigned to you for review and action.</p>
      
      <div class="details-box">
        <h4>Assignment Details:</h4>
        <p><strong>Feedback Number:</strong> ${feedback.number}</p>
        <p><strong>Title:</strong> ${feedback.title}</p>
        <p><strong>Category:</strong> ${
          feedback.category?.name || "Not specified"
        }</p>
        <p><strong>Priority:</strong> <span style="color: ${
          feedback.priority === "urgent"
            ? "#dc3545"
            : feedback.priority === "high"
            ? "#fd7e14"
            : "#28a745"
        };">${feedback.priority || "Normal"}</span></p>
        <p><strong>Current Status:</strong> ${feedback.status}</p>
        <p><strong>Assigned By:</strong> ${assignedBy.firstName} ${
      assignedBy.lastName
    }</p>
        <p><strong>Assigned On:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${feedbackUrl}" class="btn">View & Take Action</a>
      </div>
      
      ${
        feedback.priority === "urgent"
          ? `
        <div class="alert alert-warning">
          <strong>Urgent Priority:</strong> This feedback requires immediate attention and action.
        </div>
      `
          : ""
      }
      
      <p>Please review the feedback details and take appropriate action as needed.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Feedback Assigned", config);
  }

  /**
   * Welcome email template
   */
  static welcome(user, config) {
    const dashboardUrl = `${config.baseUrl}/dashboard`;

    const content = `
      <h2>Welcome to ${config.companyName}!</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>Welcome to our Customer Feedback Management system! Your account has been successfully created and verified.</p>
      
      <div class="alert alert-success">
        <strong>Your account is ready!</strong> You can now access all features of our platform.
      </div>
      
      <div class="details-box">
        <h4>Your Account Details:</h4>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        ${
          user.organization
            ? `<p><strong>Organization:</strong> ${user.organization}</p>`
            : ""
        }
      </div>
      
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="btn">Access Dashboard</a>
      </div>
      
      <h3>What's Next?</h3>
      <ul>
        <li>Complete your profile information</li>
        <li>Explore the feedback management features</li>
        <li>Set up your notification preferences</li>
        <li>Join relevant feedback categories</li>
      </ul>
      
      <div class="alert alert-info">
        <strong>Need Help?</strong> Check out our documentation or contact our support team at <a href="mailto:${
          config.supportEmail
        }">${config.supportEmail}</a>.
      </div>
      
      <p>We're excited to have you on board!</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(
      content,
      `Welcome to ${config.companyName}`,
      config
    );
  }

  /**
   * Case assignment notification template
   */
  static caseAssigned(user, caseData, assignedBy, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}`;

    const content = `
      <h2>Case Assigned to You</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>A case has been assigned to you for review and action.</p>
      
      <div class="details-box">
        <h4>Case Details:</h4>
        <p><strong>Case Number:</strong> ${caseData.number}</p>
        <p><strong>Title:</strong> ${caseData.title}</p>
        <p><strong>Category:</strong> ${
          caseData.category?.name || "Not specified"
        }</p>
        <p><strong>Priority:</strong> <span style="color: ${
          caseData.urgencyLevel === "urgent" ||
          caseData.priority?.name?.toLowerCase().includes("urgent")
            ? "#dc3545"
            : caseData.urgencyLevel === "high" ||
              caseData.priority?.name?.toLowerCase().includes("high")
            ? "#fd7e14"
            : "#28a745"
        };">${
      caseData.priority?.name || caseData.urgencyLevel || "Normal"
    }</span></p>
        <p><strong>Status:</strong> ${caseData.status?.name || "Open"}</p>
        <p><strong>Assigned By:</strong> ${assignedBy.firstName} ${
      assignedBy.lastName
    }</p>
        <p><strong>Assigned On:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${caseUrl}" class="btn">View & Handle Case</a>
      </div>
      
      ${
        caseData.urgencyLevel === "urgent" ||
        caseData.priority?.name?.toLowerCase().includes("urgent")
          ? `
        <div class="alert alert-warning">
          <strong>Urgent Priority:</strong> This case requires immediate attention and action.
        </div>
      `
          : ""
      }
      
      <p>Please review the case details and take appropriate action as needed.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Case Assigned", config);
  }

  /**
   * Case status change notification template
   */
  static caseStatusChanged(
    user,
    caseData,
    oldStatus,
    newStatus,
    changedBy,
    config
  ) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}`;

    const content = `
      <h2>Case Status Updated</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>The status of case "${caseData.title}" has been updated.</p>
      
      <div class="details-box">
        <h4>Status Change Details:</h4>
        <p><strong>Case Number:</strong> ${caseData.number}</p>
        <p><strong>Title:</strong> ${caseData.title}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> <span style="color: ${
          newStatus.toLowerCase().includes("resolved") ||
          newStatus.toLowerCase().includes("closed")
            ? "#28a745"
            : newStatus.toLowerCase().includes("progress") ||
              newStatus.toLowerCase().includes("active")
            ? "#fd7e14"
            : "#6c757d"
        };">${newStatus}</span></p>
        <p><strong>Changed By:</strong> ${changedBy.firstName} ${
      changedBy.lastName
    }</p>
        <p><strong>Changed On:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${caseUrl}" class="btn">View Case Update</a>
      </div>
      
      ${
        newStatus.toLowerCase().includes("resolved") ||
        newStatus.toLowerCase().includes("closed")
          ? `
        <div class="alert alert-success">
          <strong>Great News!</strong> This case has been resolved. Please review the resolution.
        </div>
      `
          : ""
      }
      
      <p>You can view the complete case details and history using the link above.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Case Status Updated", config);
  }

  /**
   * Case escalation notification template
   */
  static caseEscalated(user, caseData, escalatedBy, escalationReason, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}`;

    const content = `
      <h2>Case Escalated</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>A case has been escalated and requires your immediate attention.</p>
      
      <div class="details-box">
        <h4>Escalation Details:</h4>
        <p><strong>Case Number:</strong> ${caseData.number}</p>
        <p><strong>Title:</strong> ${caseData.title}</p>
        <p><strong>Escalation Level:</strong> ${
          caseData.escalationLevel || "Level 1"
        }</p>
        <p><strong>Escalation Reason:</strong> ${escalationReason}</p>
        <p><strong>Escalated By:</strong> ${escalatedBy.firstName} ${
      escalatedBy.lastName
    }</p>
        <p><strong>Escalated On:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Current Priority:</strong> ${
          caseData.priority?.name || caseData.urgencyLevel || "Normal"
        }</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${caseUrl}" class="btn">Handle Escalation</a>
      </div>
      
      <div class="alert alert-warning">
        <strong>Escalated Case:</strong> This case requires priority handling due to escalation.
      </div>
      
      <p>Please review the escalation details and take immediate action as required.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Case Escalated", config);
  }

  /**
   * Case comment notification template
   */
  static caseCommentAdded(user, caseData, comment, commentBy, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}#comment-${comment.id}`;

    const content = `
      <h2>New ${comment.commentType || "Case"} Comment</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>A new ${
        comment.commentType || "case"
      } comment has been added to case "${caseData.title}".</p>
      
      <div class="details-box">
        <h4>Comment Details:</h4>
        <p><strong>Case Number:</strong> ${caseData.number}</p>
        <p><strong>Case Title:</strong> ${caseData.title}</p>
        <p><strong>Comment Type:</strong> ${
          comment.commentType || "General"
        }</p>
        <p><strong>Comment By:</strong> ${commentBy.firstName} ${
      commentBy.lastName
    }</p>
        <p><strong>Posted On:</strong> ${new Date(
          comment.createdAt || new Date()
        ).toLocaleString()}</p>
        ${
          comment.requiresFollowUp
            ? "<p><strong>Follow-up Required:</strong> Yes</p>"
            : ""
        }
      </div>

      <div class="details-box" style="background-color: #f8f9fa; border-left: 4px solid #0066cc;">
        <h4>Comment:</h4>
        <p style="font-style: italic;">"${
          comment.comment || comment.content
        }"</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${caseUrl}" class="btn">View Comment</a>
      </div>
      
      ${
        comment.requiresFollowUp
          ? `
        <div class="alert alert-info">
          <strong>Follow-up Required:</strong> This comment requires your follow-up action.
        </div>
      `
          : ""
      }
      
      <p>You can view the complete comment and respond using the link above.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(
      content,
      `New ${comment.commentType || "Case"} Comment`,
      config
    );
  }

  /**
   * Case resolved notification template
   */
  static caseResolved(user, caseData, resolvedBy, resolutionSummary, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}`;

    const content = `
      <h2>Case Resolved</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>Case "${caseData.title}" has been marked as resolved.</p>
      
      <div class="details-box">
        <h4>Resolution Details:</h4>
        <p><strong>Case Number:</strong> ${caseData.number}</p>
        <p><strong>Title:</strong> ${caseData.title}</p>
        <p><strong>Resolved By:</strong> ${resolvedBy.firstName} ${
      resolvedBy.lastName
    }</p>
        <p><strong>Resolved On:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Final Status:</strong> ${
          caseData.status?.name || "Resolved"
        }</p>
      </div>

      ${
        resolutionSummary
          ? `
      <div class="details-box" style="background-color: #d4edda; border-left: 4px solid #28a745;">
        <h4>Resolution Summary:</h4>
        <p>${resolutionSummary}</p>
      </div>
      `
          : ""
      }
      
      <div style="text-align: center;">
        <a href="${caseUrl}" class="btn">View Resolution</a>
      </div>
      
      <div class="alert alert-success">
        <strong>Case Completed:</strong> This case has been successfully resolved.
      </div>
      
      <p>You can view the complete resolution details using the link above.</p>
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, "Case Resolved", config);
  }

  /**
   * Generic case notification template
   */
  static caseNotification(user, notification, config) {
    const content = `
      <h2>${notification.title}</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>${notification.message}</p>
      
      ${
        notification.case
          ? `
      <div class="details-box">
        <h4>Case Details:</h4>
        <p><strong>Case Number:</strong> ${notification.case.number}</p>
        <p><strong>Title:</strong> ${notification.case.title}</p>
        ${
          notification.case.status
            ? `<p><strong>Status:</strong> ${notification.case.status}</p>`
            : ""
        }
        ${
          notification.case.priority
            ? `<p><strong>Priority:</strong> ${notification.case.priority}</p>`
            : ""
        }
        ${
          notification.case.urgencyLevel
            ? `<p><strong>Urgency:</strong> ${notification.case.urgencyLevel}</p>`
            : ""
        }
      </div>
      `
          : ""
      }
      
      ${
        notification.actionUrl
          ? `
      <div style="text-align: center;">
        <a href="${notification.actionUrl}" class="btn">
          ${notification.actionText || "View Details"}
        </a>
      </div>
      `
          : ""
      }
      
      ${
        notification.metadata
          ? `
      <div class="details-box" style="background-color: #e7f3ff; border-left: 4px solid #0066cc;">
        <p><strong>Additional Information:</strong></p>
        ${Object.entries(notification.metadata)
          .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
          .join("")}
      </div>
      `
          : ""
      }
      
      <p>Best regards,<br>The ${config.companyName} Team</p>
    `;

    return this._getBaseTemplate(content, notification.title, config);
  }
}
