function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        <div>
          <h1 className="text-2xl font-bold">
            AgentPay{" "}
            <span className="text-violet-400">
              AI
            </span>
          </h1>

          <p className="text-xs text-slate-500">
            Agentic Commerce Platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />

          <span className="text-sm text-slate-300">
            Agent Online
          </span>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;