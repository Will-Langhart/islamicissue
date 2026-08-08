// Review status is data, not code: it lives in review-status.json so the editorial
// pipeline (verifier/apply-review.mjs) can merge machine-assisted reviews into it
// without rewriting this module. A JSON import (with import attribute) is bundled
// safely by Next.js/Turbopack — including into client components via structure.mjs —
// and is valid in raw `node` scripts (build-graph.mjs, build-doc.mjs) on Node >= 22.
// (Do NOT use fs here: structure.mjs is imported by client components, where fs is absent.)
import issueReviewStatus from "./review-status.json" with { type: "json" };

export { issueReviewStatus };

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
