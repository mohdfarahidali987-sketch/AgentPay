import type {
  PaymentVerificationResponse,
  PurchaseResponse,
  SearchResponse,
} from "../types";

const API_URL =import.meta.env.VITE_API_URL || "http://localhost:5000";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  spendingLimit: number;
};

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  localStorage.setItem("agentpay_access_token", data.accessToken);
  localStorage.setItem("agentpay_user", JSON.stringify(data.user));
  return data as { accessToken: string; user: AuthUser };
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  spendingLimit: number
) {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, spendingLimit }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Account creation failed");
  }

  return data;
}

export async function loginWithGoogle(credential: string) {
  const response = await fetch(`${API_URL}/api/users/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Google login failed");
  }

  localStorage.setItem("agentpay_access_token", data.accessToken);
  localStorage.setItem("agentpay_user", JSON.stringify(data.user));
  return data as { accessToken: string; user: AuthUser };
}

export function logoutUser() {
  localStorage.removeItem("agentpay_access_token");
  localStorage.removeItem("agentpay_user");
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("agentpay_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}


 
// Product Search
 

export async function searchProducts(message: string): Promise<SearchResponse> {
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

  return response.json() as Promise<SearchResponse>;
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


 
// Purchase Product
 
export async function purchaseProduct(
  productId: string
): Promise<PurchaseResponse> {
  const response = await fetch(
    `${API_URL}/api/agent/purchase`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },

      body: JSON.stringify({
        productId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Purchase failed"
    ) as Error & {
      status?: number;
      guardrail?: PurchaseResponse["guardrail"];
    };

    error.status = response.status;
    error.guardrail = data.guardrail;

    throw error;
  }

  return data as PurchaseResponse;
}


 
// Verify Razorpay Payment
 

export async function verifyPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<PaymentVerificationResponse> {
  const response = await fetch(
    `${API_URL}/api/agent/payment/verify`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
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

  return data as PaymentVerificationResponse;
}