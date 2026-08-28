import { useState } from "react";

import Navbar from "./components/Navbar";
import AgentChat from "./components/Agentchats";
import IntentPanel from "./components/IntentPanel";
import ProductGrid from "./components/ProductGrid";
import GuardrailPanel from "./components/GuardRailPanel";

import {
  searchProducts,
  purchaseProduct,
  verifyPayment,
} from "./services/api";
import type { AuthUser } from "./services/api";

import type {
  Product,
  CommerceIntent,
  GuardrailResult,
} from "./types";


// =====================================================
// TYPES
// =====================================================

// =====================================================
// APP
// =====================================================

function App() {

  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("agentpay_user");
    return storedUser ? JSON.parse(storedUser) as AuthUser : null;
  });

  // ===================================================
  // SEARCH STATE
  // ===================================================

  const [products, setProducts] =
    useState<Product[]>([]);

  const [intent, setIntent] =
    useState<CommerceIntent | null>(null);

 

  const [searchError, setSearchError] =
    useState("");


  // ===================================================
  // PURCHASE STATE
  // ===================================================

 const [processingProductId, setProcessingProductId] =
  useState<string | null>(null);

  const [purchaseError, setPurchaseError] =
    useState("");

  const [guardrail, setGuardrail] =
    useState<GuardrailResult | null>(null);

  const [paymentSuccess, setPaymentSuccess] =
    useState(false);
    const [paymentInfo, setPaymentInfo] =
  useState<{
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    status: string;
    productName: string;
  } | null>(null);


  // ===================================================
  // PRODUCT SEARCH
  // ===================================================

  const handleSearch = async (
    searchMessage: string
  ) => {

    if (!searchMessage.trim()) {
      return;
    }

    try {

      

      setSearchError("");

      setPurchaseError("");

      setGuardrail(null);

      setPaymentInfo(null);


      // -----------------------------------------------
      // Ask Supervisor + Product Agent
      // -----------------------------------------------

      const data =
        await searchProducts(
          searchMessage
        );


      // -----------------------------------------------
      // Update AI intent
      // -----------------------------------------------

      setIntent(
        data.intent
      );


      // -----------------------------------------------
      // Update products
      // -----------------------------------------------

      setProducts(
        data.products || []
      );

    } catch (error) {

      console.error(
        "AI search failed:",
        error
      );

      setSearchError(
        error instanceof Error
          ? error.message
          : "AI search failed. Please try again."
      );

      setProducts([]);

      setIntent(null);

    } 

     

    
  };


  // ===================================================
  // PURCHASE PRODUCT
  // ===================================================

  const handleBuy = async (
    product: Product
  ) => {

    try {

      if (!user) {
        setPurchaseError("Please log in before making a purchase.");
        return;
      }

      setProcessingProductId(product.id);

      setPurchaseError("");

      setPaymentSuccess(false);


      // -----------------------------------------------
      // STEP 1
      // Create purchase through backend
      // -----------------------------------------------

      const data =
        await purchaseProduct(
          product.id
        );


      // -----------------------------------------------
      // STEP 2
      // Check guardrail
      // -----------------------------------------------

      if (
        !data.guardrail ||
        data.guardrail.decision !==
          "APPROVED"
      ) {

        setGuardrail({
          ...(data.guardrail || {
            currentSpending: 0,
            requestedAmount: product.price,
            spendingLimit: 0,
            remainingLimit: 0,
          }),
          decision: "BLOCKED",
          reason: data.guardrail?.reason || "Purchase was blocked by the spending guardrail.",
        });


        setPurchaseError(
          data.guardrail?.reason ||
          "Purchase was blocked."
        );

        return;
      }


      // -----------------------------------------------
      // STEP 3
      // Show guardrail approval
      // -----------------------------------------------

      setGuardrail({
        ...data.guardrail,
      });


      // -----------------------------------------------
      // STEP 4
      // Make sure Razorpay order exists
      // -----------------------------------------------

      if (
        !data.razorpay ||
        !data.razorpay.orderId
      ) {

        throw new Error(
          "Razorpay order was not created."
        );
      }


      // -----------------------------------------------
      // STEP 5
      // Get Razorpay public key
      // -----------------------------------------------

      const razorpayKey =
        import.meta.env
          .VITE_RAZORPAY_KEY_ID;


      if (!razorpayKey) {

        throw new Error(
          "Razorpay Key ID is not configured."
        );
      }


      // -----------------------------------------------
      // STEP 6
      // Razorpay Checkout options
      // -----------------------------------------------

      const options: RazorpayOptions = {

        key:
          razorpayKey,

        amount:
          data.razorpay.amount,

        currency:
          data.razorpay.currency,

        name:
          "AgentPay AI",

        description:
          `Purchase ${product.name}`,

        order_id:
          data.razorpay.orderId,


        // ---------------------------------------------
        // Customer information
        // ---------------------------------------------

        prefill: {

          name:
            user.name,

          email:
            user.email,

        },


        // ---------------------------------------------
        // Checkout theme
        // ---------------------------------------------

        theme: {

          color:
            "#7c3aed",

        },


        // ---------------------------------------------
        // PAYMENT SUCCESS
        // ---------------------------------------------

        handler:
          async (response) => {

            try {

              console.log(
                "Razorpay payment response:",
                response
              );


              // -----------------------------------------
              // STEP 7
              // Verify payment on backend
              // -----------------------------------------

              const verification =
                await verifyPayment(

                  response
                    .razorpay_payment_id,

                  response
                    .razorpay_order_id,

                  response
                    .razorpay_signature

                );


              console.log(
                "Payment verified:",
                verification
              );


              // -----------------------------------------
              // STEP 8
              // Payment verified
              // -----------------------------------------

            


             setPaymentSuccess(true);

setPaymentInfo({
  orderId:
    verification.order.id,

  razorpayOrderId:
    verification.payment.orderId,

  razorpayPaymentId:
    verification.payment.paymentId,

  amount:
    verification.order.amount,

  status:
    verification.order.status,

  productName:
    verification.order.product?.name ||
    product.name,
});

setGuardrail((previous) => previous ? {
  ...previous,
  decision: "APPROVED",
  reason: "Payment completed and verified successfully.",
} : previous);

setPurchaseError("");

            } catch (error) {

              console.error(
                "Payment verification failed:",
                error
              );


              setPaymentSuccess(
                false
              );


              setPurchaseError(

                error instanceof Error
                  ? error.message
                  : "Payment verification failed."

              );

            }

          },


        // ---------------------------------------------
        // PAYMENT CHECKOUT CLOSED
        // ---------------------------------------------

        modal: {

          ondismiss: () => {

            setPurchaseError(
              "Payment was cancelled."
            );

          },

        },

      };


      // -----------------------------------------------
      // STEP 9
      // Open Razorpay Checkout
      // -----------------------------------------------

      const razorpay =
        new window.Razorpay(
          options
        );


      razorpay.open();

   } catch (error) {
  console.error(
    "Purchase failed:",
    error
  );

  setPaymentSuccess(false);

  // -----------------------------------------------
  // Handle spending guardrail rejection
  // -----------------------------------------------

  if (
    error instanceof Error &&
    "guardrail" in error
  ) {
    const purchaseError = error as Error & {
      status?: number;
      guardrail?: {
        decision: string;
        reason: string;
        currentSpending: number;
        requestedAmount: number;
        spendingLimit: number;
        remainingLimit: number;
      };
    };

    const guardrail =
      purchaseError.guardrail;

    if (
      purchaseError.status === 403 &&
      guardrail?.decision === "BLOCKED"
    ) {
      setGuardrail({
        ...guardrail,
        decision: "BLOCKED",
      });

      setPurchaseError(
        `You're out of budget. This product costs ₹${guardrail.requestedAmount.toLocaleString("en-IN")}, but you have only ₹${guardrail.remainingLimit.toLocaleString("en-IN")} remaining in your spending limit.`
      );

      return;
    }
  }

  // -----------------------------------------------
  // Other purchase errors
  // -----------------------------------------------

  setPurchaseError(
    error instanceof Error
      ? error.message
      : "Purchase failed. Please try again."
  );

} finally {
  setProcessingProductId(null);
}
  };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white">


      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar
        user={user}
        onLogin={setUser}
        onLogout={() => setUser(null)}
      />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-6 py-12">


        {/* =================================================
            AI CHAT
        ================================================= */}

        <AgentChat
          onProductSearch={
            handleSearch
          }
        />


        {/* =================================================
            SEARCH ERROR
        ================================================= */}

        {searchError && (

          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">

            {searchError}

          </div>

        )}


        {/* =================================================
            AI INTENT
        ================================================= */}

        <IntentPanel
          intent={intent}
        />


        {/* =================================================
            PRODUCT RECOMMENDATIONS
        ================================================= */}

    <ProductGrid
  products={products}
  onBuy={handleBuy}
  processingProductId={processingProductId}
/>


        {/* =================================================
            PURCHASE ERROR
        ================================================= */}

        {purchaseError && (

          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">

            {purchaseError}

          </div>

        )}


        {/* =================================================
            PAYMENT SUCCESS
        ================================================= */}

     {paymentSuccess && paymentInfo && (
  <section className="mt-16">

    <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-900 shadow-2xl shadow-emerald-950/20">

      {/* ================================================= */}
      {/* SUCCESS HEADER */}
      {/* ================================================= */}

      <div className="relative overflow-hidden border-b border-slate-800 px-6 py-10 text-center sm:px-10">

        {/* Glow */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">

          {/* Success icon */}

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-3xl text-emerald-400 shadow-lg shadow-emerald-500/10">
            ✓
          </div>

          <h3 className="mt-5 text-2xl font-bold text-white">
            Payment Successful
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your payment has been verified and your order has been
            successfully confirmed by AgentPay AI.
          </p>

          {/* Amount */}

          <div className="mt-6">

            <p className="text-xs font-medium uppercase tracking-widest text-slate-600">
              Amount Paid
            </p>

            <p className="mt-1 text-4xl font-bold tracking-tight text-white">
              ₹{paymentInfo.amount.toLocaleString("en-IN")}
            </p>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* ORDER DETAILS */}
      {/* ================================================= */}

      <div className="p-6 sm:p-8">

        {/* Product */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

          <div className="flex items-start justify-between gap-5">

            <div>

              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Purchased Product
              </p>

              <h4 className="mt-2 text-lg font-semibold text-white">
                {paymentInfo.productName}
              </h4>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-lg">
              🛍️
            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* VERIFICATION STEPS */}
        {/* ================================================= */}

        <div className="mt-5 grid gap-3 md:grid-cols-3">

          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">

            <div className="flex items-center gap-3">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                ✓
              </span>

              <div>
                <p className="text-sm font-medium text-slate-200">
                  Guardrail approved
                </p>

                <p className="text-xs text-slate-600">
                  Spending limit checked
                </p>
              </div>

            </div>

          </div>


          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">

            <div className="flex items-center gap-3">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                ✓
              </span>

              <div>
                <p className="text-sm font-medium text-slate-200">
                  Payment verified
                </p>

                <p className="text-xs text-slate-600">
                  Razorpay signature verified
                </p>
              </div>

            </div>

          </div>


          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">

            <div className="flex items-center gap-3">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                ✓
              </span>

              <div>
                <p className="text-sm font-medium text-slate-200">
                  Order confirmed
                </p>

                <p className="text-xs text-slate-600">
                  Transaction completed
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* TRANSACTION DETAILS */}
        {/* ================================================= */}

        <div className="mt-6 rounded-2xl border border-slate-800">

          <div className="border-b border-slate-800 px-5 py-4">

            <div className="flex items-center justify-between">

              <div>

                <h4 className="font-semibold text-slate-200">
                  Transaction Details
                </h4>

                <p className="mt-1 text-xs text-slate-600">
                  Secure payment information
                </p>

              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                {paymentInfo.status}
              </span>

            </div>

          </div>


          <div className="divide-y divide-slate-800">

            {/* AgentPay Order */}

            <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <span className="text-sm text-slate-500">
                AgentPay Order ID
              </span>

              <span className="break-all font-mono text-xs text-slate-300 sm:max-w-md sm:text-right">
                {paymentInfo.orderId}
              </span>

            </div>


            {/* Razorpay Order */}

            <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <span className="text-sm text-slate-500">
                Razorpay Order ID
              </span>

              <span className="break-all font-mono text-xs text-slate-300 sm:max-w-md sm:text-right">
                {paymentInfo.razorpayOrderId}
              </span>

            </div>


            {/* Payment ID */}

            <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <span className="text-sm text-slate-500">
                Razorpay Payment ID
              </span>

              <span className="break-all font-mono text-xs text-slate-300 sm:max-w-md sm:text-right">
                {paymentInfo.razorpayPaymentId}
              </span>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* FINAL MESSAGE */}
        {/* ================================================= */}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">

          <span className="mt-0.5 text-lg">
            🤖
          </span>

          <div>

            <p className="text-sm font-semibold text-violet-300">
              AgentPay AI completed the transaction
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              The AI agent evaluated your request, checked the spending
              guardrail, created the Razorpay order, and verified the
              payment before confirming this purchase.
            </p>

          </div>

        </div>

      </div>

    </div>

  </section>
)}


        {/* =================================================
            PURCHASE GUARDRAIL
        ================================================= */}

        <GuardrailPanel guardrail={guardrail} />

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-600">

        AgentPay AI · AI-powered agentic commerce

      </footer>


    </div>

  );
}

export default App;