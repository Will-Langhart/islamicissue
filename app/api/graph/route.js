import { NextResponse } from "next/server";
import { getGraphIndex } from "@/lib/server-data";

function buildNodeMap(graph) {
  return new Map((graph.nodes || []).map(([id, node]) => [id, node]));
}

function relatedForIssue(graph, issueId, limit = 12, minWeight = 0.2) {
  const nodesById = buildNodeMap(graph);
  const edges = (graph.edges || [])
    .filter(
      (edge) =>
        edge.type === "related" &&
        (edge.source === issueId || edge.target === issueId) &&
        (edge.weight || 0) >= minWeight
    )
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, limit);

  return edges
    .map((edge) => {
      const neighborId = edge.source === issueId ? edge.target : edge.source;
      const node = nodesById.get(neighborId);
      return node
        ? {
            id: neighborId,
            title: node.label,
            href: node.href,
            partNum: node.partNum,
            issueNum: node.issueNum,
            strength: edge.weight || 0,
          }
        : null;
    })
    .filter(Boolean);
}

function issuesForConcept(graph, concept, limit = 30) {
  const nodesById = buildNodeMap(graph);
  const entries = graph.conceptIndex || [];
  const match = entries.find(([key]) => key.toLowerCase() === concept.toLowerCase());
  if (!match) return [];
  return match[1]
    .map((issueId) => {
      const node = nodesById.get(issueId);
      return node
        ? {
            id: issueId,
            title: node.label,
            href: node.href,
            partNum: node.partNum,
            issueNum: node.issueNum,
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, limit);
}

export async function GET(request) {
  const graph = await getGraphIndex();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "summary";

  if (mode === "summary") {
    return NextResponse.json({
      generatedAt: graph.generatedAt,
      stats: graph.stats,
    });
  }

  if (mode === "related") {
    const issueId = searchParams.get("issueId");
    if (!issueId) {
      return NextResponse.json(
        { error: "Missing issueId query parameter for related mode." },
        { status: 400 }
      );
    }
    const limit = Number(searchParams.get("limit") || "12");
    const minWeight = Number(searchParams.get("minWeight") || "0.2");
    return NextResponse.json({
      issueId,
      related: relatedForIssue(graph, issueId, limit, minWeight),
    });
  }

  if (mode === "concept") {
    const concept = searchParams.get("name");
    if (!concept) {
      return NextResponse.json(
        { error: "Missing name query parameter for concept mode." },
        { status: 400 }
      );
    }
    const limit = Number(searchParams.get("limit") || "30");
    return NextResponse.json({
      concept,
      issues: issuesForConcept(graph, concept, limit),
    });
  }

  if (mode === "concepts") {
    const conceptIndex = (graph.conceptIndex || [])
      .map(([concept, issueIds]) => ({ concept, count: issueIds.length }))
      .sort((a, b) => b.count - a.count);
    return NextResponse.json({ concepts: conceptIndex });
  }

  return NextResponse.json(
    { error: `Unsupported mode '${mode}'.` },
    { status: 400 }
  );
}

