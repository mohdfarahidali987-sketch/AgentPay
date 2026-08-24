import prisma from "../lib/prisma";

import {
  checkPurchaseGuardrail,
} from "../guardrails/guardrail.service";

import {
  createRazorpayOrder,
} from "../payments/razorpay.service";


export async function purchaseProduct(
  userId: string,
  productId: string
) {

  // 1. Find product
  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });


  if (!product) {
    throw new Error(
      "PRODUCT_NOT_FOUND"
    );
  }


  // 2. Check stock
  if (product.stock <= 0) {
    throw new Error(
      "PRODUCT_OUT_OF_STOCK"
    );
  }


  // 3. Check purchase guardrail
  const guardrail =
    await checkPurchaseGuardrail(
      userId,
      product.price
    );


  // 4. Block purchase
  if (
    guardrail.decision ===
    "BLOCKED"
  ) {

    return {
      success: false,

      guardrail,

      order: null,

      razorpay: null,
    };
  }


  // 5. Create internal order
  const order =
    await prisma.order.create({

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


  // 6. Create Razorpay order
  const razorpayOrder =
    await createRazorpayOrder(
      product.price,
      order.id
    );


  // 7. Save Razorpay order ID
  const updatedOrder =
    await prisma.order.update({

      where: {
        id: order.id,
      },

      data: {
        razorpayOrderId:
          razorpayOrder.id,
      },

      include: {
        product: true,
        user: true,
      },
    });


  // 8. Return everything
  return {

    success: true,

    order: updatedOrder,

    razorpay: {
      orderId:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,
    },

    guardrail,
  };
}