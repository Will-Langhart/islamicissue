"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { RelatedIssueResult } from "@/lib/types";

interface RelatedIssuesProps {
  issueId: string;
  partSlug: string;
  issueSlug: string;
  className?: string;
}

interface GraphIssueNode {
  id: string;
  label: string;
  href: string;
  partNum: number;
  metadata?: {
    concepts?: string[];
  };
}

interface GraphData {
  nodes: [string, GraphIssueNode][];
  edges: Array<{
    source: string;
    target: string;
    type: string;
    weight?: number;
  }>;
}

function useGraphQuery() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/graph-index.json")
      .then((response) => response.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load graph index:", error);
        setLoading(false);
      });
  }, []);

  return { graphData, loading };
}

function findRelatedIssues(
  graphData: GraphData,
  issueId: string,
  limit: number = 12
): RelatedIssueResult[] {
  if (!graphData) return [];
  const { nodes, edges } = graphData;
  const nodeEntry = nodes.find(([id]) => id === issueId);
  if (!nodeEntry) return [];

  const [, issueNode] = nodeEntry;
  const issueConcepts = issueNode.metadata?.concepts || [];
  const relatedEdges = edges.filter(
    (edge) => (edge.source === issueId || edge.target === issueId) && edge.type === "related"
  );

  const results: RelatedIssueResult[] = [];
  for (const edge of relatedEdges) {
    const otherId = edge.source === issueId ? edge.target : edge.source;
    const otherEntry = nodes.find(([id]) => id === otherId);
    if (!otherEntry) continue;

    const [, otherNode] = otherEntry;
    const otherConcepts = otherNode.metadata?.concepts || [];
    const sharedConcepts = issueConcepts.filter((concept) => otherConcepts.includes(concept));
    const reasons: string[] = [];

    if (sharedConcepts.length > 0) {
      reasons.push(`Shares concept: ${sharedConcepts.slice(0, 2).join(", ")}`);
    }
    if (issueNode.partNum === otherNode.partNum) {
      reasons.push(`Same part (Part ${issueNode.partNum})`);
    }

    results.push({
      issueId: otherId,
      href: otherNode.href,
      title: otherNode.label,
      reason: reasons.join(" • ") || "Related",
      relevance: edge.weight || 0.5,
      sharedElements: {
        concepts: sharedConcepts,
      },
    });
  }

  results.sort((a, b) => b.relevance - a.relevance);
  return results.slice(0, limit);
}

function toPartLabel(href: string) {
  const match = href.match(/^\/([^/]+)\//);
  if (!match) return "unknown";
  return match[1];
}

export default function RelatedIssuesWidget({
  issueId,
  className = "",
}: RelatedIssuesProps) {
  const { graphData, loading } = useGraphQuery();
  const [allRelated, setAllRelated] = useState<RelatedIssueResult[]>([]);
  const [minStrength, setMinStrength] = useState(0.45);
  const [selectedPart, setSelectedPart] = useState("all");
  const [conceptFilter, setConceptFilter] = useState("");

  useEffect(() => {
    if (graphData && issueId) {
      setAllRelated(findRelatedIssues(graphData, issueId, 20));
    }
  }, [graphData, issueId]);

  const partOptions = useMemo(() => {
    const parts = new Set(
      allRelated.map((result) => toPartLabel(result.href)).filter((value) => value !== "unknown")
    );
    return ["all", ...Array.from(parts).sort()];
  }, [allRelated]);

  const conceptOptions = useMemo(() => {
    const concepts = new Set<string>();
    for (const result of allRelated) {
      for (const concept of result.sharedElements?.concepts || []) concepts.add(concept);
    }
    return Array.from(concepts).sort((a, b) => a.localeCompare(b));
  }, [allRelated]);

  const filtered = useMemo(() => {
    return allRelated
      .filter((result) => result.relevance >= minStrength)
      .filter((result) => {
        if (selectedPart === "all") return true;
        return toPartLabel(result.href) === selectedPart;
      })
      .filter((result) => {
        if (!conceptFilter) return true;
        return (result.sharedElements?.concepts || []).includes(conceptFilter);
      })
      .slice(0, 8);
  }, [allRelated, minStrength, selectedPart, conceptFilter]);

  if (loading) {
    return (
      <section id="related" className={`scroll-mt-24 border-t border-line py-12 ${className}`}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="h-8 w-40 animate-pulse rounded bg-line/40" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded bg-line/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!graphData || allRelated.length === 0) return null;

  return (
    <section id="related" className={`scroll-mt-24 border-t border-line py-12 ${className}`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-2 font-ui text-xs font-semibold uppercase tracking-wider text-cite">
          Related Issues
        </div>
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-heading">
          Explore Connected Arguments
        </h2>
        <p className="mb-5 text-sm text-muted">
          Filter by relationship strength, part, and shared concept to trace targeted argument paths.
        </p>

        <div className="mb-5 grid gap-3 rounded-lg border border-line bg-page p-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            Min strength
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={minStrength}
              onChange={(event) => setMinStrength(Number(event.target.value))}
            />
            <span className="text-[11px]">{Math.round(minStrength * 100)}%+</span>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            Part
            <select
              className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink"
              value={selectedPart}
              onChange={(event) => setSelectedPart(event.target.value)}
            >
              {partOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All parts" : option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            Shared concept
            <select
              className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink"
              value={conceptFilter}
              onChange={(event) => setConceptFilter(event.target.value)}
            >
              <option value="">Any concept</option>
              {conceptOptions.map((concept) => (
                <option key={concept} value={concept}>
                  {concept}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-md border border-dashed border-line p-4 text-sm text-muted">
            No related issues match the selected filters.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((result) => (
              <Link
                key={result.issueId}
                href={result.href}
                className="group block rounded-lg border border-line bg-surface px-4 py-4 transition-colors hover:border-accent/40 hover:bg-accentbg/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-heading transition-colors group-hover:text-accent">
                      {result.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{result.reason}</p>
                    {(result.sharedElements?.concepts || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(result.sharedElements?.concepts || []).slice(0, 4).map((concept) => (
                          <span
                            key={concept}
                            className="rounded-full bg-accentbg/40 px-2.5 py-1 text-[11px] font-semibold text-accent"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 pt-1 text-right">
                    <div className="text-xs font-semibold text-cite">
                      {Math.round(result.relevance * 100)}%
                    </div>
                    <div className="mt-1 text-[10px] text-muted">match</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

