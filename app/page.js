import Link from "next/link";
import { site, preface, roman, flatIssues } from "@/lib/structure.mjs";

export default function HomePage() {
  const totalIssues = flatIssues.length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="hero-glow py-16 text-center sm:py-24">
        <p className="mb-5 font-ui text-xs font-bold uppercase tracking-[0.28em] text-cite">
          An Internal Critique Compendium
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-heading sm:text-5xl">
          Examining Islam from Within
        </h1>
        <div className="mx-auto mt-7 mb-7 h-px w-24 bg-cite/50" />
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted">
          {site.length} parts. {totalIssues} issues. Every argument tested against Islam’s own sources —
          the Quran, the sahih hadith, the sira, and the manuscript record — with the strongest Muslim
          responses stated before each counter-rebuttal.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 font-ui">
          <Link
            href={flatIssues[0].href}
            className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-oncolor shadow-sm transition hover:opacity-90 hover:shadow-md"
          >
            Begin with Part I
          </Link>
          <a
            href="/Examining-Islam-from-Within.docx"
            className="rounded-md border border-line bg-surface px-6 py-3 text-sm font-semibold text-heading shadow-sm transition hover:border-accent/60 hover:text-accent"
          >
            Download as Word document
          </a>
        </div>
      </section>

      {/* Method */}
      <section className="mx-auto max-w-3xl border-t border-line py-14">
        <p className="mb-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-cite">
          How to read this compendium
        </p>
        <h2 className="mb-6 text-2xl font-bold text-heading">Method and Scope</h2>
        {preface.map((t, i) => (
          <p key={i} className="mb-4 leading-relaxed text-ink">
            {t}
          </p>
        ))}
      </section>

      {/* Contents */}
      <section id="contents" className="scroll-mt-20 border-t border-line py-14">
        <p className="mb-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-cite">
          Contents
        </p>
        <h2 className="mb-8 text-2xl font-bold text-heading">The Nine Parts</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {site.map((part) => {
            const [, rest] = part.title.split(" — ");
            return (
              <Link
                key={part.slug}
                href={`/${part.slug}`}
                className="group rounded-lg border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
              >
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-cite/80">{roman[part.num - 1]}</span>
                  <span className="font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {part.items.length} issues
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold leading-snug text-heading transition-colors group-hover:text-accent">
                  {rest}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                  {part.intro[0]}
                </p>
              </Link>
            );
          })}
          <Link
            href="/conclusion"
            className="group flex flex-col justify-center rounded-lg border border-accent/40 bg-accentbg p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
          >
            <h3 className="mb-2 text-lg font-bold text-heading transition-colors group-hover:text-accent">
              Conclusion: The Cumulative Case
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              How the nine parts converge — and where the Quran’s own test (4:82) leaves the reader.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
