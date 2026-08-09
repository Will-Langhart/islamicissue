// Builds the reviewed-only knowledge corpus that is stuffed into the chatbot's
// cached system prompt. Server-only — never import this into a client component.
//
// Source of truth is content/content.mjs (via lib/structure.mjs `site`), the same
// content that feeds the website and the Word doc, so the corpus is always in sync
// with reviewed material. Only issues whose citation review status is "reviewed"
// are included, so the bot can never cite an unreviewed draft.

import { site, blockText, roman } from "../structure.mjs";
import reviewStatus from "../../content/review-status.json";

function isReviewed(partSlug, issueSlug) {
  const record = reviewStatus[`${partSlug}/${issueSlug}`];
  return record?.citation?.status === "reviewed";
}

function proofBlock(proof) {
  if (!proof) return "";
  const lines = [];
  if (proof.premises?.length) {
    lines.push(
      "  Premises:\n" + proof.premises.map((p) => `    - ${p}`).join("\n")
    );
  }
  if (proof.conclusion) lines.push(`  Conclusion: ${proof.conclusion}`);
  if (proof.assumptions?.length) {
    lines.push(
      "  Assumptions:\n" +
        proof.assumptions.map((a) => `    - ${a}`).join("\n")
    );
  }
  if (typeof proof.confidence === "number") {
    lines.push(`  Confidence: ${proof.confidence}`);
  }
  return lines.length ? "PROOF:\n" + lines.join("\n") : "";
}

function issueBlock(part, item) {
  const href = `/${part.slug}/${item.slug}`;
  const parts = [
    `### ${item.title}`,
    `PART: ${roman[part.num - 1]} — ${part.short}`,
    `URL: ${href}`,
    `CRITIQUE: ${blockText(item.critique)}`,
  ];
  const response = blockText(item.response);
  if (response) parts.push(`MUSLIM RESPONSE (steelman): ${response}`);
  const rebuttal = blockText(item.rebuttal);
  if (rebuttal) parts.push(`REBUTTAL: ${rebuttal}`);
  const proof = proofBlock(item.proof);
  if (proof) parts.push(proof);
  return parts.join("\n");
}

let corpusCache = null;
let indexCache = null;

/** Flat list of the reviewed issues included in the corpus. */
export function reviewedIssueIndex() {
  if (indexCache) return indexCache;
  const out = [];
  for (const part of site) {
    for (const item of part.items) {
      if (!isReviewed(part.slug, item.slug)) continue;
      out.push({
        title: item.title,
        href: `/${part.slug}/${item.slug}`,
        part: `Part ${roman[part.num - 1]} — ${part.short}`,
      });
    }
  }
  indexCache = out;
  return out;
}

/** The full reviewed corpus as one string, memoized at module load. */
export function buildCorpus() {
  if (corpusCache) return corpusCache;
  const blocks = [];
  for (const part of site) {
    for (const item of part.items) {
      if (!isReviewed(part.slug, item.slug)) continue;
      blocks.push(issueBlock(part, item));
    }
  }
  corpusCache =
    `The following are the ${blocks.length} reviewed issues of the compendium ` +
    `"Examining Islam from Within". Each issue has a URL you must cite when you ` +
    `use it. Answer only from this material.\n\n` +
    blocks.join("\n\n---\n\n");
  return corpusCache;
}
