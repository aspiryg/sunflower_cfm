import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { database } from "./backend/config/database.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";

config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Import routes
import userRoutes from "./backend/routes/userRoute.js";
import authRoutes from "./backend/routes/authRoute.js";
import feedbackRoutes from "./backend/routes/feedbackRoute.js";
import notificationRoutes from "./backend/routes/notificationRoute.js";
import feedbackRelatedDataRoute from "./backend/routes/feedbackRelatedDataRoute.js";
import myProfileRoutes from "./backend/routes/myProfileRoute.js";

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 login attempts per windowMs
  message: {
    error: "Too many login attempts, please try again later.",
  },
});

app.use(limiter);
app.use("/api/auth", authLimiter); // Apply rate limiting to auth routes

// Cookie parser
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Specify allowed origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow credentials if needed
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression and logging

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Todo: Implement database connection check
    const pool = database.getPool();
    if (!pool) {
      throw new Error("Database connection pool is not initialized.");
    }

    // Check if the database is healthy
    const dbCheck = await pool.request().query("SELECT 1 AS healthy");

    // Check if the Users table exists
    const tableCheck = await pool.request().query(`
        SELECT COUNT(*) AS tableExists
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'Users'
    `);

    // Check user count
    const userCount = await pool
      .request()
      .query("SELECT COUNT(*) AS count FROM Users");

    // For now, just return a simple response
    res.status(200).json({
      status: "OK",
      message: "Server is running smoothly",
      timestamp: new Date().toISOString(),
      server: {
        environment: process.env.NODE_ENV || "development",
        port: PORT,
      },
      database: {
        connected: dbCheck.recordset[0].healthy === 1,
        usersTableExists: tableCheck.recordset[0].tableExists > 0,
        userCount: userCount.recordset[0].count,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
      error: error.message || "Unknown error",
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/profile", myProfileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback-related-data", feedbackRelatedDataRoute);

// Serve static files from the frontend build directory
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// TODO: 404 handler

// TODO: Global error handler

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  // Close database connections
  database.disconnect();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  // Close database connections
  database.disconnect();
  process.exit(0);
});

// Start the server and connect to the database
const startServer = async () => {
  try {
    // Connect to the database
    await database.connect();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();
