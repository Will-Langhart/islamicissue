"""Steelman node — assesses and strengthens the "common Muslim responses" (proof dimension).

Generative and UNGROUNDED (unlike the citation verifier), so the guardrails are stricter:
  * higher hallucination risk → every proof signoff goes through a human interrupt;
    there is no `--bless` for generative verdicts.
  * it NEVER writes content.mjs — it only files suggestions to
    verifier/steelman-suggestions.json for a human to merge by hand.
  * charity bias is explicit: the compendium argues against Islam, so the assessor is
    told to be maximally charitable to the Muslim side and to flag strawmanning.

Governs the `proof` review dimension (the citation verifier governs `citation`).
"""
import json
import signal
from pathlib import Path
from typing import Literal, TypedDict

from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt
from langchain_anthropic import ChatAnthropic

from verifier._env import load_dotenv

load_dotenv()

ASSESS_MODEL = "claude-sonnet-5"
DRAFT_MODEL = "claude-sonnet-5"   # upgrade to "claude-opus-5" for stronger drafting


class _HardTimeout(Exception):
    pass


def _with_timeout(fn, seconds: int):
    """Backstop wall-clock timeout via SIGALRM — abandons a wedged socket read that the
    SDK's own read-timeout fails to catch (observed: connection stalls for hours). Main
    thread only. This is why the scans below run single-threaded in __main__."""
    def _handler(signum, frame):
        raise _HardTimeout(f"hard timeout after {seconds}s")
    old = signal.signal(signal.SIGALRM, _handler)
    signal.alarm(seconds)
    try:
        return fn()
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old)


def section_text(blocks: list[dict]) -> str:
    out = []
    for b in blocks:
        if b["type"] == "para":
            out.append(b["text"])
        elif b["type"] == "quote":
            out.append(f'“{b.get("q", "")}” — {b.get("ref", "")}'.strip(" —"))
        elif b["type"] == "bullet":
            out.append(" ".join(b.get("items", [])))
    return "\n\n".join(t for t in out if t)


class SteelmanState(TypedDict):
    issue_slug: str
    issue_title: str
    content_hash: str
    critique: str
    response: str
    rebuttal: str
    assessment: dict
    suggestion: dict
    warnings: list
    human_decision: dict


def feed_steelman(issues_path: str = "verifier/issues.json"):
    for iss in json.loads(Path(issues_path).read_text(encoding="utf-8")):
        b = iss["blocks"]
        yield {
            "issue_slug": iss["slug"], "issue_title": iss["title"],
            "content_hash": iss.get("contentHash", ""),
            "critique": section_text(b.get("critique", [])),
            "response": section_text(b.get("response", [])),   # the "common Muslim responses"
            "rebuttal": section_text(b.get("rebuttal", [])),
            "assessment": {}, "suggestion": {}, "warnings": [], "human_decision": {},
        }


class Assessment(BaseModel):
    verdict: Literal["strong", "adequate", "strawman", "missing"]
    missing_responses: list[str]   # omitted/under-developed replies, BY NAME (school/scholar/doctrine)
    gaps: list[str]
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str


class Suggestion(BaseModel):
    strengthened_response: list[str]   # proposed paragraphs, house register
    positions_covered: list[str]       # each tagged to a named source for auditability
    note_to_editor: str


_ASSESS = None
_DRAFT = None


def _assessor():
    global _ASSESS
    if _ASSESS is None:
        _ASSESS = ChatAnthropic(model=ASSESS_MODEL, timeout=60, max_retries=2
                                ).with_structured_output(Assessment)
    return _ASSESS


def _drafter():
    global _DRAFT
    if _DRAFT is None:
        _DRAFT = ChatAnthropic(model=DRAFT_MODEL, timeout=90, max_retries=2
                               ).with_structured_output(Suggestion)
    return _DRAFT


ASSESS_SYSTEM = (
    "You audit whether a critical compendium states the STRONGEST Muslim responses to a critique "
    "before rebutting them. The compendium argues AGAINST Islam, so your job is to protect it from "
    "strawmanning — be MAXIMALLY charitable to the Muslim side, and bias toward flagging weakness.\n"
    "Given the CRITIQUE, the current RESPONSE section (the Muslim replies as written), and the REBUTTAL, "
    "judge the RESPONSE section:\n"
    "  * 'strong': the best-known scholarly Muslim replies are present and fairly stated.\n"
    "  * 'adequate': present, but a stronger form or an important reply is under-developed.\n"
    "  * 'strawman': the replies given are weak or caricatured versions of the real Muslim position.\n"
    "  * 'missing': a well-known, materially stronger Muslim reply is absent.\n"
    "Name omitted or under-developed replies by their school, scholar, or doctrine (e.g. naskh/abrogation, "
    "bila kayfa, tawatur transmission, isnad-cum-matn analysis, occasion-of-revelation, a named modern "
    "apologist or academic). Judge FAIRNESS of representation, not whether the reply ultimately succeeds "
    "against the rebuttal. Set confidence on your overall judgment."
)

DRAFT_SYSTEM = (
    "Write the STRONGEST, fairest version of the Muslim responses to this critique, in a scholarly "
    "(not polemical) register matching a serious compendium's 'common responses' section. Address the "
    "weaknesses identified. Attribute each reply to a named school, scholar, doctrine, or source so an "
    "editor can verify it. Do NOT invent Qur'an or hadith reference numbers — refer to sources by name "
    "and let citation review add exact refs later. Return separate paragraph blocks in "
    "`strengthened_response`, the positions/sources covered in `positions_covered`, and a short "
    "`note_to_editor` on what changed and what to verify."
)


def assess_response(state: SteelmanState) -> dict:
    a = _assessor().invoke([("system", ASSESS_SYSTEM), ("human",
        f"CRITIQUE:\n{state['critique']}\n\n"
        f"CURRENT RESPONSE (Muslim replies as written):\n{state['response'] or '(none written)'}\n\n"
        f"REBUTTAL:\n{state['rebuttal']}")])
    return {"assessment": a.model_dump()}


def _needs_draft(state: SteelmanState) -> str:
    return "draft" if state["assessment"]["verdict"] != "strong" else "gate"


def draft_steelman(state: SteelmanState) -> dict:
    s = _drafter().invoke([("system", DRAFT_SYSTEM), ("human",
        f"CRITIQUE:\n{state['critique']}\n\n"
        f"WEAKNESSES FOUND:\n{json.dumps(state['assessment'], ensure_ascii=False)}\n\n"
        f"CURRENT RESPONSE:\n{state['response'] or '(none)'}")])
    return {"suggestion": s.model_dump()}


def steelman_gate(state: SteelmanState) -> dict:
    a = state["assessment"]
    if a["verdict"] == "strong":
        return {}   # nothing to propose; no interrupt (proof left for a human to affirm)

    decision = interrupt({
        "issue": state["issue_slug"], "issue_title": state["issue_title"],
        "assessment": a, "suggestion": state.get("suggestion", {}),
        "prompt": "keep (current already strong) / adopt / revise / defer",
    })  # -> {"action": keep|adopt|revise|defer, "reviewer": "...", "notes": "..."}

    action, reviewer = decision.get("action"), decision.get("reviewer", "")
    # 'keep' = human affirms the existing response is strong -> proof reviewed.
    # 'adopt'/'revise' = content will CHANGE -> proof stays in_review until merged + re-checked.
    status = "reviewed" if (action == "keep" and reviewer) else "in_review"
    return {"warnings": [{"issueTitle": state["issue_title"], "dimension": "proof",
                          "status": "info" if action == "keep" else "in_review",
                          "verdict": a["verdict"], "reason": a["reason"]}],
            "human_decision": {**decision, "status": status}}


def build_steelman():
    g = StateGraph(SteelmanState)
    g.add_node("assess", assess_response)
    g.add_node("draft", draft_steelman)
    g.add_node("gate", steelman_gate)
    g.add_edge(START, "assess")
    g.add_conditional_edges("assess", _needs_draft, {"draft": "draft", "gate": "gate"})
    g.add_edge("draft", "gate")
    g.add_edge("gate", END)
    return g.compile(checkpointer=MemorySaver())


def assess_landscape(issues_path: str = "verifier/issues.json") -> dict:
    """Assess-only (no drafting, no writes to review-status): map the proof dimension
    across the whole corpus so we can see how much strengthening it needs before
    committing to expensive drafting. Writes verifier/steelman-landscape.json."""
    from collections import Counter
    from datetime import date

    path = Path("verifier/steelman-landscape.json")
    out = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    errors, today = [], date.today().isoformat()
    for st in feed_steelman(issues_path):
        slug = st["issue_slug"]
        prev = out.get(slug)
        if prev and prev.get("verdict") not in (None, "error") \
                and prev.get("contentHash") == st.get("content_hash"):
            continue  # already assessed this exact content — resume, don't re-spend
        try:
            st.update(_with_timeout(lambda: assess_response(st), 150))
            a = st["assessment"]
            out[slug] = {"verdict": a["verdict"], "confidence": a["confidence"],
                         "missing_count": len(a.get("missing_responses", [])),
                         "reason": a["reason"], "checkedAt": today,
                         "contentHash": st.get("content_hash", "")}
        except Exception as e:  # hard-timeout or transient failure — record, keep going
            errors.append(slug)
            out[slug] = {"verdict": "error", "error": str(e)[:200],
                         "contentHash": st.get("content_hash", "")}
        path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")  # incremental
    return {"total": len(out), "distribution": dict(Counter(v["verdict"] for v in out.values())),
            "errors": errors}


def draft_for_issues(slugs: list[str], issues_path: str = "verifier/issues.json") -> dict:
    """Assess + draft the given issues; MERGE results into steelman-suggestions.json.
    These are PROPOSALS for human review — never merged into content.mjs automatically."""
    from datetime import date

    want = set(slugs)
    states = {s["issue_slug"]: s for s in feed_steelman(issues_path) if s["issue_slug"] in want}
    path = Path("verifier/steelman-suggestions.json")
    out = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    drafted, errors, today = [], [], date.today().isoformat()
    for slug in slugs:
        st = states.get(slug)
        if not st:
            continue
        prev = out.get(slug)
        if prev and prev.get("status") == "proposed" and prev.get("contentHash") == st.get("content_hash"):
            continue  # already drafted this content — skip on retry
        try:
            st.update(_with_timeout(lambda: assess_response(st), 150))
            st.update(_with_timeout(lambda: draft_steelman(st), 200))
        except Exception:
            errors.append(slug)
            continue
        a, s = st["assessment"], st["suggestion"]
        out[slug] = {"verdict": a["verdict"], "confidence": a["confidence"],
                     "assessment_reason": a["reason"], "missing_responses": a["missing_responses"],
                     "gaps": a["gaps"], "suggestion": s, "checkedAt": today,
                     "contentHash": st.get("content_hash", ""), "status": "proposed"}
        drafted.append(slug)
        path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")  # incremental
    return {"drafted": drafted, "errors": errors}


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "draft-weak":
        land = json.loads(Path("verifier/steelman-landscape.json").read_text(encoding="utf-8"))
        targets = [s for s, v in land.items() if v["verdict"] in ("strawman", "missing")]
        print(f"Drafting {len(targets)} weak issues (strawman/missing)...")
        r = draft_for_issues(targets)
        print(f"Drafted {len(r['drafted'])} → verifier/steelman-suggestions.json"
              + (f"  ({len(r['errors'])} errored: {r['errors']})" if r["errors"] else ""))
    else:
        r = assess_landscape()
        print(f"\nAssessed {r['total']} issues (proof dimension):")
        for verdict in ("strong", "adequate", "strawman", "missing", "error"):
            n = r["distribution"].get(verdict, 0)
            if n:
                print(f"  {verdict:9} {n}")
        if r["errors"]:
            print("errored:", r["errors"])
