import CitedText from "@/components/Cite";

// Renders content block entries: string → paragraph, {q, ref} → block quote, {b} → bullet list.
// Prose, bullet items, and citation footers are run through CitedText so the
// Quran/hadith references written into the text become verifiable links and
// glossary terms get first-use tooltips. `seen` is threaded from the page so a
// glossary term is annotated only once across the whole article.
export default function Blocks({ entries, seen, dropCap = false }) {
  if (!entries) return null;
  return (
    <>
      {entries.map((e, i) => {
        if (typeof e === "string") {
          // Illuminated drop-cap on the opening line only (e.g. the first
          // paragraph of a critique), for a restrained scholarly flourish.
          const lead = dropCap && i === 0;
          return (
            <p
              key={i}
              className={`mb-4 leading-relaxed text-ink${lead ? " dropcap" : ""}`}
            >
              <CitedText text={e} seen={seen} />
            </p>
          );
        }
        if (e.q) {
          return (
            <blockquote
              key={i}
              className="mb-4 rounded-r-md border border-line border-l-2 border-l-cite bg-surface px-5 py-4 shadow-sm"
            >
              <p className="italic leading-relaxed text-ink">“{e.q}”</p>
              {e.ref && (
                <footer className="mt-2.5">
                  <cite className="inline-flex items-center gap-1.5 rounded-full border border-cite/30 bg-accentbg px-2.5 py-1 font-ui text-[11px] font-semibold not-italic uppercase tracking-wider text-cite">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <CitedText text={e.ref} seen={seen} />
                  </cite>
                </footer>
              )}
            </blockquote>
          );
        }
        if (e.b) {
          return (
            <ul key={i} className="mb-4 ml-5 list-disc space-y-2 marker:text-cite">
              {e.b.map((item, j) => (
                <li key={j} className="leading-relaxed text-ink">
                  <CitedText text={item} seen={seen} />
                </li>
              ))}
            </ul>
          );
        }
        return null;
      })}
    </>
  );
}
