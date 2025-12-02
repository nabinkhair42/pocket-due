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

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Request logging middleware
app.use((req, res, next) => {
  logger.logRequest(req, res, next);
});

// Routes
app.get("/", (_, res) => {
  res.json({
    message: "Welcome to PocketDue API",
    version: "1.0.0",
    environment: config.NODE_ENV,
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
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

// Start server
const PORT = config.PORT;
const HOST = "0.0.0.0"; // Listen on all interfaces for mobile development

app.listen(PORT, HOST, () => {
  logger.info(`Server running on ${HOST}:${PORT}`, {
    environment: config.NODE_ENV,
    port: PORT,
    host: HOST,
    database: config.MONGODB_URI.split("/").pop(),
  });
});

export default app;
