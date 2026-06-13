// Renders content block entries: string → paragraph, {q, ref} → block quote, {b} → bullet list.
export default function Blocks({ entries }) {
  if (!entries) return null;
  return (
    <>
      {entries.map((e, i) => {
        if (typeof e === "string") {
          return (
            <p key={i} className="mb-4 leading-relaxed text-ink">
              {e}
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
                  — {e.ref}
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
                  {item}
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
