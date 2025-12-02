import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  return new AppError(message, statusCode);
};

export const handleAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  let error = err;

  // If it's not our custom error, create one
  if (!(error instanceof AppError)) {
    error = new AppError(error.message || "Something went wrong", 500);
  }

  const appError = error as AppError;

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: appError.message,
      stack: appError.stack,
      statusCode: appError.statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      user: (req as unknown as { user?: { _id: string } }).user?._id,
    });
  }

  // Send error response
  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    error: appError.message,
    ...(process.env.NODE_ENV === "development" && { stack: appError.stack }),
  });
};

export const notFound = (req: Request, res: Response<ApiResponse>): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};
