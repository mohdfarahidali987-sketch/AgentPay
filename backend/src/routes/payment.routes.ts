import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody, schemas } from "../middleware/validation.middleware.js";
import { createRazorpayOrder } from "../payments/razorpay.service.js";

const router = Router();

router.post("/create-order", authMiddleware, validateBody(schemas.createRazorpayOrder), async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const order =
      await createRazorpayOrder(
        amount,
        receipt || `agentpay_${Date.now()}`
      );

    return res.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error(
      "Razorpay order creation failed:",
      error
    );

    return res.status(500).json({
      message: "Failed to create Razorpay order",
    });
  }
});

export default router;