import { Request, Response, NextFunction } from "express";
import { z, ZodIssue } from "zod";
import { logger } from "../lib/logger.js";

/**
 * Create a validation middleware for request body
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = await schema.parseAsync(
        req.body
      );
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Validation error", {
          endpoint: req.path,
          statusCode: 400,
        });

        res.status(400).json({
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          errors: error.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validation schemas for common requests
 */

export const schemas = {
  // Auth schemas
  createUser: z.object({
    name: z
      .string()
      .min(1, "name is required")
      .max(100, "name is too long"),
    email: z
      .string()
      .email("email must be valid"),
    spendingLimit: z
      .number()
      .nonnegative("spendingLimit must be non-negative")
      .optional(),
    password: z
      .string()
      .min(8, "password must be at least 8 characters"),
  }),

  login: z.object({
    email: z
      .string()
      .email("email must be valid"),
    password: z
      .string()
      .min(1, "password is required"),
  }),

  googleLogin: z.object({
    credential: z.string().min(1, "Google credential is required"),
  }),

  // Agent schemas
  understandIntent: z.object({
    message: z
      .string()
      .min(1, "message is required")
      .max(500, "message is too long"),
  }),

  searchProducts: z.object({
    message: z
      .string()
      .min(1, "message is required")
      .max(500, "message is too long"),
  }),

  checkGuardrail: z.object({
    amount: z
      .number()
      .positive("amount must be positive"),
  }),

  createOrder: z.object({
    productId: z
      .string()
      .min(1, "productId is required"),
  }),

  // Payment schemas
  createRazorpayOrder: z.object({
    amount: z
      .number()
      .positive("amount must be positive"),
    receipt: z
      .string()
      .optional(),
  }),

  verifyPayment: z.object({
    orderId: z
      .string()
      .min(1, "orderId is required"),
    paymentId: z
      .string()
      .min(1, "paymentId is required"),
    signature: z
      .string()
      .min(1, "signature is required"),
  }),
};
