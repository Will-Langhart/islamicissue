// Deterministic citation validator for the chatbot. Shared by the API route
// (post-stream monitoring) and the markdown renderer (render-time guard) so a
// hallucinated internal link can never resolve to a 404 or masquerade as a real
// citation of the compendium.
//
// Client-safe: depends only on structure.mjs (pure content, no fs / no
// review-status), which is already bundled into client components. The corpus
// only ever contains reviewed issue URLs + /conclusion, so anything the model
// emits outside the real-page set below is an invention, not a citation.

import { site, flatIssues } from "../structure.mjs";

// Static content routes that exist under app/ and that the bot may legitimately
// link (the cumulative case, "browse the compendium"). Keep in sync with the
// top-level route directories.
const STATIC_ROUTES = [
  "/",
  "/conclusion",
  "/sources",
  "/methodology",
  "/timeline",
  "/glossary",
  "/graph",
  "/citations",
  "/corrections",
];

let urlSetCache = null;

/** Set of every real internal URL the bot could cite (issues + part indexes + static). */
export function validInternalUrls() {
  if (urlSetCache) return urlSetCache;
  const set = new Set(STATIC_ROUTES);
  for (const part of site) set.add(`/${part.slug}`); // part index pages
  for (const f of flatIssues) set.add(f.href); // every issue page
  urlSetCache = set;
  return set;
}

// Normalize a link target for comparison: drop any anchor/query and a trailing slash.
function normalize(url) {
  const bare = url.split("#")[0].split("?")[0];
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
}

/** Internal ("/…") URL points at a real page? External URLs are out of scope → true. */
export function isValidInternalUrl(url) {
  if (typeof url !== "string" || !url.startsWith("/")) return true;
  return validInternalUrls().has(normalize(url));
}

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Internal markdown links in `text` that resolve to no real page (fabricated citations). */
export function findInvalidCitations(text) {
  const bad = [];
  if (!text) return bad;
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    const [, label, url] = m;
    if (url.startsWith("/") && !isValidInternalUrl(url)) bad.push({ label, url });
  }
  return bad;
}
