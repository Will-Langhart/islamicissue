import CitedText from "@/components/Cite";

// Renders content block entries: string → paragraph, {q, ref} → block quote, {b} → bullet list.
// Prose, bullet items, and citation footers are run through CitedText so the
// Quran/hadith references written into the text become verifiable links and
// glossary terms get first-use tooltips. `seen` is threaded from the page so a
// glossary term is annotated only once across the whole article.
export default function Blocks({ entries, seen }) {
  if (!entries) return null;
  return (
    <>
      {entries.map((e, i) => {
        if (typeof e === "string") {
          return (
            <p key={i} className="mb-4 leading-relaxed text-ink">
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
                <footer className="mt-2 font-ui text-xs font-semibold uppercase tracking-wider text-cite">
                  — <CitedText text={e.ref} seen={seen} />
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
