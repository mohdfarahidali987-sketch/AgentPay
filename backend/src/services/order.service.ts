import prisma from "../lib/prisma";

export async function createPendingOrder(
  userId: string,
  productId: string
) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  if (product.stock <= 0) {
    throw new Error("PRODUCT_OUT_OF_STOCK");
  }

  const order = await prisma.order.create({
    data: {
      userId,
      productId,
      amount: product.price,
      status: "PENDING",
    },
    include: {
      product: true,
      user: true,
    },
  });

  return order;
}

export async function getOrderById(
  orderId: string
) {
  return prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      product: true,
      user: true,
      agentActions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}