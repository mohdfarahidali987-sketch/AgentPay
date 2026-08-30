import { Router } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return res.status(500).json({
        message: "Webhook secret not configured",
      });
    }

    const signature = req.headers["x-razorpay-signature"];

    if (typeof signature !== "string") {
      return res.status(400).json({
        message: "Missing Razorpay webhook signature",
      });
    }

    // IMPORTANT:
    // req.body must be the raw Buffer.
    const rawBody = req.body as Buffer;

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    const event = payload.event;

    console.log(`Razorpay webhook received: ${event}`);

    const payment = payload.payload?.payment?.entity;

    if (!payment) {
      return res.status(200).json({
        received: true,
        message: "Event does not contain payment data",
      });
    }

    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    if (!razorpayOrderId) {
      return res.status(200).json({
        received: true,
        message: "No Razorpay order ID",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        razorpayOrderId,
      },
    });

    if (!order) {
      console.warn(
        `Order not found for Razorpay order ${razorpayOrderId}`
      );

      return res.status(200).json({
        received: true,
        message: "Order not found",
      });
    }

    if (event === "payment.captured") {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PAID",
          razorpayPaymentId,
        },
      });

      console.log(`Order ${order.id} marked as PAID`);
    }

    if (event === "payment.failed") {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "FAILED",
          razorpayPaymentId,
        },
      });

      console.log(`Order ${order.id} marked as FAILED`);
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      message: "Webhook processing failed",
    });
  }
});

export default router;