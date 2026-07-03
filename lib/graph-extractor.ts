/**
 * Knowledge Graph Extractor
 * 
 * Extracts nodes and edges from the content structure.
 * Run at build time to generate the graph index.
 */

import type {
  ContentBlock,
  BlockQuote,
  ProcessedIssue,
  CitationRef,
  IssueNode,
  ConceptNode,
  GraphNode,
  GraphEdge,
  KnowledgeGraph,
} from './types';

// ============ Citation Extraction ============

/**
 * Extract all Quranic verse references from text
 * Patterns: "Quran X:Y", "X:Y", "Surah X, Ayah Y"
 */
export function extractVerseReferences(text: string): string[] {
  const patterns = [
    /Quran\s+(\d{1,3}):(\d{1,3})/gi,
    /(\d{1,3}):(\d{1,3})(?:\s|$|[^\d])/g,
  ];
  
  const verses = new Set<string>();
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const surah = parseInt(match[1], 10);
      const ayah = parseInt(match[2], 10);
      if (surah >= 1 && surah <= 114 && ayah >= 1) {
        verses.add(`${surah}:${ayah}`);
      }
    }
  }
  
  return Array.from(verses);
}

/**
 * Extract Hadith references
 * Patterns: "Bukhari 123", "Muslim 456", "Abu Dawud 789"
 */
export function extractHadithReferences(text: string): string[] {
  const collections = [
    'Sahih al-Bukhari', 'Bukhari',
    'Sahih Muslim', 'Muslim',
    'Sunan Abu Dawud', 'Abu Dawud',
    'Jami` at-Tirmidhi', 'Tirmidhi',
    'Sunan an-Nasa\'i', 'Nasa\'i',
    'Sunan Ibn Majah', 'Ibn Majah',
  ];
  
  const hadith = new Set<string>();
  
  // Pattern: "Collection XYZ" or "Collection 1234"
  for (const collection of collections) {
    const escaped = collection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escaped}\\s+(\\d+)`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      hadith.add(`${collection} ${match[1]}`);
    }
  }
  
  return Array.from(hadith);
}

/**
 * Extract scholar names and their opinions
 * Looks for patterns like "al-Tabari", "Ibn Hazm", "Muhammad Abduh"
 */
export function extractScholarReferences(text: string): string[] {
  const scholars = [
    'al-Tabari', 'Ibn Hazm', 'al-Razi', 'Muhammad Abduh',
    'al-Suyuti', 'Ibn al-Jawzi', 'al-Tabatabai',
    'Ibn Taymiyyah', 'Ibn Qa\'yyim', 'al-Ghazali',
  ];
  
  const found = new Set<string>();
  
  for (const scholar of scholars) {
    if (text.includes(scholar)) {
      found.add(scholar);
    }
  }
  
  return Array.from(found);
}

/**
 * Extract conceptual keywords from content
 * These represent abstract ideas: abrogation, corruption, contradiction, etc.
 */
export function extractConcepts(text: string): string[] {
  const conceptKeywords = [
    'abrogation', 'naskh', 'tahrif', 'corruption', 'distortion',
    'contradiction', 'paradox', 'inconsistency', 'preserved', 'preservation',
    'authenticity', 'chain', 'isnad', 'manuscript', 'paleography',
    'canonization', 'compilation', 'transmission', 'interpolation',
    'integrity', 'textual', 'variant', 'harmony', 'harmonization',
    'circular reasoning', 'false equivalence', 'begging the question',
    'deity', 'atonement', 'resurrection', 'crucifixion',
    'omniscience', 'omnipotence', 'divine speech', 'revelation',
    'prophecy', 'miracle', 'historical', 'anachronism', 'scientific',
  ];
  
  const normalizedText = text.toLowerCase();
  const found = new Set<string>();
  
  for (const concept of conceptKeywords) {
    if (normalizedText.includes(concept)) {
      found.add(concept);
    }
  }
  
  return Array.from(found);
}

/**
 * Parse a content block into text for extraction
 */
function blockToText(block: ContentBlock): string {
  if (typeof block === 'string') {
    return block;
  }
  if ('q' in block) {
    return (block as BlockQuote).q + (block.ref ? ' ' + block.ref : '');
  }
  if ('b' in block) {
    return (block as { b: string[] }).b.join(' ');
  }
  return '';
}

/**
 * Process citations from content into structured CitationRef
 */
function processCitations(blocks: ContentBlock[]): CitationRef[] {
  const citations: CitationRef[] = [];
  const seenRefs = new Set<string>();
  
  for (const block of blocks) {
    const text = blockToText(block);
    
    // Extract verses
    const verses = extractVerseReferences(text);
    for (const verse of verses) {
      if (!seenRefs.has(verse)) {
        citations.push({ type: 'quran', reference: verse });
        seenRefs.add(verse);
      }
    }
    
    // Extract hadith
    const hadith = extractHadithReferences(text);
    for (const h of hadith) {
      if (!seenRefs.has(h)) {
        citations.push({ type: 'hadith', reference: h });
        seenRefs.add(h);
      }
    }
    
    // Extract scholars
    const scholars = extractScholarReferences(text);
    for (const scholar of scholars) {
      if (!seenRefs.has(scholar)) {
        citations.push({ type: 'scholar', reference: scholar });
        seenRefs.add(scholar);
      }
    }
  }
  
  return citations;
}

/**
 * Build a processed issue with extracted metadata
 */
export function processIssue(
  partNum: number,
  partSlug: string,
  issueNum: number,
  issueSlug: string,
  title: string,
  href: string,
  critique: ContentBlock[],
  response: ContentBlock[],
  rebuttal: ContentBlock[]
): ProcessedIssue {
  const allBlocks = [...critique, ...response, ...rebuttal];
  const allText = allBlocks.map(blockToText).join(' ');
  
  const citations = processCitations(allBlocks);
  
  const verses = extractVerseReferences(allText);
  const hadith = extractHadithReferences(allText);
  const scholars = extractScholarReferences(allText);
  const concepts = extractConcepts(allText);
  
  return {
    partNum,
    partSlug,
    issueNum,
    issueSlug,
    title,
    href,
    critique,
    response,
    rebuttal,
    concepts,
    citations,
    mentions: {
      verses,
      hadith,
      scholars,
    },
  };
}

/**
 * Create an IssueNode from a processed issue
 */
export function createIssueNode(processed: ProcessedIssue): IssueNode {
  const id = `issue-${processed.partNum}-${processed.issueNum}`;
  
  return {
    id,
    type: 'issue',
    label: processed.title,
    description: `Part ${processed.partNum}, Issue ${processed.issueNum}`,
    partNum: processed.partNum,
    issueNum: processed.issueNum,
    partSlug: processed.partSlug,
    issueSlug: processed.issueSlug,
    href: processed.href,
    metadata: {
      concepts: processed.concepts,
      citationCount: processed.citations.length,
    },
  };
}

/**
 * Create concept nodes and track frequency
 */
export function createConceptNodes(processedIssues: ProcessedIssue[]): Map<string, ConceptNode> {
  const conceptMap = new Map<string, { count: number; contexts: Set<string> }>();
  
  // Aggregate concepts across all issues
  for (const issue of processedIssues) {
    for (const concept of issue.concepts) {
      if (!conceptMap.has(concept)) {
        conceptMap.set(concept, { count: 0, contexts: new Set() });
      }
      const entry = conceptMap.get(concept)!;
      entry.count++;
      entry.contexts.add(`${issue.title} (Part ${issue.partNum})`);
    }
  }
  
  // Convert to ConceptNode
  const nodes = new Map<string, ConceptNode>();
  
  for (const [concept, data] of conceptMap.entries()) {
    const id = `concept-${concept.toLowerCase().replace(/\s+/g, '-')}`;
    nodes.set(concept, {
      id,
      type: 'concept',
      label: concept,
      frequency: data.count,
      contexts: Array.from(data.contexts).slice(0, 3),
      metadata: { category: 'conceptual' },
    });
  }
  
  return nodes;
}

/**
 * Build edges between related issues
 * Strategy:
 * 1. Issues in the same part are related
 * 2. Issues sharing concepts are related
 * 3. Issues sharing citations are related
 * 4. Explicit response/rebuttal relationships (if marked)
 */
export function buildIssueRelationships(
  processedIssues: ProcessedIssue[]
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  
  // Helper to avoid duplicate edges
  const addEdge = (source: string, target: string, type: string, weight: number) => {
    const key = [source, target, type].sort().join('|');
    if (!edgeSet.has(key)) {
      edges.push({
        source,
        target,
        type: type as any,
        weight,
      });
      edgeSet.add(key);
    }
  };
  
  for (let i = 0; i < processedIssues.length; i++) {
    const issue1 = processedIssues[i];
    const id1 = `issue-${issue1.partNum}-${issue1.issueNum}`;
    
    for (let j = i + 1; j < processedIssues.length; j++) {
      const issue2 = processedIssues[j];
      const id2 = `issue-${issue2.partNum}-${issue2.issueNum}`;
      
      let weight = 0;
      
      // Same part → weak relationship
      if (issue1.partNum === issue2.partNum) {
        weight += 0.3;
      }
      
      // Shared concepts → medium relationship
      const sharedConcepts = issue1.concepts.filter(c => issue2.concepts.includes(c));
      weight += sharedConcepts.length * 0.2;
      
      // Shared citations → strong relationship
      const sharedCitations = issue1.citations.filter(c1 =>
        issue2.citations.some(c2 => c1.reference === c2.reference)
      );
      weight += sharedCitations.length * 0.25;
      
      // Shared scholars → medium relationship
      const sharedScholars = issue1.mentions.scholars.filter(s =>
        issue2.mentions.scholars.includes(s)
      );
      weight += sharedScholars.length * 0.15;
      
      if (weight > 0.1) { // Only create edge if meaningful connection
        addEdge(id1, id2, 'related', Math.min(weight, 1));
      }
    }
  }
  
  return edges;
}

/**
 * Build the complete knowledge graph
 */
export function buildKnowledgeGraph(
  processedIssues: ProcessedIssue[]
): KnowledgeGraph {
  const graph: KnowledgeGraph = {
    nodes: new Map(),
    edges: [],
    nodesByType: new Map(),
    concepts: new Map(),
    issuesByPartAndSlug: new Map(),
    citationIndex: new Map(),
    conceptIndex: new Map(),
  };
  
  // Create issue nodes
  for (const processed of processedIssues) {
    const issueNode = createIssueNode(processed);
    graph.nodes.set(issueNode.id, issueNode);
    
    // Index by part and slug
    if (!graph.issuesByPartAndSlug.has(processed.partSlug)) {
      graph.issuesByPartAndSlug.set(processed.partSlug, new Map());
    }
    graph.issuesByPartAndSlug.get(processed.partSlug)!.set(processed.issueSlug, issueNode);
    
    // Register node type
    if (!graph.nodesByType.has('issue')) {
      graph.nodesByType.set('issue', []);
    }
    graph.nodesByType.get('issue')!.push(issueNode);
  }
  
  // Create concept nodes
  const conceptNodes = createConceptNodes(processedIssues);
  for (const [concept, node] of conceptNodes.entries()) {
    graph.nodes.set(node.id, node);
    graph.concepts.set(concept, node);
    
    if (!graph.nodesByType.has('concept')) {
      graph.nodesByType.set('concept', []);
    }
    graph.nodesByType.get('concept')!.push(node);
  }
  
  // Build edges
  graph.edges = buildIssueRelationships(processedIssues);
  
  // Build citation index (citation → issue IDs)
  for (const processed of processedIssues) {
    const issueId = `issue-${processed.partNum}-${processed.issueNum}`;
    
    for (const citation of processed.citations) {
      const key = citation.reference;
      if (!graph.citationIndex.has(key)) {
        graph.citationIndex.set(key, []);
      }
      graph.citationIndex.get(key)!.push(issueId);
    }
    
    // Build concept index
    for (const concept of processed.concepts) {
      if (!graph.conceptIndex.has(concept)) {
        graph.conceptIndex.set(concept, []);
      }
      graph.conceptIndex.get(concept)!.push(issueId);
    }
  }
  
  return graph;
}
