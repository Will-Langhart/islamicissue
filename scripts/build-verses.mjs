// One-time/maintenance script: scans content.mjs for every Quran reference,
// expands ranges, fetches Sahih International + Uthmani Arabic from quran.com,
// and writes content/verses.json. The site reads that JSON statically — no
// runtime API calls. Re-run when new verses are cited:  node scripts/build-verses.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAHIH_INTL = 20; // quran.com translation resource id

const raw = await readFile(join(root, "content/content.mjs"), "utf8");

// Collect distinct verse keys, expanding ranges like "3:3–4" and "66:1–5".
const keys = new Set();
const chain = /\bQuran\s+\d+:\d+(?:[–-]\d+)?(?:\s*[;,]\s*\d+:\d+(?:[–-]\d+)?)*/g;
const token = /(\d+):(\d+)(?:[–-](\d+))?/g;
for (const m of raw.matchAll(chain)) {
  for (const t of m[0].matchAll(token)) {
    const surah = +t[1];
    const start = +t[2];
    const end = t[3] ? +t[3] : start;
    for (let a = start; a <= end && a - start < 12; a++) keys.add(`${surah}:${a}`);
  }
}

const sorted = [...keys].sort((a, b) => {
  const [as, aa] = a.split(":").map(Number);
  const [bs, ba] = b.split(":").map(Number);
  return as - bs || aa - ba;
});
console.log(`Fetching ${sorted.length} verses…`);

const strip = (s) =>
  (s || "")
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const out = {};
for (const key of sorted) {
  const url = `https://api.quran.com/api/v4/verses/by_key/${key}?translations=${SAHIH_INTL}&fields=text_uthmani`;
  let ok = false;
  for (let attempt = 0; attempt < 3 && !ok; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const v = data.verse;
      out[key] = {
        translation: strip(v.translations?.[0]?.text),
        arabic: v.text_uthmani || "",
      };
      ok = true;
    } catch (e) {
      if (attempt === 2) {
        console.error(`  ! ${key}: ${e.message}`);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }
  await new Promise((r) => setTimeout(r, 90));
}

await writeFile(
  join(root, "content/verses.json"),
  JSON.stringify(out, null, 0) + "\n"
);
console.log(`Wrote content/verses.json (${Object.keys(out).length} verses).`);
