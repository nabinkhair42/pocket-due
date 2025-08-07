import { NextFunction, Request, Response } from "express";

interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  private logLevel: number;

  constructor() {
    this.logLevel =
      LOG_LEVELS[process.env.LOG_LEVEL as keyof LogLevel] || LOG_LEVELS.INFO;
  }

  private formatMessage(
    level: string,
    message: string,
    data?: Record<string, unknown>
  ): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  error(message: string, data?: Record<string, unknown>): void {
    if (this.logLevel >= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage("ERROR", message, data));
    }
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (this.logLevel >= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage("WARN", message, data));
    }
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (this.logLevel >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage("INFO", message, data));
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (this.logLevel >= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage("DEBUG", message, data));
    }
  }

  // Request logging
  logRequest(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      this.info(`${req.method} ${req.originalUrl}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });
    });

    next();
  }

  // Error logging
  logError(error: Error, req?: Request): void {
    this.error(error.message, {
      stack: error.stack,
      url: req?.originalUrl,
      method: req?.method,
      user: (req as unknown as { user?: { _id: string } }).user?._id,
    });
  }
}

export const logger = new Logger();
