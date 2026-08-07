"""Citation Verifier — a grounded, human-gated LangGraph node.

For each citation the feeder extracted:
  1. existence gate (deterministic) — does the ref resolve in content/verses.json?
  2. support/fidelity check (LLM, grounded on the corpus translation) — does the
     verse actually say what the claim asserts? (quote locus = fidelity; prose = support)
  3. human interrupt on anything flagged — the AI never self-approves.

Quran is grounded against verses.json (range-aware). Hadith has no local corpus,
so it is existence/format-checked only. The quote-locus prompt is hardened against
translation mismatch: it judges meaning, not wording.
"""
import json
import re
from pathlib import Path
from typing import Literal, TypedDict

from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt
from langchain_anthropic import ChatAnthropic

from verifier._env import load_dotenv

load_dotenv()  # make ANTHROPIC_API_KEY (from .env) available before any API call

MODEL = "claude-sonnet-5"

# --- Grounding corpus (trusted, local) -------------------------------------
VERSES = json.loads(Path("content/verses.json").read_text(encoding="utf-8"))
_DASH = re.compile(r"[–—-]")   # en-dash, em-dash, hyphen


def quran_ayah_keys(ref: str) -> list[str]:
    """'3:3–4' -> ['3:3','3:4'];  '4:157' -> ['4:157']. Degrades safely on junk."""
    try:
        surah, _, rest = ref.partition(":")
        ends = _DASH.split(rest)
        if len(ends) == 1:
            return [f"{surah}:{int(ends[0])}"]
        start, end = int(ends[0]), int(ends[1])
        if not (0 < end - start <= 20):
            return [f"{surah}:{start}"]
        return [f"{surah}:{a}" for a in range(start, end + 1)]
    except (ValueError, IndexError):
        return []


def quran_grounding(ref: str) -> str | None:
    """Concatenated official translation across the whole range, or None."""
    present = [(k, VERSES[k]["translation"]) for k in quran_ayah_keys(ref) if k in VERSES]
    return "\n".join(f"{k}: {t}" for k, t in present) if present else None


# --- Structured output -----------------------------------------------------
class Verdict(BaseModel):
    id: str                                    # echoes the feeder id, not the ref
    # not_found = ref doesn't resolve (deterministic only). unsupported = verse doesn't
    # back the claim. misattributed = quote distorts the verse. The model emits everything
    # except not_found (it only ever sees verses that exist).
    status: Literal["supported", "misattributed", "unsupported", "unverifiable", "not_found"]
    fidelity: Literal["exact", "variant_translation", "distorted", "n/a"] = "n/a"
    confidence: float = Field(ge=0.0, le=1.0)
    divergences: list[str] = []                # meaning-bearing differences; empty if wording-only
    reason: str


class BatchVerdict(BaseModel):
    verdicts: list[Verdict]


SYSTEM = (
    "You are a citation auditor for a scholarly compendium. Each item has a unique `id`, the official "
    "corpus translation (`verse_text`, which may span several ayat), a `claim`, and a `locus`. You are "
    "only ever given verses that EXIST — never answer 'not_found'.\n"
    "\n"
    "locus 'quote' — the claim is the site's own QUOTATION of the verse. Judge SEMANTIC FIDELITY, NOT "
    "wording. verse_text and the quote are usually DIFFERENT English translations of the same Arabic; "
    "translation differences are EXPECTED and are NOT errors.\n"
    "  * Reduce both to propositions (who does what to whom, affirmed vs negated, quantities, conditions) "
    "and compare PROPOSITIONS, not words.\n"
    "  * EQUIVALENT (fidelity='variant_translation', status='supported'): synonyms, archaic vs modern "
    "phrasing, word order, bracketed glosses, pronoun-vs-name, punctuation, partial quotation that omits "
    "text without changing what remains.\n"
    "  * DISTORTED (fidelity='distorted', status='misattributed') ONLY when a proposition changes: a "
    "negation dropped/added, a different actor/object/referent, a changed quantity, a claim the verse does "
    "not make appended to the quote, or an ellipsis that reverses the sense. When wording and meaning both "
    "match, fidelity='exact'. List meaning-bearing differences in `divergences`.\n"
    "\n"
    "locus 'prose' — the verse is cited IN SUPPORT of an argumentative claim. Claims are often supported "
    "JOINTLY by several co-cited refs (listed in `co_cited_refs`). Judge only whether THIS verse plausibly "
    "BELONGS as a citation for the claim — i.e. it is RELEVANT to and CONSISTENT with the claim. Do NOT "
    "require it to prove the whole claim by itself, and do not penalize it for details supplied by hadith, "
    "exegesis, or the co-cited verses.\n"
    "  A verse may be cited as a STANDARD, CRITERION, or PREMISE that the surrounding argument then TESTS "
    "or CHALLENGES (e.g. 'by the Qur'an's own no-contradiction test in 4:82, it fails'). This is legitimate "
    "citation — judge relevance to the claim's TOPIC, not whether the verse agrees with the author's "
    "conclusion.\n"
    "  * 'supported': the verse is relevant to the claim and does not contradict it (a legitimate citation).\n"
    "  * 'unsupported': the verse is IRRELEVANT to the claim or CONTRADICTS it (a genuine mis-citation).\n"
    "  * 'unverifiable': verse_text is insufficient to tell.\n"
    "\n"
    "Judge only from verse_text, never from memory. Set fidelity='n/a' for prose. Echo each `id` exactly."
)


class VerifierState(TypedDict):
    issue_slug: str
    issue_title: str
    content_hash: str
    citations: list
    existence: dict
    verdicts: list
    warnings: list
    human_decisions: dict


_LLM = None


def _llm():
    global _LLM
    if _LLM is None:
        # Sonnet 5 deprecates `temperature`; structured output already pins determinism.
        # timeout + retries so a stalled connection can't hang the whole run indefinitely.
        _LLM = ChatAnthropic(model=MODEL, timeout=90, max_retries=3).with_structured_output(BatchVerdict)
    return _LLM


# Two tiers (both deterministic on status):
#   BLOCKING  — quote misquote or non-resolving ref. Stable, high-precision. Gates review.
#   ADVISORY  — prose relevance ('unsupported'). Fuzzy, varies run-to-run. Surfaced, not blocking.
def _blocking(v: dict) -> bool:
    return v["status"] in ("misattributed", "not_found")


def _advisory(v: dict) -> bool:
    return v["status"] == "unsupported"


# === Node 1: deterministic existence gate (no LLM) =========================
def check_existence(state: VerifierState) -> dict:
    existence = {}
    for c in state["citations"]:
        if c["kind"] == "quran":
            # verses.json is a PARTIAL corpus (only cited ayat), so a wide span like
            # "20:85–97" won't have every intermediate ayah. Require the anchor ayah to
            # resolve; grounding then uses whatever ayat of the range are present.
            keys = quran_ayah_keys(c["ref"])
            existence[c["id"]] = bool(keys) and keys[0] in VERSES
        else:  # no local hadith corpus: format-check only
            existence[c["id"]] = bool(c["ref"].strip()) and any(ch.isdigit() for ch in c["ref"])
    return {"existence": existence}


# === Node 2: grounded support/fidelity check (one batched LLM call) ========
def support_check(state: VerifierState) -> dict:
    by_id = {c["id"]: c for c in state["citations"]}
    grounding = {c["id"]: quran_grounding(c["ref"])
                 for c in state["citations"]
                 if c["kind"] == "quran" and state["existence"].get(c["id"])}
    grounding = {cid: g for cid, g in grounding.items() if g}

    verdicts: list[dict] = []
    if grounding:
        payload = [{"id": cid, "ref": by_id[cid]["ref"], "locus": by_id[cid]["locus"],
                    "claim": by_id[cid]["claim"], "verse_text": text,
                    "co_cited_refs": by_id[cid].get("co_refs", [])}
                   for cid, text in grounding.items()]
        result = _llm().invoke([
            ("system", SYSTEM),
            ("human", f"Issue: {state['issue_title']}\nCitations:\n"
                      f"{json.dumps(payload, indent=2, ensure_ascii=False)}"),
        ])
        got = {v.id: v.model_dump() for v in result.verdicts}
        for cid in grounding:
            verdicts.append(got.get(cid, {
                "id": cid, "status": "unverifiable", "fidelity": "n/a", "confidence": 0.5,
                "divergences": [], "reason": "model returned no verdict for this id"}))

    checked = set(grounding)
    for c in state["citations"]:
        if c["id"] in checked:
            continue
        if not state["existence"].get(c["id"]):
            verdicts.append({"id": c["id"], "status": "not_found", "fidelity": "n/a",
                             "confidence": 1.0, "divergences": [],
                             "reason": "Reference does not resolve in the corpus."})
        elif c["kind"] == "hadith":
            verdicts.append({"id": c["id"], "status": "unverifiable", "fidelity": "n/a",
                             "confidence": 1.0, "divergences": [],
                             "reason": "No local hadith corpus; existence-checked only."})
        else:
            verdicts.append({"id": c["id"], "status": "unverifiable", "fidelity": "n/a",
                             "confidence": 1.0, "divergences": [],
                             "reason": "Verse text unavailable for grounding."})
    return {"verdicts": verdicts}


# === Node 3: human-in-the-loop gate ========================================
def editor_gate(state: VerifierState) -> dict:
    by_id = {c["id"]: c for c in state["citations"]}
    blocking = [v for v in state["verdicts"] if _blocking(v)]
    advisory = [v for v in state["verdicts"] if _advisory(v)]

    # Advisory notes are always recorded, never block a bless.
    warnings = [{"issueTitle": state["issue_title"], "reference": by_id[v["id"]]["ref"],
                 "reason": v["reason"], "status": "info", "verdict": "unsupported",
                 "confidence": v["confidence"], "locus": by_id[v["id"]]["locus"]}
                for v in advisory]

    if not blocking:
        return {"warnings": warnings}   # clean or advisory-only: no interrupt

    review_items = [{**v, "reference": by_id[v["id"]]["ref"], "claim": by_id[v["id"]]["claim"],
                     "locus": by_id[v["id"]]["locus"]} for v in blocking]
    decisions = interrupt({
        "issue": state["issue_slug"], "issue_title": state["issue_title"],
        "review_this": review_items,
        "prompt": "Confirm, override, or reject each flagged citation.",
    })
    warnings += [{"issueTitle": state["issue_title"], "reference": by_id[v["id"]]["ref"],
                  "reason": v["reason"], "status": "in_review", "verdict": v["status"],
                  "fidelity": v["fidelity"], "divergences": v["divergences"],
                  "confidence": v["confidence"], "locus": by_id[v["id"]]["locus"]}
                 for v in blocking]
    return {"warnings": warnings, "human_decisions": decisions}


def build_verifier():
    g = StateGraph(VerifierState)
    g.add_node("existence", check_existence)
    g.add_node("support", support_check)
    g.add_node("gate", editor_gate)
    g.add_edge(START, "existence")
    g.add_edge("existence", "support")
    g.add_edge("support", "gate")
    g.add_edge("gate", END)
    return g.compile(checkpointer=MemorySaver())
