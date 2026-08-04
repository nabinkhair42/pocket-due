import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env";
import { connectDB } from "./config/database";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import paymentRoutes from "./routes/payments.routes";
import { errorHandler, notFound } from "./utils/error-handler";
import { logger } from "./utils/logger";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Request logging middleware
app.use((req, res, next) => {
  logger.logRequest(req, res, next);
});

// Reuses a single connection promise in long-running and serverless runtimes.
app.use(async (_req, _res, next) => {
  if (_req.path === "/health") return next();
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.get("/", (_, res) => {
  res.json({
    message: "Welcome to PocketDue API",
    version: "1.0.0",
    environment: config.NODE_ENV,
  });
});

app.get("/health", async (_, res) => {
  try {
    await connectDB();
  } catch {
    // Report degraded readiness without exposing connection details.
  }
  const ready = require("mongoose").connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

export const startServer = async () => {
  await connectDB();
  const server = app.listen(config.PORT, "0.0.0.0", () => {
    logger.info(`Server running on 0.0.0.0:${config.PORT}`, { environment: config.NODE_ENV });
  });
  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    logger.error("Server startup failed", { error });
    process.exitCode = 1;
  });
}

export default app;
