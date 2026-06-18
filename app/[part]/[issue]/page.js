import Link from "next/link";
import { notFound } from "next/navigation";
import { site, getIssue, getRelated, roman, blockText } from "@/lib/structure.mjs";
import Sidebar from "@/components/Sidebar";
import Blocks from "@/components/Blocks";
import Collapsible from "@/components/Collapsible";
import IssueTools from "@/components/IssueTools";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.flatMap((p) =>
    p.items.map((i) => ({ part: p.slug, issue: i.slug }))
  );
}

export async function generateMetadata({ params }) {
  const { part: partSlug, issue: issueSlug } = await params;
  const data = getIssue(partSlug, issueSlug);
  if (!data) return {};
  return {
    title: data.item.title,
    description: blockText(data.item.critique).slice(0, 160),
  };
}

export default async function IssuePage({ params }) {
  const { part: partSlug, issue: issueSlug } = await params;
  const data = getIssue(partSlug, issueSlug);
  if (!data) notFound();
  const { part, item, prev, next } = data;
  const related = getRelated(partSlug, issueSlug);
  const partLabel = `Part ${roman[part.num - 1]}: ${part.short}`;

  // Shared across the article so each glossary term is annotated only on its
  // first appearance (critique → responses → rebuttal, in document order).
  const seen = new Set();

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <Sidebar />
        </div>
      </aside>

      <article className="min-w-0 max-w-3xl flex-1">
        <nav className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">
          <Link href={`/${part.slug}`} className="hover:underline">
            Part {roman[part.num - 1]} — {part.short}
          </Link>
          <span className="mx-2 text-muted">·</span>
          <span className="text-muted">
            Issue {item.num} of {part.items.length}
          </span>
        </nav>

        <h1 className="mb-5 text-3xl font-bold leading-tight text-heading sm:text-4xl">
          {item.title}
        </h1>

        <IssueTools title={item.title} partLabel={partLabel} />

        {/* Mobile TOC */}
        <details className="cv mb-8 rounded-lg border border-line bg-surface shadow-sm lg:hidden">
          <summary className="flex items-center gap-2 px-4 py-3 font-ui text-sm font-semibold text-heading">
            <svg className="chev text-cite" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            Browse all parts &amp; issues
          </summary>
          <div className="border-t border-line p-3">
            <Sidebar />
          </div>
        </details>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-3 font-ui text-xs font-bold uppercase tracking-[0.18em] text-cite">
            <span className="rule-grad h-px w-10" />
            The Critique
          </h2>
          <Blocks entries={item.critique} seen={seen} />
        </section>

        <Collapsible
          label="Common Muslim Responses"
          hint="how Muslim scholarship answers"
          entries={item.response}
          seen={seen}
        />
        <Collapsible
          label="Counter-Rebuttal"
          hint="why critics find the responses insufficient"
          entries={item.rebuttal}
          accent
          seen={seen}
        />

        {related.length > 0 && (
          <section className="issue-related mt-12 border-t border-line pt-6">
            <h2 className="mb-4 flex items-center gap-3 font-ui text-xs font-bold uppercase tracking-[0.18em] text-cite">
              <span className="rule-grad h-px w-10" />
              Related Issues
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="group block h-full rounded-lg border border-line bg-surface p-4 shadow-sm transition hover:border-accent/50 hover:shadow-md"
                  >
                    <div className="font-ui text-[11px] uppercase tracking-wider text-muted">
                      Part {roman[r.partNum - 1]} · {r.partShort}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-heading transition-colors group-hover:text-accent">
                      {r.title}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="mt-12 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          {prev ? (
            <Link
              href={prev.href}
              className="group rounded-lg border border-line bg-surface p-4 shadow-sm transition hover:border-accent/50 hover:shadow-md"
            >
              <div className="font-ui text-[11px] uppercase tracking-wider text-muted">
                ← Previous · {prev.partShort}
              </div>
              <div className="mt-1 text-sm font-semibold text-heading transition-colors group-hover:text-accent">
                {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group rounded-lg border border-line bg-surface p-4 text-right shadow-sm transition hover:border-accent/50 hover:shadow-md"
            >
              <div className="font-ui text-[11px] uppercase tracking-wider text-muted">
                Next · {next.partShort} →
              </div>
              <div className="mt-1 text-sm font-semibold text-heading transition-colors group-hover:text-accent">
                {next.title}
              </div>
            </Link>
          ) : (
            <Link
              href="/conclusion"
              className="group rounded-lg border border-accent/40 bg-accentbg p-4 text-right shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <div className="font-ui text-[11px] uppercase tracking-wider text-muted">
                Finish →
              </div>
              <div className="mt-1 text-sm font-semibold text-heading transition-colors group-hover:text-accent">
                Conclusion: The Cumulative Case
              </div>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
