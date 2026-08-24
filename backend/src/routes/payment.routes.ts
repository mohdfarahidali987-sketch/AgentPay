import { Router } from "express";
import { createRazorpayOrder } from "../payments/razorpay.service";

const router = Router();

router.post("/create-order", async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (
      typeof amount !== "number" ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Valid amount is required",
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