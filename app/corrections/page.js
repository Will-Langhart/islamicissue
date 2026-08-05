export const metadata = {
  title: "Corrections and Revision Log",
  // Editorial apparatus, not reading content — kept out of search indexes.
  robots: { index: false, follow: true },
};

export default function CorrectionsPage() {
  return <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <p className="eyebrow">Editorial transparency</p><h1 className="page-title">Corrections and Revision Log</h1>
    <p className="lede">A persuasive case becomes more trustworthy when errors are easy to report and corrections remain visible.</p>
    <section className="mt-9 rounded-xl border border-line bg-surface p-6"><h2 className="text-xl font-bold text-heading">Correction policy</h2><ul className="mt-4 ml-5 list-disc space-y-2 marker:text-cite"><li>Factual errors are corrected promptly and logged here.</li><li>Substantive interpretive revisions identify what changed and why.</li><li>Typographic changes do not require individual entries.</li><li>Good-faith objections are evaluated by their evidence, regardless of the submitter's worldview.</li></ul></section>
    <section className="mt-6 rounded-xl border border-dashed border-line p-6"><p className="font-ui text-xs font-bold uppercase tracking-wider text-cite">Revision log</p><p className="mt-3 text-muted">No material corrections have been logged since the public revision system was introduced in July 2026.</p></section>
    <section className="mt-6 rounded-xl bg-accentbg p-6"><h2 className="text-lg font-bold text-heading">Report an issue</h2><p className="mt-2 text-sm leading-relaxed text-muted">Include the page title, exact sentence, proposed correction, and the strongest source supporting it. A public contact channel should be connected here before launch.</p></section>
  </div>;
}
