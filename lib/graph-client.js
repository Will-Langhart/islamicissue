export async function loadGraphIndex() {
  const response = await fetch("/graph-index.json");
  if (!response.ok) {
    throw new Error("Failed to load graph index.");
  }
  return response.json();
}

export function mapNodesById(graphData) {
  return new Map((graphData?.nodes || []).map(([id, node]) => [id, node]));
}

export function listIssueNodes(graphData) {
  return (graphData?.nodes || [])
    .map(([, node]) => node)
    .filter((node) => node.type === "issue");
}

export function getRelatedEdges(graphData, issueId, minWeight = 0) {
  return (graphData?.edges || []).filter(
    (edge) =>
      (edge.source === issueId || edge.target === issueId) &&
      edge.type === "related" &&
      (edge.weight || 0) >= minWeight
  );
}

export function getDegreeMap(graphData, minWeight = 0) {
  const degree = new Map();
  for (const edge of graphData?.edges || []) {
    if (edge.type !== "related" || (edge.weight || 0) < minWeight) continue;
    degree.set(edge.source, (degree.get(edge.source) || 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) || 0) + 1);
  }
  return degree;
}

