"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversations } from "./useConversations";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import RetryToast from "./RetryToast";

const STARTERS = [
  "What is the Islamic Dilemma?",
  "Does the Quran affirm or deny the crucifixion of Jesus?",
  "How well was the Quran preserved textually?",
  "What does the Sana'a palimpsest show?",
];

export default function ChatApp() {
  const {
    conversations,
    active,
    activeId,
    newChat,
    selectChat,
    deleteChat,
    createWith,
    setMessages,
  } = useConversations();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // collapsed by default
  const [toastUntil, setToastUntil] = useState(null);
  const scrollRef = useRef(null);

  const closeToast = useCallback(() => setToastUntil(null), []);

  // Desktop sidebar collapse, persisted; defaults to collapsed for new visitors.
  useEffect(() => {
    const v = localStorage.getItem("eiw-chat-sidebar-collapsed");
    if (v !== null) setCollapsed(v === "1");
  }, []);
  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("eiw-chat-sidebar-collapsed", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Lock page scroll so the chat is a self-contained viewport (no scroll to footer).
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  const messages = active?.messages ?? [];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function submit(text) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setBusy(true);

    const userMsg = { role: "user", content: trimmed };
    const priorMessages = active?.messages ?? [];
    const outgoing = [...priorMessages, userMsg];

    let convoId = activeId;
    const createdNew = !convoId || !active;
    if (createdNew) {
      convoId = createWith(userMsg);
      setMessages(convoId, (msgs) => [...msgs, { role: "assistant", content: "" }]);
    } else {
      setMessages(convoId, (msgs) => [
        ...msgs,
        userMsg,
        { role: "assistant", content: "" },
      ]);
    }

    // Undo the optimistic turn (used when the request was never processed).
    const rollback = () => {
      if (createdNew) deleteChat(convoId);
      else setMessages(convoId, (msgs) => msgs.slice(0, -2));
      setInput(trimmed);
    };

    const setLastAssistant = (content) =>
      setMessages(convoId, (msgs) => {
        const copy = msgs.slice();
        copy[copy.length - 1] = { role: "assistant", content };
        return copy;
      });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outgoing }),
      });
      if (res.status === 429) {
        const retry = Number(res.headers.get("Retry-After")) || 30;
        rollback();
        setToastUntil(Date.now() + retry * 1000);
        return;
      }
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setLastAssistant(acc);
      }
      if (!acc) setLastAssistant("_No response. Please try again._");
    } catch (err) {
      setLastAssistant(`_${err.message || "Something went wrong."}_`);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-61px)] overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onNew={() => {
          newChat();
          setSidebarOpen(false);
        }}
        onSelect={(id) => {
          selectChat(id);
          setSidebarOpen(false);
        }}
        onDelete={deleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          {/* Mobile: open the conversation drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open conversations"
            className="rounded p-1.5 text-ink hover:bg-page md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          {/* Desktop: collapse / expand the sidebar */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded p-1.5 text-ink hover:bg-page md:inline-flex"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-heading">Ask the compendium</span>
          <button
            onClick={() => {
              newChat();
              setSidebarOpen(false);
            }}
            aria-label="New chat"
            title="New chat"
            className="ml-auto rounded p-1.5 text-ink hover:bg-page"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.length === 0 ? (
              <EmptyState onPick={submit} disabled={busy} />
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <ChatMessage
                    key={i}
                    role={m.role}
                    content={m.content}
                    streaming={
                      busy && i === messages.length - 1 && m.role === "assistant"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-line bg-surface/80 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask about the Islamic Dilemma, preservation, the crucifixion…"
              className="max-h-40 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-line bg-page px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-brand-2"
            />
            <button
              onClick={() => submit(input)}
              disabled={busy || !input.trim()}
              className="h-11 shrink-0 rounded-xl bg-[image:var(--grad-brand)] px-4 text-sm font-semibold text-oncolor transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "…" : "Send"}
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted">
            Grounded in the compendium's reviewed issues. May be imperfect —
            follow the source links to verify.
          </p>
        </div>
      </div>

      {toastUntil && <RetryToast until={toastUntil} onClose={closeToast} />}
    </div>
  );
}

function EmptyState({ onPick, disabled }) {
  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <h1 className="font-serif text-2xl font-semibold text-heading">
        Ask the compendium
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        Ask about any argument in <em>Examining Islam from Within</em>. Answers are
        grounded in the reviewed issues and link to their sources.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {STARTERS.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            disabled={disabled}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink transition hover:border-brand-2 hover:bg-page disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
