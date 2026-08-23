import { Router } from "express";

import {
  understandCommerceIntent,
} from "../agents/supervisor.agent";

import {
  findProducts,
} from "../agents/product.agent";

import {
  checkPurchaseGuardrail,
} from "../guardrails/guardrail.service";

import {
  createAuditAction,
  getUserAuditActions,
} from "../services/audit.service";
import {
  createOrderForProduct,
} from "../agents/order.agent";
import prisma from "../lib/prisma";

const router = Router();

/**
 * POST /api/agent/understand
 *
 * Understand a user's commerce request
 * using the Supervisor Agent.
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
 * POST /api/agent/search
 *
 * AI-powered product search.
 *
 * Flow:
 *
 * User message
 *      ↓
 * Supervisor Agent
 *      ↓
 * Product Agent
 *      ↓
 * Product Service
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

    if (intent.intent !== "SEARCH_PRODUCT") {
      return res.status(400).json({
        message:
          "This request is not a product search.",
        intent,
      });
    }

    const products = await findProducts(
      intent.query,
      intent.maxPrice
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
      message: "Product search failed",
    });
  }
});

/**
 * POST /api/agent/guardrail
 *
 * Check whether a purchase is allowed.
 *
 * Flow:
 *
 * Purchase Request
 *      ↓
 * Guardrail Engine
 *      ↓
 * APPROVED / BLOCKED
 *      ↓
 * Audit Log
 */
router.post("/guardrail", async (req, res) => {
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

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message:
          "amount must be a positive number",
      });
    }

    // Check deterministic spending policy
    const result =
      await checkPurchaseGuardrail(
        userId,
        amount
      );

    // Record every purchase decision
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
      error.message === "USER_NOT_FOUND"
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
      message: "Guardrail check failed",
    });
  }
});


/**
 * GET /api/agent/audit/:userId
 *
 * Get the complete AI action history
 * for a user.
 */
router.get(
  "/audit/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          message: "userId is required",
        });
      }

      const actions =
        await getUserAuditActions(userId);

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
        message: "Failed to fetch audit history",
      });
    }
  }
);


 
router.post("/purchase", async (req, res) => {
  try {
    const {
      userId,
      productId,
    } = req.body;

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
     * Fetch product first so we know
     * the exact amount that will be charged.
     */
    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        message: "Product is out of stock",
      });
    }

    /*
     * IMPORTANT:
     * Guardrail receives the actual database price.
     * The client cannot choose the amount.
     */
    const guardrail =
      await checkPurchaseGuardrail(
        userId,
        product.price
      );

    if (
      guardrail.decision === "BLOCKED"
    ) {
      await createAuditAction({
        userId,
        action: "PURCHASE_REQUEST",
        amount: product.price,
        status: "BLOCKED",
        reason: guardrail.reason,
      });

      return res.status(403).json({
        message: "Purchase blocked",
        product,
        guardrail,
      });
    }

    /*
     * Guardrail approved.
     * Create the pending order.
     */
    const order =
      await createOrderForProduct(
        userId,
        productId
      );

    /*
     * Record successful authorization.
     */
    await createAuditAction({
      userId,
      orderId: order.id,
      action: "ORDER_CREATED",
      amount: order.amount,
      status: "APPROVED",
      reason:
        "Purchase passed the spending guardrail and an order was created.",
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
      guardrail,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PRODUCT_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "PRODUCT_OUT_OF_STOCK"
    ) {
      return res.status(400).json({
        message: "Product is out of stock",
      });
    }

    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.error(
      "Purchase request failed:",
      error
    );

    return res.status(500).json({
      message: "Purchase request failed",
    });
  }
});
/**
 * GET /api/agent/orders/:orderId
 */
router.get(
  "/orders/:orderId",
  async (req, res) => {
    try {
      const order =
        await prisma.order.findUnique({
          where: {
            id: req.params.orderId,
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

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
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
        message: "Failed to fetch order",
      });
    }
  }
);

export default router;