// Builds the reviewed-only knowledge corpus that is stuffed into the chatbot's
// cached system prompt. Server-only — never import this into a client component.
//
// Source of truth is content/content.mjs (via lib/structure.mjs `site`), the same
// content that feeds the website and the Word doc, so the corpus is always in sync
// with reviewed material. Only issues whose citation review status is "reviewed"
// are included, so the bot can never cite an unreviewed draft.

import { site, blockText, roman, getRelated, conclusionParas } from "../structure.mjs";
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
  // The compendium flags weaknesses in its OWN arguments. Surfacing these is the
  // point of an honest internal critique — never hide them from the reader.
  if (proof.fallacies?.length) {
    lines.push(
      "  Self-flagged weaknesses (this argument's own vulnerable points):\n" +
        proof.fallacies.map((f) => `    - ${f}`).join("\n")
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
  // Hand-curated cross-references (structure.mjs relatedMap) — lets the bot point
  // the reader to thematically connected issues. Only reviewed related issues.
  const related = getRelated(part.slug, item.slug).filter((r) =>
    isReviewed(r.partSlug, r.issueSlug)
  );
  if (related.length) {
    parts.push(
      "RELATED: " +
        related.map((r) => `[${r.title}](${r.href})`).join("; ")
    );
  }
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
  // The cumulative case: how the individual issues stack into one argument. Feeds
  // "big picture" / "strongest overall case" questions that no single issue answers.
  const conclusion = conclusionParas?.length
    ? `### The Cumulative Case\n` +
      `PART: Closing synthesis\n` +
      `URL: /conclusion\n` +
      `SYNTHESIS: ${conclusionParas.join("\n\n")}`
    : "";
  if (conclusion) blocks.push(conclusion);

  corpusCache =
    `The following are the ${blocks.length} reviewed sections of the compendium ` +
    `"Examining Islam from Within" (the reviewed issues plus a closing synthesis). ` +
    `Each section has a URL you must cite when you use it. Answer only from this ` +
    `material.\n\n` +
    blocks.join("\n\n---\n\n");
  return corpusCache;
}
