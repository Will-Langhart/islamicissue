"use client";

/**
 * Related Issues Widget
 * 
 * Displays issues related to the current issue based on:
 * - Shared concepts
 * - Shared citations
 * - Proximity in the graph
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RelatedIssueResult } from "@/lib/types";

interface RelatedIssuesProps {
  issueId: string;
  partSlug: string;
  issueSlug: string;
  className?: string;
}

/**
 * Client-side hook to load and query the graph
 */
function useGraphQuery() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load pre-built graph index
    fetch('/graph-index.json')
      .then(r => r.json())
      .then(data => {
        // Reconstruct the graph data structure on client
        setGraphData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load graph index:', err);
        setLoading(false);
      });
  }, []);
  
  return { graphData, loading };
}

/**
 * Find related issues from the graph
 */
function findRelatedIssues(
  graphData: any,
  issueId: string,
  limit: number = 5
): RelatedIssueResult[] {
  if (!graphData) return [];
  
  const { nodes, edges, conceptIndex } = graphData;
  
  // Find the node
  const nodeEntry = nodes.find((e: [string, any]) => e[0] === issueId);
  if (!nodeEntry) return [];
  
  const [, issueNode] = nodeEntry;
  const issueConcepts = (issueNode.metadata?.concepts as string[]) || [];
  
  // Find all edges connected to this issue
  const relatedEdges = edges.filter(
    (e: any) => (e.source === issueId || e.target === issueId) && e.type === 'related'
  );
  
  const results: RelatedIssueResult[] = [];
  
  for (const edge of relatedEdges) {
    const otherId = edge.source === issueId ? edge.target : edge.source;
    const otherEntry = nodes.find((e: [string, any]) => e[0] === otherId);
    
    if (!otherEntry) continue;
    
    const [, otherNode] = otherEntry;
    
    // Determine why they're related
    const reasons: string[] = [];
    const otherConcepts = (otherNode.metadata?.concepts as string[]) || [];
    const sharedConcepts = issueConcepts.filter((c) => otherConcepts.includes(c));
    
    if (sharedConcepts.length > 0) {
      reasons.push(`Shares concept: ${sharedConcepts.slice(0, 2).join(', ')}`);
    }
    
    if (issueNode.partNum === otherNode.partNum) {
      reasons.push(`Same part (Part ${issueNode.partNum})`);
    }
    
    results.push({
      issueId: otherId,
      href: otherNode.href,
      title: otherNode.label,
      reason: reasons.join(' • ') || 'Related',
      relevance: edge.weight || 0.5,
      sharedElements: {
        concepts: sharedConcepts,
      },
    });
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  
  return results.slice(0, limit);
}

export default function RelatedIssues({
  issueId,
  partSlug,
  issueSlug,
  className = "",
}: RelatedIssuesProps) {
  const { graphData, loading } = useGraphQuery();
  const [related, setRelated] = useState<RelatedIssueResult[]>([]);
  
  useEffect(() => {
    if (graphData && issueId) {
      const results = findRelatedIssues(graphData, issueId, 5);
      setRelated(results);
    }
  }, [graphData, issueId]);
  
  if (loading) {
    return (
      <section id="related" className={`scroll-mt-24 border-t border-line py-12 ${className}`}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="h-8 w-40 animate-pulse rounded bg-line/40" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded bg-line/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (related.length === 0) {
    return null;
  }
  
  return (
    <section id="related" className={`scroll-mt-24 border-t border-line py-12 ${className}`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-2 font-ui text-xs font-semibold uppercase tracking-wider text-cite">
          Related Issues
        </div>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-heading">
          Explore Connected Arguments
        </h2>
        <p className="mb-8 text-sm text-muted">
          These issues share concepts or citations with this one, forming a web of interconnected arguments.
        </p>
        
        <div className="space-y-3">
          {related.map((result) => (
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
                  <p className="mt-1 text-sm text-muted">
                    {result.reason}
                  </p>
                  {result.sharedElements?.concepts && result.sharedElements.concepts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.sharedElements.concepts.slice(0, 3).map((concept) => (
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
                <div className="shrink-0 pt-1">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-cite">
                      {Math.round(result.relevance * 100)}%
                    </div>
                    <div className="mt-1 text-[10px] text-muted">match</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
