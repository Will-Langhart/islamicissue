"use client";

import { useMemo } from "react";

function blockText(entries = []) {
  return entries
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry.q) return `${entry.q} ${entry.ref || ""}`;
      if (entry.b) return entry.b.join(" ");
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstStatement(text, fallback) {
  const sentence = text.match(/^(.{50,280}?[.!?])(?:\s|$)/);
  if (sentence) return sentence[1];
  if (text.length === 0) return fallback;
  return text.slice(0, 220) + (text.length > 220 ? "…" : "");
}

function detectLogicalRisks(text) {
  const normalized = text.toLowerCase();
  const rules = [
    ["false dilemma", ["either", "or"]],
    ["appeal to authority", ["scholar", "consensus", "authority"]],
    ["circularity risk", ["because", "therefore", "it follows"]],
    ["sweeping quantifier", ["all ", "none ", "never ", "always "]],
    ["assumption-heavy leap", ["must", "cannot", "necessarily"]],
  ];
  const found = [];
  for (const [label, needles] of rules) {
    const hitCount = needles.reduce(
      (sum, needle) => sum + (normalized.includes(needle) ? 1 : 0),
      0
    );
    if (hitCount >= 2 || (label === "assumption-heavy leap" && hitCount >= 1)) {
      found.push(label);
    }
  }
  return found.slice(0, 4);
}

function scoreProof({ citations, critiqueLength, responseLength, rebuttalLength, riskCount }) {
  const citationStrength = Math.min(1, citations / 12);
  const balanceStrength =
    (responseLength > 0 ? 0.35 : 0) + (rebuttalLength > 0 ? 0.35 : 0) + (critiqueLength > 0 ? 0.3 : 0);
  const riskPenalty = Math.min(0.35, riskCount * 0.08);
  const score = Math.max(0, citationStrength * 0.55 + balanceStrength * 0.45 - riskPenalty);
  return score;
}

function countCitations(text) {
  const verse = text.match(/Quran\s+\d{1,3}:\d{1,3}|\b\d{1,3}:\d{1,3}\b/gi) || [];
  const hadith = text.match(/(Bukhari|Muslim|Abu Dawud|Tirmidhi|Nasa'i|Ibn Majah)\s+\d+/gi) || [];
  return new Set([...verse, ...hadith]).size;
}

function verdict(score) {
  if (score >= 0.8) return "Formally robust";
  if (score >= 0.62) return "Mostly robust";
  if (score >= 0.45) return "Plausible, needs stronger warrants";
  return "Weak formal support";
}

export default function ProofSystemPanel({
  title,
  critique,
  response,
  rebuttal,
  proof,
  review,
}) {
  const analysis = useMemo(() => {
    const critiqueText = blockText(critique);
    const responseText = blockText(response);
    const rebuttalText = blockText(rebuttal);
    const combined = `${critiqueText} ${responseText} ${rebuttalText}`;
    const risks = detectLogicalRisks(combined);
    const citations = countCitations(combined);
    const proofScore = scoreProof({
      citations,
      critiqueLength: critiqueText.length,
      responseLength: responseText.length,
      rebuttalLength: rebuttalText.length,
      riskCount: risks.length,
    });

    const heuristicResult = {
      premises: [
        firstStatement(critiqueText, "Primary claim extracted from critique."),
        firstStatement(responseText, "Primary Muslim response extracted from response section."),
        firstStatement(rebuttalText, "Critical rebuttal extracted from rebuttal section."),
      ],
      conclusion: firstStatement(
        rebuttalText,
        "Conclusion cannot be inferred because rebuttal content is limited."
      ),
      risks,
      citations,
      proofScore,
      verdict: verdict(proofScore),
      assumptions: [],
      source: "heuristic",
    };
    if (!proof) return heuristicResult;

    const authorPremises =
      Array.isArray(proof.premises) && proof.premises.length > 0
        ? proof.premises.slice(0, 4)
        : heuristicResult.premises;
    const authorRisks =
      Array.isArray(proof.fallacies) && proof.fallacies.length > 0
        ? proof.fallacies.slice(0, 5)
        : heuristicResult.risks;
    const authorScore =
      typeof proof.confidence === "number"
        ? Math.max(0, Math.min(1, proof.confidence))
        : heuristicResult.proofScore;

    return {
      ...heuristicResult,
      premises: authorPremises,
      conclusion: proof.conclusion || heuristicResult.conclusion,
      risks: authorRisks,
      assumptions: Array.isArray(proof.assumptions) ? proof.assumptions.slice(0, 5) : [],
      proofScore: authorScore,
      verdict: verdict(authorScore),
      source: proof.source || "author",
    };
  }, [critique, response, rebuttal, proof]);

  return (
    <section id="proof" className="mt-8 scroll-mt-24 rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-heading">Formal Proof System</h2>
        <span className="rounded-full bg-accentbg/35 px-2.5 py-1 text-xs font-semibold text-cite">
          {analysis.verdict} · {Math.round(analysis.proofScore * 100)}%
        </span>
      </div>
      <p className="mb-4 text-sm text-muted">
        Structured logic extraction for <strong className="text-heading">{title}</strong> based on
        premise chain quality, dialectic balance, and risk flags.
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-line bg-page px-2 py-1 text-[11px] font-semibold text-muted">
          Source: {analysis.source === "author" ? "Author-defined" : "Heuristic"}
        </span>
        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
            review?.proof?.status === "reviewed"
              ? "bg-emerald-100 text-emerald-700"
              : review?.proof?.status === "in_review"
              ? "bg-amber-100 text-amber-700"
              : "bg-zinc-100 text-zinc-700"
          }`}
        >
          Proof review: {review?.proof?.status || "unreviewed"}
        </span>
      </div>

      <div className="space-y-3">
        {analysis.premises.map((premise, idx) => (
          <div key={`premise-${idx}`} className="rounded-lg border border-line bg-page p-3">
            <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
              P{idx + 1}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{premise}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-accent/35 bg-accentbg/20 p-3">
        <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">Conclusion</p>
        <p className="mt-1 text-sm leading-relaxed text-heading">{analysis.conclusion}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-line bg-page px-3 py-2 text-center">
          <p className="text-sm font-semibold text-heading">{analysis.citations}</p>
          <p className="text-[11px] text-muted">Citations used</p>
        </div>
        <div className="rounded-md border border-line bg-page px-3 py-2 text-center">
          <p className="text-sm font-semibold text-heading">{analysis.risks.length}</p>
          <p className="text-[11px] text-muted">Risk flags</p>
        </div>
        <div className="rounded-md border border-line bg-page px-3 py-2 text-center">
          <p className="text-sm font-semibold text-heading">{Math.round(analysis.proofScore * 100)}%</p>
          <p className="text-[11px] text-muted">Proof confidence</p>
        </div>
      </div>

      {analysis.assumptions.length > 0 && (
        <div className="mt-4 rounded-lg border border-line bg-page p-3">
          <p className="mb-1 font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
            Explicit assumptions
          </p>
          <ul className="space-y-1">
            {analysis.assumptions.map((assumption) => (
              <li key={assumption} className="text-sm text-ink">
                • {assumption}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-1 font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
          Logical risks detected
        </p>
        {analysis.risks.length === 0 ? (
          <p className="text-sm text-emerald-700">No major heuristic risks detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analysis.risks.map((risk) => (
              <span
                key={risk}
                className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
              >
                {risk}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
