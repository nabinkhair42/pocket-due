import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  MOBILE_APP_URL: string;
  ALLOWED_ORIGINS: string[];
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === "your-secret-key") {
    throw new Error("JWT_SECRET must be set to a strong secret of at least 32 characters");
  }
  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3000", 10),
    MONGODB_URI:
      process.env.MONGODB_URI || "mongodb://localhost:27017/pocketDue",
    JWT_SECRET: jwtSecret,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    MOBILE_APP_URL: process.env.MOBILE_APP_URL || "pocketdue://",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:19006",
      "exp://localhost:19000",
      "http://localhost:8081",
      "pocketdue://",
    ],
  };
};

export const config = getEnvironmentConfig();
