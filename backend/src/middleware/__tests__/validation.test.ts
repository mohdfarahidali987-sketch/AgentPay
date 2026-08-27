import { describe, it, expect } from "vitest";
import { z } from "zod";
import { schemas } from "../src/middleware/validation.middleware";

describe("Request Validation Schemas", () => {
  describe("User Schemas", () => {
    it("should validate user creation", () => {
      const validUser = {
        name: "John Doe",
        email: "john@example.com",
        spendingLimit: 5000,
      };

      const result = schemas.createUser.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should require email format", () => {
      const invalidUser = {
        name: "John Doe",
        email: "not-an-email",
      };

      const result = schemas.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should not allow empty name", () => {
      const invalidUser = {
        name: "",
        email: "john@example.com",
      };

      const result = schemas.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should not allow negative spending limit", () => {
      const invalidUser = {
        name: "John Doe",
        email: "john@example.com",
        spendingLimit: -1000,
      };

      const result = schemas.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should allow optional spending limit", () => {
      const user = {
        name: "John Doe",
        email: "john@example.com",
      };

      const result = schemas.createUser.safeParse(user);
      expect(result.success).toBe(true);
    });
  });

  describe("Login Schema", () => {
    it("should validate login with email", () => {
      const login = {
        email: "user@example.com",
      };

      const result = schemas.login.safeParse(login);
      expect(result.success).toBe(true);
    });

    it("should require valid email format", () => {
      const invalidLogin = {
        email: "invalid-email",
      };

      const result = schemas.login.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });

  describe("Agent Schemas", () => {
    it("should validate understand intent request", () => {
      const request = {
        message: "I want to buy a laptop",
      };

      const result = schemas.understandIntent.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should not allow empty message", () => {
      const request = {
        message: "",
      };

      const result = schemas.understandIntent.safeParse(request);
      expect(result.success).toBe(false);
    });

    it("should enforce maximum message length", () => {
      const request = {
        message: "a".repeat(501), // Over 500 char limit
      };

      const result = schemas.understandIntent.safeParse(request);
      expect(result.success).toBe(false);
    });

    it("should validate search products request", () => {
      const request = {
        message: "show me wireless mice under 2000",
      };

      const result = schemas.searchProducts.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should validate guardrail check", () => {
      const request = {
        amount: 1500,
      };

      const result = schemas.checkGuardrail.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should require positive amount for guardrail", () => {
      const invalidRequests = [
        { amount: 0 },
        { amount: -100 },
        { amount: NaN },
      ];

      invalidRequests.forEach((req) => {
        const result = schemas.checkGuardrail.safeParse(req);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Order Schemas", () => {
    it("should validate create order", () => {
      const request = {
        productId: "prod-12345",
      };

      const result = schemas.createOrder.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should not allow empty productId", () => {
      const request = {
        productId: "",
      };

      const result = schemas.createOrder.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe("Payment Schemas", () => {
    it("should validate create Razorpay order", () => {
      const request = {
        amount: 5000,
        receipt: "order-123",
      };

      const result =
        schemas.createRazorpayOrder.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should allow optional receipt", () => {
      const request = {
        amount: 5000,
      };

      const result =
        schemas.createRazorpayOrder.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should require positive amount", () => {
      const invalidRequests = [
        { amount: 0 },
        { amount: -5000 },
      ];

      invalidRequests.forEach((req) => {
        const result =
          schemas.createRazorpayOrder.safeParse(req);
        expect(result.success).toBe(false);
      });
    });

    it("should validate payment verification", () => {
      const request = {
        orderId: "order-123",
        paymentId: "pay-456",
        signature: "sig-789",
      };

      const result = schemas.verifyPayment.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should require all payment verification fields", () => {
      const incompleteRequests = [
        { orderId: "order-123", paymentId: "pay-456" },
        { orderId: "order-123", signature: "sig-789" },
        { paymentId: "pay-456", signature: "sig-789" },
      ];

      incompleteRequests.forEach((req) => {
        const result = schemas.verifyPayment.safeParse(req);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Common Validations", () => {
    it("should reject extra properties", () => {
      const user = {
        name: "John Doe",
        email: "john@example.com",
        spendingLimit: 5000,
        extraField: "should-be-ignored",
      };

      // By default, Zod passthrough extra fields
      const result = schemas.createUser.strict().safeParse(user);
      expect(result.success).toBe(false);
    });

    it("should handle null values appropriately", () => {
      const user = {
        name: null,
        email: "john@example.com",
      };

      const result = schemas.createUser.safeParse(user);
      expect(result.success).toBe(false);
    });

    it("should handle undefined values appropriately", () => {
      const user = {
        name: "John Doe",
        email: "john@example.com",
        spendingLimit: undefined,
      };

      const result = schemas.createUser.safeParse(user);
      expect(result.success).toBe(true); // spendingLimit is optional
    });
  });
});
