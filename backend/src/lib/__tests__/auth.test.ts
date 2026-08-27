import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  extractTokenFromHeader,
  AuthPayload,
} from "../src/lib/auth";

describe("Auth Utils", () => {
  describe("JWT Token Operations", () => {
    it("should sign an access token with valid payload", () => {
      const payload: AuthPayload = {
        userId: "user-123",
        email: "test@example.com",
      };

      const token = signAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format: header.payload.signature
    });

    it("should verify a valid token and return original payload", () => {
      const payload: AuthPayload = {
        userId: "user-456",
        email: "verify@example.com",
      };

      const token = signAccessToken(payload);
      const verified = verifyAccessToken(token);

      expect(verified.userId).toBe(payload.userId);
      expect(verified.email).toBe(payload.email);
    });

    it("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => verifyAccessToken(invalidToken)).toThrow(
        "Invalid token"
      );
    });

    it("should throw error for tampered token", () => {
      const payload: AuthPayload = {
        userId: "user-789",
        email: "tamper@example.com",
      };

      const token = signAccessToken(payload);
      const tamperedToken = token.slice(0, -5) + "xxxxx";

      expect(() => verifyAccessToken(tamperedToken)).toThrow(
        "Invalid token"
      );
    });
  });

  describe("Authorization Header Parsing", () => {
    it("should extract token from valid Authorization header", () => {
      const token = "valid.jwt.token";
      const header = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(header);

      expect(extracted).toBe(token);
    });

    it("should return null for missing Authorization header", () => {
      const extracted = extractTokenFromHeader(undefined);

      expect(extracted).toBeNull();
    });

    it("should return null for empty Authorization header", () => {
      const extracted = extractTokenFromHeader("");

      expect(extracted).toBeNull();
    });

    it("should return null for invalid Bearer format", () => {
      const invalidHeaders = [
        "Bearer",
        "Bearer  token",
        "Bearer token extra",
        "InvalidScheme token",
      ];

      invalidHeaders.forEach((header) => {
        expect(extractTokenFromHeader(header)).toBeNull();
      });
    });
  });
});
