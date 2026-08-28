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

  const [purchaseLoading, setPurchaseLoading] =
    useState(false);

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

      setPurchaseLoading(true);

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

              setPaymentSuccess(
                true
              );


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


      setPurchaseError(

        error instanceof Error
          ? error.message
          : "Purchase failed."

      );

    } finally {

      setPurchaseLoading(
        false
      );

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

          products={
            products
          }

          onBuy={
            handleBuy
          }

          purchaseLoading={
            purchaseLoading
          }

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
  <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900">

    {/* Header */}

    <div className="border-b border-slate-800 bg-emerald-500/5 p-6">

      <div className="flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-400">
          ✓
        </div>

        <div>

          <h3 className="text-xl font-semibold text-emerald-400">
            Payment Successful
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Your payment has been verified successfully by AgentPay AI.
          </p>

        </div>

      </div>

    </div>


    {/* Order Information */}

    <div className="p-6">

      <div className="mb-6">

        <h4 className="text-lg font-semibold">
          Order Confirmation
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          Your purchase has been successfully processed.
        </p>

      </div>


      <div className="grid gap-4 md:grid-cols-2">


        {/* Product */}

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-sm text-slate-500">
            Product
          </p>

          <p className="mt-2 font-semibold">
            {paymentInfo.productName}
          </p>

        </div>


        {/* Amount */}

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-sm text-slate-500">
            Amount Paid
          </p>

          <p className="mt-2 text-xl font-bold text-white">
            ₹{paymentInfo.amount.toLocaleString()}
          </p>

        </div>


        {/* Order ID */}

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-sm text-slate-500">
            AgentPay Order ID
          </p>

          <p className="mt-2 break-all font-mono text-sm text-slate-300">
            {paymentInfo.orderId}
          </p>

        </div>


        {/* Status */}

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-sm text-slate-500">
            Order Status
          </p>

          <p className="mt-2 font-semibold text-emerald-400">
            {paymentInfo.status}
          </p>

        </div>


        {/* Razorpay Order ID */}

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-sm text-slate-500">
            Razorpay Order ID
          </p>

          <p className="mt-2 break-all font-mono text-sm text-slate-300">
            {paymentInfo.razorpayOrderId}
          </p>

        </div>


        {/* Razorpay Payment ID */}

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-sm text-slate-500">
            Razorpay Payment ID
          </p>

          <p className="mt-2 break-all font-mono text-sm text-slate-300">
            {paymentInfo.razorpayPaymentId}
          </p>

        </div>

      </div>


      {/* Verification */}

      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

        <div className="flex items-center gap-3">

          <span className="text-emerald-400">
            ✓
          </span>

          <div>

            <p className="font-medium text-emerald-400">
              Payment Verified
            </p>

            <p className="text-sm text-slate-500">
              Razorpay payment signature was successfully verified by the AgentPay backend.
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