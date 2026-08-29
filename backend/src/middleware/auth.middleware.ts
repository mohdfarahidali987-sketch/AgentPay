import { Request, Response, NextFunction } from "express";
import {
  extractTokenFromHeader,
  verifyAccessToken,
  AuthPayload,
} from "../lib/auth.js";

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(
      req.headers.authorization
    );

    if (!token) {
      res.status(401).json({
        message: "Missing authorization token",
        error: "NO_TOKEN",
      });
      return;
    }

    const user = verifyAccessToken(token);
    req.user = user;

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed";

    res.status(401).json({
      message,
      error: "INVALID_TOKEN",
    });
  }
}

/**
 * Optional authentication middleware
 * Verifies JWT if present, but doesn't require it
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(
      req.headers.authorization
    );

    if (token) {
      const user = verifyAccessToken(token);
      req.user = user;
    }
  } catch (error) {
    console.warn("Optional auth failed:", error);
    // Continue without user
  }

  next();
}
