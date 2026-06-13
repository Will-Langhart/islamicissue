import { parts, preface, conclusionParas, bibliography } from "../content/content.mjs";

export const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const partMeta = [
  { slug: "islamic-dilemma", short: "The Islamic Dilemma" },
  { slug: "quran-contradictions", short: "Internal Contradictions" },
  { slug: "preservation", short: "The Preservation Problem" },
  { slug: "history-science", short: "History & Science" },
  { slug: "muhammad", short: "The Prophetic Credentials" },
  { slug: "theology-ethics", short: "Theology & Ethics" },
  { slug: "sharia-morality", short: "Sharia & Morality" },
  { slug: "hadith-problem", short: "The Hadith Problem" },
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

export { parts, preface, conclusionParas, bibliography };
