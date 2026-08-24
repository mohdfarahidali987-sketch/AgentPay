import type { CommerceIntent } from "../types";

type IntentPanelProps = {
  intent: CommerceIntent | null;
};

function IntentPanel({ intent }: IntentPanelProps) {
  return (
    <section className="mt-16">

      <div className="mb-5">
        <h3 className="text-xl font-semibold">
          AI Understanding
        </h3>

        <p className="text-sm text-slate-500">
          Supervisor Agent analyzed your request
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">
            Intent
          </p>

          <p className="mt-2 font-semibold text-violet-400">
            {intent?.intent || "Waiting for request"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">
            Category
          </p>

          <p className="mt-2 font-semibold">
            {intent?.query || "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">
            Maximum Price
          </p>

          <p className="mt-2 font-semibold">
            {intent?.maxPrice
              ? `₹${intent.maxPrice.toLocaleString()}`
              : "—"}
          </p>
        </div>

      </div>

    </section>
  );
}

export default IntentPanel;