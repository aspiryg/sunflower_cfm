/*
🔍 Potential Root Causes:
Email Security Scanning: Office 365 has advanced security features that scan email links automatically
Race Condition: Multiple requests hitting the verification endpoint
Email Client Pre-fetching: Some email clients automatically fetch links for security/preview purposes
Azure Application Insights: If enabled, might be making health check requests
*/

// 🛠️ Step 1: Enhanced Logging for Production Debugging
// First, let's add comprehensive logging to track what's happening:

// Add this enhanced logging to your existing verifyEmail function

export async function verifyEmail(req, res) {
  const requestId = `verify-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    const { token } = req.params;

    // Enhanced logging for debugging
    console.log("🔍 EMAIL VERIFICATION DEBUG:", {
      requestId,
      timestamp: new Date().toISOString(),
      token: token ? `${token.substring(0, 10)}...` : "missing",
      userAgent: req.get("User-Agent"),
      referer: req.get("Referer"),
      origin: req.get("Origin"),
      ip: req.ip,
      forwarded: req.get("X-Forwarded-For"),
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        accept: req.get("Accept"),
        "accept-language": req.get("Accept-Language"),
        "cache-control": req.get("Cache-Control"),
        "sec-fetch-dest": req.get("Sec-Fetch-Dest"),
        "sec-fetch-mode": req.get("Sec-Fetch-Mode"),
        "sec-fetch-site": req.get("Sec-Fetch-Site"),
      },
    });

    if (!token) {
      console.log("❌ VERIFICATION FAILED - Missing token:", { requestId });
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
        error: "MISSING_TOKEN",
      });
    }

    console.log("🔄 VERIFICATION ATTEMPT:", {
      requestId,
      tokenPrefix: token.substring(0, 10),
    });

    // Check if this is likely an automated request
    const userAgent = req.get("User-Agent") || "";
    const isLikelyBot =
      /bot|crawl|spider|scanner|preview|fetch|monitor|check/i.test(userAgent);
    const isOffice365Scanner = /microsoft|office|outlook|exchange/i.test(
      userAgent
    );

    console.log("🤖 REQUEST ANALYSIS:", {
      requestId,
      userAgent,
      isLikelyBot,
      isOffice365Scanner,
      hasReferer: !!req.get("Referer"),
      hasOrigin: !!req.get("Origin"),
    });

    // If this looks like an automated scan, log but don't process
    if (isLikelyBot || isOffice365Scanner) {
      console.log("⚠️ POTENTIAL AUTOMATED SCAN DETECTED:", {
        requestId,
        userAgent,
        action: "proceeding_with_caution",
      });
    }

    const user = await User.verifyEmailAsync(token);

    if (!user) {
      console.log("❌ VERIFICATION FAILED - Invalid token:", { requestId });
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
        error: "INVALID_TOKEN",
      });
    }

    console.log("✅ EMAIL VERIFIED SUCCESSFULLY:", {
      requestId,
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    // Send welcome email (don't fail verification if email fails)
    try {
      console.log("📧 SENDING WELCOME EMAIL:", {
        requestId,
        userEmail: user.email,
      });
      await EmailController.sendWelcomeEmail(user);
      console.log("✅ WELCOME EMAIL SENT:", {
        requestId,
        userEmail: user.email,
      });
    } catch (emailError) {
      console.error("❌ WELCOME EMAIL FAILED:", {
        requestId,
        userEmail: user.email,
        error: emailError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to the platform.",
      user: returnUserWithoutPassword(user),
    });
  } catch (error) {
    console.error("❌ EMAIL VERIFICATION ERROR:", {
      requestId,
      error: error.message,
      stack: error.stack,
    });

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

/*🛠️ Step 2: Enhanced User Model Verification
Update your User model to include better logging:*/

// Add enhanced logging to your verifyEmailAsync method (add the user model)

async function verifyEmailAsync(token) {
  const pool = database.getPool();

  try {
    if (!token) {
      throw new Error("Verification token is required");
    }

    console.log("🔍 VERIFY EMAIL ASYNC - Starting:", {
      tokenPrefix: token.substring(0, 10),
      timestamp: new Date().toISOString(),
    });

    const query = this._buildSelectQuery({
      where:
        "u.emailVerificationToken = @token AND u.emailVerificationExpires > @now AND u.isActive = 1 AND u.isDeleted = 0",
      includePassword: false,
    });

    const result = await pool
      .request()
      .input("token", sql.NVarChar, token)
      .input("now", sql.DateTime, new Date())
      .query(query);

    console.log("🔍 TOKEN LOOKUP RESULT:", {
      tokenPrefix: token.substring(0, 10),
      recordsFound: result.recordset.length,
      timestamp: new Date().toISOString(),
    });

    if (result.recordset.length === 0) {
      console.log("❌ NO MATCHING TOKEN FOUND:", {
        tokenPrefix: token.substring(0, 10),
        timestamp: new Date().toISOString(),
      });
      throw new Error("Invalid or expired verification token");
    }

    const user = this._transformUserResult(result.recordset[0]);

    console.log("📋 USER FOUND FOR VERIFICATION:", {
      userId: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      tokenPrefix: token.substring(0, 10),
      timestamp: new Date().toISOString(),
    });

    // Check if already verified
    if (user.isEmailVerified) {
      console.log("⚠️ EMAIL ALREADY VERIFIED:", {
        userId: user.id,
        email: user.email,
        verifiedAt: user.emailVerifiedAt,
        timestamp: new Date().toISOString(),
      });
      // Return the user anyway for now, but log this suspicious activity
      return await this.findUserByIdAsync(user.id);
    }

    // Update user as verified
    console.log("🔄 UPDATING USER AS VERIFIED:", {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    await this.updateUserAsync(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      emailVerifiedAt: new Date(),
    });

    console.log("✅ USER EMAIL VERIFIED SUCCESSFULLY:", {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return await this.findUserByIdAsync(user.id);
  } catch (error) {
    console.error("❌ VERIFY EMAIL ASYNC ERROR:", {
      tokenPrefix: token ? token.substring(0, 10) : "missing",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
// 🛠️ Step 3: Enhanced Registration Logging
// Update your registration function to track the email verification token generation:

// Update your register function with enhanced logging

export async function register(req, res) {
  const registrationId = `reg-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

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

    console.log("🔄 USER REGISTRATION STARTING:", {
      registrationId,
      email: email?.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

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

    console.log("📋 USER DATA PREPARED:", {
      registrationId,
      email: userData.email,
      isEmailVerified: userData.isEmailVerified,
      timestamp: new Date().toISOString(),
    });

    // Create new user using the updated model
    const newUser = await User.createUserAsync(userData);
    if (!newUser) {
      console.log("❌ USER CREATION FAILED:", { registrationId });
      return res.status(400).json({
        success: false,
        message: "User registration failed",
        error: "REGISTRATION_FAILED",
      });
    }

    console.log("✅ USER CREATED SUCCESSFULLY:", {
      registrationId,
      userId: newUser.id,
      email: newUser.email,
      isEmailVerified: newUser.isEmailVerified,
      hasVerificationToken: !!newUser.emailVerificationToken,
      verificationTokenPrefix: newUser.emailVerificationToken?.substring(0, 10),
      timestamp: new Date().toISOString(),
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(newUser);

    // Set tokens in cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Send verification email (don't fail registration if email fails)
    try {
      if (newUser.emailVerificationToken) {
        console.log("📧 SENDING VERIFICATION EMAIL:", {
          registrationId,
          userId: newUser.id,
          email: newUser.email,
          tokenPrefix: newUser.emailVerificationToken.substring(0, 10),
          timestamp: new Date().toISOString(),
        });

        await EmailController.sendEmailVerification(
          newUser,
          newUser.emailVerificationToken
        );

        console.log("✅ VERIFICATION EMAIL SENT:", {
          registrationId,
          userId: newUser.id,
          email: newUser.email,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log("⚠️ NO VERIFICATION TOKEN FOUND:", {
          registrationId,
          userId: newUser.id,
          email: newUser.email,
        });
      }
    } catch (emailError) {
      console.error("❌ VERIFICATION EMAIL FAILED:", {
        registrationId,
        userId: newUser.id,
        email: newUser.email,
        error: emailError.message,
        timestamp: new Date().toISOString(),
      });
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
    console.error("❌ REGISTRATION ERROR:", {
      registrationId,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

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

// 🛠️ Step 4: Add Request Tracking Middleware
// Add this middleware to track all verification requests:
export const trackVerificationRequests = (req, res, next) => {
  // Only track verification-related endpoints
  if (req.path.includes("verify-email") || req.path.includes("verification")) {
    const requestId = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("🔍 VERIFICATION REQUEST TRACKER:", {
      requestId,
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      userAgent: req.get("User-Agent"),
      referer: req.get("Referer"),
      origin: req.get("Origin"),
      ip: req.ip,
      forwarded: req.get("X-Forwarded-For"),
      timestamp: new Date().toISOString(),
      headers: {
        accept: req.get("Accept"),
        "sec-fetch-dest": req.get("Sec-Fetch-Dest"),
        "sec-fetch-mode": req.get("Sec-Fetch-Mode"),
        "sec-fetch-site": req.get("Sec-Fetch-Site"),
      },
    });

    // Add request ID to request object for tracing
    req.requestId = requestId;
  }

  next();
};

// Then add it to your auth routes:
// import { trackVerificationRequests } from "../middlewares/requestTracker.js";

// // Add this middleware before your verification routes
// router.use(trackVerificationRequests);

// 🛠️ Step 5: Office 365 Scanner Detection
// Add specific protection against Office 365 email scanning:
export const protectFromEmailScanners = (req, res, next) => {
  const userAgent = req.get("User-Agent") || "";
  const referer = req.get("Referer") || "";

  // Common Office 365 scanner patterns
  const office365Patterns = [
    /microsoft/i,
    /office/i,
    /outlook/i,
    /exchange/i,
    /safelinks/i,
    /protection\.outlook\.com/i,
    /owa/i,
  ];

  // Bot/scanner patterns
  const botPatterns = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /scanner/i,
    /preview/i,
    /fetch/i,
    /monitor/i,
    /check/i,
    /verify/i,
    /validate/i,
  ];

  const isOffice365Scanner = office365Patterns.some((pattern) =>
    pattern.test(userAgent)
  );
  const isBot = botPatterns.some((pattern) => pattern.test(userAgent));

  // Check for automated request characteristics
  const hasNoReferer = !referer;
  const hasNoOrigin = !req.get("Origin");
  const isHeadRequest = req.method === "HEAD";
  const hasSecFetchDest = req.get("Sec-Fetch-Dest");

  if (isOffice365Scanner || (isBot && hasNoReferer && hasNoOrigin)) {
    console.log("🚫 BLOCKING SUSPECTED EMAIL SCANNER:", {
      userAgent,
      referer,
      isOffice365Scanner,
      isBot,
      hasNoReferer,
      hasNoOrigin,
      isHeadRequest,
      hasSecFetchDest,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    // Return a neutral response that doesn't trigger verification
    return res.status(200).json({
      success: true,
      message: "Link processed",
      action: "scanner_detected",
    });
  }

  next();
};

// Add this to your verification route:
// import { protectFromEmailScanners } from "../middlewares/scannerProtection.js";

// // Update your verification route
// router.get("/verify-email/:token", protectFromEmailScanners, verifyEmail);
// 🔧 Step 6: Azure Application Insights (if you're using it)
// If you're using Azure Application Insights, add this to ignore health checks:
// Add this before your routes if using Application Insights

// Ignore health check and verification requests from Application Insights
// app.use((req, res, next) => {
//   const userAgent = req.get("User-Agent") || "";

//   if (
//     userAgent.includes("ApplicationInsights") ||
//     userAgent.includes("AlwaysOn") ||
//     userAgent.includes("Azure-Health-Check")
//   ) {
//     console.log("🔍 Azure health check detected, skipping:", {
//       userAgent,
//       path: req.path,
//       timestamp: new Date().toISOString(),
//     });

//     return res.status(200).json({ status: "ok" });
//   }

//   next();
// });

// 📊 Step 7: Monitor the Logs
// After deploying these changes, monitor your Azure logs for:

// Multiple verification requests for the same token
// Automated requests from Office 365 scanners
// The order of operations (registration → email send → verification)
// Request patterns that indicate email scanning
// 🎯 Quick Test
// To test immediately, try registering with both email types and watch the console logs to see:

// When the verification token is generated
// When the verification email is sent
// When the verification endpoint is called
// What user agent is making the verification request
// The enhanced logging will help you identify exactly what's causing the automatic verification. Most likely, it's Office 365's Safe Links feature automatically scanning the verification URL.

// Let me know what you see in the logs after implementing these changes!
