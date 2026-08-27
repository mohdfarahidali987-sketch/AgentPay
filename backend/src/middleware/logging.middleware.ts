import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Request logging middleware
 * Logs all HTTP requests with timing and status
 */
export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const method = req.method;
  const path = req.path;
  const userId = req.user?.userId;

  // Log request
  logger.debug("Incoming request", {
    method,
    endpoint: path,
    userId,
  });

  // Capture response
  const originalJson = res.json;
  res.json = function (data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    logger.info("Request completed", {
      method,
      endpoint: path,
      statusCode,
      duration,
      userId,
    });

    return originalJson.call(this, data);
  };

  next();
}
