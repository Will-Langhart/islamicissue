"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-page p-3">
      <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-heading">{value}</p>
    </div>
  );
}

function TopList({ title, items, valueLabel = "count", itemKey = "reference" }) {
  return (
    <section className="rounded-lg border border-line bg-page p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-cite">{title}</h3>
      <div className="mt-3 space-y-2">
        {(items || []).slice(0, 10).map((item, index) => (
          <div key={`${item[itemKey]}-${index}`} className="flex items-start justify-between gap-4 rounded-md border border-line bg-surface px-3 py-2">
            <p className="text-sm font-semibold text-heading">{item[itemKey] || item.collection}</p>
            <p className="text-xs font-semibold text-muted">{item[valueLabel]} issues</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CitationReportDashboard() {
  const [report, setReport] = useState(null);
  const [warningFilter, setWarningFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/citation-report.json")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch(() => {
        if (!cancelled) setReport({ summary: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const warnings = useMemo(() => {
    const all = report?.validationWarnings || [];
    if (warningFilter === "all") return all.slice(0, 30);
    return all.filter((warning) => warning.reviewStatus === warningFilter).slice(0, 30);
  }, [report, warningFilter]);

  if (!report) {
    return (
      <section className="rounded-xl border border-line bg-surface p-6">
        <div className="h-6 w-64 animate-pulse rounded bg-line/40" />
        <div className="mt-4 h-72 animate-pulse rounded bg-line/20" />
      </section>
    );
  }

  if (!report.summary) {
    return (
      <section className="rounded-xl border border-line bg-surface p-6">
        <p className="text-sm text-muted">Citation report is unavailable.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-xl font-bold text-heading sm:text-2xl">Citation Health Overview</h2>
        <p className="mt-2 text-sm text-muted">
          Generated at {new Date(report.generatedAt).toLocaleString()} from build-time validation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total citations" value={report.summary.totalCitations} />
          <Metric label="Quran references" value={report.summary.uniqueQuranReferences} />
          <Metric label="Hadith references" value={report.summary.uniqueHadithReferences} />
          <Metric label="Validation warnings" value={report.summary.totalWarnings} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Metric
            label="Citation review"
            value={`${report.summary.reviewCoverage?.citation?.reviewed || 0} reviewed`}
          />
          <Metric
            label="Citation in review"
            value={`${report.summary.reviewCoverage?.citation?.in_review || 0} issues`}
          />
          <Metric
            label="Proof review"
            value={`${report.summary.reviewCoverage?.proof?.reviewed || 0} reviewed`}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <TopList title="Most cited Quran references" items={report.topQuranReferences} />
        <TopList title="Most cited Hadith collections" items={report.topHadithCollections} itemKey="collection" />
        <TopList title="Most cited scholars" items={report.topScholars} />
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h3 className="text-lg font-bold text-heading">Citations by part</h3>
        <div className="mt-4 space-y-2">
          {(report.citationsByPart || []).map((entry) => (
            <div key={entry.partNum}>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
                <span>Part {entry.partNum}</span>
                <span>{entry.count} citations</span>
              </div>
              <div className="h-2 rounded-full bg-line/40">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((entry.count / Math.max(1, report.summary.totalCitations)) * 1800)
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h3 className="text-lg font-bold text-heading">Validation warnings</h3>
        <p className="mt-1 text-sm text-muted">
          Warnings indicate references that look malformed or out-of-range.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["unreviewed", "Unreviewed"],
            ["in_review", "In review"],
            ["reviewed", "Reviewed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setWarningFilter(value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                warningFilter === value
                  ? "bg-accent text-oncolor"
                  : "border border-line bg-page text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {warnings.length === 0 ? (
            <p className="text-sm font-semibold text-emerald-600">No validation warnings detected.</p>
          ) : (
            warnings.map((warning, index) => (
              <Link
                key={`${warning.issueId}-${index}`}
                href={warning.href}
                className="block rounded-md border border-line bg-page px-3 py-2 transition hover:border-accent/45"
              >
                <p className="text-sm font-semibold text-heading">{warning.issueTitle}</p>
                <p className="text-xs text-muted">
                  {warning.type.toUpperCase()} · {warning.reference} · {warning.reason}
                </p>
                <p className="text-[11px] text-muted">
                  Review: {warning.reviewStatus || "unreviewed"}
                  {warning.reviewer ? ` · ${warning.reviewer}` : ""}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
