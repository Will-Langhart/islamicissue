import { parseCitations } from "@/lib/citations.mjs";
import { GLOSSARY_RE, termFor, defFor } from "@/content/glossary.mjs";
import verses from "@/content/verses.json";
import VerseCite from "@/components/VerseCite";
import GlossaryTerm from "@/components/GlossaryTerm";

// Marks the first unseen occurrence of each glossary term inside a plain-text
// run. `seen` is shared across a page so a term is annotated only once.
function glossNodes(text, seen, keyBase) {
  if (!seen) return text;
  GLOSSARY_RE.lastIndex = 0;
  const out = [];
  let last = 0;
  let m;
  let k = 0;
  while ((m = GLOSSARY_RE.exec(text))) {
    const term = termFor(m[1]);
    if (!term || seen.has(term)) continue;
    seen.add(term);
    const def = defFor(term);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <GlossaryTerm key={`${keyBase}-g${k++}`} term={term} short={def.short}>
        {m[0]}
      </GlossaryTerm>
    );
    last = m.index + m[0].length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Renders a plain string with Quran/hadith references turned into links and the
// first use of each glossary term annotated. `seen` is an optional Set, threaded
// per page, that tracks which glossary terms have already been marked.
export default function CitedText({ text, seen }) {
  const segments = parseCitations(text);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <span key={i}>{glossNodes(seg.value, seen, i)}</span>;
        if (seg.kind === "quran") {
          return (
            <VerseCite
              key={i}
              label={seg.label}
              href={seg.href}
              reference={seg.ref}
              verse={verses[seg.ref] || null}
            />
          );
        }
        return (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer"
            className="cite-link"
          >
            {seg.label}
          </a>
        );
      })}
    </>
  );
}
