type HeroSearchProps = {
  message: string;
  setMessage: (message: string) => void;
  onSearch: () => void;
  loading: boolean;
};

function HeroSearch({
  message,
  setMessage,
  onSearch,
  loading,
}: HeroSearchProps) {
  const exampleQueries = [
    "Find the best monitor under ₹25000",
    "Show me cheap accessories",
    "I need a laptop for coding",
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-4 text-center">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />

      {/* Agent badge */}
      <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 shadow-lg shadow-violet-950/20">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span>AI Shopping Agent</span>
      </div>

      {/* Heading */}
      <h2 className="text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
        Tell me what you need.
        <br />

        <span className="bg-gradient-to from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
          I'll handle the commerce.
        </span>
      </h2>

      {/* Description */}
      <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
        Describe a product in natural language. AgentPay AI understands your
        intent, finds and ranks products, protects your spending limit, and
        handles the purchase through Razorpay.
      </p>

      {/* Search box */}
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="group relative rounded-2xl bg-gradient-to from-violet-600/40 via-purple-500/20 to-fuchsia-600/40 p-[1px] shadow-2xl shadow-violet-950/30">

          <div className="flex items-center rounded-2xl bg-slate-950 p-2 transition-all duration-300 group-focus-within:shadow-lg group-focus-within:shadow-violet-950/40">

            {/* Search icon */}
            <div className="hidden pl-4 text-slate-500 sm:block">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  onSearch();
                }
              }}
              placeholder="Ask your AI shopping agent..."
              className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base text-white outline-none placeholder:text-slate-600"
            />

            <button
              onClick={onSearch}
              disabled={loading || !message.trim()}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-900/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Thinking
                </>
              ) : (
                <>
                  Ask AI
                  <span className="text-lg">→</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Example queries */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <span className="mr-1 py-2 text-xs text-slate-600">
            Try:
          </span>

          {exampleQueries.map((query) => (
            <button
              key={query}
              onClick={() => setMessage(query)}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 transition hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-violet-300"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Trust / capability indicators */}
      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="text-violet-400">✦</span>
          Natural language
        </span>

        <span className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          Spending protected
        </span>

        <span className="flex items-center gap-2">
          <span className="text-blue-400">₹</span>
          Razorpay payments
        </span>

        <span className="flex items-center gap-2">
          <span className="text-amber-400">◆</span>
          AI product ranking
        </span>
      </div>

    </section>
  );
}

export default HeroSearch;