type GuardrailPanelProps = {
  amount?: number;
  decision?: "APPROVED" | "BLOCKED" | null;
  reason?: string;
};

function GuardrailPanel({
  amount,
  decision,
  reason,
}: GuardrailPanelProps) {

  const approved = decision === "APPROVED";
 

  return (
    <section className="mt-16">

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            🛡️
          </div>

          <div>
            <h3 className="font-semibold">
              AI Purchase Guardrail
            </h3>

            <p className="text-sm text-slate-500">
              Every money action is checked before execution
            </p>
          </div>

        </div>

        {!decision ? (

          <div className="mt-6 rounded-xl bg-slate-800/50 p-5 text-center text-slate-500">
            No purchase requested yet.
          </div>

        ) : (

          <>
            <div className="mt-6 grid gap-4 md:grid-cols-4">

              <div>
                <p className="text-sm text-slate-500">
                  Requested
                </p>

                <p className="mt-1 text-xl font-semibold">
                  ₹{amount?.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Spending Limit
                </p>

                <p className="mt-1 text-xl font-semibold">
                  ₹5,000
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p
                  className={`mt-1 text-xl font-semibold ${
                    approved
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {decision}
                </p>
              </div>

              <div className="flex items-center">

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    approved
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {approved
                    ? "✓ PURCHASE APPROVED"
                    : "✕ PURCHASE BLOCKED"}
                </span>

              </div>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              {reason}
            </p>
          </>

        )}

      </div>

    </section>
  );
}

export default GuardrailPanel;