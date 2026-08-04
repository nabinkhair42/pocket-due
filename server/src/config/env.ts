import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  MOBILE_APP_URL: string;
  ALLOWED_ORIGINS: string[];
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
  const developmentOrigins = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:19006",
    "exp://localhost:8081",
    "exp://localhost:19000",
    "pocketdue://",
  ];
  const authSecret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!authSecret || authSecret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters");
  }
  const required = (name: string) => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} must be set`);
    return value;
  };
  return {
    NODE_ENV: nodeEnv,
    PORT: parseInt(process.env.PORT || "3000", 10),
    MONGODB_URI:
      process.env.MONGODB_URI || "mongodb://localhost:27017/pocketDue",
    BETTER_AUTH_SECRET: authSecret,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
    GITHUB_CLIENT_ID: required("GITHUB_CLIENT_ID"),
    GITHUB_CLIENT_SECRET: required("GITHUB_CLIENT_SECRET"),
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    MOBILE_APP_URL: process.env.MOBILE_APP_URL || "pocketdue://",
    ALLOWED_ORIGINS: Array.from(
      new Set([
        ...configuredOrigins,
        ...(nodeEnv === "development" ? developmentOrigins : []),
      ])
    ),
  };
};

export const config = getEnvironmentConfig();
