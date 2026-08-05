import { site } from "@/lib/structure.mjs";

export const dynamicParams = false;

// Base URL for absolute sitemap entries. Override via env when a custom
// domain is connected in Vercel; falls back to the current production URL.
const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "https://islamicissue.vercel.app"
).replace(/\/$/, "");

export default function sitemap() {
  const lastModified = new Date();

  // Home — the entry point to the whole compendium.
  const home = {
    url: `${BASE}/`,
    lastModified,
    changeFrequency: "monthly",
    priority: 1.0,
  };

  // Standalone content pages (the argument's supporting apparatus).
  const contentPages = [
    "conclusion",
    "methodology",
    "sources",
    "glossary",
    "timeline",
  ].map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Interactive tools/reports (/graph, /citations, /corrections) are intentionally
  // omitted here and disallowed in robots.js — they're apparatus, not reading content.

  // The nine parts and their issues, driven off the content structure so the
  // sitemap can never drift from what actually renders.
  const partPages = site.map((part) => ({
    url: `${BASE}/${part.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const issuePages = site.flatMap((part) =>
    part.items.map((item) => ({
      url: `${BASE}/${part.slug}/${item.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  );

  return [home, ...partPages, ...issuePages, ...contentPages];
}
