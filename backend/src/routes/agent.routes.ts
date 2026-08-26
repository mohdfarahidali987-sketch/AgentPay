import { Router } from "express";

import {
  understandCommerceIntent,
} from "../agents/supervisor.agent";

import {
  findProducts,
} from "../agents/product.agent";

import {
  createOrderForProduct,
} from "../agents/order.agent";

import {
  checkPurchaseGuardrail,
} from "../guardrails/guardrail.service";

import {
  createAuditAction,
  getUserAuditActions,
} from "../services/audit.service";

import prisma from "../lib/prisma";
import {
  verifyRazorpayPayment,
} from "../payments/razorpay.service";

const router = Router();

/**
 * =========================================================
 * POST /api/agent/understand
 * =========================================================
 *
 * Understand a user's commerce request
 * using the Supervisor Agent.
 *
 * User message
 *      ↓
 * Supervisor Agent
 *      ↓
 * Commerce Intent
 */
router.post("/understand", async (req, res) => {
  try {
    const { message } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "message is required",
      });
    }

    const intent =
      await understandCommerceIntent(message);

    return res.json({
      message,
      intent,
    });
  } catch (error) {
    console.error(
      "Supervisor agent failed:",
      error
    );

    return res.status(500).json({
      message: "AI agent failed",
    });
  }
});


/**
 * =========================================================
 * POST /api/agent/search
 * =========================================================
 *
 * AI-powered product search.
 *
 * User message
 *      ↓
 * Supervisor Agent
 *      ↓
 * Product Agent
 *      ↓
 * PostgreSQL
 */
router.post("/search", async (req, res) => {
  try {
    const { message } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "message is required",
      });
    }

    const intent =
      await understandCommerceIntent(message);

    if (
      intent.intent !== "SEARCH_PRODUCT"
    ) {
      return res.status(400).json({
        message:
          "This request is not a product search.",
        intent,
      });
    }

  const products = await findProducts(
  intent.query,
  intent.maxPrice,
  intent.preference
);

    return res.json({
      intent,
      products,
      count: products.length,
    });

  } catch (error) {
    console.error(
      "AI product search failed:",
      error
    );

    return res.status(500).json({
      message:
        "Product search failed",
    });
  }
});


/**
 * =========================================================
 * POST /api/agent/guardrail
 * =========================================================
 *
 * Check whether a purchase is allowed.
 *
 * This endpoint is useful for:
 * - Testing the guardrail independently
 * - Demonstrating the safety policy
 * - Showing audit logging
 *
 * Purchase Request
 *      ↓
 * Guardrail Engine
 *      ↓
 * APPROVED / BLOCKED
 *      ↓
 * Audit Log
 */
router.post(
  "/guardrail",
  async (req, res) => {
    try {
      const {
        userId,
        amount,
      } = req.body;

      if (
        typeof userId !== "string" ||
        !userId.trim() ||
        typeof amount !== "number"
      ) {
        return res.status(400).json({
          message:
            "userId and numeric amount are required",
        });
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          message:
            "amount must be a positive number",
        });
      }

      const result =
        await checkPurchaseGuardrail(
          userId,
          amount
        );

      /*
       * Every standalone guardrail request
       * is recorded in the audit log.
       */
      await createAuditAction({
        userId,
        action: "PURCHASE_REQUEST",
        amount,
        status: result.decision,
        reason: result.reason,
      });

      return res.json({
        ...result,
        auditLogged: true,
      });

    } catch (error) {

      if (
        error instanceof Error &&
        error.message ===
          "USER_NOT_FOUND"
      ) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      console.error(
        "Guardrail check failed:",
        error
      );

      return res.status(500).json({
        message:
          "Guardrail check failed",
      });
    }
  }
);


/**
 * =========================================================
 * POST /api/agent/purchase
 * =========================================================
 *
 * Complete AI purchase flow.
 *
 * User
 *   ↓
 * Order Agent
 *   ↓
 * Product validation
 *   ↓
 * Stock validation
 *   ↓
 * Spending Guardrail
 *   ↓
 * APPROVED?
 *   │
 *   ├── BLOCKED
 *   │      ↓
 *   │   Audit Log
 *   │
 *   └── APPROVED
 *          ↓
 *      Create Internal Order
 *          ↓
 *      Create Razorpay Order
 *          ↓
 *      Save Razorpay Order ID
 *          ↓
 *      Audit Log
 *
 * IMPORTANT:
 * The guardrail is NOT checked here directly.
 *
 * createOrderForProduct()
 *       ↓
 * purchaseProduct()
 *       ↓
 * checkPurchaseGuardrail()
 *
 * This prevents checking the guardrail twice.
 */
router.post(
  "/purchase",
  async (req, res) => {
    try {
      const {
        userId,
        productId,
      } = req.body;

      /*
       * Validate request body.
       */
      if (
        typeof userId !== "string" ||
        !userId.trim() ||
        typeof productId !== "string" ||
        !productId.trim()
      ) {
        return res.status(400).json({
          message:
            "userId and productId are required",
        });
      }

      /*
       * Order Agent handles:
       *
       * 1. Product lookup
       * 2. Stock check
       * 3. Guardrail check
       * 4. Internal order creation
       * 5. Razorpay order creation
       * 6. Razorpay order ID persistence
       */
      const result =
        await createOrderForProduct(
          userId,
          productId
        );

      /*
       * Guardrail blocked the purchase.
       */
    if (
  !result.success ||
  result.guardrail.decision === "BLOCKED" ||
  !result.order ||
  !result.razorpay
) {
  await createAuditAction({
    userId,
    action: "PURCHASE_REQUEST",
    amount: result.guardrail.requestedAmount,
    status: "BLOCKED",
    reason: result.guardrail.reason,
  });

  return res.status(403).json({
    message: "Purchase blocked",
    guardrail: result.guardrail,
    razorpay: null,
  });
}
      /*
       * Purchase was approved.
       *
       * Internal order has already been
       * created by order.service.ts.
       */
      await createAuditAction({
        userId,

        orderId:
          result.order.id,

        action:
          "ORDER_CREATED",

        amount:
          result.order.amount,

        status: "APPROVED",

        reason:
          "Purchase passed the spending guardrail and an order was created.",
      });

      /*
       * Return the internal order,
       * guardrail decision and
       * Razorpay order information.
       */
      return res.status(201).json({
        message:
          "Order created successfully",

        order:
          result.order,

        guardrail:
          result.guardrail,

        razorpay:
          result.razorpay,
      });

    } catch (error) {

      /*
       * Product not found.
       */
      if (
        error instanceof Error &&
        error.message ===
          "PRODUCT_NOT_FOUND"
      ) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      /*
       * Product out of stock.
       */
      if (
        error instanceof Error &&
        error.message ===
          "PRODUCT_OUT_OF_STOCK"
      ) {
        return res.status(400).json({
          message:
            "Product is out of stock",
        });
      }

      /*
       * User not found.
       */
      if (
        error instanceof Error &&
        error.message ===
          "USER_NOT_FOUND"
      ) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      console.error(
        "Purchase request failed:",
        error
      );

      return res.status(500).json({
        message:
          "Purchase request failed",
      });
    }
  }
);


/**
 * =========================================================
 * GET /api/agent/audit/:userId
 * =========================================================
 *
 * Get complete AI action history
 * for a user.
 */
router.get(
  "/audit/:userId",
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      if (
        !userId ||
        !userId.trim()
      ) {
        return res.status(400).json({
          message:
            "userId is required",
        });
      }

      const actions =
        await getUserAuditActions(
          userId
        );

      return res.json({
        actions,
        count: actions.length,
      });

    } catch (error) {
      console.error(
        "Failed to fetch audit history:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch audit history",
      });
    }
  }
);


/**
 * =========================================================
 * GET /api/agent/orders/:orderId
 * =========================================================
 *
 * Get complete order information.
 *
 * Includes:
 * - Product
 * - User
 * - Agent actions / audit trail
 */
router.get(
  "/orders/:orderId",
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      if (
        !orderId ||
        !orderId.trim()
      ) {
        return res.status(400).json({
          message:
            "orderId is required",
        });
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },

          include: {
            product: true,

            user: true,

            agentActions: {
              orderBy: {
                createdAt:
                  "desc",
              },
            },
          },
        });

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      return res.json({
        order,
      });

    } catch (error) {
      console.error(
        "Failed to fetch order:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch order",
      });
    }
  }
);

/**
 * POST /api/agent/payment/verify
 *
 * Verify Razorpay payment signature
 * and mark the internal order as PAID.
 */
router.post(
  "/payment/verify",
  async (req, res) => {
    try {
      const {
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      } = req.body;

      // ---------------------------------------------
      // Validate request
      // ---------------------------------------------

      if (
        typeof razorpayPaymentId !== "string" ||
        !razorpayPaymentId.trim() ||

        typeof razorpayOrderId !== "string" ||
        !razorpayOrderId.trim() ||

        typeof razorpaySignature !== "string" ||
        !razorpaySignature.trim()
      ) {
        return res.status(400).json({
          message:
            "razorpayPaymentId, razorpayOrderId and razorpaySignature are required",
        });
      }


      // ---------------------------------------------
      // Verify Razorpay signature
      // ---------------------------------------------

      const isValid =
        verifyRazorpayPayment(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );


      // ---------------------------------------------
      // Invalid signature
      // ---------------------------------------------

      if (!isValid) {
        return res.status(400).json({
          message:
            "Payment signature verification failed",
        });
      }


      // ---------------------------------------------
      // Find our internal order
      // ---------------------------------------------

      const order =
        await prisma.order.findFirst({
          where: {
            razorpayOrderId,
          },

          include: {
            product: true,
            user: true,
          },
        });


      if (!order) {
        return res.status(404).json({
          message:
            "Internal order not found",
        });
      }


      // ---------------------------------------------
      // Prevent duplicate processing
      // ---------------------------------------------

      if (order.status === "PAID") {
        return res.json({
          success: true,
          message:
            "Payment was already verified",
          order,
        });
      }


      // ---------------------------------------------
      // Mark order as PAID
      // ---------------------------------------------

   const updatedOrder =
  await prisma.order.update({
    where: {
      id: order.id,
    },

    data: {
      status: "PAID",

      razorpayPaymentId,
      razorpaySignature,
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


      // ---------------------------------------------
      // Create audit record
      // ---------------------------------------------

      await createAuditAction({
        userId: order.userId,

        orderId: order.id,

        action:
          "PAYMENT_VERIFIED",

        amount: order.amount,

        status: "APPROVED",

        reason:
          "Razorpay payment signature was successfully verified.",
      });


      // ---------------------------------------------
      // Response
      // ---------------------------------------------

      return res.json({
        success: true,

        message:
          "Payment verified successfully",

        payment: {
          paymentId:
            razorpayPaymentId,

          orderId:
            razorpayOrderId,
        },

        order: updatedOrder,
      });

    } catch (error) {
      console.error(
        "Payment verification failed:",
        error
      );

      return res.status(500).json({
        message:
          "Payment verification failed",
      });
    }
  }
);

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "message is required",
      });
    }

    const intent =
      await understandCommerceIntent(message);

    return res.json({
      intent: intent.intent,
      response: intent.response,
      query: intent.query,
      maxPrice: intent.maxPrice,
    });

  } catch (error) {

    console.error(
      "AI chat failed:",
      error
    );

    return res.status(500).json({
      message: "AI chat failed",
    });
  }
});


export default router;