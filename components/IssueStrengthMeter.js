"use client";

import { useEffect, useMemo, useState } from "react";
import { getRelatedEdges, loadGraphIndex, mapNodesById } from "@/lib/graph-client";

function blocksToText(entries) {
  return (entries || [])
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry.q) return `${entry.q} ${entry.ref || ""}`;
      if (entry.b) return entry.b.join(" ");
      return "";
    })
    .join(" ");
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function countCitations(text) {
  const verseMatches = text.match(/Quran\s+\d{1,3}:\d{1,3}|\b\d{1,3}:\d{1,3}\b/gi) || [];
  const hadithMatches =
    text.match(/(Bukhari|Muslim|Abu Dawud|Tirmidhi|Nasa'i|Ibn Majah)\s+\d+/gi) || [];
  const scholarMatches =
    text.match(/(Ibn\s+[A-Z][a-z]+|al-[A-Z][a-z]+|Muhammad\s+Abduh)/g) || [];
  return new Set([...verseMatches, ...hadithMatches, ...scholarMatches]).size;
}

function scoreLabel(score) {
  if (score >= 0.8) return "High";
  if (score >= 0.6) return "Substantial";
  if (score >= 0.4) return "Moderate";
  return "Developing";
}

export default function IssueStrengthMeter({
  issueId,
  critique,
  response,
  rebuttal,
}) {
  const [graphData, setGraphData] = useState(null);
  const [relatedCount, setRelatedCount] = useState(0);
  const [conceptCount, setConceptCount] = useState(0);

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

  useEffect(() => {
    if (!graphData || !issueId) return;
    const nodesById = mapNodesById(graphData);
    const node = nodesById.get(issueId);
    const conceptTotal = node?.metadata?.concepts?.length || 0;
    const related = getRelatedEdges(graphData, issueId, 0.2).length;
    setConceptCount(conceptTotal);
    setRelatedCount(related);
  }, [graphData, issueId]);

  const metrics = useMemo(() => {
    const text = [
      blocksToText(critique),
      blocksToText(response),
      blocksToText(rebuttal),
    ].join(" ");
    const citations = countCitations(text);
    const dialecticSections = [critique, response, rebuttal].filter(
      (entries) => Array.isArray(entries) && entries.length > 0
    ).length;
    const sectionVolume = (critique?.length || 0) + (response?.length || 0) + (rebuttal?.length || 0);

    const citationDensity = clamp01(citations / 14);
    const conceptCoverage = clamp01(conceptCount / 10);
    const dialecticDepth = clamp01((dialecticSections * 0.35) + sectionVolume / 30);
    const networkConnectedness = clamp01(relatedCount / 14);
    const overall =
      citationDensity * 0.35 +
      conceptCoverage * 0.25 +
      dialecticDepth * 0.2 +
      networkConnectedness * 0.2;

    return {
      citationDensity,
      conceptCoverage,
      dialecticDepth,
      networkConnectedness,
      overall,
      citations,
    };
  }, [critique, response, rebuttal, conceptCount, relatedCount]);

  const rows = [
    ["Citation density", metrics.citationDensity],
    ["Concept coverage", metrics.conceptCoverage],
    ["Dialectic depth", metrics.dialecticDepth],
    ["Network connectedness", metrics.networkConnectedness],
  ];

  return (
    <section id="strength" className="mt-8 scroll-mt-24 rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-heading">Argument Strength Dashboard</h2>
        <span className="rounded-full bg-accentbg/35 px-2.5 py-1 text-xs font-semibold text-cite">
          {scoreLabel(metrics.overall)} · {Math.round(metrics.overall * 100)}%
        </span>
      </div>
      <p className="mb-4 text-sm text-muted">
        Composite score from citation density, concept coverage, dialectical structure, and graph connectivity.
      </p>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
              <span>{label}</span>
              <span>{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-line/40">
              <div
                className="h-2 rounded-full bg-accent transition-all"
                style={{ width: `${Math.round(value * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md border border-line bg-page px-2 py-2">
          <p className="font-semibold text-heading">{metrics.citations}</p>
          <p className="text-muted">Citations</p>
        </div>
        <div className="rounded-md border border-line bg-page px-2 py-2">
          <p className="font-semibold text-heading">{conceptCount}</p>
          <p className="text-muted">Concepts</p>
        </div>
        <div className="rounded-md border border-line bg-page px-2 py-2">
          <p className="font-semibold text-heading">{relatedCount}</p>
          <p className="text-muted">Connections</p>
        </div>
      </div>
    </section>
  );
}

