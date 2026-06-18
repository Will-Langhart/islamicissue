// Technical-vocabulary glossary. Drives inline tooltips (first use per page) and
// the standalone /glossary page. `term` is matched case-insensitively on word
// boundaries; `aliases` catch alternate spellings. Keep `short` to one sentence.
export const glossary = [
  {
    term: "tahrif",
    short:
      "The doctrine that Jews and Christians corrupted the earlier scriptures — invoked to explain why the Quran both affirms the Torah and Gospel and contradicts them.",
  },
  {
    term: "naskh",
    aliases: ["abrogation"],
    short:
      "Abrogation: the principle that a later Quranic revelation can cancel or replace an earlier ruling. Classical scholars catalogued dozens to hundreds of abrogated verses.",
  },
  {
    term: "isnad",
    aliases: ["isnād"],
    short:
      "The chain of narrators that transmits a hadith. Its reliability is the basis on which hadith are graded authentic or weak.",
  },
  {
    term: "sira",
    aliases: ["sīra"],
    short:
      "The traditional biography of Muhammad. The earliest surviving sira (Ibn Ishaq, via Ibn Hisham) dates to over a century after his death.",
  },
  {
    term: "tafsir",
    aliases: ["tafsīr"],
    short:
      "Classical Quranic exegesis — the commentary tradition (al-Tabari, al-Razi, Ibn Kathir, etc.) that explains and contextualizes the text.",
  },
  {
    term: "sahih",
    aliases: ["sahīh", "saheeh"],
    short:
      "“Authentic.” The highest grade of hadith reliability; also the name of the two most authoritative collections (al-Bukhari and Muslim).",
  },
  {
    term: "hadith",
    aliases: ["ahadith", "aḥādīth"],
    short:
      "A report of Muhammad's words, actions, or tacit approvals. The hadith corpus is the second source of Islamic law after the Quran.",
  },
  {
    term: "sunnah",
    short:
      "The normative example of Muhammad — his sayings and practice — which Muslims are commanded to follow alongside the Quran.",
  },
  {
    term: "mutawatir",
    aliases: ["mutawātir"],
    short:
      "A report transmitted by so many independent chains that collusion in error is deemed impossible — the gold standard of certainty in hadith science.",
  },
  {
    term: "ahad",
    aliases: ["āhād", "khabar al-wahid"],
    short:
      "A “solitary” report transmitted through few chains. It yields probability, not certainty — a key fault line in hadith epistemology.",
  },
  {
    term: "qiraat",
    aliases: ["qirāʾāt", "qira'at"],
    short:
      "The canonical variant readings of the Quran. Differences among them touch wording, not just pronunciation, complicating claims of a single perfect text.",
  },
  {
    term: "Tawrat",
    aliases: ["Tawrāt"],
    short:
      "The Torah, as named and affirmed by the Quran as a genuine revelation given to Moses.",
  },
  {
    term: "Injil",
    aliases: ["Injīl"],
    short:
      "The Gospel, as named by the Quran — spoken of as a revelation given to Jesus and present among Christians in Muhammad's day.",
  },
  {
    term: "naskh al-tilawa",
    short:
      "“Abrogation of recitation” — the claim that some revealed verses were divinely removed from the Quran's text while their ruling (or memory) remained.",
  },
  {
    term: "ijma",
    aliases: ["ijmāʿ", "ijma'"],
    short:
      "The consensus of qualified scholars, treated in Sunni jurisprudence as a binding source of law.",
  },
  {
    term: "fiqh",
    short:
      "Islamic jurisprudence — the human science of deriving legal rulings from the Quran, sunnah, consensus, and analogy.",
  },
];

// Longest-first alternation so multi-word terms win over their parts.
const ENTRIES = glossary
  .flatMap((g) => [g.term, ...(g.aliases || [])].map((form) => ({ form, def: g })))
  .sort((a, b) => b.form.length - a.form.length);

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GLOSSARY_RE = new RegExp(
  "(?<![\\p{L}])(" + ENTRIES.map((e) => escapeRe(e.form)).join("|") + ")(?![\\p{L}])",
  "giu"
);

// Canonical-term lookup for a matched surface form (lowercased).
const FORM_TO_TERM = new Map(
  ENTRIES.map((e) => [e.form.toLowerCase(), e.def.term])
);
export function termFor(form) {
  return FORM_TO_TERM.get(form.toLowerCase());
}

const TERM_TO_DEF = new Map(glossary.map((g) => [g.term, g]));
export function defFor(term) {
  return TERM_TO_DEF.get(term);
}
