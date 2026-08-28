export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  reviewCount: number;
  brand: string | null;
  attributes: Record<string, unknown> | null;
  aiScore?: number;
  rankingReasons?: string[];
};

export type CommerceIntent = {
  intent: string;
  query?: string;
  maxPrice?: number | null;
  preference?: "QUALITY" | "PRICE" | "BALANCED";
  response?: string;
};

export type SearchResponse = {
  intent: CommerceIntent;
  products: Product[];
  count: number;
};

export type GuardrailResult = {
  decision: "APPROVED" | "BLOCKED";
  reason: string;
  currentSpending: number;
  requestedAmount: number;
  spendingLimit: number;
  remainingLimit: number;
};

export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "BLOCKED"
  | "PAYMENT_CREATED"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export type Order = {
  id: string;
  amount: number;
  status: OrderStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  product?: Product;
};

export type PurchaseResponse = {
  message: string;
  order: Order;
  guardrail: GuardrailResult;
  razorpay: {
    orderId: string;
    amount: number;
    currency: string;
  };
};

export type PaymentVerificationResponse = {
  success: boolean;
  message: string;
  payment: {
    paymentId: string;
    orderId: string;
  };
  order: Order;
};