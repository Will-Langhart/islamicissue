import { parts, preface, conclusionParas, bibliography } from "../content/content.mjs";

export const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

const partMeta = [
  { slug: "islamic-dilemma", short: "The Islamic Dilemma" },
  { slug: "quran-contradictions", short: "Internal Contradictions" },
  { slug: "preservation", short: "The Preservation Problem" },
  { slug: "history-science", short: "History & Science" },
  { slug: "muhammad", short: "The Prophetic Credentials" },
  { slug: "theology-ethics", short: "Theology & Ethics" },
  { slug: "sharia-morality", short: "Sharia & Morality" },
  { slug: "hadith-problem", short: "The Hadith Problem" },
  { slug: "prophecy-miracle", short: "Prophecy, Miracle & Origins" },
];

function slugify(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'‘]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

// Plain text of a block list (for excerpts and search).
export function blockText(entries) {
  if (!entries) return "";
  return entries
    .map((e) => {
      if (typeof e === "string") return e;
      if (e.q) return "“" + e.q + "”" + (e.ref ? " — " + e.ref : "");
      if (e.b) return e.b.join(" ");
      return "";
    })
    .join(" ");
}

export const site = parts.map((part, pi) => {
  const meta = partMeta[pi];
  return {
    num: pi + 1,
    slug: meta.slug,
    short: meta.short,
    title: part.title,
    intro: part.intro,
    items: part.items.map((item, ii) => ({
      num: ii + 1,
      slug: slugify(item.title),
      title: item.title,
      critique: item.critique,
      response: item.response,
      rebuttal: item.rebuttal,
    })),
  };
});

// Flat ordered list of all issues for prev/next navigation.
export const flatIssues = site.flatMap((part) =>
  part.items.map((item) => ({
    href: `/${part.slug}/${item.slug}`,
    partSlug: part.slug,
    partShort: part.short,
    partNum: part.num,
    issueSlug: item.slug,
    title: item.title,
    num: item.num,
  }))
);

export function getPart(partSlug) {
  return site.find((p) => p.slug === partSlug);
}

export function getIssue(partSlug, issueSlug) {
  const part = getPart(partSlug);
  if (!part) return null;
  const item = part.items.find((i) => i.slug === issueSlug);
  if (!item) return null;
  const flatIdx = flatIssues.findIndex(
    (f) => f.partSlug === partSlug && f.issueSlug === issueSlug
  );
  return {
    part,
    item,
    prev: flatIdx > 0 ? flatIssues[flatIdx - 1] : null,
    next: flatIdx < flatIssues.length - 1 ? flatIssues[flatIdx + 1] : null,
  };
}

// Search index: one entry per issue plus conclusion/sources.
export const searchIndex = [
  ...site.flatMap((part) =>
    part.items.map((item) => ({
      href: `/${part.slug}/${item.slug}`,
      title: item.title,
      label: `Part ${roman[part.num - 1]} — ${part.short}`,
      text: [
        item.title,
        blockText(item.critique),
        blockText(item.response),
        blockText(item.rebuttal),
      ].join(" "),
    }))
  ),
  {
    href: "/conclusion",
    title: "Conclusion: The Cumulative Case",
    label: "Closing",
    text: conclusionParas.join(" "),
  },
  {
    href: "/sources",
    title: "Sources and Further Reading",
    label: "Bibliography",
    text: bibliography.join(" "),
  },
];

// Curated cross-references between thematically connected issues. Keys and
// values are "part-slug/issue-slug". Relationships are one-directional as
// written but rendered both ways (see getRelated), so listing A→B also surfaces
// A under B. Kept hand-picked rather than auto-derived to avoid noise.
const relatedMap = {
  "islamic-dilemma/what-the-quran-says-about-the-torah-and-the-gospel": [
    "islamic-dilemma/the-dilemma-stated",
    "theology-ethics/the-crucifixion-denial",
  ],
  "islamic-dilemma/the-dilemma-stated": [
    "theology-ethics/the-crucifixion-denial",
    "theology-ethics/salvation-without-atonement-and-the-transferred-sins-hadith",
    "preservation/the-quran-was-compiled-after-muhammads-death-and-parts-were",
  ],
  "islamic-dilemma/the-qurans-own-falsification-test": [
    "quran-contradictions/how-many-days-of-creation-six-or-eight",
    "quran-contradictions/tolerance-verses-versus-sword-verses-and-the-problem-of-abro",
  ],
  "quran-contradictions/could-allah-have-a-son": [
    "quran-contradictions/does-the-quran-misdescribe-the-trinity",
    "theology-ethics/the-crucifixion-denial",
  ],
  "quran-contradictions/does-the-quran-misdescribe-the-trinity": [
    "theology-ethics/the-crucifixion-denial",
  ],
  "quran-contradictions/does-intercession-exist-or-not": [
    "theology-ethics/salvation-without-atonement-and-the-transferred-sins-hadith",
  ],
  "quran-contradictions/tolerance-verses-versus-sword-verses-and-the-problem-of-abro": [
    "preservation/missing-verses-stoning-adult-suckling-and-the-sheep",
    "sharia-morality/the-jizya-and-the-dhimma-system",
  ],
  "quran-contradictions/pure-arabic-with-foreign-loanwords": [
    "prophecy-miracle/the-literary-challenge-ijaz-and-its-unfalsifiability",
    "prophecy-miracle/borrowed-apocryphal-and-legendary-sources",
  ],
  "preservation/the-quran-was-compiled-after-muhammads-death-and-parts-were": [
    "preservation/uthman-burned-the-competing-codices",
    "preservation/ibn-masud-and-ubayy-the-master-reciters-disagreed-about-the",
    "hadith-problem/the-hadith-corpus-late-sifted-and-self-confessedly-polluted",
  ],
  "preservation/uthman-burned-the-competing-codices": [
    "preservation/ibn-masud-and-ubayy-the-master-reciters-disagreed-about-the",
    "preservation/the-qiraat-todays-qurans-differ-from-each-other",
    "preservation/the-sanaa-palimpsest-physical-evidence-of-a-different-text",
  ],
  "preservation/the-sanaa-palimpsest-physical-evidence-of-a-different-text": [
    "preservation/the-qiraat-todays-qurans-differ-from-each-other",
  ],
  "preservation/missing-verses-stoning-adult-suckling-and-the-sheep": [
    "sharia-morality/child-marriage-quran-65-4-and-the-juristic-consensus",
  ],
  "history-science/haman-in-pharaohs-egypt": [
    "history-science/the-samaritan-at-sinai",
    "history-science/mary-the-sister-of-aaron-daughter-of-amram",
    "prophecy-miracle/borrowed-apocryphal-and-legendary-sources",
  ],
  "history-science/the-samaritan-at-sinai": [
    "history-science/mary-the-sister-of-aaron-daughter-of-amram",
  ],
  "history-science/the-sun-sets-in-a-muddy-spring": [
    "history-science/stars-as-missiles-seven-earths-and-the-solid-sky",
    "history-science/embryology-the-clot-and-the-bones-then-flesh-sequence",
  ],
  "history-science/semen-from-between-the-backbone-and-the-ribs": [
    "history-science/embryology-the-clot-and-the-bones-then-flesh-sequence",
  ],
  "history-science/embryology-the-clot-and-the-bones-then-flesh-sequence": [
    "history-science/stars-as-missiles-seven-earths-and-the-solid-sky",
  ],
  "history-science/hadith-science-the-fly-the-camel-urine-and-adams-height": [
    "hadith-problem/the-hadith-corpus-late-sifted-and-self-confessedly-polluted",
  ],
  "muhammad/a-messenger-without-signs-who-later-has-thousands": [
    "prophecy-miracle/the-literary-challenge-ijaz-and-its-unfalsifiability",
    "prophecy-miracle/the-night-journey-and-the-negotiated-prayers",
    "muhammad/the-satanic-verses-incident",
  ],
  "muhammad/convenient-revelations-zaynab-the-wives-and-aishas-observati": [
    "muhammad/aishas-age",
    "sharia-morality/temporary-marriage-mutah-the-revocable-sexual-contract",
    "theology-ethics/women-in-the-quran-and-sahih-hadith",
  ],
  "muhammad/the-satanic-verses-incident": [
    "muhammad/the-bewitchment-of-the-prophet",
  ],
  "muhammad/the-bewitchment-of-the-prophet": [
    "muhammad/the-aorta-test-quran-69-44-46-and-the-prophets-death",
  ],
  "muhammad/aishas-age": [
    "sharia-morality/child-marriage-quran-65-4-and-the-juristic-consensus",
  ],
  "muhammad/banu-qurayza-and-the-captives": [
    "sharia-morality/slavery-and-concubinage",
    "sharia-morality/assassinations-of-critics-and-the-nakhla-precedent",
  ],
  "muhammad/the-aorta-test-quran-69-44-46-and-the-prophets-death": [
    "prophecy-miracle/failed-and-unfulfilled-prophecies",
  ],
  "theology-ethics/allah-the-best-of-schemers": [
    "theology-ethics/predestination-versus-accountability",
    "sharia-morality/sanctioned-deception-and-the-dissolution-of-oaths",
  ],
  "theology-ethics/predestination-versus-accountability": [
    "theology-ethics/eternal-hell-the-treatment-of-unbelief-and-compulsion-in-pra",
  ],
  "theology-ethics/the-crucifixion-denial": [
    "theology-ethics/salvation-without-atonement-and-the-transferred-sins-hadith",
  ],
  "theology-ethics/women-in-the-quran-and-sahih-hadith": [
    "sharia-morality/slavery-and-concubinage",
    "sharia-morality/temporary-marriage-mutah-the-revocable-sexual-contract",
  ],
  "theology-ethics/eternal-hell-the-treatment-of-unbelief-and-compulsion-in-pra": [
    "sharia-morality/the-jizya-and-the-dhimma-system",
  ],
  "sharia-morality/the-jizya-and-the-dhimma-system": [
    "sharia-morality/slavery-and-concubinage",
  ],
  "sharia-morality/sanctioned-deception-and-the-dissolution-of-oaths": [
    "sharia-morality/temporary-marriage-mutah-the-revocable-sexual-contract",
  ],
  "sharia-morality/assassinations-of-critics-and-the-nakhla-precedent": [
    "muhammad/the-satanic-verses-incident",
  ],
  "hadith-problem/islam-is-unworkable-without-hadith": [
    "hadith-problem/the-hadith-corpus-late-sifted-and-self-confessedly-polluted",
    "hadith-problem/the-consensus-trap",
  ],
  "hadith-problem/the-hadith-corpus-late-sifted-and-self-confessedly-polluted": [
    "hadith-problem/the-consensus-trap",
  ],
  "prophecy-miracle/failed-and-unfulfilled-prophecies": [
    "prophecy-miracle/the-literary-challenge-ijaz-and-its-unfalsifiability",
  ],
  "prophecy-miracle/the-literary-challenge-ijaz-and-its-unfalsifiability": [
    "prophecy-miracle/borrowed-apocryphal-and-legendary-sources",
  ],
  "prophecy-miracle/borrowed-apocryphal-and-legendary-sources": [
    "prophecy-miracle/pagan-continuity-in-islamic-ritual",
  ],
  "prophecy-miracle/the-inheritance-arithmetic-the-awl-problem": [
    "prophecy-miracle/the-literary-challenge-ijaz-and-its-unfalsifiability",
  ],
  "prophecy-miracle/pagan-continuity-in-islamic-ritual": [
    "prophecy-miracle/the-night-journey-and-the-negotiated-prayers",
  ],
};

// Lookup from "part/slug" → flat-issue record (href, title, part info).
const issueByKey = new Map(
  flatIssues.map((f) => [`${f.partSlug}/${f.issueSlug}`, f])
);

// Symmetric adjacency: a curated A→B link surfaces on both A and B.
const relatedAdjacency = (() => {
  const adj = new Map();
  const add = (a, b) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a).add(b);
  };
  for (const [key, list] of Object.entries(relatedMap)) {
    for (const other of list) {
      add(key, other);
      add(other, key);
    }
  }
  return adj;
})();

// Resolved related issues for an issue page, in roadmap order.
export function getRelated(partSlug, issueSlug) {
  const key = `${partSlug}/${issueSlug}`;
  const set = relatedAdjacency.get(key);
  if (!set) return [];
  return [...set]
    .map((k) => issueByKey.get(k))
    .filter(Boolean)
    .sort((a, b) => a.partNum - b.partNum || a.num - b.num);
}

export { parts, preface, conclusionParas, bibliography };
