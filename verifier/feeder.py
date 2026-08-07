"""Citation claim-extraction feeder.

Ports lib/citations.mjs parseCitations to Python and attaches a CLAIM to every
citation, producing the list[Citation] the citation verifier consumes per issue.

Pure and deterministic: no LLM, no network. The only input is verifier/issues.json
(produced by scripts/export-claims.mjs from content/content.mjs).
"""
import json
import re
from pathlib import Path
from typing import Iterator, TypedDict


class Citation(TypedDict):
    id: str            # stable disambiguator: "<ref>::<locus>::<n>"
    ref: str           # "4:157" (quran token) | "Sahih al-Bukhari 3017"
    kind: str          # "quran" | "hadith"
    claim: str         # quoted text (quote locus) or the containing sentence (prose locus)
    locus: str         # "quote" | "prose"
    co_refs: list[str] # other refs cited in the same claim (prose); jointly support it


# --- Regexes ported from lib/citations.mjs (order preserved: alternation is
#     greedy, so keep the longer/qualified names first). --------------------
_HADITH = [
    "Sahih al-Bukhari", "Sahih Muslim", "Sunan Abi Dawud", "Sunan Abu Dawud",
    "Sunan Ibn Majah", "Sunan al-Tirmidhi", "Jami al-Tirmidhi", "Sunan an-Nasai",
    "Sunan al-Nasai", "Sunan al-Darimi", "Muwatta Malik", "Musnad Ahmad",
]
_D = "–—-"  # en-dash, em-dash, hyphen — content uses “–”
QURAN_CHAIN = re.compile(rf"\bQuran\s+\d+:\d+(?:[{_D}]\d+)?(?:\s*[;,]\s*\d+:\d+(?:[{_D}]\d+)?)*")
QURAN_TOKEN = re.compile(rf"\d+:\d+(?:[{_D}]\d+)?")
HADITH_RE = re.compile(r"\b(" + "|".join(map(re.escape, _HADITH)) + rf")\s+(\d+(?:[{_D}]\d+)?)")


def find_citations(text: str) -> list[dict]:
    """Every citation with absolute offsets — mirrors parseCitations' hit-walk."""
    hits: list[dict] = []
    for m in QURAN_CHAIN.finditer(text):                 # re-tokenize the chain so
        for t in QURAN_TOKEN.finditer(m.group(0)):       # "Quran 2:106; 16:101" splits
            hits.append({"kind": "quran", "ref": t.group(0),
                         "start": m.start() + t.start(), "end": m.start() + t.end()})
    for m in HADITH_RE.finditer(text):
        hits.append({"kind": "hadith", "ref": f"{m.group(1)} {m.group(2)}",
                     "start": m.start(), "end": m.end()})
    hits.sort(key=lambda h: h["start"])
    return hits


# --- Pragmatic sentence segmentation. The claim is only LLM context, so an
#     approximate split is fine; swap for `syntok`/`nltk` if precision matters.
_SENT_END = re.compile(r"[.?!][\"”’')\]]*(?=\s|$)")


def sentence_spans(text: str) -> list[tuple[int, int]]:
    spans: list[tuple[int, int]] = []
    start = 0
    for m in _SENT_END.finditer(text):
        spans.append((start, m.end()))
        start = m.end()
    if start < len(text):
        spans.append((start, len(text)))
    # Merge stray fragments ("c. 650", "A.C.", initials) into the previous sentence.
    merged: list[tuple[int, int]] = []
    for s, e in spans:
        if merged and (e - s) < 25:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    return merged or [(0, len(text))]


def _span_of(pos: int, spans: list[tuple[int, int]]) -> tuple[int, int]:
    for s, e in spans:
        if s <= pos < e:
            return (s, e)
    return spans[-1] if spans else (0, 0)


def _claims_from_blocks(blocks: list[dict]) -> Iterator[Citation]:
    for b in blocks:
        if b["type"] == "quote":
            # The ref field carries the citation; the site's own quote IS the claim.
            for h in find_citations(b.get("ref", "")):
                yield {"id": "", "ref": h["ref"], "kind": h["kind"],
                       "claim": b.get("q", "").strip(), "locus": "quote", "co_refs": []}
        else:
            texts = [b["text"]] if b["type"] == "para" else b.get("items", [])
            for t in texts:
                spans = sentence_spans(t)
                hits = find_citations(t)
                for h in hits:
                    s, e = _span_of(h["start"], spans)
                    # Sibling refs in the same sentence jointly support this claim.
                    co = [x["ref"] for x in hits if x is not h and s <= x["start"] < e]
                    yield {"id": "", "ref": h["ref"], "kind": h["kind"],
                           "claim": t[s:e].strip(), "locus": "prose", "co_refs": co}


def _dedup_and_id(cits: list[Citation]) -> list[Citation]:
    seen: set[tuple[str, str]] = set()
    counter: dict[str, int] = {}
    out: list[Citation] = []
    for c in cits:
        key = (c["ref"], c["claim"])
        if key in seen:            # same ref + same claim → one check
            continue
        seen.add(key)
        n = counter.get(c["ref"], 0)
        counter[c["ref"]] = n + 1
        c["id"] = f'{c["ref"]}::{c["locus"]}::{n}'   # unique even when a ref recurs
        out.append(c)
    return out


def feed(issues_path: str = "verifier/issues.json") -> Iterator[dict]:
    """Yield ready-to-run verifier state per issue."""
    issues = json.loads(Path(issues_path).read_text(encoding="utf-8"))
    for iss in issues:
        cits: list[Citation] = []
        for field in ("critique", "response", "rebuttal"):
            cits.extend(_claims_from_blocks(iss["blocks"].get(field, [])))
        yield {
            "issue_slug": iss["slug"],
            "issue_title": iss["title"],
            "content_hash": iss.get("contentHash", ""),
            "citations": _dedup_and_id(cits),
            "existence": {}, "verdicts": [], "warnings": [], "human_decisions": {},
        }


if __name__ == "__main__":
    for state in feed():
        print(f'{state["issue_slug"]:60}  {len(state["citations"]):3} citations')
