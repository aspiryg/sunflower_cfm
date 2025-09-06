import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { database } from "./backend/config/database.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import compression from "compression";
import morgan from "morgan";

config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Import routes
import userRoutes from "./backend/routes/userRoute.js";
import authRoutes from "./backend/routes/authRoute.js";
import myProfileRoutes from "./backend/routes/myProfileRoute.js";

// New case management routes
import caseRoutes from "./backend/routes/caseRoute.js";
// import caseManagementRoutes from "./backend/routes/caseManagementRoute.js";
import notificationRoute from "./backend/routes/notificationRoute.js";

// Reference data routes
// import categoriesRoutes from "./backend/routes/categoriesRoute.js";
// import statusRoutes from "./backend/routes/statusRoute.js";
// import priorityRoutes from "./backend/routes/priorityRoute.js";
// import channelsRoutes from "./backend/routes/channelsRoute.js";
// import providerTypesRoutes from "./backend/routes/providerTypesRoute.js";
// import geographyRoutes from "./backend/routes/geographyRoute.js";
// import programRoutes from "./backend/routes/programRoute.js";

// System routes
// import systemRoutes from "./backend/routes/systemRoute.js";
// import analyticsRoutes from "./backend/routes/analyticsRoute.js";

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:", "wss:"],
        mediaSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for Azure Storage compatibility
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Rate limiting configurations
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    error: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.AUTH_RATE_LIMIT_MAX || 50, // limit each IP to 50 auth attempts per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    error: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const caseSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.CASE_SUBMISSION_LIMIT || 1000, // limit each IP to 1000 case submissions per hour
  message: {
    success: false,
    message: "Too many case submissions, please try again later.",
    error: "CASE_SUBMISSION_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting
app.use(limiter);

// Cookie parser
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://localhost:5000",
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(
  express.json({
    limit: process.env.JSON_LIMIT || "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.URL_ENCODED_LIMIT || "10mb",
  })
);

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set("trust proxy", 1);

// Health check endpoint with comprehensive system status
app.get("/api/health", async (req, res) => {
  try {
    const startTime = Date.now();

    // Database health check
    const dbHealth = await database.healthCheck();
    const dbStats = await database.getStats();

    // System health checks
    const systemHealth = {
      server: {
        status: "healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        port: PORT,
      },
      database: {
        status: dbHealth.status,
        ...dbStats,
        responseTime: dbHealth.responseTime,
      },
      services: {
        emailService: await getEmailServiceHealth(),
        storageService: await getStorageServiceHealth(),
      },
    };

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      status: "healthy",
      message: "Sunflower CFM system is operational",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.APP_VERSION || "1.0.0",
      system: systemHealth,
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(503).json({
      success: false,
      status: "unhealthy",
      message: "System health check failed",
      timestamp: new Date().toISOString(),
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Service unavailable",
    });
  }
});

// API Documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Sunflower CFM API",
    version: "1.0.0",
    documentation: {
      authentication: "/api/auth/*",
      users: "/api/users/*",
      profile: "/api/profile/*",
      cases: "/api/cases/*",
      management: "/api/management/*",
      notifications: "/api/notifications/*",
      references: {
        categories: "/api/references/categories",
        status: "/api/references/status",
        priority: "/api/references/priority",
        channels: "/api/references/channels",
        providerTypes: "/api/references/provider-types",
        geography: "/api/references/geography",
        programs: "/api/references/programs",
      },
      system: "/api/system/*",
      analytics: "/api/analytics/*",
    },
    endpoints: {
      health: "/api/health",
      status: "/api/status",
    },
  });
});

// Authentication routes (with enhanced rate limiting)
app.use("/api/auth", authLimiter, authRoutes);

// User management routes
app.use("/api/users", userRoutes);
app.use("/api/profile", myProfileRoutes);

// Core case management routes
app.use("/api/cases", caseSubmissionLimiter, caseRoutes);
// app.use("/api/management", caseManagementRoutes); // coming soon

// Notification routes
app.use("/api/notifications", notificationRoute);

// Reference data routes (grouped under /api/references)
// app.use("/api/references/categories", categoriesRoutes);
// app.use("/api/references/status", statusRoutes);
// app.use("/api/references/priority", priorityRoutes);
// app.use("/api/references/channels", channelsRoutes);
// app.use("/api/references/provider-types", providerTypesRoutes);
// app.use("/api/references/geography", geographyRoutes);
// app.use("/api/references/programs", programRoutes);

// System administration routes
// app.use("/api/system", systemRoutes);

// Analytics and reporting routes
// app.use("/api/analytics", analyticsRoutes);

// Legacy route support (backward compatibility)
app.use("/api/feedback", (req, res) => {
  res.status(301).json({
    success: false,
    message: "This endpoint has been moved to /api/cases",
    redirectTo: "/api/cases",
    deprecationNotice:
      "The /api/feedback endpoint is deprecated. Please use /api/cases instead.",
  });
});

app.use("/api/feedback-related-data", (req, res) => {
  res.status(301).json({
    success: false,
    message: "This endpoint has been moved to /api/references",
    redirectTo: "/api/references",
    deprecationNotice:
      "The /api/feedback-related-data endpoint is deprecated. Please use /api/references instead.",
  });
});

// File upload size error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
      error: "INVALID_JSON",
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large",
      error: "FILE_TOO_LARGE",
    });
  }

  next(error);
});

// Serve static files from the frontend build directory (Production)
if (process.env.NODE_ENV === "production") {
  // Serve static files with appropriate headers
  app.use(
    express.static(path.join(__dirname, "frontend/dist"), {
      maxAge: "1y", // Cache static assets for 1 year
      etag: true,
      lastModified: true,
    })
  );

  // Handle client-side routing (SPA) - FIXED
  app.get("/*splat", (req, res, next) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/")) {
      return next(); // Let it fall through to the 404 handler
    }

    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// 404 handler for API routes - FIXED
app.use((req, res, next) => {
  // Only handle API routes that weren't matched
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      error: "ENDPOINT_NOT_FOUND",
      suggestion: "Check the API documentation at /api",
    });
  }

  // For non-API routes, pass to next middleware
  next();
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("🚨 Unhandled error:", error);

  // Log detailed error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Stack trace:", error.stack);
  }

  // Handle specific error types
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: "VALIDATION_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
      error: "UNAUTHORIZED",
    });
  }

  if (error.code === "ECONNREFUSED") {
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
      error: "SERVICE_UNAVAILABLE",
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    error: error.code || "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      details: error,
    }),
  });
});

// Helper functions for health checks
async function getEmailServiceHealth() {
  try {
    const { EmailController } = await import(
      "./backend/controllers/emailController.js"
    );
    const status = EmailController.getEmailServiceStatus();
    return {
      status: status.isConfigured ? "healthy" : "degraded",
      ...status,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    };
  }
}

async function getStorageServiceHealth() {
  try {
    const { azureStorageService } = await import(
      "./backend/services/azureStorageService.js"
    );
    const testResult = await azureStorageService.testConnection();
    return {
      status: testResult.success ? "healthy" : "degraded",
      ...testResult.details,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    };
  }
}

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

  try {
    // Close database connections
    if (database) {
      await database.disconnect();
      console.log("✅ Database connections closed");
    }

    // Close other connections (Redis, external services, etc.)
    // Add cleanup logic here

    console.log("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💀 Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💀 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server and connect to the database
const startServer = async () => {
  try {
    console.log("🚀 Starting Sunflower CFM Server...");
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);

    // Connect to the database first
    await database.connect();
    console.log("✅ Database connected and initialized");

    // Start the server
    const server = app.listen(PORT, () => {
      console.log("━".repeat(60));
      console.log(`🌻 Sunflower CFM Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
      console.log(
        `🌐 Frontend URL: ${
          process.env.FRONTEND_URL || `http://localhost:${PORT}`
        }`
      );
      console.log("━".repeat(60));
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error("❌ Server error:", error);
        process.exit(1);
      }
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

startServer();
