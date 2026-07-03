/**
 * Core type definitions for the knowledge graph and content structure.
 */

// ============ Content Structure Types ============

export interface BlockQuote {
  q: string;
  ref?: string;
}

export interface BulletList {
  b: string[];
}

export type ContentBlock = string | BlockQuote | BulletList;

export interface Issue {
  title: string;
  critique: ContentBlock[];
  response: ContentBlock[];
  rebuttal: ContentBlock[];
  evidence?: Evidence[];
  editorial?: string;
  audit?: unknown;
}

export interface Part {
  title: string;
  intro: string[];
  items: Issue[];
}

// ============ Knowledge Graph Node Types ============

export type NodeType = 'issue' | 'concept' | 'source' | 'verse' | 'hadith' | 'scholar' | 'manuscript' | 'person';

export interface GraphNode<T extends NodeType = NodeType> {
  id: string;
  type: T;
  label: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface IssueNode extends GraphNode<'issue'> {
  partNum: number;
  issueNum: number;
  partSlug: string;
  issueSlug: string;
  href: string;
}

export interface ConceptNode extends GraphNode<'concept'> {
  frequency: number; // How many times mentioned
  contexts: string[]; // Brief context snippets
}

export interface SourceNode extends GraphNode<'source'> {
  sourceType: 'quran' | 'hadith' | 'manuscript' | 'tafsir' | 'scholar';
  reference: string; // e.g., "Quran 5:47", "Bukhari 4428"
}

export interface VerseNode extends GraphNode<'verse'> {
  surah: number;
  ayah: number;
  arabic?: string;
  translation?: string;
  themes: string[];
}

export interface HadithNode extends GraphNode<'hadith'> {
  collection: string; // Bukhari, Muslim, etc.
  hadithNumber: string;
  chainStrength?: 'sahih' | 'hasan' | 'da\'if' | 'unknown';
  text?: string;
}

export interface ScholarNode extends GraphNode<'scholar'> {
  period: string; // e.g., "8th century", "modern"
  school?: string; // e.g., "Maliki", "Hanafi"
  expertise: string[];
}

// ============ Edge Types ============

export type EdgeType = 
  | 'refutes'           // Issue → Issue
  | 'supports'          // Issue → Issue
  | 'contradicts'       // Issue → Issue
  | 'cites'             // Issue → Source/Verse/Hadith
  | 'mentionsOf'        // Issue/Source → Concept
  | 'supportedBy'       // Issue → Source/Verse
  | 'refutedBy'         // Issue → Response (Issue)
  | 'containedIn'       // Verse → Surah
  | 'authored'          // Scholar → Response/Commentary
  | 'contains'          // Manuscript → Verse
  | 'responds'          // Scholar/Position → Issue
  | 'related';          // Issue ↔ Issue (general relation)

export interface GraphEdge {
  source: string;       // Node ID
  target: string;       // Node ID
  type: EdgeType;
  weight?: number;      // 0-1, confidence or strength
  metadata?: Record<string, unknown>;
}

// ============ Evidence & Citation Types ============

export interface Evidence {
  type: 'quran' | 'hadith' | 'manuscript' | 'scholar' | 'historical';
  reference: string;
  quote?: string;
  strength?: 'strong' | 'moderate' | 'weak';
}

export interface CitationRef {
  type: 'quran' | 'hadith' | 'manuscript' | 'scholar';
  reference: string;
  context?: string;
}

// ============ Knowledge Graph ============

export interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  nodesByType: Map<NodeType, GraphNode[]>;
  concepts: Map<string, ConceptNode>;
  // Indexes for fast lookups
  issuesByPartAndSlug: Map<string, Map<string, IssueNode>>;
  citationIndex: Map<string, string[]>; // citation ref → issue IDs
  conceptIndex: Map<string, string[]>;  // concept → issue IDs
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  depth: number;
}

// ============ Structured Content ============

export interface ProcessedIssue {
  partNum: number;
  partSlug: string;
  issueNum: number;
  issueSlug: string;
  title: string;
  href: string;
  critique: ContentBlock[];
  response: ContentBlock[];
  rebuttal: ContentBlock[];
  concepts: string[];
  citations: CitationRef[];
  mentions: {
    verses: string[];
    hadith: string[];
    scholars: string[];
  };
}

// ============ Query Types ============

export interface RelatedIssueResult {
  issueId: string;
  href: string;
  title: string;
  reason: string;        // "Shares concept: abrogation"
  relevance: number;     // 0-1 confidence
  sharedElements: {
    concepts?: string[];
    citations?: string[];
    scholars?: string[];
  };
}

export interface GraphNeighborhood {
  center: IssueNode;
  related: RelatedIssueResult[];
  concepts: ConceptNode[];
  sources: SourceNode[];
  depth: number;
}
