import Link from "next/link";
import Image from "next/image";
import { site, preface, roman, flatIssues } from "@/lib/structure.mjs";
import Reveal from "@/components/Reveal";

export default function HomePage() {
  const totalIssues = flatIssues.length;
  const stats = [
    { value: site.length, label: "Parts" },
    { value: totalIssues, label: "Issues" },
    { value: "100%", label: "Sourced" },
    { value: "Both", label: "Sides argued" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="hero-grid" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Reveal className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Examining Islam from Within"
              width={84}
              height={84}
              priority
              className="h-20 w-20 drop-shadow-sm"
            />
          </Reveal>
          <Reveal as="p" delay={60} className="mb-5 font-ui text-xs font-bold uppercase tracking-[0.3em] text-cite">
            An Internal Critique Compendium
          </Reveal>
          <Reveal as="h1" delay={120} className="mx-auto max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-heading sm:text-6xl">
            Examining Islam from Within
          </Reveal>
          <Reveal delay={180} className="mx-auto mt-7 mb-7 h-px w-24 bg-cite/50" />
          <Reveal as="p" delay={220} className="mx-auto max-w-2xl text-lg leading-relaxed text-muted">
            Every argument tested against Islam’s own sources — the Quran, the sahih hadith, the sira,
            and the manuscript record — with the strongest Muslim responses stated before each
            counter-rebuttal.
          </Reveal>
          <Reveal delay={280} className="mt-10 flex flex-wrap items-center justify-center gap-4 font-ui">
            <Link
              href={flatIssues[0].href}
              className="rounded-md bg-brand px-7 py-3.5 text-sm font-semibold text-oncolor shadow-sm transition hover:opacity-90 hover:shadow-md"
            >
              Begin with Part I
            </Link>
            <a
              href="/Examining-Islam-from-Within.docx"
              className="group inline-flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-3.5 text-sm font-semibold text-heading shadow-sm transition hover:border-accent/60 hover:text-accent"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted transition-colors group-hover:text-accent">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Download as Word
            </a>
          </Reveal>

          {/* Stat row */}
          <Reveal delay={340} className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/60 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface px-4 py-5">
                <div className="text-2xl font-bold text-heading sm:text-3xl">{s.value}</div>
                <div className="mt-1 font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Featured Quran quote — the dilemma at the heart of the study */}
      <section className="border-y border-line bg-accentbg/40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <Reveal as="p" className="mb-6 font-ui text-xs font-bold uppercase tracking-[0.25em] text-cite">
            The dilemma at the heart of this study
          </Reveal>
          <Reveal>
            <blockquote className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 font-body text-7xl leading-none text-cite/25">
                “
              </span>
              <p className="relative font-body text-2xl italic leading-snug text-heading sm:text-[1.75rem]">
                And let the People of the Gospel judge by what Allah has revealed therein. And whoever
                does not judge by what Allah has revealed — then it is those who are the defiantly
                disobedient.
              </p>
            </blockquote>
          </Reveal>
          <Reveal as="p" delay={120} className="mt-6 font-ui text-sm font-semibold uppercase tracking-wider text-cite">
            — Quran 5:47
          </Reveal>
          <Reveal as="p" delay={180} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
            The Quran commands Christians to judge by the Gospel — yet contradicts its central claims.
            If that Gospel is preserved, Islam is false; if it is corrupted, the Quran endorsed a
            corrupted text.{" "}
            <Link href={flatIssues[0].href} className="font-semibold text-accent hover:underline">
              Read the argument →
            </Link>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Method */}
        <section className="mx-auto max-w-3xl py-16">
          <Reveal as="p" className="mb-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-cite">
            How to read this compendium
          </Reveal>
          <Reveal as="h2" className="mb-6 text-3xl font-bold tracking-tight text-heading">
            Method and Scope
          </Reveal>
          {preface.map((t, i) => (
            <Reveal as="p" key={i} delay={i * 40} className="mb-4 leading-relaxed text-ink">
              {t}
            </Reveal>
          ))}
        </section>

        {/* Contents */}
        <section id="contents" className="scroll-mt-20 border-t border-line py-16">
          <Reveal as="p" className="mb-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-cite">
            Contents
          </Reveal>
          <Reveal as="h2" className="mb-8 text-3xl font-bold tracking-tight text-heading">
            The Nine Parts
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {site.map((part, idx) => {
              const [, rest] = part.title.split(" — ");
              return (
                <Reveal key={part.slug} delay={(idx % 2) * 80}>
                  <Link
                    href={`/${part.slug}`}
                    className="group flex h-full gap-5 rounded-lg border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
                  >
                    <div className="shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-accentbg font-body text-xl font-bold text-cite transition-colors group-hover:border-accent/40">
                        {roman[part.num - 1]}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="mb-1 font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {part.items.length} issues
                      </div>
                      <h3 className="mb-2 text-lg font-bold leading-snug text-heading transition-colors group-hover:text-accent">
                        {rest}
                      </h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                        {part.intro[0]}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
            <Reveal delay={(site.length % 2) * 80}>
              <Link
                href="/conclusion"
                className="group flex h-full flex-col justify-center rounded-lg border border-accent/40 bg-accentbg p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
              >
                <div className="mb-1 font-ui text-[11px] font-semibold uppercase tracking-wider text-cite">
                  Closing
                </div>
                <h3 className="mb-2 text-lg font-bold text-heading transition-colors group-hover:text-accent">
                  Conclusion: The Cumulative Case
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  How the nine parts converge — and where the Quran’s own test (4:82) leaves the reader.
                </p>
              </Link>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
}
