import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});


 
// CREATE RAZORPAY ORDER
 
export async function createRazorpayOrder(
  amount: number,
  receipt: string
) {
  const order =
    await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
    });

  return order;
}


 
// VERIFY RAZORPAY PAYMENT
 

export function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const secret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error(
      "RAZORPAY_KEY_SECRET is not configured"
    );
  }

  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest("hex");

  return (
    generatedSignature ===
    razorpaySignature
  );
}