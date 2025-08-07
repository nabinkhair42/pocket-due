import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(private config: RateLimitConfig) {}

  middleware = (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const key = this.getKey(req);
    const now = Date.now();
    // const windowStart = now - this.config.windowMs;

    // Get or create request record
    let record = this.requests.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + this.config.windowMs };
      this.requests.set(key, record);
    }

    // Check if limit exceeded
    if (record.count >= this.config.maxRequests) {
      return res.status(429).json({
        success: false,
        message: this.config.message || "Too many requests",
        error: "Rate limit exceeded",
      });
    }

    // Increment count
    record.count++;

    // Add headers
    res.setHeader("X-RateLimit-Limit", this.config.maxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      this.config.maxRequests - record.count
    );
    res.setHeader("X-RateLimit-Reset", record.resetTime);

    next();
  };

  private getKey(req: Request): string {
    // Use IP address as default key
    return req.ip || req.connection.remoteAddress || "unknown";
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (record.resetTime < now) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiters
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per window
  message: "Too many authentication attempts",
});

export const apiRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  message: "Too many API requests",
});

// Clean up old entries every 5 minutes
setInterval(() => {
  authRateLimit.cleanup();
  apiRateLimit.cleanup();
}, 5 * 60 * 1000);
