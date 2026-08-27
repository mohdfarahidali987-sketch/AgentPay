import { describe, it, expect } from "vitest";
import type { GuardrailResult } from "../src/guardrails/guardrail.service";

/**
 * Test the guardrail logic without Prisma
 * Tests the business rules for spending limits
 */

describe("Guardrail Service - Business Logic", () => {
  /**
   * Mock guardrail logic to test without database
   */
  function checkGuardrail(
    currentSpending: number,
    requestedAmount: number,
    spendingLimit: number
  ): GuardrailResult {
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return {
        decision: "BLOCKED",
        reason: "Purchase amount must be greater than zero.",
        currentSpending: 0,
        requestedAmount,
        spendingLimit: 0,
        remainingLimit: 0,
      };
    }

    const remainingLimit = Math.max(
      spendingLimit - currentSpending,
      0
    );

    if (currentSpending + requestedAmount > spendingLimit) {
      return {
        decision: "BLOCKED",
        reason:
          `Purchase of ₹${requestedAmount} exceeds the remaining ` +
          `spending limit of ₹${remainingLimit}.`,
        currentSpending,
        requestedAmount,
        spendingLimit,
        remainingLimit,
      };
    }

    return {
      decision: "APPROVED",
      reason:
        `Purchase of ₹${requestedAmount} is within the user's ` +
        `spending limit.`,
      currentSpending,
      requestedAmount,
      spendingLimit,
      remainingLimit,
    };
  }

  describe("Valid Purchases", () => {
    it("should APPROVE purchase within limit", () => {
      const result = checkGuardrail(
        0, // currentSpending
        1000, // requestedAmount
        5000 // spendingLimit
      );

      expect(result.decision).toBe("APPROVED");
      expect(result.remainingLimit).toBe(4000);
    });

    it("should APPROVE purchase at exact remaining limit", () => {
      const result = checkGuardrail(
        3000, // currentSpending
        2000, // requestedAmount
        5000 // spendingLimit
      );

      expect(result.decision).toBe("APPROVED");
      expect(result.remainingLimit).toBe(2000);
    });

    it("should APPROVE first purchase for new user", () => {
      const result = checkGuardrail(
        0, // currentSpending
        500, // requestedAmount
        5000 // spendingLimit
      );

      expect(result.decision).toBe("APPROVED");
      expect(result.currentSpending).toBe(0);
      expect(result.remainingLimit).toBe(5000);
    });
  });

  describe("Blocked Purchases", () => {
    it("should BLOCK purchase exceeding limit", () => {
      const result = checkGuardrail(
        4500, // currentSpending
        1000, // requestedAmount
        5000 // spendingLimit
      );

      expect(result.decision).toBe("BLOCKED");
      expect(result.remainingLimit).toBe(500);
      expect(result.reason).toContain("exceeds the remaining");
    });

    it("should BLOCK purchase when already at limit", () => {
      const result = checkGuardrail(
        5000, // currentSpending
        1, // requestedAmount
        5000 // spendingLimit
      );

      expect(result.decision).toBe("BLOCKED");
      expect(result.remainingLimit).toBe(0);
    });

    it("should BLOCK purchase with zero or negative amount", () => {
      const zeroResult = checkGuardrail(0, 0, 5000);
      const negativeResult = checkGuardrail(0, -100, 5000);

      expect(zeroResult.decision).toBe("BLOCKED");
      expect(negativeResult.decision).toBe("BLOCKED");
      expect(zeroResult.reason).toContain("greater than zero");
    });

    it("should BLOCK invalid amount (Infinity, NaN)", () => {
      const infinityResult = checkGuardrail(
        0,
        Infinity,
        5000
      );
      const nanResult = checkGuardrail(
        0,
        NaN,
        5000
      );

      expect(infinityResult.decision).toBe("BLOCKED");
      expect(nanResult.decision).toBe("BLOCKED");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large spending limits", () => {
      const result = checkGuardrail(
        1000000,
        500000,
        10000000
      );

      expect(result.decision).toBe("APPROVED");
      expect(result.remainingLimit).toBe(8500000);
    });

    it("should handle micro transactions", () => {
      const result = checkGuardrail(
        0,
        0.01,
        5000
      );

      expect(result.decision).toBe("APPROVED");
      expect(result.remainingLimit).toBeCloseTo(4999.99);
    });

    it("should calculate remaining limit correctly", () => {
      const result = checkGuardrail(
        1500,
        1200,
        5000
      );

      expect(result.remainingLimit).toBe(2300);
      expect(result.currentSpending + result.requestedAmount).toBe(2700);
      expect(2700 + result.remainingLimit).toBe(5000);
    });
  });

  describe("Remaining Limit Calculation", () => {
    it("should never return negative remaining limit", () => {
      const result = checkGuardrail(
        6000, // Over limit already
        1000,
        5000
      );

      expect(result.remainingLimit).toBe(0);
      expect(result.remainingLimit).toBeGreaterThanOrEqual(0);
    });

    it("should correctly report remaining limit in blocked response", () => {
      const result = checkGuardrail(
        4000,
        1500,
        5000
      );

      expect(result.decision).toBe("BLOCKED");
      expect(result.remainingLimit).toBe(1000);
    });
  });
});
