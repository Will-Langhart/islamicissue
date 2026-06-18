// Citation parsing — turns the plain-text references already written into the
// prose (e.g. "Quran 4:157", "Sahih al-Bukhari 3017") into structured segments
// that the renderer links to quran.com / sunnah.com. Content stays plain text;
// linking happens at render time, so content/content.mjs needs no edits.

// Hadith collections in use, longest names first so the alternation is greedy.
// `slug` matches sunnah.com's URL scheme: https://sunnah.com/bukhari:3017
const HADITH = [
  { name: "Sahih al-Bukhari", slug: "bukhari" },
  { name: "Sahih Muslim", slug: "muslim" },
  { name: "Sunan Abi Dawud", slug: "abudawud" },
  { name: "Sunan Abu Dawud", slug: "abudawud" },
  { name: "Sunan Ibn Majah", slug: "ibnmajah" },
  { name: "Sunan al-Tirmidhi", slug: "tirmidhi" },
  { name: "Jami al-Tirmidhi", slug: "tirmidhi" },
  { name: "Sunan an-Nasai", slug: "nasai" },
  { name: "Sunan al-Nasai", slug: "nasai" },
  { name: "Sunan al-Darimi", slug: "darimi" },
  { name: "Muwatta Malik", slug: "malik" },
  { name: "Musnad Ahmad", slug: "ahmad" },
];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A Quran citation may chain several refs after one "Quran" prefix:
//   "Quran 2:106; 16:101"  or  "Quran 10:3, 19:87, 20:109"
const QURAN_RE = /\bQuran\s+\d+:\d+(?:[–-]\d+)?(?:\s*[;,]\s*\d+:\d+(?:[–-]\d+)?)*/g;
const QURAN_TOKEN_RE = /\d+:\d+(?:[–-]\d+)?/g;
const HADITH_RE = new RegExp(
  "\\b(" + HADITH.map((h) => escapeRe(h.name)).join("|") + ")\\s+(\\d+(?:[–-]\\d+)?)",
  "g"
);

const HADITH_SLUG = Object.fromEntries(HADITH.map((h) => [h.name, h.slug]));

// surah/first-ayah from a token like "85:21–22" → { surah: "85", ayah: "21" }
function quranParts(token) {
  const [chapter, rest] = token.split(":");
  const ayah = rest.split(/[–-]/)[0];
  return { surah: chapter, ayah };
}

export function quranHref(token) {
  const { surah, ayah } = quranParts(token);
  return `https://quran.com/${surah}/${ayah}`;
}

function hadithHref(name, num) {
  const first = num.split(/[–-]/)[0];
  return `https://sunnah.com/${HADITH_SLUG[name]}:${first}`;
}

// Parse a plain string into ordered segments:
//   { type: "text", value }
//   { type: "cite", kind: "quran"|"hadith", label, href, ref }
// `ref` is the canonical reference (e.g. "4:157" or "Sahih al-Bukhari 3017"),
// used by the verse-preview layer. Returns a single text segment when no
// citation is present, so callers can render uniformly.
export function parseCitations(text) {
  if (typeof text !== "string" || !text) return [{ type: "text", value: text }];

  // Collect every match (Quran + hadith) with absolute offsets, then walk
  // left-to-right emitting text gaps and cite segments in source order.
  const hits = [];

  for (const m of text.matchAll(QURAN_RE)) {
    hits.push({ start: m.index, end: m.index + m[0].length, kind: "quran", raw: m[0] });
  }
  for (const m of text.matchAll(HADITH_RE)) {
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      kind: "hadith",
      raw: m[0],
      name: m[1],
      num: m[2],
    });
  }
  if (hits.length === 0) return [{ type: "text", value: text }];

  hits.sort((a, b) => a.start - b.start);

  const segments = [];
  let cursor = 0;
  const pushText = (value) => {
    if (value) segments.push({ type: "text", value });
  };

  for (const hit of hits) {
    if (hit.start < cursor) continue; // skip overlaps (shouldn't happen)
    pushText(text.slice(cursor, hit.start));

    if (hit.kind === "quran") {
      // Re-tokenize the matched span so each "X:Y" in a chain links separately,
      // preserving the "Quran " prefix and the separators between refs as text.
      let local = 0;
      const span = hit.raw;
      for (const t of span.matchAll(QURAN_TOKEN_RE)) {
        pushText(span.slice(local, t.index));
        segments.push({
          type: "cite",
          kind: "quran",
          label: t[0],
          href: quranHref(t[0]),
          ref: t[0],
        });
        local = t.index + t[0].length;
      }
      pushText(span.slice(local));
    } else {
      segments.push({
        type: "cite",
        kind: "hadith",
        label: hit.raw,
        href: hadithHref(hit.name, hit.num),
        ref: hit.raw,
      });
    }
    cursor = hit.end;
  }
  pushText(text.slice(cursor));
  return segments;
}
