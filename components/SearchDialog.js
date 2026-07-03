"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { searchIndex } from "@/lib/structure.mjs";
import { loadGraphIndex } from "@/lib/graph-client";

function snippet(text, q) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text.slice(0, 120) + "…";
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + q.length + 70);
  return (
    (start > 0 ? "…" : "") +
    text.slice(start, idx) +
    "⟪" +
    text.slice(idx, idx + q.length) +
    "⟫" +
    text.slice(idx + q.length, end) +
    (end < text.length ? "…" : "")
  );
}

function renderSnippet(text) {
  const parts = text.split(/⟪|⟫/);
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

function classifyEntry(entry) {
  if (entry.label.startsWith("Part ")) return "issues";
  return "tools";
}

function tokenize(query) {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeQuranRef(query) {
  const match = query.match(/(?:quran\s+)?(\d{1,3}):(\d{1,3})/i);
  if (!match) return null;
  return `${Number(match[1])}:${Number(match[2])}`;
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [graphData, setGraphData] = useState(null);
  const [graphLoaded, setGraphLoaded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((state) => !state);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 20);
    if (graphLoaded) return;
    loadGraphIndex()
      .then((data) => {
        setGraphData(data);
        setGraphLoaded(true);
      })
      .catch(() => {
        setGraphLoaded(true);
      });
  }, [open, graphLoaded]);

  const issueIdByHref = useMemo(() => {
    const map = new Map();
    for (const [id, node] of graphData?.nodes || []) {
      if (node.type === "issue") map.set(node.href, id);
    }
    return map;
  }, [graphData]);

  const conceptEntries = useMemo(
    () => (graphData?.conceptIndex || []).map(([concept, issueIds]) => ({ concept, issueIds })),
    [graphData]
  );

  const citationMap = useMemo(
    () => new Map((graphData?.citationIndex || []).map(([ref, ids]) => [String(ref).toLowerCase(), ids])),
    [graphData]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const tokens = tokenize(q);
    const quranRef = normalizeQuranRef(q);

    const ranked = searchIndex
      .map((entry) => {
        const entryType = classifyEntry(entry);
        if (scope !== "all" && scope !== entryType) return null;

        const title = entry.title.toLowerCase();
        const text = entry.text.toLowerCase();
        const label = entry.label.toLowerCase();
        let score = 0;
        const reasons = [];

        if (title === q) {
          score += 12;
          reasons.push("Exact title");
        } else if (title.includes(q)) {
          score += 6;
          reasons.push("Title match");
        }
        if (label.includes(q)) score += 2;
        if (text.includes(q)) score += 2;

        let tokenHits = 0;
        for (const token of tokens) {
          if (token.length < 2) continue;
          if (title.includes(token)) tokenHits += 2;
          else if (text.includes(token)) tokenHits += 1;
        }
        if (tokenHits > 0) {
          score += Math.min(tokenHits, 8);
          reasons.push("Keyword overlap");
        }

        const issueId = issueIdByHref.get(entry.href);
        if (issueId) {
          let conceptBoost = 0;
          for (const { concept, issueIds } of conceptEntries) {
            const c = concept.toLowerCase();
            if (!(c.includes(q) || q.includes(c))) continue;
            if (issueIds.includes(issueId)) conceptBoost += 3;
          }
          if (conceptBoost > 0) {
            score += Math.min(conceptBoost, 9);
            reasons.push("Concept match");
          }

          if (quranRef) {
            const ids = citationMap.get(quranRef.toLowerCase());
            if (ids?.includes(issueId)) {
              score += 9;
              reasons.push("Citation match");
            }
          } else {
            const citationHit = [...citationMap.keys()].find((key) => key.includes(q));
            if (citationHit) {
              const ids = citationMap.get(citationHit) || [];
              if (ids.includes(issueId)) {
                score += 5;
                reasons.push("Citation match");
              }
            }
          }
        }

        if (score <= 0) return null;
        return { ...entry, entryType, score, reasons };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 14);

    return ranked;
  }, [query, scope, issueIdByHref, conceptEntries, citationMap]);

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
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-line px-5 py-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search issues, citations, concepts — e.g. "Quran 5:47", "abrogation"'
                className="w-full bg-transparent font-ui text-base text-ink outline-none placeholder:text-muted/70"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["all", "All"],
                  ["issues", "Issues"],
                  ["tools", "Research tools"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScope(value)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      scope === value
                        ? "bg-accent text-oncolor"
                        : "border border-line bg-page text-muted hover:border-accent/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[58vh] overflow-y-auto">
              {query.trim().length >= 2 && results.length === 0 && (
                <p className="px-5 py-6 font-ui text-sm text-muted">No matches found.</p>
              )}
              {results.map((result) => (
                <Link
                  key={result.href}
                  href={result.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line/60 px-5 py-3 transition-colors hover:bg-accentbg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
                        {result.label}
                      </div>
                      <div className="font-semibold text-heading">{result.title}</div>
                      <div className="mt-0.5 line-clamp-2 text-sm text-muted">
                        {renderSnippet(snippet(result.text, query.trim()))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {result.reasons.slice(0, 2).map((reason) => (
                          <span
                            key={`${result.href}-${reason}`}
                            className="rounded-full bg-accentbg/45 px-2 py-0.5 text-[10px] font-semibold text-cite"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-cite">{result.score}</p>
                      <p className="text-[10px] text-muted">score</p>
                    </div>
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

