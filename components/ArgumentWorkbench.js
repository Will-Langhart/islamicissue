"use client";

import { useMemo, useState } from "react";

const perspectives = ["Primary", "Muslim", "Academic", "Critical"];

function textOf(entries = []) {
  return entries.map((e) => typeof e === "string" ? e : e.q ? e.q : e.b ? e.b.join(" ") : "").join(" ");
}

function firstSentence(entries) {
  const text = textOf(entries);
  const match = text.match(/^(.{50,260}?[.!?])(?:\s|$)/);
  return match ? match[1] : text.slice(0, 220) + (text.length > 220 ? "…" : "");
}

function hrefFor(ref) {
  const q = ref.match(/Quran\s+(\d+):(\d+)/);
  if (q) return `https://quran.com/${q[1]}/${q[2]}`;
  const collections = { "Sahih al-Bukhari": "bukhari", "Sahih Muslim": "muslim", "Sunan Ibn Majah": "ibnmajah", "Sunan Abi Dawud": "abudawud", "Sunan Abu Dawud": "abudawud", "Jami al-Tirmidhi": "tirmidhi", "Sunan al-Tirmidhi": "tirmidhi", "Musnad Ahmad": "ahmad", "Muwatta Malik": "malik" };
  for (const [name, slug] of Object.entries(collections)) {
    const match = ref.match(new RegExp(`${name}\\s+(\\d+)`));
    if (match) return `https://sunnah.com/${slug}:${match[1]}`;
  }
  return null;
}

export default function ArgumentWorkbench({ title, critique, response, rebuttal, evidence, editorial, audit }) {
  const [rejected, setRejected] = useState(null);
  const [filters, setFilters] = useState(perspectives);
  const [copied, setCopied] = useState(false);
  const derivedPremises = useMemo(() => [
    { id: 1, label: "Claim under examination", text: firstSentence(critique) },
    { id: 2, label: "Best available response", text: firstSentence(response) },
    { id: 3, label: "Critical assessment", text: firstSentence(rebuttal) },
  ], [critique, response, rebuttal]);
  const premises = audit?.premises?.map((premise, index) => ({ ...premise, id: index + 1 })) || derivedPremises;
  const auditedSources = audit?.sources || [];

  const toggle = (name) => setFilters((current) => current.includes(name) ? current.filter((x) => x !== name) : [...current, name]);
  const copySummary = async () => {
    const summary = `${title}\n\nClaim: ${premises[0].text}\nResponse: ${premises[1].text}\nAssessment: ${premises[2].text}\n\n${window.location.href}`;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="workbench" className="workbench mt-10 scroll-mt-24 rounded-xl border border-line bg-surface shadow-sm">
      <header className="border-b border-line p-5 sm:p-6">
        <p className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-cite">Interactive analysis</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-heading">Argument workbench</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{audit?.thesis || "Inspect the logic, reject a premise, and follow the evidence. The conclusion is only as strong as its premises."}</p>
          </div>
          <span className={`strength strength--${editorial.level}`}>{editorial.label}</span>
        </div>
        <p className="mt-3 rounded-md bg-accentbg px-3 py-2 font-ui text-xs leading-relaxed text-muted"><strong className="text-heading">Editorial note:</strong> {editorial.note}</p>
        {audit && <p className="mt-2 font-ui text-[11px] text-muted"><strong className="text-heading">{audit.status}</strong> · Last reviewed {audit.reviewed}</p>}
      </header>

      <div className="p-5 sm:p-6">
        <div className="argument-map" aria-label="Visual argument map">
          {premises.map((premise, index) => (
            <div key={premise.id} className="contents">
              <button type="button" onClick={() => setRejected(rejected === premise.id ? null : premise.id)} className={`argument-node ${rejected === premise.id ? "argument-node--rejected" : ""}`}>
                <span className="argument-node__number">{premise.id}</span>
                <span><strong>{premise.label}</strong><small>{premise.text}</small></span>
              </button>
              {index < premises.length - 1 && <span className="argument-arrow" aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
        <div className={`mt-4 rounded-lg border px-4 py-3 font-ui text-sm ${rejected ? "border-ember/40 bg-ember/5 text-heading" : "border-accent/30 bg-accentbg text-heading"}`}>
          {rejected ? `You rejected premise ${rejected}. The displayed conclusion no longer follows unless that premise can be defended.` : "All three stages remain in play. Select any card to challenge it."}
        </div>

        <h3 className="mt-8 font-ui text-xs font-bold uppercase tracking-[0.18em] text-cite">Side-by-side comparison</h3>
        <div className="comparison-grid mt-3">
          {premises.map((p) => <article key={p.id}><span>{p.label}</span><p>{p.text}</p></article>)}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-cite">Evidence register</h3>
          <div className="flex flex-wrap gap-1.5" aria-label="Source perspective filters">
            {perspectives.map((name) => <button type="button" key={name} onClick={() => toggle(name)} aria-pressed={filters.includes(name)} className="filter-chip">{name}</button>)}
          </div>
        </div>
        <p className="mt-2 font-ui text-xs text-muted">Each source card separates what the evidence supports from what it cannot establish by itself.</p>
        {audit ? (
          <div className="audited-sources mt-4">
            {auditedSources.filter((item) => filters.includes(item.perspective)).map((item) => (
              <article key={item.citation} className="audited-source">
                <div className="audited-source__meta"><span>{item.perspective}</span><small>{item.type}</small></div>
                <h4>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.citation} ↗</a> : item.citation}</h4>
                {item.quote && <blockquote>“{item.quote}”</blockquote>}
                <dl><div><dt>Establishes</dt><dd>{item.supports}</dd></div><div><dt>Does not establish</dt><dd>{item.limit}</dd></div></dl>
              </article>
            ))}
            {auditedSources.filter((item) => filters.includes(item.perspective)).length === 0 && <p className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">No sources match the selected perspectives.</p>}
          </div>
        ) : filters.includes("Primary") && evidence.length > 0 ? (
          <div className="evidence-grid mt-4">
            {evidence.map((item) => {
              const href = hrefFor(item.ref);
              const Card = href ? "a" : "div";
              return <Card key={item.ref} {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})} className="evidence-card">
                <span>{item.kind}</span><strong>{item.ref}</strong><small>✓ {item.status}</small>
              </Card>;
            })}
          </div>
        ) : <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-sm text-muted">This issue has not completed claim-level review. Available primary-text links are preliminary, and the absent categories are an audit gap—not evidence of absence.</p>}

        <div className="share-summary mt-8">
          <div><span>Shareable summary</span><strong>{title}</strong><p>{premises[0].text}</p></div>
          <button type="button" onClick={copySummary}>{copied ? "Copied" : "Copy summary"}</button>
        </div>
      </div>
    </section>
  );
}
