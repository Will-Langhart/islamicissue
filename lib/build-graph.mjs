/**
 * Build-time knowledge graph index generator
 * 
 * Run during `npm run build` to extract and index the graph.
 * Outputs: public/graph-index.json (static, deployed with site)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { site, flatIssues } from './structure.mjs';
import { processIssue, buildKnowledgeGraph, type ProcessedIssue } from './graph-extractor';

/**
 * Generate and save the knowledge graph index
 */
export async function generateGraphIndex() {
  console.log('🔗 Generating knowledge graph index...');
  
  // Step 1: Process all issues
  console.log(`📝 Processing ${flatIssues.length} issues...`);
  
  const processedIssues: ProcessedIssue[] = [];
  
  for (const issue of flatIssues) {
    const part = site.find(p => p.slug === issue.partSlug);
    if (!part) continue;
    
    const item = part.items.find(i => i.slug === issue.issueSlug);
    if (!item) continue;
    
    const processed = processIssue(
      issue.partNum,
      issue.partSlug,
      issue.num,
      issue.issueSlug,
      issue.title,
      issue.href,
      item.critique || [],
      item.response || [],
      item.rebuttal || []
    );
    
    processedIssues.push(processed);
  }
  
  console.log(`✓ Processed ${processedIssues.length} issues`);
  
  // Step 2: Build the knowledge graph
  console.log('🔨 Building knowledge graph...');
  const graph = buildKnowledgeGraph(processedIssues);
  
  console.log(`  ✓ Nodes: ${graph.nodes.size}`);
  console.log(`  ✓ Edges: ${graph.edges.length}`);
  console.log(`  ✓ Concepts: ${graph.concepts.size}`);
  console.log(`  ✓ Citation index entries: ${graph.citationIndex.size}`);
  
  // Step 3: Serialize and save
  console.log('💾 Serializing and saving graph...');
  
  const graphIndex = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    stats: {
      nodeCount: graph.nodes.size,
      edgeCount: graph.edges.length,
      conceptCount: graph.concepts.size,
      issueCount: flatIssues.length,
    },
    // Serialize nodes (convert Map to Array of [id, node])
    nodes: Array.from(graph.nodes.entries()),
    // Edges as-is
    edges: graph.edges,
    // Serialize indexes
    citationIndex: Array.from(graph.citationIndex.entries()),
    conceptIndex: Array.from(graph.conceptIndex.entries()),
    // Issue lookup index for fast access
    issueIndex: Array.from(graph.issuesByPartAndSlug.entries()).map(([partSlug, issues]) => [
      partSlug,
      Array.from(issues.entries()),
    ]),
  };
  
  const outputDir = 'public';
  mkdirSync(outputDir, { recursive: true });
  
  const outputPath = `${outputDir}/graph-index.json`;
  writeFileSync(outputPath, JSON.stringify(graphIndex, null, 2));
  
  console.log(`✓ Saved graph index to ${outputPath}`);
  console.log(`  File size: ${(JSON.stringify(graphIndex).length / 1024).toFixed(2)} KB`);
  
  return graphIndex;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateGraphIndex().catch(console.error);
}
