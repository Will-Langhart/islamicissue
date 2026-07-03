/**
 * Build-time knowledge graph index generator
 * 
 * Run during `npm run build` to extract and index the graph.
 * Outputs: public/graph-index.json (static, deployed with site)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { site, flatIssues } from './lib/structure.mjs';

/**
 * Extract verse references from text
 */
function extractVerseReferences(text) {
  const patterns = [
    /Quran\s+(\d{1,3}):(\d{1,3})/gi,
    /(\d{1,3}):(\d{1,3})(?:\s|$|[^\d])/g,
  ];
  
  const verses = new Set();
  
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
 * Extract hadith references
 */
function extractHadithReferences(text) {
  const collections = [
    'Sahih al-Bukhari', 'Bukhari',
    'Sahih Muslim', 'Muslim',
    'Sunan Abu Dawud', 'Abu Dawud',
    'Jami` at-Tirmidhi', 'Tirmidhi',
    'Sunan an-Nasa\'i', 'Nasa\'i',
    'Sunan Ibn Majah', 'Ibn Majah',
  ];
  
  const hadith = new Set();
  
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
 * Extract scholar names
 */
function extractScholarReferences(text) {
  const scholars = [
    'al-Tabari', 'Ibn Hazm', 'al-Razi', 'Muhammad Abduh',
    'al-Suyuti', 'Ibn al-Jawzi', 'al-Tabatabai',
    'Ibn Taymiyyah', 'Ibn Qa\'yyim', 'al-Ghazali',
  ];
  
  const found = new Set();
  
  for (const scholar of scholars) {
    if (text.includes(scholar)) {
      found.add(scholar);
    }
  }
  
  return Array.from(found);
}

/**
 * Extract conceptual keywords
 */
function extractConcepts(text) {
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
  const found = new Set();
  
  for (const concept of conceptKeywords) {
    if (normalizedText.includes(concept)) {
      found.add(concept);
    }
  }
  
  return Array.from(found);
}

/**
 * Convert content block to text
 */
function blockToText(block) {
  if (typeof block === 'string') {
    return block;
  }
  if (block.q) {
    return block.q + (block.ref ? ' ' + block.ref : '');
  }
  if (block.b) {
    return block.b.join(' ');
  }
  return '';
}

/**
 * Process citations from content
 */
function processCitations(blocks) {
  const citations = [];
  const seenRefs = new Set();
  
  for (const block of blocks) {
    const text = blockToText(block);
    
    const verses = extractVerseReferences(text);
    for (const verse of verses) {
      if (!seenRefs.has(verse)) {
        citations.push({ type: 'quran', reference: verse });
        seenRefs.add(verse);
      }
    }
    
    const hadith = extractHadithReferences(text);
    for (const h of hadith) {
      if (!seenRefs.has(h)) {
        citations.push({ type: 'hadith', reference: h });
        seenRefs.add(h);
      }
    }
    
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
 * Process a single issue
 */
function processIssue(partNum, partSlug, issueNum, issueSlug, title, href, critique, response, rebuttal) {
  const allBlocks = [...(critique || []), ...(response || []), ...(rebuttal || [])];
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
 * Create issue node
 */
function createIssueNode(processed) {
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
 * Create concept nodes
 */
function createConceptNodes(processedIssues) {
  const conceptMap = new Map();
  
  for (const issue of processedIssues) {
    for (const concept of issue.concepts) {
      if (!conceptMap.has(concept)) {
        conceptMap.set(concept, { count: 0, contexts: new Set() });
      }
      const entry = conceptMap.get(concept);
      entry.count++;
      entry.contexts.add(`${issue.title} (Part ${issue.partNum})`);
    }
  }
  
  const nodes = new Map();
  
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
 * Build issue relationships
 */
function buildIssueRelationships(processedIssues) {
  const edges = [];
  const edgeSet = new Set();
  
  const addEdge = (source, target, type, weight) => {
    const key = [source, target, type].sort().join('|');
    if (!edgeSet.has(key)) {
      edges.push({
        source,
        target,
        type,
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
      
      if (issue1.partNum === issue2.partNum) {
        weight += 0.3;
      }
      
      const sharedConcepts = issue1.concepts.filter(c => issue2.concepts.includes(c));
      weight += sharedConcepts.length * 0.2;
      
      const sharedCitations = issue1.citations.filter(c1 =>
        issue2.citations.some(c2 => c1.reference === c2.reference)
      );
      weight += sharedCitations.length * 0.25;
      
      const sharedScholars = issue1.mentions.scholars.filter(s =>
        issue2.mentions.scholars.includes(s)
      );
      weight += sharedScholars.length * 0.15;
      
      if (weight > 0.1) {
        addEdge(id1, id2, 'related', Math.min(weight, 1));
      }
    }
  }
  
  return edges;
}

/**
 * Build the complete knowledge graph
 */
function buildKnowledgeGraph(processedIssues) {
  const graph = {
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
    
    if (!graph.issuesByPartAndSlug.has(processed.partSlug)) {
      graph.issuesByPartAndSlug.set(processed.partSlug, new Map());
    }
    graph.issuesByPartAndSlug.get(processed.partSlug).set(processed.issueSlug, issueNode);
    
    if (!graph.nodesByType.has('issue')) {
      graph.nodesByType.set('issue', []);
    }
    graph.nodesByType.get('issue').push(issueNode);
  }
  
  // Create concept nodes
  const conceptNodes = createConceptNodes(processedIssues);
  for (const [concept, node] of conceptNodes.entries()) {
    graph.nodes.set(node.id, node);
    graph.concepts.set(concept, node);
    
    if (!graph.nodesByType.has('concept')) {
      graph.nodesByType.set('concept', []);
    }
    graph.nodesByType.get('concept').push(node);
  }
  
  // Build edges
  graph.edges = buildIssueRelationships(processedIssues);
  
  // Build indexes
  for (const processed of processedIssues) {
    const issueId = `issue-${processed.partNum}-${processed.issueNum}`;
    
    for (const citation of processed.citations) {
      const key = citation.reference;
      if (!graph.citationIndex.has(key)) {
        graph.citationIndex.set(key, []);
      }
      graph.citationIndex.get(key).push(issueId);
    }
    
    for (const concept of processed.concepts) {
      if (!graph.conceptIndex.has(concept)) {
        graph.conceptIndex.set(concept, []);
      }
      graph.conceptIndex.get(concept).push(issueId);
    }
  }
  
  return graph;
}

/**
 * Main: Generate and save the knowledge graph index
 */
async function generateGraphIndex() {
  console.log('🔗 Generating knowledge graph index...');
  
  console.log(`📝 Processing ${flatIssues.length} issues...`);
  
  const processedIssues = [];
  
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
  
  console.log('🔨 Building knowledge graph...');
  const graph = buildKnowledgeGraph(processedIssues);
  
  console.log(`  ✓ Nodes: ${graph.nodes.size}`);
  console.log(`  ✓ Edges: ${graph.edges.length}`);
  console.log(`  ✓ Concepts: ${graph.concepts.size}`);
  console.log(`  ✓ Citation index entries: ${graph.citationIndex.size}`);
  
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
    nodes: Array.from(graph.nodes.entries()),
    edges: graph.edges,
    citationIndex: Array.from(graph.citationIndex.entries()),
    conceptIndex: Array.from(graph.conceptIndex.entries()),
    issueIndex: Array.from(graph.issuesByPartAndSlug.entries()).map(([partSlug, issues]) => [
      partSlug,
      Array.from(issues.entries()),
    ]),
  };
  
  mkdirSync('public', { recursive: true });
  
  const outputPath = 'public/graph-index.json';
  writeFileSync(outputPath, JSON.stringify(graphIndex, null, 2));
  
  const fileSize = (JSON.stringify(graphIndex).length / 1024).toFixed(2);
  console.log(`✓ Saved graph index to ${outputPath}`);
  console.log(`  File size: ${fileSize} KB`);
  
  return graphIndex;
}

generateGraphIndex().catch(console.error);
