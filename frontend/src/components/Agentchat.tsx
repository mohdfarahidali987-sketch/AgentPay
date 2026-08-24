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

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        content:
          "Hi! 👋 I'm AgentPay AI. I can help you find products, compare options, and make purchases safely.",
      },
    ]);

  const [loading, setLoading] =
    useState(false);

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

      const data =
        await chatWithAgent(
          userMessage
        );

      /*
       * If Supervisor detects a product
       * search, let the parent load products.
       */
      if (
        data.intent ===
        "SEARCH_PRODUCT"
      ) {
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

      console.error(
        "Chat failed:",
        error
      );

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
    <section className="mx-auto max-w-3xl">

      <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
        🤖 AI Shopping Agent
      </div>

      <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
        Shop smarter.
        <br />

        <span className="text-violet-400">
          Talk to your AI agent.
        </span>
      </h2>

      <p className="mt-5 text-lg text-slate-400">
        Tell AgentPay what you need in
        natural language.
      </p>


      {/* Chat window */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

        <div className="max-h-80 space-y-4 overflow-y-auto p-5">

          {messages.map(
            (msg, index) => (

              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.content}
                </div>

              </div>

            )
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-400">
                Thinking...
              </div>
            </div>
          )}

        </div>


        {/* Input */}

        <div className="border-t border-slate-800 p-3">

          <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">

            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask AgentPay anything..."
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !message.trim()
              }
              className="rounded-lg bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "..."
                : "Send"}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default AgentChat;