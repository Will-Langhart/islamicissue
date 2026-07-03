"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadGraphIndex, mapNodesById } from "@/lib/graph-client";

export default function ConceptBrowser() {
  const [graphData, setGraphData] = useState(null);
  const [query, setQuery] = useState("");
  const [activeConcept, setActiveConcept] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadGraphIndex()
      .then((data) => {
        if (cancelled) return;
        setGraphData(data);
      })
      .catch(() => {
        if (cancelled) return;
        setGraphData({ nodes: [], conceptIndex: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nodesById = useMemo(() => mapNodesById(graphData), [graphData]);
  const conceptNodeByLabel = useMemo(() => {
    const map = new Map();
    for (const [, node] of graphData?.nodes || []) {
      if (node.type === "concept") {
        map.set(node.label, node);
      }
    }
    return map;
  }, [graphData]);

  const concepts = useMemo(() => {
    const entries = graphData?.conceptIndex || [];
    const lowered = query.trim().toLowerCase();
    const values = entries
      .map(([concept, issueIds]) => {
        const conceptNode = conceptNodeByLabel.get(concept);
        return {
          concept,
          issueIds,
          frequency: conceptNode?.frequency || issueIds.length,
        };
      })
      .filter((entry) => !lowered || entry.concept.toLowerCase().includes(lowered))
      .sort((a, b) => b.frequency - a.frequency);
    return values;
  }, [graphData, conceptNodeByLabel, query]);

  useEffect(() => {
    if (!activeConcept && concepts.length > 0) {
      setActiveConcept(concepts[0].concept);
    }
  }, [activeConcept, concepts]);

  const activeIssueIds =
    concepts.find((entry) => entry.concept === activeConcept)?.issueIds || [];

  if (!graphData) {
    return (
      <section className="rounded-xl border border-line bg-surface p-6">
        <div className="h-6 w-56 animate-pulse rounded bg-line/40" />
        <div className="mt-4 h-72 animate-pulse rounded bg-line/20" />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-heading sm:text-2xl">Concept Browser</h2>
        <span className="text-xs font-semibold text-muted">
          {concepts.length} indexed concepts
        </span>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter concepts (e.g., abrogation, manuscript, contradiction)"
        className="mb-4 w-full rounded-md border border-line bg-page px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent/50"
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {concepts.map((entry) => (
            <button
              key={entry.concept}
              type="button"
              onClick={() => setActiveConcept(entry.concept)}
              className={`w-full rounded-md border px-3 py-2 text-left transition ${
                activeConcept === entry.concept
                  ? "border-accent/60 bg-accentbg/25"
                  : "border-line bg-page hover:border-accent/35"
              }`}
            >
              <p className="text-sm font-semibold text-heading">{entry.concept}</p>
              <p className="text-[11px] text-muted">
                Mentioned in {entry.frequency} issue{entry.frequency === 1 ? "" : "s"}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-page p-4">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
            Issues tagged with
          </p>
          <h3 className="mt-1 text-lg font-bold text-heading">{activeConcept || "—"}</h3>

          <div className="mt-3 space-y-2">
            {activeIssueIds.length === 0 ? (
              <p className="text-sm text-muted">Select a concept to inspect linked issues.</p>
            ) : (
              activeIssueIds.map((issueId) => {
                const issue = nodesById.get(issueId);
                if (!issue) return null;
                return (
                  <Link
                    key={issueId}
                    href={issue.href}
                    className="block rounded-md border border-line bg-surface px-3 py-2 transition hover:border-accent/50"
                  >
                    <p className="line-clamp-1 text-sm font-semibold text-heading">{issue.label}</p>
                    <p className="text-[11px] text-muted">
                      Part {issue.partNum} · Issue {issue.issueNum}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

