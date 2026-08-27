import { z } from "zod";

/**
 * Environment variable validation schema
 * Ensures all required env vars are present on startup
 */
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

  RAZORPAY_WEBHOOK_SECRET: z
    .string()
    .min(1, "RAZORPAY_WEBHOOK_SECRET is required"),

  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export validated env
export const env = validateEnv();
