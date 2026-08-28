import { useState } from "react";
import { chatWithAgent } from "../services/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AgentChatProps = {
  onProductSearch: (message: string) => void;
};

function AgentChat({
  onProductSearch,
}: AgentChatProps) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm AgentPay AI. I can help you find products, compare options, and make purchases safely.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    setMessage("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    try {
      setLoading(true);

      const data = await chatWithAgent(userMessage);

      /*
       * If Supervisor detects a product search,
       * let the parent load the products.
       */
      if (data.intent === "SEARCH_PRODUCT") {
        onProductSearch(userMessage);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sure! 🔎 I'll find the best matching products for you.",
          },
        ]);

        return;
      }

      /*
       * Normal conversation.
       */
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.response ||
            "I'm here to help with your shopping needs.",
        },
      ]);
    } catch (error) {
      console.error("Chat failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process that request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <section className="mx-auto max-w-4xl">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-8 text-center">

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300">

          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-xs">
            ✦
          </span>

          AI Shopping Agent

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

        </div>


        <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">

          Shop smarter.

          <br />

          <span className="text-violet-400">
            Talk to your AI agent.
          </span>

        </h2>


        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
          Tell AgentPay what you need in natural language.
          Your AI agent understands your request and helps you
          complete the purchase safely.
        </p>

      </div>


      {/* ================================================= */}
      {/* CHAT CONTAINER */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/20">

        {/* ================================================= */}
        {/* CHAT HEADER */}
        {/* ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-lg">
              🤖
            </div>

            <div>

              <div className="flex items-center gap-2">

                <p className="text-sm font-semibold text-slate-200">
                  AgentPay Assistant
                </p>

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              </div>

              <p className="text-xs text-slate-600">
                AI commerce agent · Online
              </p>

            </div>

          </div>


          <span className="hidden rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-600 sm:block">
            Natural Language
          </span>

        </div>


        {/* ================================================= */}
        {/* MESSAGES */}
        {/* ================================================= */}

        <div className="max-h-[420px] min-h-[280px] space-y-5 overflow-y-auto p-5 sm:p-6">

          {messages.map((msg, index) => {

            const isUser = msg.role === "user";

            return (
              <div
                key={index}
                className={`flex items-end gap-3 ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {/* AI avatar */}

                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm">
                    ✦
                  </div>
                )}


                <div
                  className={`max-w-[82%] px-4 py-3.5 text-sm leading-6 ${
                    isUser
                      ? "rounded-2xl rounded-br-md bg-violet-600 text-white shadow-lg shadow-violet-950/20"
                      : "rounded-2xl rounded-bl-md border border-slate-800 bg-slate-800/70 text-slate-300"
                  }`}
                >
                  {msg.content}
                </div>

              </div>
            );
          })}


          {/* ================================================= */}
          {/* THINKING INDICATOR */}
          {/* ================================================= */}

          {loading && (
            <div className="flex items-end gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm">
                ✦
              </div>

              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-800 bg-slate-800/70 px-4 py-4">

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />

              </div>

            </div>
          )}

        </div>


        {/* ================================================= */}
        {/* INPUT AREA */}
        {/* ================================================= */}

        <div className="border-t border-slate-800 bg-slate-950/40 p-4">

          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-1.5 transition-colors focus-within:border-violet-500/50">

            <div className="flex items-center">

              <div className="pl-3 text-slate-600">
                ✦
              </div>

              <input
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask AgentPay anything..."
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
              />

              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !message.trim()
                }
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span className="hidden sm:inline">
                      Thinking
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Send
                    </span>
                    <span className="text-base">
                      →
                    </span>
                  </>
                )}

              </button>

            </div>

          </div>


          {/* Input hint */}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">

            <p className="text-[11px] text-slate-700">
              Try: "Find gaming accessories under ₹5,000"
            </p>

            <p className="text-[11px] text-slate-700">
              Press Enter to send
            </p>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* CAPABILITIES */}
      {/* ================================================= */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">

          <div className="flex items-center gap-2">

            <span className="text-sm text-violet-400">
              🔎
            </span>

            <span className="text-xs font-medium text-slate-400">
              Understands requests
            </span>

          </div>

        </div>


        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">

          <div className="flex items-center gap-2">

            <span className="text-sm text-emerald-400">
              🛡️
            </span>

            <span className="text-xs font-medium text-slate-400">
              Checks spending limits
            </span>

          </div>

        </div>


        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">

          <div className="flex items-center gap-2">

            <span className="text-sm text-yellow-400">
              ⚡
            </span>

            <span className="text-xs font-medium text-slate-400">
              Executes purchases
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default AgentChat;