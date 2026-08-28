import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";

/**
 * Test environment validation schema
 * These tests verify the env validation logic without actually calling process.exit()
 */

describe("Environment Validation", () => {
  const envSchema = z.object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    PORT: z
      .string()
      .default("5000")
      .transform((val) => parseInt(val, 10)),

    DATABASE_URL: z
      .string()
      .url("DATABASE_URL must be a valid URL"),

    AI_API_KEY: z
      .string()
      .min(1, "AI_API_KEY is required"),

    AI_MODEL: z
      .string()
      .default("openai/gpt-oss-20b"),

    RAZORPAY_KEY_ID: z
      .string()
      .min(1, "RAZORPAY_KEY_ID is required"),

    RAZORPAY_KEY_SECRET: z
      .string()
      .min(1, "RAZORPAY_KEY_SECRET is required"),

    CORS_ORIGIN: z
      .string()
      .default("http://localhost:3000"),

    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters")
      .optional(),
  });

  describe("Valid Environments", () => {
    it("should validate complete required environment", () => {
      const validEnv = {
        NODE_ENV: "development",
        PORT: "5000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
        JWT_SECRET: "this-is-a-very-long-jwt-secret-at-least-32-chars",
      };

      const result = envSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
    });

    it("should use default values for optional fields", () => {
      const minimalEnv = {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(minimalEnv);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.NODE_ENV).toBe("development");
        expect(result.data.PORT).toBe(5000);
        expect(result.data.AI_MODEL).toBe("openai/gpt-oss-20b");
        expect(result.data.CORS_ORIGIN).toBe("http://localhost:3000");
      }
    });

    it("should parse PORT as integer", () => {
      const env = {
        PORT: "3000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.PORT).toBe(3000);
        expect(typeof result.data.PORT).toBe("number");
      }
    });
  });

  describe("Missing Required Variables", () => {
    it("should fail without DATABASE_URL", () => {
      const env = {
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues[0];
        expect(error.path).toContain("DATABASE_URL");
      }
    });

    it("should fail without AI_API_KEY", () => {
      const env = {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("should fail without Razorpay credentials", () => {
      const env = {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "valid-api-key",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errorPaths = result.error.issues.map((e) =>
          e.path.join(".")
        );
        expect(errorPaths).toContain("RAZORPAY_KEY_ID");
        expect(errorPaths).toContain("RAZORPAY_KEY_SECRET");
      }
    });
  });

  describe("Invalid Variable Values", () => {
    it("should fail with invalid DATABASE_URL format", () => {
      const env = {
        DATABASE_URL: "not-a-valid-url",
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues[0];
        expect(error.message).toContain("URL");
      }
    });

    it("should fail with invalid NODE_ENV value", () => {
      const env = {
        NODE_ENV: "staging", // Invalid
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("should fail with JWT_SECRET too short", () => {
      const env = {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
        JWT_SECRET: "short", // Too short
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((e) =>
          e.path.includes("JWT_SECRET")
        );
        expect(error?.message).toContain("32 characters");
      }
    });
  });

  describe("Edge Cases", () => {
    it("should accept PORT as string and convert to number", () => {
      const env = {
        PORT: "8080",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "valid-api-key",
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.PORT).toBe(8080);
      }
    });

    it("should handle empty string as invalid", () => {
      const env = {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/agentpay",
        AI_API_KEY: "", // Empty
        RAZORPAY_KEY_ID: "key_12345",
        RAZORPAY_KEY_SECRET: "secret_12345",
        RAZORPAY_WEBHOOK_SECRET: "webhook_secret",
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });
  });
});
