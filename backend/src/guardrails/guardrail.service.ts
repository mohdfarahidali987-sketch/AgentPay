import prisma from "../lib/prisma.js";

export type GuardrailResult = {
  decision: "APPROVED" | "BLOCKED";
  reason: string;
  currentSpending: number;
  requestedAmount: number;
  spendingLimit: number;
  remainingLimit: number;
};

export async function checkPurchaseGuardrail(
  userId: string,
  amount: number
): Promise<GuardrailResult> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      decision: "BLOCKED",
      reason: "Purchase amount must be greater than zero.",
      currentSpending: 0,
      requestedAmount: amount,
      spendingLimit: 0,
      remainingLimit: 0,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  /*
   * Only successful/approved money movement counts
   * toward the user's spending limit.
   */
  const spending = await prisma.order.aggregate({
    where: {
      userId,
      status: {
        in: ["APPROVED", "PAYMENT_CREATED", "PAID"],
      },
    },
    _sum: {
      amount: true,
    },
  });

  const currentSpending = spending._sum.amount ?? 0;

  const remainingLimit = Math.max(
    user.spendingLimit - currentSpending,
    0
  );

  if (
    currentSpending + amount >
    user.spendingLimit
  ) {
    return {
      decision: "BLOCKED",
      reason:
        `Purchase of ₹${amount} exceeds the remaining ` +
        `spending limit of ₹${remainingLimit}.`,
      currentSpending,
      requestedAmount: amount,
      spendingLimit: user.spendingLimit,
      remainingLimit,
    };
  }

  return {
    decision: "APPROVED",
    reason:
      `Purchase of ₹${amount} is within the user's ` +
      `spending limit.`,
    currentSpending,
    requestedAmount: amount,
    spendingLimit: user.spendingLimit,
    remainingLimit,
  };
}