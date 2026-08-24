const API_URL = "http://localhost:5000";


// ======================================================
// Product Search
// ======================================================

export async function searchProducts(
  message: string
) {
  const response = await fetch(
    `${API_URL}/api/agent/search`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to search products"
    );
  }

  return response.json();
}
export async function chatWithAgent(message: string) {
  const response = await fetch(
    `${API_URL}/api/agent/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "AI chat failed"
    );
  }

  return data;
}


// ======================================================
// Purchase Product
// ======================================================

export async function purchaseProduct(
  userId: string,
  productId: string
) {
  const response = await fetch(
    `${API_URL}/api/agent/purchase`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId,
        productId,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Purchase failed"
    );
  }

  return data;
}


// ======================================================
// Verify Razorpay Payment
// ======================================================

export async function verifyPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
) {
  const response = await fetch(
    `${API_URL}/api/agent/payment/verify`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Payment verification failed"
    );
  }

  return data;
}