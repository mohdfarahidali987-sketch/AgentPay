import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
export function errorHandlingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const userId = req.user?.userId;
  const method = req.method;
  const path = req.path;

  // AppError - Known error
  if (error instanceof AppError) {
    logger.warn(error.message, {
      statusCode: error.statusCode,
      endpoint: path,
      userId,
    });

    res.status(error.statusCode).json({
      message: error.message,
      code: error.code || "UNKNOWN_ERROR",
      details: error.details,
    });
    return;
  }

  // Validation error
  if (error.name === "ValidationError") {
    logger.warn("Validation error", {
      endpoint: path,
      userId,
    });

    res.status(400).json({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.message,
    });
    return;
  }

  // Unexpected error
  logger.error("Unexpected error", error, {
    method,
    endpoint: path,
    userId,
  });

  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
    ...(process.env.NODE_ENV === "development" && {
      details: error.message,
    }),
  });
}

/**
 * Async route wrapper to catch errors
 * Use this to wrap async route handlers
 */
export function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
