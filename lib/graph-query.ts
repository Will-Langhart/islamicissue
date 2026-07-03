/**
 * Knowledge Graph Query API
 * 
 * High-level queries against the knowledge graph.
 * Used by components to find related issues, concepts, etc.
 */

import type {
  KnowledgeGraph,
  IssueNode,
  ConceptNode,
  RelatedIssueResult,
  GraphNeighborhood,
  ProcessedIssue,
} from './types';

/**
 * Find issues related to a given issue
 * Returns sorted by relevance (highest first)
 */
export function getRelatedIssues(
  graph: KnowledgeGraph,
  issueId: string,
  limit: number = 5
): RelatedIssueResult[] {
  const issueNode = graph.nodes.get(issueId) as IssueNode | undefined;
  if (!issueNode) return [];
  
  // Find all edges connected to this issue
  const relatedEdges = graph.edges.filter(
    (e) => (e.source === issueId || e.target === issueId) && e.type === 'related'
  );
  
  const results: RelatedIssueResult[] = [];
  
  for (const edge of relatedEdges) {
    const otherId = edge.source === issueId ? edge.target : edge.source;
    const otherNode = graph.nodes.get(otherId) as IssueNode | undefined;
    
    if (!otherNode) continue;
    
    // Determine why they're related
    const reasons: string[] = [];
    const sharedElements = {
      concepts: [] as string[],
      citations: [] as string[],
      scholars: [] as string[],
    };
    
    // Shared concepts
    const issueMetaConcepts = (issueNode.metadata?.concepts as string[]) || [];
    const otherMetaConcepts = (otherNode.metadata?.concepts as string[]) || [];
    const shared = issueMetaConcepts.filter((c) => otherMetaConcepts.includes(c));
    
    if (shared.length > 0) {
      reasons.push(`Shares concept${shared.length > 1 ? 's' : ''}: ${shared.slice(0, 2).join(', ')}`);
      sharedElements.concepts = shared;
    }
    
    // Same part
    if (issueNode.partNum === otherNode.partNum) {
      reasons.push(`Both in Part ${issueNode.partNum}`);
    }
    
    results.push({
      issueId: otherId,
      href: otherNode.href,
      title: otherNode.label,
      reason: reasons.join(' • ') || 'Related',
      relevance: edge.weight || 0.5,
      sharedElements,
    });
  }
  
  // Sort by relevance (descending)
  results.sort((a, b) => b.relevance - a.relevance);
  
  return results.slice(0, limit);
}

/**
 * Get all concepts mentioned in an issue
 */
export function getConceptsForIssue(
  graph: KnowledgeGraph,
  issueId: string
): ConceptNode[] {
  const issueNode = graph.nodes.get(issueId);
  if (!issueNode) return [];
  
  const concepts = (issueNode.metadata?.concepts as string[]) || [];
  const conceptNodes: ConceptNode[] = [];
  
  for (const conceptLabel of concepts) {
    const conceptNode = graph.concepts.get(conceptLabel);
    if (conceptNode) {
      conceptNodes.push(conceptNode);
    }
  }
  
  return conceptNodes;
}

/**
 * Get all issues that mention a specific concept
 */
export function getIssuesByConceptt(
  graph: KnowledgeGraph,
  concept: string,
  limit: number = 10
): IssueNode[] {
  const issueIds = graph.conceptIndex.get(concept) || [];
  
  return issueIds
    .map((id) => graph.nodes.get(id) as IssueNode | undefined)
    .filter((n): n is IssueNode => !!n)
    .slice(0, limit);
}

/**
 * Get the neighborhood of an issue in the graph
 * Returns the issue, its related issues, concepts, and sources
 */
export function getIssueNeighborhood(
  graph: KnowledgeGraph,
  issueId: string,
  depth: number = 2
): GraphNeighborhood {
  const issueNode = graph.nodes.get(issueId) as IssueNode | undefined;
  
  if (!issueNode) {
    return {
      center: null as any,
      related: [],
      concepts: [],
      sources: [],
      depth,
    };
  }
  
  const related = getRelatedIssues(graph, issueId, 10);
  const concepts = getConceptsForIssue(graph, issueId);
  
  return {
    center: issueNode,
    related,
    concepts,
    sources: [], // Could expand to source nodes if needed
    depth,
  };
}

/**
 * Find issues by citation reference
 * E.g., find all issues citing "Quran 5:47"
 */
export function getIssuesByCitation(
  graph: KnowledgeGraph,
  citationRef: string,
  limit: number = 10
): IssueNode[] {
  const issueIds = graph.citationIndex.get(citationRef) || [];
  
  return issueIds
    .map((id) => graph.nodes.get(id) as IssueNode | undefined)
    .filter((n): n is IssueNode => !!n)
    .slice(0, limit);
}

/**
 * Find related issues across the graph using BFS
 * Useful for "also see" recommendations
 */
export function findRelatedIssuesTransitive(
  graph: KnowledgeGraph,
  issueId: string,
  maxDepth: number = 2,
  limit: number = 8
): RelatedIssueResult[] {
  const visited = new Set<string>();
  const queue: { id: string; depth: number; path: string[] }[] = [
    { id: issueId, depth: 0, path: [issueId] },
  ];
  
  const results = new Map<string, RelatedIssueResult>();
  
  while (queue.length > 0) {
    const { id, depth, path } = queue.shift()!;
    
    if (depth > maxDepth || visited.has(id)) {
      continue;
    }
    
    visited.add(id);
    
    // Get direct connections
    const related = getRelatedIssues(graph, id, 20);
    
    for (const rel of related) {
      if (!visited.has(rel.issueId) && rel.issueId !== issueId) {
        // Adjust relevance based on depth
        const adjustedRelevance = rel.relevance / (1 + depth * 0.3);
        
        if (!results.has(rel.issueId) || results.get(rel.issueId)!.relevance < adjustedRelevance) {
          results.set(rel.issueId, {
            ...rel,
            relevance: adjustedRelevance,
          });
        }
        
        if (depth < maxDepth) {
          queue.push({
            id: rel.issueId,
            depth: depth + 1,
            path: [...path, rel.issueId],
          });
        }
      }
    }
  }
  
  // Sort by relevance and return
  return Array.from(results.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

/**
 * Get concept co-occurrence network
 * Returns concepts that frequently appear together
 */
export function getConceptNetwork(
  graph: KnowledgeGraph,
  concept: string,
  limit: number = 10
): Array<{ concept: string; cooccurrence: number }> {
  const issueIds = graph.conceptIndex.get(concept) || [];
  const cooccurrenceMap = new Map<string, number>();
  
  // Count co-occurrences
  for (const issueId of issueIds) {
    const node = graph.nodes.get(issueId);
    const concepts = (node?.metadata?.concepts as string[]) || [];
    
    for (const otherConcept of concepts) {
      if (otherConcept !== concept) {
        cooccurrenceMap.set(
          otherConcept,
          (cooccurrenceMap.get(otherConcept) || 0) + 1
        );
      }
    }
  }
  
  // Sort and return
  return Array.from(cooccurrenceMap.entries())
    .map(([concept, count]) => ({ concept, cooccurrence: count }))
    .sort((a, b) => b.cooccurrence - a.cooccurrence)
    .slice(0, limit);
}

/**
 * Analyze argument strength based on citation density and concept coverage
 */
export function analyzeArgumentStrength(
  graph: KnowledgeGraph,
  issueId: string
): {
  citationDensity: number;      // 0-1
  conceptCoverage: number;       // 0-1
  relatedIssuesCount: number;
  overallStrength: number;       // 0-1 weighted average
} {
  const node = graph.nodes.get(issueId) as IssueNode | undefined;
  if (!node) {
    return {
      citationDensity: 0,
      conceptCoverage: 0,
      relatedIssuesCount: 0,
      overallStrength: 0,
    };
  }
  
  const citationCount = (node.metadata?.citationCount as number) || 0;
  const concepts = getConceptsForIssue(graph, issueId);
  const related = getRelatedIssues(graph, issueId, 100);
  
  // Normalize citation density (0-1)
  const citationDensity = Math.min(citationCount / 20, 1);
  
  // Normalize concept coverage (0-1)
  const conceptCoverage = Math.min(concepts.length / 10, 1);
  
  // Weight the average
  const overallStrength = citationDensity * 0.4 + conceptCoverage * 0.3 + Math.min(related.length / 10, 1) * 0.3;
  
  return {
    citationDensity,
    conceptCoverage,
    relatedIssuesCount: related.length,
    overallStrength,
  };
}

/**
 * Export graph as static JSON for distribution
 */
export function exportGraphAsJSON(graph: KnowledgeGraph): {
  nodes: Array<[string, any]>;
  edges: any[];
  indexes: {
    citationIndex: Array<[string, string[]]>;
    conceptIndex: Array<[string, string[]]>;
  };
} {
  return {
    nodes: Array.from(graph.nodes.entries()),
    edges: graph.edges,
    indexes: {
      citationIndex: Array.from(graph.citationIndex.entries()),
      conceptIndex: Array.from(graph.conceptIndex.entries()),
    },
  };
}
