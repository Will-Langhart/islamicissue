import Link from "next/link";

// First-use marker for a technical term. Pure CSS reveal (hover / focus-within),
// so it stays server-rendered with no client JS. The label links to /glossary.
export default function GlossaryTerm({ children, term, short }) {
  return (
    <span className="gloss" tabIndex={0}>
      {children}
      <span role="tooltip" className="gloss-pop">
        <span className="mb-1 block font-ui text-[11px] font-bold uppercase tracking-wider text-cite">
          {term}
        </span>
        <span className="block text-sm not-italic leading-relaxed text-ink">
          {short}
        </span>
        <Link
          href={`/glossary#${term.replace(/\s+/g, "-")}`}
          className="mt-2 inline-block font-ui text-xs font-semibold text-accent hover:underline"
        >
          Full glossary →
        </Link>
      </span>
    </span>
  );
}
