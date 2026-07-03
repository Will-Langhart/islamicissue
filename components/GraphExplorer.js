"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  loadGraphIndex,
  mapNodesById,
  listIssueNodes,
  getRelatedEdges,
  getDegreeMap,
} from "@/lib/graph-client";

export default function GraphExplorer() {
  const [graphData, setGraphData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [minWeight, setMinWeight] = useState(0.35);
  const [partFilter, setPartFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    loadGraphIndex()
      .then((data) => {
        if (cancelled) return;
        setGraphData(data);
      })
      .catch(() => {
        if (cancelled) return;
        setGraphData({ nodes: [], edges: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nodesById = useMemo(() => mapNodesById(graphData), [graphData]);
  const issueNodes = useMemo(() => listIssueNodes(graphData), [graphData]);
  const degreeMap = useMemo(() => getDegreeMap(graphData, minWeight), [graphData, minWeight]);

  const rankedIssues = useMemo(() => {
    return [...issueNodes]
      .sort((a, b) => (degreeMap.get(b.id) || 0) - (degreeMap.get(a.id) || 0))
      .slice(0, 30);
  }, [issueNodes, degreeMap]);

  useEffect(() => {
    if (!selectedId && rankedIssues.length > 0) {
      setSelectedId(rankedIssues[0].id);
    }
  }, [selectedId, rankedIssues]);

  const selectedNode = selectedId ? nodesById.get(selectedId) : null;

  const neighbors = useMemo(() => {
    if (!selectedId) return [];
    const edges = getRelatedEdges(graphData, selectedId, minWeight);
    const values = [];
    for (const edge of edges) {
      const neighborId = edge.source === selectedId ? edge.target : edge.source;
      const neighbor = nodesById.get(neighborId);
      if (!neighbor) continue;
      if (partFilter !== "all" && String(neighbor.partNum) !== partFilter) continue;
      values.push({ ...neighbor, weight: edge.weight || 0 });
    }
    return values.sort((a, b) => b.weight - a.weight).slice(0, 14);
  }, [selectedId, graphData, nodesById, minWeight, partFilter]);

  const partOptions = useMemo(() => {
    const parts = new Set(issueNodes.map((n) => String(n.partNum)));
    return ["all", ...[...parts].sort((a, b) => Number(a) - Number(b))];
  }, [issueNodes]);

  const layout = useMemo(() => {
    const center = { x: 50, y: 50 };
    const radius = 38;
    const positioned = neighbors.map((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(neighbors.length, 1);
      return {
        ...node,
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      };
    });
    return { center, positioned };
  }, [neighbors]);

  if (!graphData) {
    return (
      <section className="rounded-xl border border-line bg-surface p-6">
        <div className="h-6 w-64 animate-pulse rounded bg-line/40" />
        <div className="mt-4 h-64 animate-pulse rounded bg-line/20" />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-heading sm:text-2xl">Interactive Graph Explorer</h2>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span>{graphData?.stats?.nodeCount || 0} nodes</span>
          <span className="text-line">·</span>
          <span>{graphData?.stats?.edgeCount || 0} edges</span>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
          Center issue
          <select
            className="rounded-md border border-line bg-page px-3 py-2 text-sm text-ink"
            value={selectedId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {rankedIssues.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
          Minimum strength
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={minWeight}
            onChange={(e) => setMinWeight(Number(e.target.value))}
          />
          <span className="text-[11px]">{Math.round(minWeight * 100)}% or higher</span>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
          Part filter
          <select
            className="rounded-md border border-line bg-page px-3 py-2 text-sm text-ink"
            value={partFilter}
            onChange={(e) => setPartFilter(e.target.value)}
          >
            {partOptions.map((part) => (
              <option key={part} value={part}>
                {part === "all" ? "All parts" : `Part ${part}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-line bg-page p-3">
          <svg viewBox="0 0 100 100" role="img" className="h-[420px] w-full">
            {layout.positioned.map((node) => (
              <line
                key={`line-${node.id}`}
                x1={layout.center.x}
                y1={layout.center.y}
                x2={node.x}
                y2={node.y}
                stroke="currentColor"
                className="text-line"
                opacity={Math.max(0.2, node.weight)}
                strokeWidth={0.45 + node.weight}
              />
            ))}

            {layout.positioned.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={2.8 + node.weight * 2.2}
                  className="cursor-pointer fill-accent/70 stroke-accentbg"
                  strokeWidth="1"
                  onClick={() => setSelectedId(node.id)}
                />
                <title>{node.label}</title>
              </g>
            ))}

            <circle
              cx={layout.center.x}
              cy={layout.center.y}
              r="5.6"
              className="fill-accent stroke-cite"
              strokeWidth="1.2"
            />
            <title>{selectedNode?.label || "Selected issue"}</title>
          </svg>
        </div>

        <aside className="rounded-lg border border-line bg-page p-4">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
            Focus node
          </p>
          <h3 className="mt-1 text-base font-semibold text-heading">{selectedNode?.label}</h3>
          <p className="mt-1 text-xs text-muted">
            Part {selectedNode?.partNum} · {neighbors.length} visible relationships
          </p>
          {selectedNode?.href ? (
            <Link href={selectedNode.href} className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">
              Open issue →
            </Link>
          ) : null}

          <div className="mt-4 space-y-2">
            {neighbors.length === 0 ? (
              <p className="text-sm text-muted">No neighbors match current filters.</p>
            ) : (
              neighbors.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-left transition hover:border-accent/50"
                >
                  <p className="line-clamp-1 text-sm font-semibold text-heading">{node.label}</p>
                  <p className="text-[11px] text-muted">Part {node.partNum} · {Math.round(node.weight * 100)}% strength</p>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

