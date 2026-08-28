import type { GuardrailResult } from "../types";

type GuardrailPanelProps = {
  guardrail: GuardrailResult | null;
};

function GuardrailPanel({
  guardrail,
}: GuardrailPanelProps) {
  const approved = guardrail?.decision === "APPROVED";

  const spendingPercentage =
    guardrail && guardrail.spendingLimit > 0
      ? Math.min(
          (guardrail.currentSpending +
            guardrail.requestedAmount) /
            guardrail.spendingLimit *
            100,
          100
        )
      : 0;

  return (
    <section className="mt-16">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6 flex items-end justify-between">

        <div>
          <div className="flex items-center gap-2">

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              🛡️
            </span>

            <h3 className="text-xl font-semibold text-white">
              AI Purchase Guardrail
            </h3>

          </div>

          <p className="mt-2 text-sm text-slate-500">
            Every money action is checked before execution
          </p>
        </div>

        <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Protection active
        </span>

      </div>


      {/* ================================================= */}
      {/* MAIN CARD */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">

        {/* Status header */}

        <div
          className={`border-b px-5 py-4 ${
            !guardrail
              ? "border-slate-800"
              : approved
                ? "border-emerald-500/10 bg-emerald-500/[0.02]"
                : "border-red-500/10 bg-red-500/[0.02]"
          }`}
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  !guardrail
                    ? "bg-slate-800 text-slate-500"
                    : approved
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                }`}
              >
                {!guardrail
                  ? "🛡️"
                  : approved
                    ? "✓"
                    : "!"
                }
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-200">
                  {!guardrail
                    ? "Guardrail ready"
                    : approved
                      ? "Purchase authorized"
                      : "Purchase blocked"}
                </p>

                <p className="mt-0.5 text-xs text-slate-600">
                  {!guardrail
                    ? "Waiting for a purchase request"
                    : approved
                      ? "Transaction is within your authorized spending limit"
                      : "Transaction exceeds your authorized spending limit"}
                </p>

              </div>

            </div>


            {guardrail && (
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  approved
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {approved
                  ? "APPROVED"
                  : "BLOCKED"}
              </span>
            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {!guardrail ? (

          <div className="px-6 py-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-2xl">
              🛡️
            </div>

            <h4 className="mt-5 font-semibold text-slate-300">
              Your purchases are protected
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              When you attempt a purchase, AgentPay checks your spending
              limit before allowing the transaction to proceed.
            </p>

          </div>

        ) : (

          <>
            {/* ================================================= */}
            {/* FINANCIAL DETAILS */}
            {/* ================================================= */}

            <div className="grid gap-px bg-slate-800 sm:grid-cols-2 lg:grid-cols-4">

              {/* Requested */}

              <div className="bg-slate-900 p-5">

                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  Requested
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  ₹{guardrail.requestedAmount.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Current purchase
                </p>

              </div>


              {/* Current spending */}

              <div className="bg-slate-900 p-5">

                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  Current Spending
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  ₹{guardrail.currentSpending.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Already spent
                </p>

              </div>


              {/* Spending limit */}

              <div className="bg-slate-900 p-5">

                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  Spending Limit
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  ₹{guardrail.spendingLimit.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Your authorization limit
                </p>

              </div>


              {/* Remaining */}

              <div className="bg-slate-900 p-5">

                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  Remaining
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    guardrail.remainingLimit >=
                    guardrail.requestedAmount
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  ₹{guardrail.remainingLimit.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Available before purchase
                </p>

              </div>

            </div>


            {/* ================================================= */}
            {/* BUDGET PROGRESS */}
            {/* ================================================= */}

            <div className="border-t border-slate-800 px-5 py-5">

              <div className="flex items-center justify-between">

                <p className="text-xs font-medium text-slate-500">
                  Spending utilization
                </p>

                <p className="text-xs text-slate-600">
                  {Math.round(spendingPercentage)}%
                </p>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    approved
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${spendingPercentage}%`,
                  }}
                />

              </div>

            </div>


            {/* ================================================= */}
            {/* DECISION */}
            {/* ================================================= */}

            <div className="border-t border-slate-800 px-5 py-5">

              <div
                className={`rounded-xl border p-4 ${
                  approved
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >

                <div className="flex items-start gap-3">

                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      approved
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {approved ? "✓" : "!"}
                  </span>

                  <div>

                    <p
                      className={`text-sm font-semibold ${
                        approved
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {approved
                        ? "Purchase approved"
                        : "Purchase blocked"}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {guardrail.reason}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* ================================================= */}
            {/* SECURITY PIPELINE */}
            {/* ================================================= */}

            <div className="border-t border-slate-800 px-5 py-4">

              <div className="flex flex-wrap items-center gap-2 text-xs">

                <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-400">
                  ✓ Spending checked
                </span>

                <span className="text-slate-700">
                  →
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 ${
                    approved
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {approved
                    ? "✓ Transaction authorized"
                    : "✕ Transaction blocked"}
                </span>

                {approved && (
                  <>
                    <span className="text-slate-700">
                      →
                    </span>

                    <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-300">
                      Razorpay ready
                    </span>
                  </>
                )}

              </div>

            </div>

          </>

        )}

      </div>

    </section>
  );
}

export default GuardrailPanel;