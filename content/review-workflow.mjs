// Review status is data, not code: it lives in review-status.json so the editorial
// pipeline (verifier/apply-review.mjs) can merge machine-assisted reviews into it
// without rewriting this module. Read via fs so it works identically under the
// Next.js bundler and raw `node` scripts (build-graph.mjs, build-doc.mjs).
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));

export const issueReviewStatus = JSON.parse(
  readFileSync(join(here, "review-status.json"), "utf8")
);

export const defaultReviewStatus = {
  citation: {
    status: "unreviewed",
    reviewer: "",
    reviewedAt: "",
    notes: "",
  },
  proof: {
    status: "unreviewed",
    reviewer: "",
    reviewedAt: "",
    notes: "",
  },
};

export function reviewForIssue(partSlug, issueSlug) {
  const key = `${partSlug}/${issueSlug}`;
  const value = issueReviewStatus[key];
  if (!value) return defaultReviewStatus;
  return {
    citation: { ...defaultReviewStatus.citation, ...(value.citation || {}) },
    proof: { ...defaultReviewStatus.proof, ...(value.proof || {}) },
  };
}
