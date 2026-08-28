import type { CommerceIntent } from "../types";

type IntentPanelProps = {
  intent: CommerceIntent | null;
};

function IntentPanel({ intent }: IntentPanelProps) {
  const isWaiting = !intent;

  const formatIntent = (value?: string) => {
    if (!value) return "Waiting for request";

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatPreference = (value?: string) => {
    if (!value) return "Not specified";

    return value.charAt(0) + value.slice(1).toLowerCase();
  };

  return (
    <section className="mt-16">

      {/* Header */}
      <div className="mb-6 flex items-end justify-between">

        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              ✦
            </span>

            <h3 className="text-xl font-semibold text-white">
              AI Understanding
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Supervisor Agent analyzed your request
          </p>
        </div>

        {!isWaiting && (
          <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Intent detected
          </span>
        )}

      </div>

      {/* Main panel */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">

        {/* Top status bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              🤖
            </div>

            <div>
              <p className="text-sm font-medium text-slate-200">
                Supervisor Agent
              </p>

              <p className="text-xs text-slate-600">
                Intent classification & extraction
              </p>
            </div>

          </div>

          <span className="text-xs text-slate-600">
            {isWaiting ? "Idle" : "Completed"}
          </span>

        </div>

        {/* Analysis grid */}
        <div className="grid gap-px bg-slate-800 md:grid-cols-4">

          {/* Intent */}
          <div className="bg-slate-900 p-5 transition hover:bg-slate-800/70">

            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Intent
            </p>

            <div className="mt-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-violet-400" />

              <p className="font-semibold text-violet-300">
                {formatIntent(intent?.intent)}
              </p>

            </div>

          </div>

          {/* Product / Category */}
          <div className="bg-slate-900 p-5 transition hover:bg-slate-800/70">

            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Product / Category
            </p>

            <p className="mt-3 font-semibold text-white">
              {intent?.query || "Not specified"}
            </p>

          </div>

          {/* Preference */}
          <div className="bg-slate-900 p-5 transition hover:bg-slate-800/70">

            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Preference
            </p>

            <p className="mt-3 font-semibold text-white">
              {formatPreference(intent?.preference)}
            </p>

          </div>

          {/* Budget */}
          <div className="bg-slate-900 p-5 transition hover:bg-slate-800/70">

            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Maximum Budget
            </p>

            <p className="mt-3 font-semibold text-white">
              {intent?.maxPrice
                ? `₹${intent.maxPrice.toLocaleString("en-IN")}`
                : "No limit specified"}
            </p>

          </div>

        </div>

        {/* AI response */}
        {intent?.response && (
          <div className="border-t border-slate-800 px-5 py-4">

            <div className="flex gap-3">

              <span className="mt-0.5 text-violet-400">
                ✦
              </span>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  Agent response
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {intent.response}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* Processing pipeline */}
        {!isWaiting && (
          <div className="border-t border-slate-800 px-5 py-4">

            <div className="flex flex-wrap items-center gap-2 text-xs">

              <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-400">
                ✓ Intent detected
              </span>

              <span className="text-slate-700">
                →
              </span>

              <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-300">
                ✓ Query extracted
              </span>

              <span className="text-slate-700">
                →
              </span>

              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-blue-300">
                ✓ Preferences analyzed
              </span>

              {intent?.maxPrice && (
                <>
                  <span className="text-slate-700">
                    →
                  </span>

                  <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-amber-300">
                    ✓ Budget extracted
                  </span>
                </>
              )}

            </div>

          </div>
        )}

      </div>

    </section>
  );
}

export default IntentPanel;