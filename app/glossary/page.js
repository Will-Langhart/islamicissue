import Link from "next/link";
import { glossary } from "@/content/glossary.mjs";

export const metadata = {
  title: "Glossary of Terms",
  description:
    "Plain-language definitions of the technical vocabulary used throughout the compendium — tahrif, naskh, isnad, qiraat, sahih, and more.",
};

const sorted = [...glossary].sort((a, b) =>
  a.term.localeCompare(b.term, "en", { sensitivity: "base" })
);

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">
        Reference
      </p>
      <h1 className="mb-4 text-3xl font-bold leading-tight text-heading sm:text-4xl">
        Glossary of Terms
      </h1>
      <p className="mb-10 leading-relaxed text-muted">
        The key technical vocabulary of Islamic scripture, law, and hadith
        science used throughout these critiques. The first appearance of each
        term on an issue page links back here.
      </p>

      <dl className="space-y-7">
        {sorted.map((g) => (
          <div
            key={g.term}
            id={g.term.replace(/\s+/g, "-")}
            className="scroll-mt-24 border-l-2 border-l-line pl-4"
          >
            <dt className="font-ui text-sm font-bold uppercase tracking-wider text-cite">
              {g.term}
              {g.aliases?.length ? (
                <span className="ml-2 font-normal normal-case tracking-normal text-muted">
                  ({g.aliases.join(", ")})
                </span>
              ) : null}
            </dt>
            <dd className="mt-1 leading-relaxed text-ink">{g.short}</dd>
          </div>
        ))}
      </dl>

      <nav className="mt-12 border-t border-line pt-6 font-ui text-sm">
        <Link href="/" className="text-accent hover:underline">
          ← Back to contents
        </Link>
      </nav>
    </div>
  );
}
