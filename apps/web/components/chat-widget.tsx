"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";

type Msg = { id: number; role: "user" | "assistant"; text: string; failed?: boolean };
type ChatEvent = { type: "session" | "text" | "tool" | "error" | "done"; text?: string; sessionId?: string };

const TOOL_LABELS: Record<string, string> = {
  search_products: "Searching the catalog…",
  check_stock: "Checking stock…",
  get_return_policy: "Reading the returns policy…",
  list_my_orders: "Looking up your orders…",
  get_order_status: "Checking your order…",
};

const SUGGESTIONS = ["Where is my order?", "What is your return policy?", "Is the Velocity Runner in size 43?"];

const GREETING = "Hi! I'm Gia, Gym Shop's support assistant. I can help with orders, sizing, stock and returns.";

/**
 * The panel is keyed by user id, so logging in or out starts a fresh conversation
 * (the backend ties chat sessions to the user), while the open/closed state is kept.
 */
export function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return <ChatPanel key={user?.id ?? "guest"} open={open} setOpen={setOpen} />;
}

function ChatPanel({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const sessionId = useRef<string | null>(null);
  const nextId = useRef(1);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, status, open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    const assistantId = nextId.current + 1;
    setMessages((m) => [...m, { id: nextId.current, role: "user", text: message }, { id: assistantId, role: "assistant", text: "" }]);
    nextId.current += 2;

    const patch = (fn: (m: Msg) => Msg) => setMessages((all) => all.map((m) => (m.id === assistantId ? fn(m) : m)));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, message }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        patch((m) => ({ ...m, text: data?.error ?? "Sorry, something went wrong.", failed: true }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const evt = JSON.parse(line.slice(5).trim()) as ChatEvent;
          if (evt.type === "session" && evt.sessionId) sessionId.current = evt.sessionId;
          else if (evt.type === "text") {
            setStatus(null);
            patch((m) => ({ ...m, text: m.text + (evt.text ?? "") }));
          } else if (evt.type === "tool") setStatus(TOOL_LABELS[evt.text ?? ""] ?? "Working on it…");
          else if (evt.type === "error") patch((m) => ({ ...m, text: m.text || (evt.text ?? "Something went wrong."), failed: true }));
        }
      }
    } catch {
      patch((m) => ({ ...m, text: m.text || "Sorry, I couldn't reach the server.", failed: true }));
    } finally {
      setStatus(null);
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand px-5 py-3 font-semibold text-white shadow-lg hover:bg-brand-dark"
        aria-label="Open support chat"
        data-testid="chat-toggle"
      >
        <span aria-hidden>💬</span> Support
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label="Support chat"
      className="fixed bottom-5 right-5 z-40 flex h-[32rem] max-h-[calc(100vh-2.5rem)] w-96 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl"
      data-testid="chat-panel"
    >
      <header className="flex items-center justify-between bg-zinc-900 px-4 py-3 text-white">
        <div>
          <p className="font-semibold">Gia · Support</p>
          <p className="text-xs text-zinc-400">AI assistant</p>
        </div>
        <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-zinc-800" aria-label="Close support chat" data-testid="chat-close">
          ✕
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" data-testid="chat-messages" aria-live="polite">
        <div className="max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2" data-testid="chat-greeting">
          {GREETING}
        </div>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100" data-testid="chat-suggestion">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-lg bg-brand px-3 py-2 text-white" data-testid="chat-message-user">
              {m.text}
            </div>
          ) : (
            <div
              key={m.id}
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 ${m.failed ? "bg-red-50 text-red-800" : "bg-zinc-100"}`}
              data-testid="chat-message-assistant"
              data-streaming={busy && m.id === messages[messages.length - 1].id}
            >
              {m.text || <span className="text-zinc-400">…</span>}
            </div>
          ),
        )}
        {status && (
          <p className="text-xs italic text-zinc-500" data-testid="chat-status">
            {status}
          </p>
        )}
        <div ref={bottom} />
      </div>

      <form
        className="flex gap-2 border-t border-zinc-200 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about orders, sizing, returns…"
          className="input"
          maxLength={2000}
          aria-label="Message"
          data-testid="chat-input"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary" data-testid="chat-send">
          Send
        </button>
      </form>
    </section>
  );
}
