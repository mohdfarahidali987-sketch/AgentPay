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
  return (
    <section className="mx-auto max-w-3xl text-center">

      <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
        🤖 AI Shopping Agent
      </div>

      <h2 className="text-5xl font-bold tracking-tight">
        Shop smarter.
        <br />

        <span className="text-violet-400">
          Let AI handle the commerce.
        </span>
      </h2>

      <p className="mt-6 text-lg text-slate-400">
        Describe what you want. AgentPay AI searches products,
        checks your spending limits, and handles the purchase flow.
      </p>

      <div className="mt-10 flex rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
          placeholder="Show me accessories below ₹2000..."
          className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />

        <button
          onClick={onSearch}
          disabled={loading}
          className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>

      </div>

    </section>
  );
}

export default HeroSearch;