import Link from "next/link";
import { notFound } from "next/navigation";
import { site, getPart, roman, blockText } from "@/lib/structure.mjs";
import Sidebar from "@/components/Sidebar";
import Reveal from "@/components/Reveal";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.map((p) => ({ part: p.slug }));
}

export async function generateMetadata({ params }) {
  const { part: partSlug } = await params;
  const part = getPart(partSlug);
  if (!part) return {};
  return {
    title: part.title,
    description: part.intro[0].slice(0, 160),
  };
}

export default async function PartPage({ params }) {
  const { part: partSlug } = await params;
  const part = getPart(partSlug);
  if (!part) notFound();

  const prevPart = site.find((p) => p.num === part.num - 1);
  const nextPart = site.find((p) => p.num === part.num + 1);

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <Sidebar />
        </div>
      </aside>

      <article className="min-w-0 flex-1">
        {/* Part header — numeral badge, warm bloom, and a cumulative-case rail */}
        <header className="part-head mb-10">
          <div className="relative flex items-start gap-5 sm:gap-6">
            <Reveal className="shrink-0">
              <div className="part-numeral h-16 w-16 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                {roman[part.num - 1]}
              </div>
            </Reveal>
            <div className="min-w-0 flex-1 pt-1">
              <Reveal as="p" className="mb-2 flex items-center gap-3 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">
                Part {roman[part.num - 1]} of {site.length}
                <span aria-hidden="true" className="rule-grad h-px flex-1" />
              </Reveal>
              <Reveal as="h1" delay={60} className="text-3xl font-bold leading-tight text-heading sm:text-4xl">
                {part.title.split(" — ")[1]}
              </Reveal>
            </div>
          </div>

          {/* Where this part sits in the nine-part cumulative case */}
          <Reveal delay={120} className="mt-7">
            <div className="case-progress" role="list" aria-label="Position in the cumulative case">
              {site.map((p) => {
                const state = p.num < part.num ? "past" : p.num === part.num ? "current" : "future";
                return (
                  <Link
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="case-progress-seg"
                    role="listitem"
                    aria-current={state === "current" ? "step" : undefined}
                    title={`Part ${roman[p.num - 1]}: ${p.short}`}
                  >
                    <span data-state={state} />
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </header>

        {part.intro.map((t, i) => (
          <Reveal as="p" key={i} delay={i * 40} className="mb-4 text-lg leading-relaxed text-ink">
            {t}
          </Reveal>
        ))}

        <div className="mt-10 mb-5 flex items-center gap-3">
          <h2 className="text-xl font-bold text-heading">Issues in this part</h2>
          <span className="font-ui text-xs font-semibold text-muted">
            {part.items.length} {part.items.length === 1 ? "issue" : "issues"}
          </span>
          <span aria-hidden="true" className="rule-grad h-px flex-1" />
        </div>
        <ol className="space-y-4">
          {part.items.map((item, i) => (
            <li key={item.slug}>
              <Reveal delay={Math.min(i, 8) * 40}>
                <Link href={`/${part.slug}/${item.slug}`} className="part-issue-card group">
                  <span className="numeral-badge flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-accentbg font-body text-lg font-bold text-cite">
                    {item.num}
                  </span>
                  <span className="min-w-0 flex-1">
                    <h3 className="mb-1.5 font-bold leading-snug text-heading transition-colors group-hover:text-accent">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                      {blockText(item.critique).slice(0, 220)}…
                    </p>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="mt-1 hidden shrink-0 self-center text-muted/40 transition group-hover:translate-x-0.5 group-hover:text-accent sm:block"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>

        <nav className="mt-12 flex justify-between gap-4 border-t border-line pt-6 font-ui text-sm">
          {prevPart ? (
            <Link href={`/${prevPart.slug}`} className="text-accent hover:underline">
              ← Part {roman[prevPart.num - 1]}: {prevPart.short}
            </Link>
          ) : (
            <Link href="/" className="text-accent hover:underline">
              ← Home
            </Link>
          )}
          {nextPart ? (
            <Link href={`/${nextPart.slug}`} className="text-right text-accent hover:underline">
              Part {roman[nextPart.num - 1]}: {nextPart.short} →
            </Link>
          ) : (
            <Link href="/conclusion" className="text-right text-accent hover:underline">
              Conclusion →
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
