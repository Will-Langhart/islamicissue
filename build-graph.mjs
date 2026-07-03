/**
 * Build-time knowledge graph + citation report generator.
 *
 * Outputs:
 * - public/graph-index.json
 * - public/citation-report.json
 */

import { mkdirSync, writeFileSync } from "fs";
import { flatIssues, site } from "./lib/structure.mjs";

const SURAH_AYAH_COUNT = [
  0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54,
  45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62,
  55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11,
  8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

const HADITH_COLLECTION_ALIASES = {
  "Sahih al-Bukhari": ["Sahih al-Bukhari", "Bukhari"],
  "Sahih Muslim": ["Sahih Muslim", "Muslim"],
  "Sunan Abu Dawud": ["Sunan Abu Dawud", "Abu Dawud"],
  "Jami` at-Tirmidhi": ["Jami` at-Tirmidhi", "Tirmidhi"],
  "Sunan an-Nasa'i": ["Sunan an-Nasa'i", "Nasa'i"],
  "Sunan Ibn Majah": ["Sunan Ibn Majah", "Ibn Majah"],
};

const aliasToCanonical = Object.entries(HADITH_COLLECTION_ALIASES).reduce(
  (acc, [canonical, aliases]) => {
    for (const alias of aliases) acc[alias.toLowerCase()] = canonical;
    return acc;
  },
  {}
);

function blockToText(block) {
  if (typeof block === "string") return block;
  if (block.q) return block.q + (block.ref ? ` ${block.ref}` : "");
  if (block.b) return block.b.join(" ");
  return "";
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function extractVerseCandidates(text) {
  const tagged = /Quran\s+(\d{1,3}):(\d{1,3})/gi;
  const bare = /\b(\d{1,3}):(\d{1,3})\b/g;
  const candidates = [];
  let match;

  while ((match = tagged.exec(text)) !== null) {
    candidates.push({
      source: "tagged",
      raw: match[0],
      surah: Number(match[1]),
      ayah: Number(match[2]),
    });
  }
  while ((match = bare.exec(text)) !== null) {
    candidates.push({
      source: "bare",
      raw: match[0],
      surah: Number(match[1]),
      ayah: Number(match[2]),
    });
  }

  return candidates;
}

function validateVerseCandidate(candidate) {
  if (candidate.surah < 1 || candidate.surah > 114) {
    return "Surah out of range (1-114).";
  }
  if (candidate.ayah < 1) {
    return "Ayah must be positive.";
  }
  const maxAyah = SURAH_AYAH_COUNT[candidate.surah];
  if (candidate.ayah > maxAyah) {
    return `Ayah out of range for surah ${candidate.surah} (max ${maxAyah}).`;
  }
  return null;
}

function extractVerseReferences(text) {
  const valid = new Set();
  for (const candidate of extractVerseCandidates(text)) {
    if (!validateVerseCandidate(candidate)) {
      valid.add(`${candidate.surah}:${candidate.ayah}`);
    }
  }
  return [...valid];
}

function extractHadithCandidates(text) {
  const aliases = Object.keys(aliasToCanonical)
    .sort((a, b) => b.length - a.length)
    .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${aliases.join("|")})\\s+(\\d+)\\b`, "gi");
  const candidates = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    candidates.push({
      raw: match[0],
      alias: match[1],
      canonical: aliasToCanonical[match[1].toLowerCase()] || match[1],
      number: Number(match[2]),
    });
  }
  return candidates;
}

function validateHadithCandidate(candidate) {
  if (!candidate.canonical || !HADITH_COLLECTION_ALIASES[candidate.canonical]) {
    return "Unknown collection alias.";
  }
  if (!Number.isFinite(candidate.number) || candidate.number <= 0) {
    return "Hadith number must be positive.";
  }
  return null;
}

function extractHadithReferences(text) {
  const hadith = new Set();
  for (const candidate of extractHadithCandidates(text)) {
    if (!validateHadithCandidate(candidate)) {
      hadith.add(`${candidate.canonical} ${candidate.number}`);
    }
  }
  return [...hadith];
}

function extractScholarReferences(text) {
  const scholars = [
    "al-Tabari",
    "Ibn Hazm",
    "al-Razi",
    "Muhammad Abduh",
    "al-Suyuti",
    "Ibn al-Jawzi",
    "al-Tabatabai",
    "Ibn Taymiyyah",
    "Ibn Qa'yyim",
    "al-Ghazali",
  ];
  const found = new Set();
  for (const scholar of scholars) {
    if (text.includes(scholar)) found.add(scholar);
  }
  return [...found];
}

function extractConcepts(text) {
  const conceptKeywords = [
    "abrogation",
    "naskh",
    "tahrif",
    "corruption",
    "distortion",
    "contradiction",
    "paradox",
    "inconsistency",
    "preserved",
    "preservation",
    "authenticity",
    "chain",
    "isnad",
    "manuscript",
    "paleography",
    "canonization",
    "compilation",
    "transmission",
    "interpolation",
    "integrity",
    "textual",
    "variant",
    "harmony",
    "harmonization",
    "circular reasoning",
    "false equivalence",
    "begging the question",
    "deity",
    "atonement",
    "resurrection",
    "crucifixion",
    "omniscience",
    "omnipotence",
    "divine speech",
    "revelation",
    "prophecy",
    "miracle",
    "historical",
    "anachronism",
    "scientific",
  ];
  const normalizedText = text.toLowerCase();
  return conceptKeywords.filter((concept) => normalizedText.includes(concept));
}

function processCitations(blocks) {
  const citations = [];
  const seen = new Set();
  const warnings = [];

  for (const block of blocks) {
    const text = blockToText(block);

    for (const candidate of extractVerseCandidates(text)) {
      const reason = validateVerseCandidate(candidate);
      if (reason) {
        warnings.push({
          type: "quran",
          reference: candidate.raw,
          reason,
        });
      } else {
        const ref = `${candidate.surah}:${candidate.ayah}`;
        if (!seen.has(ref)) {
          citations.push({ type: "quran", reference: ref });
          seen.add(ref);
        }
      }
    }

    for (const candidate of extractHadithCandidates(text)) {
      const reason = validateHadithCandidate(candidate);
      if (reason) {
        warnings.push({
          type: "hadith",
          reference: candidate.raw,
          reason,
        });
      } else {
        const ref = `${candidate.canonical} ${candidate.number}`;
        if (!seen.has(ref)) {
          citations.push({ type: "hadith", reference: ref });
          seen.add(ref);
        }
      }
    }

    for (const scholar of extractScholarReferences(text)) {
      if (!seen.has(scholar)) {
        citations.push({ type: "scholar", reference: scholar });
        seen.add(scholar);
      }
    }
  }

  return { citations, warnings };
}

function processIssue(issue, part, item) {
  const allBlocks = [...(item.critique || []), ...(item.response || []), ...(item.rebuttal || [])];
  const allText = normalizeWhitespace(allBlocks.map(blockToText).join(" "));
  const { citations, warnings } = processCitations(allBlocks);
  return {
    partNum: issue.partNum,
    partSlug: issue.partSlug,
    issueNum: issue.num,
    issueSlug: issue.issueSlug,
    title: issue.title,
    href: issue.href,
    concepts: extractConcepts(allText),
    citations,
    warnings,
    review: item.review || {
      citation: { status: "unreviewed" },
      proof: { status: "unreviewed" },
    },
    hasStructuredProof: Boolean(item.proof),
    mentions: {
      verses: extractVerseReferences(allText),
      hadith: extractHadithReferences(allText),
      scholars: extractScholarReferences(allText),
    },
    partTitle: part.title,
  };
}

function createIssueNode(processed) {
  return {
    id: `issue-${processed.partNum}-${processed.issueNum}`,
    type: "issue",
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
      warningCount: processed.warnings.length,
      structuredProof: processed.hasStructuredProof,
      citationReviewStatus: processed.review?.citation?.status || "unreviewed",
      proofReviewStatus: processed.review?.proof?.status || "unreviewed",
    },
  };
}

function createConceptNodes(processedIssues) {
  const conceptMap = new Map();
  for (const issue of processedIssues) {
    for (const concept of issue.concepts) {
      if (!conceptMap.has(concept)) {
        conceptMap.set(concept, { count: 0, contexts: new Set() });
      }
      const entry = conceptMap.get(concept);
      entry.count += 1;
      entry.contexts.add(`${issue.title} (Part ${issue.partNum})`);
    }
  }

  const nodes = new Map();
  for (const [concept, data] of conceptMap.entries()) {
    nodes.set(concept, {
      id: `concept-${concept.toLowerCase().replace(/\s+/g, "-")}`,
      type: "concept",
      label: concept,
      frequency: data.count,
      contexts: [...data.contexts].slice(0, 3),
      metadata: { category: "conceptual" },
    });
  }
  return nodes;
}

function buildIssueRelationships(processedIssues) {
  const edges = [];
  const seen = new Set();

  for (let i = 0; i < processedIssues.length; i += 1) {
    const issue1 = processedIssues[i];
    const id1 = `issue-${issue1.partNum}-${issue1.issueNum}`;
    for (let j = i + 1; j < processedIssues.length; j += 1) {
      const issue2 = processedIssues[j];
      const id2 = `issue-${issue2.partNum}-${issue2.issueNum}`;
      let weight = 0;

      if (issue1.partNum === issue2.partNum) weight += 0.3;
      const sharedConcepts = issue1.concepts.filter((c) => issue2.concepts.includes(c));
      weight += sharedConcepts.length * 0.2;
      const sharedCitations = issue1.citations.filter((c1) =>
        issue2.citations.some((c2) => c2.reference === c1.reference)
      );
      weight += sharedCitations.length * 0.25;
      const sharedScholars = issue1.mentions.scholars.filter((s) =>
        issue2.mentions.scholars.includes(s)
      );
      weight += sharedScholars.length * 0.15;

      if (weight > 0.1) {
        const key = [id1, id2, "related"].sort().join("|");
        if (!seen.has(key)) {
          edges.push({
            source: id1,
            target: id2,
            type: "related",
            weight: Math.min(weight, 1),
          });
          seen.add(key);
        }
      }
    }
  }
  return edges;
}

function buildKnowledgeGraph(processedIssues) {
  const graph = {
    nodes: new Map(),
    edges: [],
    concepts: new Map(),
    issuesByPartAndSlug: new Map(),
    citationIndex: new Map(),
    conceptIndex: new Map(),
  };

  for (const processed of processedIssues) {
    const issueNode = createIssueNode(processed);
    graph.nodes.set(issueNode.id, issueNode);
    if (!graph.issuesByPartAndSlug.has(processed.partSlug)) {
      graph.issuesByPartAndSlug.set(processed.partSlug, new Map());
    }
    graph.issuesByPartAndSlug.get(processed.partSlug).set(processed.issueSlug, issueNode);
  }

  const conceptNodes = createConceptNodes(processedIssues);
  for (const [concept, node] of conceptNodes.entries()) {
    graph.nodes.set(node.id, node);
    graph.concepts.set(concept, node);
  }

  graph.edges = buildIssueRelationships(processedIssues);

  for (const processed of processedIssues) {
    const issueId = `issue-${processed.partNum}-${processed.issueNum}`;
    for (const citation of processed.citations) {
      if (!graph.citationIndex.has(citation.reference)) {
        graph.citationIndex.set(citation.reference, []);
      }
      graph.citationIndex.get(citation.reference).push(issueId);
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

function toCountArray(map, limit = 15, formatter = ([reference, issueIds]) => ({
  reference,
  count: issueIds.length,
  issues: issueIds,
})) {
  return [...map.entries()]
    .map(formatter)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function buildCitationReport(processedIssues, graph) {
  const byType = { quran: 0, hadith: 0, scholar: 0 };
  const warnings = [];
  const quranMap = new Map();
  const hadithMap = new Map();
  const scholarMap = new Map();
  const partMap = new Map();
  const reviewSummary = {
    citation: { reviewed: 0, in_review: 0, unreviewed: 0 },
    proof: { reviewed: 0, in_review: 0, unreviewed: 0 },
  };

  for (const issue of processedIssues) {
    const issueId = `issue-${issue.partNum}-${issue.issueNum}`;
    const citationStatus = issue.review?.citation?.status || "unreviewed";
    const proofStatus = issue.review?.proof?.status || "unreviewed";
    reviewSummary.citation[citationStatus] = (reviewSummary.citation[citationStatus] || 0) + 1;
    reviewSummary.proof[proofStatus] = (reviewSummary.proof[proofStatus] || 0) + 1;

    partMap.set(issue.partNum, (partMap.get(issue.partNum) || 0) + issue.citations.length);
    for (const citation of issue.citations) {
      byType[citation.type] = (byType[citation.type] || 0) + 1;
      if (citation.type === "quran") {
        if (!quranMap.has(citation.reference)) quranMap.set(citation.reference, new Set());
        quranMap.get(citation.reference).add(issueId);
      }
      if (citation.type === "hadith") {
        if (!hadithMap.has(citation.reference)) hadithMap.set(citation.reference, new Set());
        hadithMap.get(citation.reference).add(issueId);
      }
      if (citation.type === "scholar") {
        if (!scholarMap.has(citation.reference)) scholarMap.set(citation.reference, new Set());
        scholarMap.get(citation.reference).add(issueId);
      }
    }
    for (const warning of issue.warnings) {
      warnings.push({
        issueId,
        issueTitle: issue.title,
        href: issue.href,
        reviewStatus: citationStatus,
        reviewer: issue.review?.citation?.reviewer || "",
        reviewedAt: issue.review?.citation?.reviewedAt || "",
        ...warning,
      });
    }
  }

  const hadithCollectionMap = new Map();
  for (const [reference, issueSet] of hadithMap.entries()) {
    const collection = reference.replace(/\s+\d+$/, "");
    if (!hadithCollectionMap.has(collection)) hadithCollectionMap.set(collection, new Set());
    for (const id of issueSet) hadithCollectionMap.get(collection).add(id);
  }

  const quranEntries = toCountArray(
    new Map([...quranMap.entries()].map(([ref, ids]) => [ref, [...ids]])),
    20
  );
  const hadithCollectionEntries = toCountArray(
    new Map([...hadithCollectionMap.entries()].map(([ref, ids]) => [ref, [...ids]])),
    12,
    ([collection, issueIds]) => ({ collection, count: issueIds.length, issues: issueIds })
  );
  const scholarEntries = toCountArray(
    new Map([...scholarMap.entries()].map(([ref, ids]) => [ref, [...ids]])),
    12
  );

  const citationsByPart = [...partMap.entries()]
    .map(([partNum, count]) => ({ partNum, count }))
    .sort((a, b) => a.partNum - b.partNum);

  const totals = Object.values(byType).reduce((sum, count) => sum + count, 0);

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    summary: {
      totalCitations: totals,
      byType,
      uniqueQuranReferences: quranMap.size,
      uniqueHadithReferences: hadithMap.size,
      uniqueScholars: scholarMap.size,
      issuesWithWarnings: new Set(warnings.map((warning) => warning.issueId)).size,
      totalWarnings: warnings.length,
      averageCitationsPerIssue: Number((totals / Math.max(processedIssues.length, 1)).toFixed(2)),
      graphNodes: graph.nodes.size,
      graphEdges: graph.edges.length,
      reviewCoverage: reviewSummary,
    },
    topQuranReferences: quranEntries,
    topHadithCollections: hadithCollectionEntries,
    topScholars: scholarEntries,
    citationsByPart,
    validationWarnings: warnings.slice(0, 200),
  };
}

function writeJson(path, payload) {
  writeFileSync(path, JSON.stringify(payload, null, 2));
}

async function generate() {
  console.log("🔗 Generating knowledge graph index...");
  console.log(`📝 Processing ${flatIssues.length} issues...`);

  const processedIssues = [];
  for (const issue of flatIssues) {
    const part = site.find((entry) => entry.slug === issue.partSlug);
    const item = part?.items.find((entry) => entry.slug === issue.issueSlug);
    if (!part || !item) continue;
    processedIssues.push(processIssue(issue, part, item));
  }
  console.log(`✓ Processed ${processedIssues.length} issues`);

  console.log("🔨 Building knowledge graph...");
  const graph = buildKnowledgeGraph(processedIssues);
  console.log(`  ✓ Nodes: ${graph.nodes.size}`);
  console.log(`  ✓ Edges: ${graph.edges.length}`);
  console.log(`  ✓ Concepts: ${graph.concepts.size}`);
  console.log(`  ✓ Citation index entries: ${graph.citationIndex.size}`);

  const citationReport = buildCitationReport(processedIssues, graph);
  console.log(`  ✓ Citation warnings: ${citationReport.summary.totalWarnings}`);

  const graphIndex = {
    version: "1.1",
    generatedAt: new Date().toISOString(),
    stats: {
      nodeCount: graph.nodes.size,
      edgeCount: graph.edges.length,
      conceptCount: graph.concepts.size,
      issueCount: flatIssues.length,
    },
    nodes: [...graph.nodes.entries()],
    edges: graph.edges,
    citationIndex: [...graph.citationIndex.entries()],
    conceptIndex: [...graph.conceptIndex.entries()],
    issueIndex: [...graph.issuesByPartAndSlug.entries()].map(([partSlug, issues]) => [
      partSlug,
      [...issues.entries()],
    ]),
  };

  mkdirSync("public", { recursive: true });
  writeJson("public/graph-index.json", graphIndex);
  writeJson("public/citation-report.json", citationReport);
  console.log("✓ Saved graph index to public/graph-index.json");
  console.log("✓ Saved citation report to public/citation-report.json");
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
