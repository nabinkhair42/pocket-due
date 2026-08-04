import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { config } from "./config/env";
import { connectDB } from "./config/database";
import { auth } from "./config/auth";
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
      logger.warn(`Blocked CORS origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);
// Better Auth must receive the raw request before Express body parsers.
app.all("/api/auth/*splat", async (req, res, next) => {
  try {
    await connectDB();
    await toNodeHandler(auth)(req, res);
  } catch (error) {
    next(error);
  }
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

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
