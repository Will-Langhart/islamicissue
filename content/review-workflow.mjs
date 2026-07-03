export const issueReviewStatus = {
  "islamic-dilemma/what-the-quran-says-about-the-torah-and-the-gospel": {
    citation: {
      status: "reviewed",
      reviewer: "Editorial Board",
      reviewedAt: "2026-07-03",
      notes: "Verse references and historical framing checked against source register.",
    },
    proof: {
      status: "reviewed",
      reviewer: "Editorial Board",
      reviewedAt: "2026-07-03",
      notes: "Premise structure accepted with explicit assumptions documented.",
    },
  },
  "islamic-dilemma/the-dilemma-stated": {
    citation: {
      status: "reviewed",
      reviewer: "Research Team",
      reviewedAt: "2026-07-03",
      notes: "Core Quran and manuscript references audited.",
    },
    proof: {
      status: "in_review",
      reviewer: "Research Team",
      reviewedAt: "2026-07-03",
      notes: "Counter-response implications under secondary review.",
    },
  },
  "islamic-dilemma/the-qurans-own-falsification-test": {
    citation: {
      status: "reviewed",
      reviewer: "Editorial Board",
      reviewedAt: "2026-07-03",
      notes: "Cross-part references verified.",
    },
    proof: {
      status: "reviewed",
      reviewer: "Editorial Board",
      reviewedAt: "2026-07-03",
      notes: "Formal premise chain accepted for publication.",
    },
  },
};

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

