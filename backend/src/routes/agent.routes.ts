import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody, schemas } from "../middleware/validation.middleware.js";
import {
  understandCommerceIntent,
} from "../agents/supervisor.agent.js";

import {
  findProducts,
} from "../agents/product.agent.js";

import {
  createOrderForProduct,
} from "../agents/order.agent.js";

import {
  checkPurchaseGuardrail,
} from "../guardrails/guardrail.service.js";

import {
  createAuditAction,
  getUserAuditActions,
} from "../services/audit.service.js";

import prisma from "../lib/prisma.js";
import {
  verifyRazorpayPayment,
} from "../payments/razorpay.service.js";

const router = Router();

 
 // POST /api/agent/understand
 
 
 
router.post(
  "/understand",
  validateBody(schemas.understandIntent),
  async (req, res) => {
    try {
      const { message } = req.body;

      const intent =
        await understandCommerceIntent(message);

    return res.json({
      message,
      intent,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "Supervisor agent failed:",
      error
    );

    return res.status(500).json({
      message: "AI agent failed",
      code: "SUPERVISOR_AGENT_ERROR",
      ...(process.env.NODE_ENV === "development" && {
        details: message,
      }),
    });
  }
});



  
 // POST /api/agent/search
 
 
router.post(
  "/search",
  validateBody(schemas.searchProducts),
  async (req, res) => {
    try {
      const { message } = req.body;

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
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "AI product search failed:",
      error
    );

    return res.status(500).json({
      message: "Product search failed",
      code: "PRODUCT_SEARCH_ERROR",
      ...(process.env.NODE_ENV === "development" && {
        details: message,
      }),
    });
  }
});


 
 // POST /api/agent/guardrail
 
 
router.post(
  "/guardrail",
  authMiddleware,
  validateBody(schemas.checkGuardrail),
  async (req, res) => {
    try {
      const {
        amount,
      } = req.body;

      //  Get userId from JWT token
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: "User not authenticated",
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

 
 //POST /api/agent/purchase
 
 
 
router.post(
  "/purchase",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        productId,
      } = req.body;

      // Get userId from JWT token
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: "User not authenticated",
        });
      }

      
       //Validate request body.
       
      if (
        typeof productId !== "string" ||
        !productId.trim()
      ) {
        return res.status(400).json({
          message:
            "productId is required",
        });
      }

  
       // Order Agent handles:
        
     
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
      
       //Purchase was approved.
   
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


 
 // GET /api/agent/audit/:userId
 
 
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



 // GET /api/agent/orders/:orderId
 
 
router.get(
  "/orders/:orderId",
  authMiddleware,
  async (req, res) => {
    try {
   const { orderId } = req.params;

if (
  !orderId ||
  Array.isArray(orderId) ||
  !orderId.trim()
) {
  return res.status(400).json({
    message: "orderId is required",
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
    message: "Order not found",
  });
}

    if (order.userId !== req.user?.userId) {
  return res.status(403).json({
    message: "You are not allowed to access this order",
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

 // POST /api/agent/payment/verify
 
router.post(
  "/payment/verify",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      } = req.body;

    
      // Validate request
 

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


 
      // Verify Razorpay signature
 

      const isValid =
        verifyRazorpayPayment(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );


     
      // Invalid signature
    

      if (!isValid) {
        return res.status(400).json({
          message:
            "Payment signature verification failed",
        });
      }


 
      // Find our internal order
   

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
      if (order.userId !== req.user?.userId) {
  return res.status(403).json({
    message: "You are not allowed to verify this order",
  });
}


     
      // Prevent duplicate processing
     

      if (order.status === "PAID") {
        return res.json({
          success: true,
          message:
            "Payment was already verified",
          order,
        });
      }


   

 
// Atomically update stock + order
 

const updatedOrder =
  await prisma.$transaction(async (tx) => {

    // Decrease stock only if stock is still available.
    // This is atomic and prevents stock from
    // becoming negative during concurrent purchases.

    const stockUpdate =
      await tx.product.updateMany({
        where: {
          id: order.productId,
          stock: {
            gt: 0,
          },
        },

        data: {
          stock: {
            decrement: 1,
          },
        },
      });


    // No row updated means the product was
    // already out of stock.

    if (stockUpdate.count === 0) {
      throw new Error(
        "PRODUCT_OUT_OF_STOCK"
      );
    }


    // Mark the order as paid only after
    // successfully reserving/decreasing stock.

    return tx.order.update({
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
  });


 
      // Create audit record
     

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


 
      // Response
      

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