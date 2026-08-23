import prisma from "../lib/prisma";

type CreateAuditActionInput = {
  userId: string;
  orderId?: string;
  action: string;
  amount?: number;
  status: "APPROVED" | "BLOCKED" | "FAILED";
  reason: string;
};

export async function createAuditAction(
  data: CreateAuditActionInput
) {
  return prisma.agentAction.create({
    data: {
      userId: data.userId,
      orderId: data.orderId,
      action: data.action,
      amount: data.amount,
      status: data.status,
      reason: data.reason,
    },
  });
}

export async function getUserAuditActions(
  userId: string
) {
  return prisma.agentAction.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}