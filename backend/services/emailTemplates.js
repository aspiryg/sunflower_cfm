/**
 * Email template builder with responsive HTML templates
 */
export class EmailTemplates {
  /* ============ Updated Templates ============ */

  /**
   * Enhanced base template with Sunflower Organization branding
   * @private
   */
  static _getBaseTemplate(content, title, config) {
    return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title} - ${config.companyName}</title>
    <style>
        /* Reset and Base Styles */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #2d3748;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            margin: 0;
            padding: 20px 10px;
            min-height: 100vh;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        
        /* Header with Sunflower Branding */
        .email-header {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
            color: #1a202c;
            padding: 30px 40px;
            text-align: center;
            position: relative;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23ffffff" opacity="0.1"/><circle cx="80" cy="30" r="1.5" fill="%23ffffff" opacity="0.1"/><circle cx="40" cy="70" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="90" cy="80" r="2.5" fill="%23ffffff" opacity="0.1"/><circle cx="10" cy="90" r="1.5" fill="%23ffffff" opacity="0.1"/></svg>') repeat;
            pointer-events: none;
        }
        
        .brand-container {
            position: relative;
            z-index: 1;
        }
        
        .sunflower-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 15px;
            background: #1a202c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #fbbf24;
            font-weight: bold;
        }
        
        .brand-name {
            font-size: 26px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #1a202c;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .brand-tagline {
            font-size: 14px;
            color: #744210;
            font-weight: 500;
            opacity: 0.9;
            margin: 0;
        }
        
        /* Content Area */
        .email-content {
            padding: 40px;
            background: #ffffff;
        }
        
        .email-content h2 {
            color: #2d3748;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
            line-height: 1.3;
        }
        
        .email-content p {
            margin: 0 0 16px 0;
            color: #4a5568;
            font-size: 16px;
        }
        
        .email-content ul {
            margin: 16px 0;
            padding-left: 20px;
        }
        
        .email-content li {
            margin: 8px 0;
            color: #4a5568;
        }
        
        /* Action Buttons */
        .btn {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #1a202c;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            border: 2px solid transparent;
        }
        
        .btn:hover {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(245, 158, 11, 0.4);
            color: #1a202c;
            text-decoration: none;
        }
        
        .btn-secondary {
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
            color: #2d3748;
            box-shadow: 0 4px 12px rgba(203, 213, 224, 0.3);
        }
        
        .btn-secondary:hover {
            background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
            color: #2d3748;
        }
        
        /* Alert Boxes */
        .alert {
            padding: 18px 20px;
            margin: 24px 0;
            border-radius: 8px;
            border-left: 4px solid;
            font-size: 15px;
            line-height: 1.6;
        }
        
        .alert-info {
            background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 20%);
            border-left-color: #3182ce;
            color: #2c5282;
        }
        
        .alert-warning {
            background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 20%);
            border-left-color: #d69e2e;
            color: #744210;
        }
        
        .alert-success {
            background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%);
            border-left-color: #38a169;
            color: #22543d;
        }
        
        .alert-urgent {
            background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 20%);
            border-left-color: #e53e3e;
            color: #742a2a;
            font-weight: 600;
        }
        
        /* Details Boxes */
        .details-box {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .details-box h4 {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
        }
        
        .details-box h4::before {
            content: '📋';
            margin-right: 8px;
        }
        
        .details-box p {
            margin: 8px 0;
            font-size: 15px;
        }
        
        .details-box strong {
            color: #2d3748;
            font-weight: 600;
        }
        
        /* Priority and Status Indicators */
        .priority-urgent { color: #e53e3e; font-weight: 700; }
        .priority-high { color: #d69e2e; font-weight: 600; }
        .priority-medium { color: #3182ce; font-weight: 500; }
        .priority-low { color: #38a169; font-weight: 500; }
        
        .status-resolved { color: #38a169; font-weight: 600; }
        .status-in-progress { color: #d69e2e; font-weight: 600; }
        .status-pending { color: #718096; font-weight: 500; }
        
        /* Footer */
        .email-footer {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-content {
            font-size: 14px;
            color: #718096;
            line-height: 1.6;
        }
        
        .footer-content p {
            margin: 8px 0;
        }
        
        .footer-content a {
            color: #3182ce;
            text-decoration: none;
            font-weight: 500;
        }
        
        .footer-content a:hover {
            color: #2c5282;
            text-decoration: underline;
        }
        
        .organization-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 13px;
            color: #a0aec0;
        }
        
        /* Responsive Design */
        @media (max-width: 600px) {
            body { padding: 10px 5px; }
            .email-header { padding: 25px 20px; }
            .email-content { padding: 25px 20px; }
            .email-footer { padding: 25px 20px; }
            .btn { display: block; text-align: center; margin: 20px 0; }
            .brand-name { font-size: 22px; }
        }
        
        /* Dark mode considerations */
        @media (prefers-color-scheme: dark) {
            /* Keep light theme for emails for consistency */
        }
        
        /* Print styles */
        @media print {
            .email-wrapper { box-shadow: none; border: 1px solid #000; }
            .btn { background: #f7fafc !important; color: #000 !important; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div class="brand-container">
                <div class="sunflower-icon">🌻</div>
                <h1 class="brand-name">${config.companyName}</h1>
                <p class="brand-tagline">Building Stronger Communities Together</p>
            </div>
        </div>
        
        <div class="email-content">
            ${content}
        </div>
        
        <div class="email-footer">
            <div class="footer-content">
                <p><strong>Thank you for being part of our community.</strong></p>
                <p>If you need assistance, contact us at <a href="mailto:${
                  config.supportEmail
                }">${config.supportEmail}</a></p>
                <p><small>This is an automated message from our feedback management system.</small></p>
                
                <div class="organization-info">
                    <p>© ${new Date().getFullYear()} ${
      config.companyName
    } • West Bank, Palestine</p>
                    <p><em>Empowering communities through responsive feedback and transparent communication</em></p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Enhanced email verification template with community focus
   */
  static emailVerification(user, verificationToken, config) {
    const verificationUrl = `${config.baseUrl}/verify-email/${verificationToken}`;

    const content = `
      <h2>Welcome to Our Community! 🌻</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>Thank you for joining the Sunflower Organization team. As a member of our staff, you play a vital role in listening to our community's voices and ensuring every feedback reaches those who can make a difference.</p>
      
      <p>To complete your account setup and start accessing our feedback management system, please verify your email address:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" class="btn">Verify My Email Address</a>
      </div>
      
      <div class="alert alert-info">
        <strong>Security Notice:</strong> This verification link will expire in 24 hours to protect your account.
      </div>
      
      <div class="details-box">
        <h4>What You Can Do Next</h4>
        <p>Once verified, you'll be able to:</p>
        <ul>
          <li><strong>Receive and review</strong> community feedback and complaints</li>
          <li><strong>Track progress</strong> on cases assigned to you</li>
          <li><strong>Collaborate</strong> with team members on resolutions</li>
          <li><strong>Generate reports</strong> to improve our services</li>
        </ul>
      </div>
      
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #3182ce; font-family: monospace; background: #f7fafc; padding: 10px; border-radius: 4px; font-size: 14px;">${verificationUrl}</p>
      
      <div class="alert alert-warning">
        <strong>Important:</strong> If you didn't create this account, please contact our system administrator immediately.
      </div>
      
      <p>We're grateful to have you as part of our mission to serve the community effectively.</p>
      
      <p><strong>The Sunflower Team</strong><br>
      <em>Together, we grow stronger</em></p>
    `;

    return this._getBaseTemplate(content, "Verify Your Email Address", config);
  }

  /**
   * Enhanced password reset template
   */
  static passwordReset(user, resetToken, config) {
    const resetUrl = `${config.baseUrl}/reset-password/${resetToken}`;

    const content = `
      <h2>Password Reset Request 🔐</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>We received a request to reset the password for your Sunflower Organization account. As a team member handling sensitive community feedback, maintaining account security is crucial.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="btn">Reset My Password</a>
      </div>
      
      <div class="alert alert-warning">
        <strong>Security Alert:</strong> This reset link will expire in 1 hour for your protection.
      </div>
      
      <div class="details-box">
        <h4>Security Guidelines</h4>
        <p>When creating your new password, please ensure it:</p>
        <ul>
          <li>Contains at least 8 characters</li>
          <li>Includes uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
          <li>Includes a special character</li>
          <li>Is unique to this account</li>
        </ul>
      </div>
      
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #3182ce; font-family: monospace; background: #f7fafc; padding: 10px; border-radius: 4px; font-size: 14px;">${resetUrl}</p>
      
      <div class="alert alert-info">
        <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged, but consider reviewing your account security.
      </div>
      
      <p>Protecting our system ensures we can continue serving our community effectively.</p>
      
      <p><strong>The Sunflower Security Team</strong><br>
      <em>Keeping our community safe</em></p>
    `;

    return this._getBaseTemplate(content, "Reset Your Password", config);
  }

  /**
   * Enhanced password changed confirmation template
   */
  static passwordChanged(user, config) {
    const content = `
      <h2>Password Successfully Updated ✅</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>Your password has been successfully changed for your Sunflower Organization account.</p>
      
      <div class="alert alert-success">
        <strong>Confirmed:</strong> Your password was updated on ${new Date().toLocaleString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jerusalem",
          }
        )} (Palestine Time).
      </div>
      
      <div class="details-box">
        <h4>Account Information</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Last Login:</strong> ${
          user.lastLogin
            ? new Date(user.lastLogin).toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jerusalem",
              }) + " (Palestine Time)"
            : "This is your first login"
        }</p>
      </div>
      
      <div class="alert alert-warning">
        <strong>Didn't make this change?</strong> If you didn't change your password, please contact our support team immediately at <a href="mailto:${
          config.supportEmail
        }">${config.supportEmail}</a> or reach out to your system administrator.
      </div>
      
      <div class="alert alert-info">
        <strong>Security Notice:</strong> For your protection, you've been logged out of all devices. Please log in again with your new password to continue accessing the feedback management system.
      </div>
      
      <p>Remember to keep your password secure and never share it with others. This helps us protect the confidential feedback and complaints we handle for our community.</p>
      
      <p><strong>The Sunflower Security Team</strong><br>
      <em>Safeguarding our community's trust</em></p>
    `;

    return this._getBaseTemplate(
      content,
      "Password Changed Successfully",
      config
    );
  }

  /**
   * Enhanced welcome email template
   */
  static welcome(user, config) {
    const dashboardUrl = `${config.baseUrl}/dashboard`;

    const content = `
      <h2>Welcome to the Sunflower Team! 🌻✨</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>Welcome to Sunflower Organization! Your account has been successfully verified, and you're now part of our dedicated team working to strengthen communities across the West Bank through responsive feedback management.</p>
      
      <div class="alert alert-success">
        <strong>Your account is ready!</strong> You can now access all features of our community feedback platform.
      </div>
      
      <div class="details-box">
        <h4>Your Account Profile</h4>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${this._formatRole(user.role)}</p>
        ${
          user.organization
            ? `<p><strong>Department:</strong> ${user.organization}</p>`
            : ""
        }
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" class="btn">Access My Dashboard</a>
      </div>
      
      <div class="details-box">
        <h4>Your Journey Starts Here</h4>
        <p>As a team member, you can now:</p>
        <ul>
          <li><strong>Complete your profile</strong> with your contact information and preferences</li>
          <li><strong>Review pending feedback</strong> from community members and beneficiaries</li>
          <li><strong>Process complaints</strong> with our structured workflow system</li>
          <li><strong>Collaborate with colleagues</strong> on complex cases requiring multiple perspectives</li>
          <li><strong>Generate insights</strong> from feedback data to improve our programs</li>
          <li><strong>Track impact</strong> of resolutions and community satisfaction</li>
        </ul>
      </div>
      
      <div class="alert alert-info">
        <strong>Need Guidance?</strong> Our team is here to help you get started. Contact us at <a href="mailto:${
          config.supportEmail
        }">${
      config.supportEmail
    }</a> or check with your supervisor for training materials and best practices.
      </div>
      
      <p>Every piece of feedback we receive is a voice from our community, and your work ensures that voice is heard, valued, and acted upon. Thank you for joining our mission.</p>
      
      <p><strong>The Sunflower Leadership Team</strong><br>
      <em>Together, we bloom where we're planted</em></p>
    `;

    return this._getBaseTemplate(
      content,
      `Welcome to ${config.companyName}`,
      config
    );
  }

  // Helper method to format user roles
  static _formatRole(role) {
    const roleMap = {
      staff: "Staff Member",
      manager: "Team Manager",
      admin: "System Administrator",
      super_admin: "Super Administrator",
    };
    return roleMap[role] || role;
  }

  // ...existing code above...

  /**
   * Enhanced case assignment notification template
   */
  static caseAssigned(user, caseData, assignedBy, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}`;
    const urgencyLevel =
      caseData.urgencyLevel ||
      caseData.priority?.name?.toLowerCase() ||
      "medium";
    const isUrgent = urgencyLevel === "urgent" || urgencyLevel === "critical";
    const isHigh = urgencyLevel === "high";

    const content = `
      <h2>New Case Assignment 📋</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>A community feedback case has been assigned to you. This represents a voice from our community that needs your attention and care.</p>
      
      ${
        isUrgent
          ? `
        <div class="alert alert-urgent">
          <strong>🚨 Urgent Case Alert</strong><br>
          This case requires immediate attention and should be prioritized in your workflow.
        </div>
      `
          : isHigh
          ? `
        <div class="alert alert-warning">
          <strong>⚡ High Priority Case</strong><br>
          This case requires prompt attention and timely resolution.
        </div>
      `
          : ""
      }
      
      <div class="details-box">
        <h4>Case Assignment Details</h4>
        <p><strong>Case Number:</strong> <span style="font-family: var(--font-mono); color: #3182ce;">${
          caseData.caseNumber || caseData.number
        }</span></p>
        <p><strong>Case Title:</strong> ${caseData.title}</p>
        <p><strong>Category:</strong> ${
          caseData.category?.name || "General Feedback"
        }</p>
        <p><strong>Priority Level:</strong> <span class="priority-${urgencyLevel}">${this._formatPriority(
      urgencyLevel
    )}</span></p>
        <p><strong>Current Status:</strong> <span class="status-${(
          caseData.status?.name || "pending"
        )
          .toLowerCase()
          .replace(" ", "-")}">${
      caseData.status?.name || "Pending Review"
    }</span></p>
        <p><strong>Submission Channel:</strong> ${
          caseData.channel?.name || "Direct Submission"
        }</p>
      </div>
      
      <div class="details-box">
        <h4>Assignment Information</h4>
        <p><strong>Assigned By:</strong> ${assignedBy.firstName} ${
      assignedBy.lastName
    }</p>
        <p><strong>Assignment Date:</strong> ${new Date().toLocaleString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jerusalem",
          }
        )} (Palestine Time)</p>
        ${
          caseData.dueDate
            ? `<p><strong>Expected Resolution:</strong> ${new Date(
                caseData.dueDate
              ).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Asia/Jerusalem",
              })} (Palestine Time)</p>`
            : ""
        }
        ${
          caseData.assignmentComments
            ? `<p><strong>Assignment Notes:</strong> <em>"${caseData.assignmentComments}"</em></p>`
            : ""
        }
      </div>
      
      ${
        caseData.description
          ? `
        <div class="details-box" style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-left: 4px solid #38a169;">
          <h4>Community Feedback Summary</h4>
          <p style="font-style: italic; line-height: 1.6;">"${
            caseData.description.length > 200
              ? caseData.description.substring(0, 200) + "..."
              : caseData.description
          }"</p>
          ${
            caseData.description.length > 200
              ? "<p><em>View the complete feedback in the system.</em></p>"
              : ""
          }
        </div>
      `
          : ""
      }
      
      ${
        caseData.location || caseData.community
          ? `
        <div class="details-box">
          <h4>Location Information</h4>
          ${
            caseData.community?.name
              ? `<p><strong>Community:</strong> ${caseData.community.name}</p>`
              : ""
          }
          ${
            caseData.location
              ? `<p><strong>Specific Location:</strong> ${caseData.location}</p>`
              : ""
          }
          ${
            caseData.affectedBeneficiaries
              ? `<p><strong>Affected Beneficiaries:</strong> ${caseData.affectedBeneficiaries} people</p>`
              : ""
          }
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${caseUrl}" class="btn">Review & Handle Case</a>
        <br><br>
        <a href="${config.baseUrl}/cases?assignedTo=${
      user.id
    }" class="btn btn-secondary">View All My Cases</a>
      </div>
      
      <div class="alert alert-info">
        <strong>Your Role in Our Mission</strong><br>
        Every case you handle represents trust from our community. Your thoughtful response helps strengthen the relationship between Sunflower Organization and those we serve.
      </div>
      
      ${
        isUrgent
          ? `
        <div class="details-box" style="background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 20%); border-left: 4px solid #e53e3e;">
          <h4>Urgent Case Guidelines</h4>
          <p>Please take immediate action on this case:</p>
          <ul>
            <li>Acknowledge receipt within 2 hours</li>
            <li>Begin preliminary assessment immediately</li>
            <li>Escalate if resolution requires additional resources</li>
            <li>Provide initial response to community member within 24 hours</li>
          </ul>
        </div>
      `
          : `
        <div class="details-box">
          <h4>Next Steps</h4>
          <p>Please complete the following actions:</p>
          <ul>
            <li><strong>Review</strong> the complete case details and any attachments</li>
            <li><strong>Acknowledge</strong> the assignment within your expected timeframe</li>
            <li><strong>Investigate</strong> the feedback thoroughly and document findings</li>
            <li><strong>Coordinate</strong> with relevant teams if cross-departmental input is needed</li>
            <li><strong>Respond</strong> to the community member with updates and resolution</li>
          </ul>
        </div>
      `
      }
      
      <p>Remember: This feedback represents someone's experience with our programs. Your careful attention ensures we continue building trust and improving our impact in the community.</p>
      
      <p><strong>The Sunflower Team</strong><br>
      <em>Together, we listen and grow</em></p>
    `;

    return this._getBaseTemplate(
      content,
      "New Case Assignment - Community Feedback",
      config
    );
  }

  /**
   * Enhanced case status change notification template
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
    const isResolved =
      newStatus.toLowerCase().includes("resolved") ||
      newStatus.toLowerCase().includes("closed");
    const isInProgress =
      newStatus.toLowerCase().includes("progress") ||
      newStatus.toLowerCase().includes("active");
    const isEscalated = newStatus.toLowerCase().includes("escalated");

    const content = `
      <h2>Case Status Update ${
        isResolved ? "✅" : isInProgress ? "⚡" : isEscalated ? "🚨" : "📝"
      }</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>The status of case "<strong>${
        caseData.title
      }</strong>" has been updated. This helps us track our progress in serving the community effectively.</p>
      
      <div class="details-box">
        <h4>Status Change Summary</h4>
        <p><strong>Case Number:</strong> <span style="font-family: var(--font-mono); color: #3182ce;">${
          caseData.caseNumber || caseData.number
        }</span></p>
        <p><strong>Case Title:</strong> ${caseData.title}</p>
        <p><strong>Previous Status:</strong> <span style="color: #718096;">${oldStatus}</span></p>
        <p><strong>New Status:</strong> <span class="status-${newStatus
          .toLowerCase()
          .replace(" ", "-")}" style="font-weight: 600;">${newStatus}</span></p>
        <p><strong>Updated By:</strong> ${changedBy.firstName} ${
      changedBy.lastName
    }</p>
        <p><strong>Update Time:</strong> ${new Date().toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jerusalem",
        })} (Palestine Time)</p>
      </div>
      
      ${
        isResolved
          ? `
        <div class="alert alert-success">
          <strong>🎉 Case Successfully Resolved!</strong><br>
          Thank you for your dedication in addressing this community feedback. Your work directly contributes to improving our programs and services.
        </div>
        
        <div class="details-box" style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-left: 4px solid #38a169;">
          <h4>Resolution Impact</h4>
          <p>This resolved case represents:</p>
          <ul>
            <li><strong>Community trust</strong> in our responsiveness</li>
            <li><strong>Continuous improvement</strong> of our services</li>
            <li><strong>Stakeholder confidence</strong> in our mission</li>
            <li><strong>Positive change</strong> for beneficiaries</li>
          </ul>
        </div>
      `
          : isInProgress
          ? `
        <div class="alert alert-info">
          <strong>⚡ Case In Progress</strong><br>
          Work is actively being done on this case. Continue monitoring progress and provide support as needed.
        </div>
      `
          : isEscalated
          ? `
        <div class="alert alert-warning">
          <strong>🚨 Case Escalated</strong><br>
          This case requires additional attention or resources. Please prioritize accordingly and collaborate with the escalation team.
        </div>
      `
          : `
        <div class="alert alert-info">
          <strong>📝 Status Updated</strong><br>
          The case status has been changed to reflect current handling progress.
        </div>
      `
      }
      
      ${
        caseData.category
          ? `
        <div class="details-box">
          <h4>Case Context</h4>
          <p><strong>Category:</strong> ${caseData.category.name}</p>
          <p><strong>Priority:</strong> <span class="priority-${(
            caseData.urgencyLevel || "medium"
          ).toLowerCase()}">${this._formatPriority(
              caseData.urgencyLevel || "medium"
            )}</span></p>
          ${
            caseData.community
              ? `<p><strong>Community:</strong> ${caseData.community.name}</p>`
              : ""
          }
          ${
            caseData.affectedBeneficiaries
              ? `<p><strong>People Affected:</strong> ${caseData.affectedBeneficiaries}</p>`
              : ""
          }
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${caseUrl}" class="btn">View Updated Case</a>
        <br><br>
        <a href="${config.baseUrl}/cases?status=${encodeURIComponent(
      newStatus
    )}" class="btn btn-secondary">View All ${newStatus} Cases</a>
      </div>
      
      ${
        isResolved
          ? `
        <div class="details-box">
          <h4>What Happens Next?</h4>
          <p>With this case resolved:</p>
          <ul>
            <li>The community member will be notified of the resolution</li>
            <li>The case will be included in our impact reports</li>
            <li>Any follow-up monitoring will be scheduled if required</li>
            <li>Lessons learned will contribute to service improvements</li>
          </ul>
        </div>
      `
          : !isResolved
          ? `
        <div class="details-box">
          <h4>Continued Action Required</h4>
          <p>This case still needs attention:</p>
          <ul>
            <li>Monitor progress regularly</li>
            <li>Update status as work continues</li>
            <li>Document all actions taken</li>
            <li>Communicate with stakeholders as needed</li>
          </ul>
        </div>
      `
          : ""
      }
      
      <p>Every status update brings us closer to delivering meaningful results for our community. Thank you for your continued commitment to excellence.</p>
      
      <p><strong>The Sunflower Team</strong><br>
      <em>Progress through partnership</em></p>
    `;

    return this._getBaseTemplate(
      content,
      `Case Status Update - ${newStatus}`,
      config
    );
  }

  /**
   * Enhanced case escalation notification template
   */
  static caseEscalated(user, caseData, escalatedBy, escalationReason, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}`;
    const escalationLevel = caseData.escalationLevel || 1;

    const content = `
      <h2>Case Escalation Alert 🚨</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>A community feedback case has been escalated to Level ${escalationLevel} and requires your immediate management attention. This escalation ensures we maintain our commitment to responsive community service.</p>
      
      <div class="alert alert-urgent">
        <strong>🚨 Escalation Level ${escalationLevel}</strong><br>
        This case requires priority attention from management to ensure proper resolution and community satisfaction.
      </div>
      
      <div class="details-box">
        <h4>Escalation Details</h4>
        <p><strong>Case Number:</strong> <span style="font-family: var(--font-mono); color: #3182ce;">${
          caseData.caseNumber || caseData.number
        }</span></p>
        <p><strong>Case Title:</strong> ${caseData.title}</p>
        <p><strong>Escalation Level:</strong> <span style="color: #e53e3e; font-weight: 700;">Level ${escalationLevel}</span></p>
        <p><strong>Escalated By:</strong> ${escalatedBy.firstName} ${
      escalatedBy.lastName
    } (${escalatedBy.role})</p>
        <p><strong>Escalation Time:</strong> ${new Date().toLocaleString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jerusalem",
          }
        )} (Palestine Time)</p>
        <p><strong>Current Priority:</strong> <span class="priority-${(
          caseData.urgencyLevel || "high"
        ).toLowerCase()}">${this._formatPriority(
      caseData.urgencyLevel || "high"
    )}</span></p>
      </div>
      
      <div class="details-box" style="background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 20%); border-left: 4px solid #e53e3e;">
        <h4>Escalation Reason</h4>
        <p style="font-style: italic; font-size: 16px; line-height: 1.6;">"${escalationReason}"</p>
      </div>
      
      <div class="details-box">
        <h4>Case Context</h4>
        <p><strong>Category:</strong> ${
          caseData.category?.name || "General Feedback"
        }</p>
        <p><strong>Current Status:</strong> ${
          caseData.status?.name || "Under Review"
        }</p>
        <p><strong>Original Assignee:</strong> ${
          caseData.assignedTo
            ? `${caseData.assignedTo.firstName} ${caseData.assignedTo.lastName}`
            : "Unassigned"
        }</p>
        ${
          caseData.community
            ? `<p><strong>Affected Community:</strong> ${caseData.community.name}</p>`
            : ""
        }
        ${
          caseData.affectedBeneficiaries
            ? `<p><strong>People Affected:</strong> ${caseData.affectedBeneficiaries}</p>`
            : ""
        }
        ${
          caseData.dueDate
            ? `<p><strong>Original Due Date:</strong> ${new Date(
                caseData.dueDate
              ).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>`
            : ""
        }
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${caseUrl}" class="btn">Handle Escalation Immediately</a>
        <br><br>
        <a href="${
          config.baseUrl
        }/cases?escalation=true" class="btn btn-secondary">View All Escalated Cases</a>
      </div>
      
      <div class="details-box" style="background: linear-gradient(135deg, #fff3cd 0%, #fce4a3 20%); border-left: 4px solid #ffc107;">
        <h4>Immediate Action Required</h4>
        <p>As the escalation recipient, please:</p>
        <ul>
          <li><strong>Review the case immediately</strong> - within 1 hour of this notification</li>
          <li><strong>Assess resource needs</strong> - determine if additional support is required</li>
          <li><strong>Reassign if necessary</strong> - ensure the right team member handles this</li>
          <li><strong>Set new timeline</strong> - establish realistic resolution expectations</li>
          <li><strong>Communicate status</strong> - update all stakeholders including community member</li>
          <li><strong>Document decisions</strong> - record all escalation actions taken</li>
        </ul>
      </div>
      
      <div class="alert alert-warning">
        <strong>Community Impact Consideration</strong><br>
        Escalated cases often represent critical moments in our relationship with community members. Swift, thoughtful resolution demonstrates our genuine commitment to serving those who depend on our programs.
      </div>
      
      <div class="details-box">
        <h4>Escalation Resources</h4>
        <p>You have access to:</p>
        <ul>
          <li><strong>Cross-departmental consultation</strong> for complex issues</li>
          <li><strong>External referral options</strong> when appropriate</li>
          <li><strong>Leadership decision-making</strong> for policy matters</li>
          <li><strong>Community liaison support</strong> for sensitive communications</li>
        </ul>
      </div>
      
      <p>This escalation reflects our organizational commitment to never let community voices go unheard. Your prompt attention ensures we maintain the trust that makes our work possible.</p>
      
      <p><strong>The Sunflower Leadership Team</strong><br>
      <em>Excellence through accountability</em></p>
    `;

    return this._getBaseTemplate(
      content,
      `Case Escalation Alert - Level ${escalationLevel}`,
      config
    );
  }

  /**
   * Enhanced case comment notification template
   */
  static caseCommentAdded(user, caseData, comment, commentBy, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}#comment-${comment.id}`;
    const isFollowUpRequired = comment.requiresFollowUp;
    const isInternalNote = comment.commentType === "internal";
    const isPublicUpdate = comment.commentType === "public";

    const content = `
      <h2>New Case ${
        isInternalNote
          ? "Internal Note"
          : isPublicUpdate
          ? "Public Update"
          : "Comment"
      } 💬</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>A new ${
        comment.commentType || "case"
      } comment has been added to "<strong>${caseData.title}</strong>". This ${
      isInternalNote
        ? "internal note helps coordinate our team response"
        : "update contributes to our case documentation"
    }.</p>
      
      ${
        isFollowUpRequired
          ? `
        <div class="alert alert-warning">
          <strong>📋 Follow-up Required</strong><br>
          This comment requires your follow-up action. Please review and respond appropriately.
        </div>
      `
          : ""
      }
      
      <div class="details-box">
        <h4>Comment Details</h4>
        <p><strong>Case Number:</strong> <span style="font-family: var(--font-mono); color: #3182ce;">${
          caseData.caseNumber || caseData.number
        }</span></p>
        <p><strong>Case Title:</strong> ${caseData.title}</p>
        <p><strong>Comment Type:</strong> ${this._formatCommentType(
          comment.commentType || "general"
        )}</p>
        <p><strong>Added By:</strong> ${commentBy.firstName} ${
      commentBy.lastName
    } (${commentBy.role})</p>
        <p><strong>Posted On:</strong> ${new Date(
          comment.createdAt || new Date()
        ).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jerusalem",
        })} (Palestine Time)</p>
        ${
          isFollowUpRequired
            ? `<p><strong>Follow-up Required:</strong> <span style="color: #d69e2e; font-weight: 600;">Yes</span></p>`
            : ""
        }
        ${
          comment.followUpDate
            ? `<p><strong>Follow-up Due:</strong> ${new Date(
                comment.followUpDate
              ).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>`
            : ""
        }
      </div>

      <div class="details-box" style="background: ${
        isInternalNote
          ? "linear-gradient(135deg, #ebf8ff 0%, #bee3f8 20%); border-left: 4px solid #3182ce;"
          : isPublicUpdate
          ? "linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-left: 4px solid #38a169;"
          : "linear-gradient(135deg, #f7fafc 0%, #edf2f7 20%); border-left: 4px solid #718096;"
      }">
        <h4>${
          isInternalNote
            ? "Internal Team Note"
            : isPublicUpdate
            ? "Public Update"
            : "Comment"
        }</h4>
        <p style="font-style: italic; font-size: 16px; line-height: 1.7; margin: 0;">
          "${comment.comment || comment.content}"
        </p>
      </div>
      
      <div class="details-box">
        <h4>Case Context</h4>
        <p><strong>Current Status:</strong> <span class="status-${(
          caseData.status?.name || "pending"
        )
          .toLowerCase()
          .replace(" ", "-")}">${caseData.status?.name || "Pending"}</span></p>
        <p><strong>Priority:</strong> <span class="priority-${(
          caseData.urgencyLevel || "medium"
        ).toLowerCase()}">${this._formatPriority(
      caseData.urgencyLevel || "medium"
    )}</span></p>
        <p><strong>Assigned To:</strong> ${
          caseData.assignedTo
            ? `${caseData.assignedTo.firstName} ${caseData.assignedTo.lastName}`
            : "Unassigned"
        }</p>
        ${
          caseData.category
            ? `<p><strong>Category:</strong> ${caseData.category.name}</p>`
            : ""
        }
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${caseUrl}" class="btn">View Comment & Respond</a>
        <br><br>
        <a href="${config.baseUrl}/cases/${
      caseData.id
    }/comments" class="btn btn-secondary">View All Case Comments</a>
      </div>
      
      ${
        isFollowUpRequired
          ? `
        <div class="details-box" style="background: linear-gradient(135deg, #fff3cd 0%, #fce4a3 20%); border-left: 4px solid #ffc107;">
          <h4>Follow-up Action Required</h4>
          <p>This comment requires your attention and response:</p>
          <ul>
            <li><strong>Review the comment</strong> thoroughly and understand the request</li>
            <li><strong>Take appropriate action</strong> based on the comment content</li>
            <li><strong>Document your response</strong> in the case management system</li>
            <li><strong>Update stakeholders</strong> if necessary</li>
            ${
              comment.followUpDate
                ? `<li><strong>Complete by:</strong> ${new Date(
                    comment.followUpDate
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</li>`
                : ""
            }
          </ul>
        </div>
      `
          : ""
      }
      
      ${
        isInternalNote
          ? `
        <div class="alert alert-info">
          <strong>Internal Communication</strong><br>
          This note is for team coordination and will not be visible to community members. Use it to share insights, coordinate actions, or document internal discussions.
        </div>
      `
          : isPublicUpdate
          ? `
        <div class="alert alert-success">
          <strong>Public Update</strong><br>
          This update may be shared with community members as part of our transparency and communication efforts.
        </div>
      `
          : ""
      }
      
      <p>Effective communication within our team ensures we provide the best possible response to community feedback. Thank you for staying engaged with this case.</p>
      
      <p><strong>The Sunflower Team</strong><br>
      <em>Collaboration strengthens our response</em></p>
    `;

    return this._getBaseTemplate(
      content,
      `New Case ${
        isInternalNote
          ? "Internal Note"
          : isPublicUpdate
          ? "Public Update"
          : "Comment"
      }`,
      config
    );
  }

  // Helper methods for formatting
  static _formatPriority(priority) {
    const priorityMap = {
      low: "Low Priority",
      medium: "Medium Priority",
      high: "High Priority",
      urgent: "Urgent",
      critical: "Critical",
    };
    return (
      priorityMap[priority?.toLowerCase()] || priority || "Medium Priority"
    );
  }

  static _formatCommentType(type) {
    const typeMap = {
      internal: "Internal Team Note",
      public: "Public Update",
      follow_up: "Follow-up Note",
      resolution: "Resolution Note",
      general: "General Comment",
    };
    return typeMap[type?.toLowerCase()] || type || "General Comment";
  }

  // ...existing code above...

  /**
   * Enhanced case resolution notification template
   */
  static caseResolved(user, caseData, resolvedBy, resolutionSummary, config) {
    const caseUrl = `${config.baseUrl}/cases/${caseData.id}`;
    const isPositiveResolution =
      caseData.resolutionCategory?.toLowerCase() === "resolved" ||
      caseData.resolutionSatisfaction >= 4; // Assuming 1-5 scale

    const content = `
      <h2>Case Successfully Resolved ✅</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>We're pleased to inform you that case "<strong>${
        caseData.title
      }</strong>" has been successfully resolved. This outcome represents our commitment to addressing every voice from our community.</p>
      
      ${
        isPositiveResolution
          ? `
        <div class="alert alert-success">
          <strong>🎉 Positive Resolution Achieved!</strong><br>
          This successful resolution demonstrates our ability to respond effectively to community needs and improve our services.
        </div>
      `
          : `
        <div class="alert alert-info">
          <strong>✅ Case Resolved</strong><br>
          The case has been processed and closed according to our established procedures.
        </div>
      `
      }
      
      <div class="details-box">
        <h4>Resolution Summary</h4>
        <p><strong>Case Number:</strong> <span style="font-family: var(--font-mono); color: #3182ce;">${
          caseData.caseNumber || caseData.number
        }</span></p>
        <p><strong>Case Title:</strong> ${caseData.title}</p>
        <p><strong>Resolved By:</strong> ${resolvedBy.firstName} ${
      resolvedBy.lastName
    }</p>
        <p><strong>Resolution Date:</strong> ${new Date(
          caseData.resolvedDate
        ).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jerusalem",
        })} (Palestine Time)</p>
        <p><strong>Resolution Category:</strong> ${this._formatResolutionCategory(
          caseData.resolutionCategory || "resolved"
        )}</p>
        ${
          caseData.resolutionSatisfaction
            ? `<p><strong>Satisfaction Level:</strong> ${this._formatSatisfactionLevel(
                caseData.resolutionSatisfaction
              )}</p>`
            : ""
        }
      </div>
      
      ${
        resolutionSummary
          ? `
        <div class="details-box" style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-left: 4px solid #38a169;">
          <h4>Resolution Details</h4>
          <p style="font-style: italic; font-size: 16px; line-height: 1.7;">"${resolutionSummary}"</p>
        </div>
      `
          : ""
      }
      
      <div class="details-box">
        <h4>Case Journey Timeline</h4>
        <p><strong>Submitted:</strong> ${new Date(
          caseData.submittedAt || caseData.createdAt
        ).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}</p>
        ${
          caseData.assignedAt
            ? `<p><strong>Assigned:</strong> ${new Date(
                caseData.assignedAt
              ).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}</p>`
            : ""
        }
        ${
          caseData.firstResponseDate
            ? `<p><strong>First Response:</strong> ${new Date(
                caseData.firstResponseDate
              ).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}</p>`
            : ""
        }
        <p><strong>Resolved:</strong> ${new Date(
          caseData.resolvedDate
        ).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}</p>
        <p><strong>Total Duration:</strong> ${this._calculateCaseDuration(
          caseData.submittedAt || caseData.createdAt,
          caseData.resolvedDate
        )}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${caseUrl}" class="btn">View Complete Case Details</a>
        <br><br>
        <a href="${
          config.baseUrl
        }/cases?status=resolved" class="btn btn-secondary">View All Resolved Cases</a>
      </div>
      
      <div class="details-box" style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-left: 4px solid #38a169;">
        <h4>Impact of This Resolution</h4>
        <p>Every resolved case contributes to:</p>
        <ul>
          <li><strong>Community Trust:</strong> Demonstrating our responsiveness to feedback</li>
          <li><strong>Service Improvement:</strong> Learning from experiences to enhance our programs</li>
          <li><strong>Stakeholder Confidence:</strong> Showing accountability and transparency</li>
          <li><strong>Beneficiary Satisfaction:</strong> Addressing concerns and building relationships</li>
          ${
            caseData.affectedBeneficiaries
              ? `<li><strong>Direct Impact:</strong> Positive outcomes for ${caseData.affectedBeneficiaries} community members</li>`
              : ""
          }
        </ul>
      </div>
      
      ${
        caseData.monitoringRequired
          ? `
        <div class="alert alert-info">
          <strong>📊 Follow-up Monitoring Scheduled</strong><br>
          This case has been marked for follow-up monitoring to ensure sustained positive outcomes and continued satisfaction.
        </div>
      `
          : ""
      }
      
      <p>Thank you for your role in ensuring this case received the attention and care it deserved. Your work directly contributes to strengthening our relationship with the communities we serve.</p>
      
      <p><strong>The Sunflower Team</strong><br>
      <em>Growing stronger through responsive service</em></p>
    `;

    return this._getBaseTemplate(content, "Case Successfully Resolved", config);
  }

  /**
   * Enhanced weekly summary report template
   */
  static weeklySummaryReport(user, summaryData, weekInfo, config) {
    const dashboardUrl = `${config.baseUrl}/dashboard`;
    const reportsUrl = `${config.baseUrl}/reports`;

    // Calculate trends and insights
    const totalCases = summaryData.totalCases || 0;
    const resolvedCases = summaryData.resolvedCases || 0;
    const newCases = summaryData.newCases || 0;
    const resolutionRate =
      totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
    const avgResolutionTime = summaryData.avgResolutionTime || 0;

    // Determine performance status
    const isHighPerformance = resolutionRate >= 80 && avgResolutionTime <= 7;
    const isGoodPerformance = resolutionRate >= 60 && avgResolutionTime <= 14;

    const content = `
      <h2>Weekly Community Impact Report 📊</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>Here's your weekly summary of our community feedback and response activities from <strong>${
        weekInfo.startDate
      }</strong> to <strong>${
      weekInfo.endDate
    }</strong>. This report highlights our collective impact in serving our communities.</p>
      
      ${
        isHighPerformance
          ? `
        <div class="alert alert-success">
          <strong>🌟 Excellent Performance This Week!</strong><br>
          Our team achieved outstanding results with high resolution rates and quick response times.
        </div>
      `
          : isGoodPerformance
          ? `
        <div class="alert alert-info">
          <strong>👍 Good Performance This Week</strong><br>
          Our team maintained solid performance in addressing community feedback.
        </div>
      `
          : `
        <div class="alert alert-warning">
          <strong>📈 Opportunity for Improvement</strong><br>
          This week's metrics suggest areas where we can enhance our response to community needs.
        </div>
      `
      }
      
      <div class="details-box">
        <h4>Weekly Performance Overview</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0;">
          <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 20%); border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #2c5282;">${newCases}</div>
            <div style="font-size: 14px; color: #2c5282;">New Cases</div>
          </div>
          <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #22543d;">${resolvedCases}</div>
            <div style="font-size: 14px; color: #22543d;">Resolved Cases</div>
          </div>
          <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 20%); border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #744210;">${resolutionRate}%</div>
            <div style="font-size: 14px; color: #744210;">Resolution Rate</div>
          </div>
          <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 20%); border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #553c9a;">${avgResolutionTime}d</div>
            <div style="font-size: 14px; color: #553c9a;">Avg Resolution</div>
          </div>
        </div>
      </div>
      
      ${
        summaryData.categoryBreakdown
          ? `
        <div class="details-box">
          <h4>Cases by Category</h4>
          <p>Understanding the types of feedback helps us identify service improvement opportunities:</p>
          ${Object.entries(summaryData.categoryBreakdown)
            .map(
              ([category, count]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="font-weight: 500;">${category}</span>
              <span style="background: #edf2f7; padding: 4px 12px; border-radius: 12px; font-weight: 600;">${count}</span>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      ${
        summaryData.priorityDistribution
          ? `
        <div class="details-box">
          <h4>Priority Distribution</h4>
          <p>Priority levels help us allocate resources effectively:</p>
          ${Object.entries(summaryData.priorityDistribution)
            .map(
              ([priority, count]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
              <span class="priority-${priority.toLowerCase()}">${this._formatPriority(
                priority
              )}</span>
              <span style="font-weight: 600;">${count} cases</span>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      ${
        summaryData.topPerformers && summaryData.topPerformers.length > 0
          ? `
        <div class="details-box" style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-left: 4px solid #38a169;">
          <h4>Recognition Corner 🌟</h4>
          <p>Celebrating team members who made exceptional contributions this week:</p>
          ${summaryData.topPerformers
            .slice(0, 3)
            .map(
              (performer, index) => `
            <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
              <span style="width: 24px; height: 24px; background: ${
                index === 0 ? "#fbbf24" : index === 1 ? "#94a3b8" : "#cd7c2f"
              }; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${
                index + 1
              }</span>
              <span style="font-weight: 600;">${performer.name}</span>
              <span style="color: #4a5568;">- ${
                performer.casesResolved
              } cases resolved</span>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      ${
        summaryData.communityFeedback
          ? `
        <div class="details-box">
          <h4>Community Feedback Highlights</h4>
          <p><strong>Average Satisfaction:</strong> ${
            summaryData.communityFeedback.avgSatisfaction
          }/5 ⭐</p>
          <p><strong>Response Time Satisfaction:</strong> ${
            summaryData.communityFeedback.responseTimeSatisfaction
          }%</p>
          <p><strong>Resolution Quality:</strong> ${
            summaryData.communityFeedback.resolutionQuality
          }%</p>
          ${
            summaryData.communityFeedback.testimonial
              ? `
            <div style="margin-top: 12px; padding: 12px; background: #f7fafc; border-left: 4px solid #3182ce; border-radius: 4px;">
              <p style="font-style: italic; margin: 0;">"${summaryData.communityFeedback.testimonial}"</p>
              <p style="font-size: 12px; color: #718096; margin: 4px 0 0 0;">- Community Member Feedback</p>
            </div>
          `
              : ""
          }
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" class="btn">View Live Dashboard</a>
        <br><br>
        <a href="${reportsUrl}" class="btn btn-secondary">Generate Detailed Reports</a>
      </div>
      
      ${
        summaryData.upcomingDeadlines &&
        summaryData.upcomingDeadlines.length > 0
          ? `
        <div class="alert alert-warning">
          <strong>⏰ Upcoming Deadlines</strong><br>
          ${summaryData.upcomingDeadlines.length} cases have deadlines approaching this week. Please review your assigned cases to ensure timely resolution.
        </div>
      `
          : ""
      }
      
      <div class="details-box">
        <h4>Week Ahead Focus Areas</h4>
        <p>Priorities for the coming week:</p>
        <ul>
          <li><strong>Pending Cases:</strong> ${
            summaryData.pendingCases || 0
          } cases need attention</li>
          <li><strong>Follow-up Required:</strong> ${
            summaryData.followUpCases || 0
          } cases require follow-up actions</li>
          <li><strong>Quality Reviews:</strong> ${
            summaryData.qualityReviewNeeded || 0
          } resolutions pending quality review</li>
          ${
            summaryData.escalatedCases > 0
              ? `<li><strong>Escalated Cases:</strong> ${summaryData.escalatedCases} cases require management attention</li>`
              : ""
          }
        </ul>
      </div>
      
      <p>Every case we handle represents trust from our community. Your dedicated work ensures that every voice is heard, every concern is addressed, and every feedback contributes to our continuous improvement.</p>
      
      <p><strong>The Sunflower Leadership Team</strong><br>
      <em>Together, we create positive change</em></p>
    `;

    return this._getBaseTemplate(
      content,
      `Weekly Report - ${weekInfo.startDate} to ${weekInfo.endDate}`,
      config
    );
  }

  /**
   * Enhanced system notification template
   */
  static systemNotification(user, notification, config) {
    const dashboardUrl = `${config.baseUrl}/dashboard`;
    const isUrgent =
      notification.priority === "urgent" ||
      notification.priority === "critical";
    const isMaintenanceNotice = notification.type?.includes("maintenance");
    const isSecurityAlert = notification.type?.includes("security");

    const content = `
      <h2>System Notification ${
        isUrgent
          ? "🚨"
          : isMaintenanceNotice
          ? "🔧"
          : isSecurityAlert
          ? "🔒"
          : "📢"
      }</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>This is an important system notification regarding the Sunflower Organization feedback management platform.</p>
      
      ${
        isUrgent
          ? `
        <div class="alert alert-urgent">
          <strong>🚨 Urgent System Alert</strong><br>
          This notification requires immediate attention to ensure continued service to our community.
        </div>
      `
          : isMaintenanceNotice
          ? `
        <div class="alert alert-warning">
          <strong>🔧 Scheduled Maintenance Notice</strong><br>
          Planned system maintenance to improve our service quality and reliability.
        </div>
      `
          : isSecurityAlert
          ? `
        <div class="alert alert-warning">
          <strong>🔒 Security Information</strong><br>
          Important security-related information to protect our community data.
        </div>
      `
          : `
        <div class="alert alert-info">
          <strong>📢 System Information</strong><br>
          Important updates about our feedback management system.
        </div>
      `
      }
      
      <div class="details-box">
        <h4>Notification Details</h4>
        <p><strong>Type:</strong> ${this._formatNotificationType(
          notification.type
        )}</p>
        <p><strong>Priority:</strong> <span class="priority-${(
          notification.priority || "medium"
        ).toLowerCase()}">${this._formatPriority(
      notification.priority || "medium"
    )}</span></p>
        <p><strong>Issued:</strong> ${new Date(
          notification.createdAt || new Date()
        ).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jerusalem",
        })} (Palestine Time)</p>
        ${
          notification.effectiveDate
            ? `<p><strong>Effective Date:</strong> ${new Date(
                notification.effectiveDate
              ).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jerusalem",
              })} (Palestine Time)</p>`
            : ""
        }
      </div>
      
      <div class="details-box" style="background: ${
        isUrgent
          ? "linear-gradient(135deg, #fed7d7 0%, #feb2b2 20%); border-left: 4px solid #e53e3e;"
          : isMaintenanceNotice
          ? "linear-gradient(135deg, #fffbeb 0%, #fed7aa 20%); border-left: 4px solid #d69e2e;"
          : "linear-gradient(135deg, #ebf8ff 0%, #bee3f8 20%); border-left: 4px solid #3182ce;"
      }">
        <h4>${notification.title || "System Notification"}</h4>
        <p style="font-size: 16px; line-height: 1.7; margin: 0;">
          ${
            notification.message ||
            notification.description ||
            "Please check the system for more details."
          }
        </p>
      </div>
      
      ${
        notification.actionRequired
          ? `
        <div class="details-box" style="background: linear-gradient(135deg, #fff3cd 0%, #fce4a3 20%); border-left: 4px solid #ffc107;">
          <h4>Action Required</h4>
          <p>${notification.actionRequired}</p>
          ${
            notification.deadline
              ? `<p><strong>Deadline:</strong> ${new Date(
                  notification.deadline
                ).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jerusalem",
                })} (Palestine Time)</p>`
              : ""
          }
        </div>
      `
          : ""
      }
      
      ${
        notification.impact
          ? `
        <div class="details-box">
          <h4>Expected Impact</h4>
          <p>${notification.impact}</p>
        </div>
      `
          : ""
      }
      
      ${
        notification.workaround
          ? `
        <div class="details-box" style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 20%); border-left: 4px solid #38a169;">
          <h4>Workaround Available</h4>
          <p>${notification.workaround}</p>
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 30px 0;">
        ${
          notification.actionUrl
            ? `
          <a href="${notification.actionUrl}" class="btn">${
                notification.actionText || "Take Action"
              }</a>
          <br><br>
        `
            : ""
        }
        <a href="${dashboardUrl}" class="btn btn-secondary">Go to Dashboard</a>
      </div>
      
      ${
        isMaintenanceNotice
          ? `
        <div class="details-box">
          <h4>During Maintenance</h4>
          <p>To ensure continuity of service to our community:</p>
          <ul>
            <li>Document any urgent cases manually if needed</li>
            <li>Prepare to resume normal operations promptly after maintenance</li>
            <li>Contact your supervisor for any critical issues</li>
            <li>Monitor this email for updates and completion notices</li>
          </ul>
        </div>
      `
          : isSecurityAlert
          ? `
        <div class="details-box">
          <h4>Security Best Practices Reminder</h4>
          <p>To protect our community's data:</p>
          <ul>
            <li>Never share your login credentials with anyone</li>
            <li>Log out completely when using shared computers</li>
            <li>Report any suspicious activity immediately</li>
            <li>Keep your password secure and update it regularly</li>
          </ul>
        </div>
      `
          : ""
      }
      
      <p>Thank you for your attention to this notification. Your vigilance helps us maintain the highest standards of service for our community.</p>
      
      <p><strong>The Sunflower System Administration Team</strong><br>
      <em>Ensuring reliable service for our community</em></p>
    `;

    return this._getBaseTemplate(
      content,
      notification.title || "System Notification",
      config
    );
  }

  /**
   * Enhanced generic case notification template
   */
  static caseNotification(user, notification, config) {
    const caseUrl =
      notification.actionUrl ||
      `${config.baseUrl}/cases/${notification.entityId}`;
    const isUrgent =
      notification.priority === "urgent" ||
      notification.priority === "critical";

    const content = `
      <h2>Case Notification ${isUrgent ? "🚨" : "📋"}</h2>
      
      <p>Hello <strong>${user.firstName || user.username}</strong>,</p>
      
      <p>You have a new notification regarding case activities in our community feedback management system.</p>
      
      ${
        isUrgent
          ? `
        <div class="alert alert-urgent">
          <strong>🚨 Urgent Case Alert</strong><br>
          This notification requires your immediate attention to ensure responsive community service.
        </div>
      `
          : `
        <div class="alert alert-info">
          <strong>📋 Case Update</strong><br>
          New activity on a case that requires your attention or awareness.
        </div>
      `
      }
      
      <div class="details-box">
        <h4>Notification Details</h4>
        <p><strong>Type:</strong> ${this._formatNotificationType(
          notification.type
        )}</p>
        <p><strong>Priority:</strong> <span class="priority-${(
          notification.priority || "medium"
        ).toLowerCase()}">${this._formatPriority(
      notification.priority || "medium"
    )}</span></p>
        <p><strong>Time:</strong> ${new Date(
          notification.createdAt || new Date()
        ).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jerusalem",
        })} (Palestine Time)</p>
        ${
          notification.case?.caseNumber
            ? `<p><strong>Case Number:</strong> <span style="font-family: var(--font-mono); color: #3182ce;">${notification.case.caseNumber}</span></p>`
            : ""
        }
        ${
          notification.case?.title
            ? `<p><strong>Case Title:</strong> ${notification.case.title}</p>`
            : ""
        }
      </div>
      
      <div class="details-box" style="background: linear-gradient(135deg, ${
        isUrgent
          ? "#fed7d7 0%, #feb2b2 20%); border-left: 4px solid #e53e3e;"
          : "#f7fafc 0%, #edf2f7 20%); border-left: 4px solid #718096;"
      }">
        <h4>${notification.title}</h4>
        <p style="font-size: 16px; line-height: 1.7; margin: 0;">
          ${notification.message}
        </p>
      </div>
      
      ${
        notification.metadata
          ? `
        <div class="details-box">
          <h4>Additional Information</h4>
          ${Object.entries(notification.metadata)
            .map(([key, value]) =>
              value
                ? `<p><strong>${this._formatMetadataKey(
                    key
                  )}:</strong> ${value}</p>`
                : ""
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${caseUrl}" class="btn">${
      notification.actionText || "View Case"
    }</a>
        <br><br>
        <a href="${
          config.baseUrl
        }/cases" class="btn btn-secondary">View All Cases</a>
      </div>
      
      <p>Your prompt attention to case notifications helps ensure we provide timely, effective responses to our community's feedback and concerns.</p>
      
      <p><strong>The Sunflower Team</strong><br>
      <em>Responsive to every community voice</em></p>
    `;

    return this._getBaseTemplate(content, notification.title, config);
  }

  // Additional helper methods for the new templates
  static _formatResolutionCategory(category) {
    const categoryMap = {
      resolved: "Successfully Resolved",
      closed_no_action: "Closed - No Action Required",
      referred: "Referred to External Agency",
      duplicate: "Duplicate Case",
      withdrawn: "Withdrawn by Provider",
    };
    return categoryMap[category?.toLowerCase()] || category || "Resolved";
  }

  static _formatSatisfactionLevel(level) {
    const stars = "⭐".repeat(Math.max(0, Math.min(5, parseInt(level) || 0)));
    const labels = {
      1: "Very Dissatisfied",
      2: "Dissatisfied",
      3: "Neutral",
      4: "Satisfied",
      5: "Very Satisfied",
    };
    return `${stars} ${labels[level] || level}`;
  }

  static _calculateCaseDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      return `${weeks} week${weeks > 1 ? "s" : ""}${
        remainingDays > 0
          ? ` ${remainingDays} day${remainingDays > 1 ? "s" : ""}`
          : ""
      }`;
    }

    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    return `${months} month${months > 1 ? "s" : ""}${
      remainingDays > 0
        ? ` ${remainingDays} day${remainingDays > 1 ? "s" : ""}`
        : ""
    }`;
  }

  static _formatNotificationType(type) {
    const typeMap = {
      case_assigned: "Case Assignment",
      case_status_changed: "Status Change",
      case_escalation: "Case Escalation",
      case_resolved: "Case Resolution",
      comment_added: "New Comment",
      assignment_transferred: "Assignment Transfer",
      system_maintenance: "System Maintenance",
      security_alert: "Security Alert",
      performance_report: "Performance Report",
      deadline_reminder: "Deadline Reminder",
    };
    return typeMap[type?.toLowerCase()] || type || "General Notification";
  }

  static _formatMetadataKey(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  // ... rest of existing methods continue...
}
