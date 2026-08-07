// SSOT bridge: flattens content.mjs into JSON the Python feeder reads.
// Reuses lib/structure.mjs so part/issue slugs match review-workflow.mjs keys
// exactly, and stamps a per-issue contentHash so the pipeline can detect edits.
// Content stays the single source of truth — this only reads it.
import { createHash } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import { site } from "../lib/structure.mjs";

const norm = (b) =>
  typeof b === "string" ? { type: "para", text: b }
  : b.q ? { type: "quote", q: b.q, ref: b.ref || "" }
  : b.b ? { type: "bullet", items: b.b }
  : { type: "para", text: "" };

const hashOf = (blocks) =>
  createHash("sha256").update(JSON.stringify(blocks)).digest("hex").slice(0, 16);

const issues = site.flatMap((part) =>
  part.items.map((item) => {
    const blocks = {
      critique: (item.critique || []).map(norm),
      response: (item.response || []).map(norm),
      rebuttal: (item.rebuttal || []).map(norm),
    };
    return {
      slug: `${part.slug}/${item.slug}`,   // e.g. "islamic-dilemma/the-dilemma-stated"
      title: item.title,
      contentHash: hashOf(blocks),
      blocks,
    };
  })
);

mkdirSync("verifier", { recursive: true });
writeFileSync("verifier/issues.json", JSON.stringify(issues, null, 2));
console.log(`Wrote ${issues.length} issues (hashed) → verifier/issues.json`);
