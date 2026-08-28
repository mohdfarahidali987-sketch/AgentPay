import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env";

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) return false;

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(actualHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}

/**
 * Sign a JWT access token
 */
export function signAccessToken(payload: AuthPayload): string {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "1h",
    algorithm: "HS256",
  });
}

/**
 * Verify a JWT access token
 */
export function verifyAccessToken(token: string): AuthPayload {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 */
export function extractTokenFromHeader(
  authHeader?: string
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
