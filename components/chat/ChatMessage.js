"use client";

import { Markdown } from "./markdown";

export default function ChatMessage({ role, content, streaming }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`text-[15px] ${
          isUser
            ? "max-w-[85%] rounded-2xl bg-[image:var(--grad-brand)] px-4 py-3 text-oncolor"
            : "w-full px-1 py-1 text-ink"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : content ? (
          <Markdown text={content} />
        ) : (
          <span className="inline-flex gap-1 py-1" aria-label="Thinking">
            <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
          </span>
        )}
        {streaming && content && (
          <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-middle" />
        )}
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: delay }}
    />
  );
}
