"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { searchIndex } from "@/lib/structure.mjs";

function snippet(text, q) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text.slice(0, 120) + "…";
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + q.length + 70);
  return (
    (start > 0 ? "…" : "") +
    text.slice(start, idx) +
    "⟪" + text.slice(idx, idx + q.length) + "⟫" +
    text.slice(idx + q.length, end) +
    (end < text.length ? "…" : "")
  );
}

function renderSnippet(s) {
  const parts = s.split(/⟪|⟫/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-accentbg px-0.5 font-semibold text-accent">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return searchIndex
      .map((entry) => {
        const inTitle = entry.title.toLowerCase().includes(q);
        const inText = entry.text.toLowerCase().includes(q);
        if (!inTitle && !inText) return null;
        return { ...entry, score: inTitle ? 2 : 1 };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 font-ui text-sm text-muted transition-colors hover:border-accent/50 hover:text-heading"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-line px-1 text-[10px] text-muted sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search issues, citations, topics — e.g. “Bukhari 4428”, “abrogation”…"
              className="w-full border-b border-line bg-transparent px-5 py-4 font-ui text-base text-ink outline-none placeholder:text-muted/70"
            />
            <div className="max-h-[55vh] overflow-y-auto">
              {query.trim().length >= 2 && results.length === 0 && (
                <p className="px-5 py-6 font-ui text-sm text-muted">No matches.</p>
              )}
              {results.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line/60 px-5 py-3 transition-colors hover:bg-accentbg"
                >
                  <div className="font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
                    {r.label}
                  </div>
                  <div className="font-semibold text-heading">{r.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-sm text-muted">
                    {renderSnippet(snippet(r.text, query.trim()))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
