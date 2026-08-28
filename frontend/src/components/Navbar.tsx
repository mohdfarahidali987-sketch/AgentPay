import { useEffect, useRef, useState, type FormEvent } from "react";
import { createUser, loginUser, loginWithGoogle, logoutUser } from "../services/api";
import type { AuthUser } from "../services/api";

type NavbarProps = {
  user: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number }) => void;
        };
      };
    };
  }
}

function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("5000");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!showLogin || isSignup || !clientId || !window.google || !googleButtonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setLoading(true);
        setError("");
        try {
          const result = await loginWithGoogle(credential);
          onLogin(result.user);
          setShowLogin(false);
        } catch (googleError) {
          setError(googleError instanceof Error ? googleError.message : "Google login failed");
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: 280,
    });
  }, [isSignup, onLogin, showLogin]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        await createUser(name, email, password, Number(spendingLimit));
      }
      const result = await loginUser(email, password);
      onLogin(result.user);
      setShowLogin(false);
      setEmail("");
      setName("");
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="relative border-b border-slate-800 bg-slate-950/80 backdrop-blur">
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

        <div className="flex items-center gap-4">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />

          <span className="text-sm text-slate-300">
            Agent Online
          </span>
          {user ? (
            <button className="text-sm text-slate-300 hover:text-white" onClick={() => { logoutUser(); onLogout(); }}>
              {user.name} · Logout
            </button>
          ) : (
            <>
              <button className="text-sm text-slate-300 hover:text-white" onClick={() => { setIsSignup(true); setShowLogin(true); }}>
                Create account
              </button>
              <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500" onClick={() => { setIsSignup(false); setShowLogin(true); }}>
                Login
              </button>
            </>
          )}
        </div>

      </div>

      {showLogin && (
        <div className="absolute right-6 top-20 z-10 w-80 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{isSignup ? "Create account" : "Login"}</h2>
            <button className="text-slate-400 hover:text-white" onClick={() => setShowLogin(false)} aria-label="Close login">×</button>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            {isSignup && (
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
            {isSignup && (
              <input
                type="number"
                min="1"
                required
                value={spendingLimit}
                onChange={(event) => setSpendingLimit(event.target.value)}
                placeholder="Spending limit"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button disabled={loading} className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold disabled:opacity-50">
              {loading ? "Please wait..." : isSignup ? "Create account" : "Continue"}
            </button>
            <button type="button" className="w-full text-sm text-slate-400 hover:text-white" onClick={() => { setIsSignup(!isSignup); setError(""); }}>
              {isSignup ? "Already have an account? Login" : "New here? Create an account"}
            </button>
            {!isSignup && (
              <>
                <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-700" />or<span className="h-px flex-1 bg-slate-700" /></div>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <div ref={googleButtonRef} className="flex justify-center" />
                ) : (
                  <p className="text-center text-xs text-slate-500">Google login requires VITE_GOOGLE_CLIENT_ID.</p>
                )}
              </>
            )}
          </form>
        </div>
      )}
    </nav>
  );
}

export default Navbar;