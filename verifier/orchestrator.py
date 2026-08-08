"""Editorial orchestrator — one graph composing the agentic nodes per issue.

Topology (per issue, thread_id = slug):

    START → plan ─┬→ verify ───────────┐
                  ├→ steelman → rebut ──┤→ gate → writer → END
                  └→ link ──────────────┘

`plan` makes it INCREMENTAL: it reads review-status.json + verification-log.json and
marks only the STALE dimensions (citation / proof) plus the cheap deterministic link.
Each propose node early-returns {} when its task isn't planned, so a reviewed+unchanged
issue costs only cheap function calls — no LLM. (This "always-run, early-return" join is
used instead of Send: deadlock-free on any LangGraph version.)

`gate` is the SINGLE consolidated human interrupt — citation flags + proof assessment +
drafted response + rebuttal + proposed edges in one payload. `writer` routes the one
decision bundle back to review-status (both dimensions), suggestions, edges, attestation.
Invariants preserved: named-reviewer-only 'reviewed'; suggestions never touch content.mjs.
"""
import json
from datetime import date
from operator import add
from pathlib import Path
from typing import Annotated, TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command

from verifier.feeder import _claims_from_blocks, _dedup_and_id
from verifier.steelman import (section_text, assess_response, draft_steelman, propose_rebut,
                               _with_timeout)
from verifier.citation_verifier import check_existence, support_check, _blocking, _advisory
from verifier.linker import propose_link
from verifier.resume import rollup_citation_status


def _load(path, default):
    p = Path(path)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default


REVIEW_STATUS = _load("content/review-status.json", {})
VERIFY_LOG = _load("verifier/verification-log.json", {})


class IssueState(TypedDict):
    issue_slug: str
    issue_title: str
    content_hash: str
    critique: str
    response: str
    rebuttal: str
    citations: list
    plan: list
    existence: dict
    verdicts: Annotated[list, add]     # verify (reducer: parallel-safe)
    assessment: dict                   # steelman
    suggestion: dict                   # steelman
    rebuttal_draft: dict               # rebut
    edges: Annotated[list, add]        # link
    warnings: Annotated[list, add]     # gate
    human_decisions: dict
    outputs: dict
    today: str


def feed_all(issues_path: str = "verifier/issues.json"):
    for iss in json.loads(Path(issues_path).read_text(encoding="utf-8")):
        b = iss["blocks"]
        cits = [c for f in ("critique", "response", "rebuttal") for c in _claims_from_blocks(b.get(f, []))]
        yield {
            "issue_slug": iss["slug"], "issue_title": iss["title"],
            "content_hash": iss.get("contentHash", ""),
            "critique": section_text(b.get("critique", [])),
            "response": section_text(b.get("response", [])),
            "rebuttal": section_text(b.get("rebuttal", [])),
            "citations": _dedup_and_id(cits),
            "plan": [], "existence": {}, "verdicts": [], "assessment": {}, "suggestion": {},
            "rebuttal_draft": {}, "edges": [], "warnings": [], "human_decisions": {},
            "outputs": {}, "today": "",
        }


# === plan: the incremental brain — only STALE work is dispatched =============
def plan(state: IssueState) -> dict:
    slug = state["issue_slug"]
    rs = REVIEW_STATUS.get(slug, {})
    prior = VERIFY_LOG.get(slug, {})
    changed = prior.get("contentHash") != state["content_hash"]
    tasks = []
    if changed or rs.get("citation", {}).get("status") != "reviewed":
        tasks.append("verify")
    if changed or rs.get("proof", {}).get("status") != "reviewed":
        tasks.append("steelman")
    tasks.append("link")   # deterministic + cheap; always runs
    return {"plan": tasks}


# === propose nodes (early-return {} when not planned) =======================
def node_verify(state: IssueState) -> dict:
    if "verify" not in state["plan"]:
        return {}
    st = {**state, **check_existence(state)}
    return {"existence": st["existence"],
            "verdicts": _with_timeout(lambda: support_check(st), 150)["verdicts"]}


def node_steelman(state: IssueState) -> dict:
    if "steelman" not in state["plan"]:
        return {}
    a = _with_timeout(lambda: assess_response(state), 150)
    out = {"assessment": a["assessment"]}
    if a["assessment"]["verdict"] != "strong":
        out.update(_with_timeout(lambda: draft_steelman({**state, **a}), 200))
    return out


def node_rebut(state: IssueState) -> dict:
    if "steelman" not in state["plan"] or state.get("assessment", {}).get("verdict") in (None, "", "strong"):
        return {}
    return _with_timeout(lambda: propose_rebut(state), 150)


def node_link(state: IssueState) -> dict:
    return propose_link(state)   # deterministic → {"edges": [...]}


# === gate: ONE consolidated human interrupt =================================
def editorial_gate(state: IssueState) -> dict:
    by_id = {c["id"]: c for c in state["citations"]}
    cit_blocking = [v for v in state["verdicts"] if _blocking(v)]
    advisories = [v for v in state["verdicts"] if _advisory(v)]
    a = state.get("assessment", {})
    proof_needed = a.get("verdict") in ("adequate", "strawman", "missing")

    warnings = [{"issueTitle": state["issue_title"], "reference": by_id[v["id"]]["ref"],
                 "status": "info", "verdict": "unsupported", "locus": by_id[v["id"]]["locus"],
                 "reason": v["reason"]} for v in advisories]

    package = {
        "issue": state["issue_slug"], "issue_title": state["issue_title"],
        "citation_flags": [{**v, "reference": by_id[v["id"]]["ref"], "claim": by_id[v["id"]]["claim"],
                            "locus": by_id[v["id"]]["locus"]} for v in cit_blocking],
        "proof_assessment": a if proof_needed else {},
        "proposed_response": state.get("suggestion", {}) if proof_needed else {},
        "proposed_rebuttal": state.get("rebuttal_draft", {}) if proof_needed else {},
        "proposed_edges": state.get("edges", []),
    }
    if not (package["citation_flags"] or package["proof_assessment"] or package["proposed_edges"]):
        return {"warnings": warnings}   # clean/advisory-only: no interrupt
    return {"warnings": warnings, "human_decisions": interrupt(package)}


# === writer: fan one decision bundle back to the artifacts ==================
def writer(state: IssueState) -> dict:
    today = state.get("today") or date.today().isoformat()
    hd = state.get("human_decisions", {})
    reviewer = hd.get("reviewer", "")
    out = {"review": {}, "suggestion": None, "edges": [], "attestation": {}}

    cdec = hd.get("citation", {})
    if cdec:
        cstatus = rollup_citation_status(cdec)
        if cstatus == "reviewed" and not reviewer:
            cstatus = "in_review"
        out["review"]["citation"] = {"status": cstatus, "reviewer": reviewer, "reviewedAt": today,
                                     "notes": "Orchestrator citation verify."}
    pdec = hd.get("proof", {})
    if pdec:
        action = pdec.get("action")
        pstatus = "reviewed" if (action == "keep" and reviewer) else "in_review"
        out["review"]["proof"] = {"status": pstatus, "reviewer": reviewer, "reviewedAt": today,
            "notes": f"Orchestrator steelman: verdict={state.get('assessment', {}).get('verdict')}, action={action}."}
        if action in ("adopt", "revise"):
            out["suggestion"] = {"response": state.get("suggestion", {}),
                                 "rebuttal": state.get("rebuttal_draft", {}), "action": action}

    accepted = set(hd.get("edges", {}).get("accept", []))
    out["edges"] = [e for e in state.get("edges", []) if e.get("target") in accepted]

    blocking = sum(1 for v in state["verdicts"] if _blocking(v))
    out["attestation"] = {"contentHash": state["content_hash"], "checkedAt": today,
                          "citationBlocking": blocking,
                          "proofVerdict": state.get("assessment", {}).get("verdict"),
                          "clean": blocking == 0}
    return {"outputs": out}


def build_orchestrator(checkpointer=None):
    g = StateGraph(IssueState)
    for name, fn in [("plan", plan), ("verify", node_verify), ("steelman", node_steelman),
                     ("rebut", node_rebut), ("link", node_link), ("gate", editorial_gate),
                     ("writer", writer)]:
        g.add_node(name, fn)
    g.add_edge(START, "plan")
    g.add_edge("plan", "verify")
    g.add_edge("plan", "steelman")
    g.add_edge("plan", "link")
    g.add_edge("steelman", "rebut")
    g.add_edge("verify", "gate")
    g.add_edge("rebut", "gate")
    g.add_edge("link", "gate")
    g.add_edge("gate", "writer")
    g.add_edge("writer", END)
    return g.compile(checkpointer=checkpointer or MemorySaver())


# === driver ================================================================
def run(review_fn=None, issues_path="verifier/issues.json", limit=None, checkpointer=None):
    """Orchestrate each issue. scan mode (review_fn=None): unattended — records an
    attestation per issue and lists those that need a human at the consolidated gate;
    never self-decides. Hang-proof (node timeouts) and per-issue error-isolated."""
    app = build_orchestrator(checkpointer)
    today = date.today().isoformat()
    log, needs_review, errors = {}, [], []
    for i, state in enumerate(feed_all(issues_path)):
        if limit and i >= limit:
            break
        state["today"] = today
        slug = state["issue_slug"]
        cfg = {"configurable": {"thread_id": "orch:" + slug}}
        try:
            result = app.invoke(state, cfg)
        except Exception as e:
            errors.append(slug)
            log[slug] = {"error": str(e)[:200], "contentHash": state["content_hash"]}
            continue
        if result.get("__interrupt__"):
            if review_fn is None:
                needs_review.append(slug)          # scan mode: leave for a human
            else:
                app.invoke(Command(resume=review_fn(result["__interrupt__"][0].value)), cfg)
        att = dict(result.get("outputs", {}).get("attestation", {}))
        att["plan"] = result.get("plan", [])
        att["needsReview"] = slug in needs_review
        log[slug] = att
    Path("verifier/orchestrator-log.json").write_text(
        json.dumps(log, indent=2, ensure_ascii=False), encoding="utf-8")
    return {"total": len(log), "needs_review": needs_review, "errors": errors}


# === consolidated reviewer — ONE prompt for the whole issue =================
def cli_review(package: dict) -> dict:
    """Render the gate's whole package (citation flags + proof + rebuttal + edges) as one
    reviewer prompt. Returns the decision bundle the writer fans out. Swap for a UI/queue."""
    import textwrap
    w = lambda t, i="     ": textwrap.fill(str(t), 88, initial_indent=i, subsequent_indent=i)

    def choose(prompt, opts):
        while True:
            c = input(f"{prompt} [{'/'.join(opts)}]: ").strip().lower()
            for o in opts:
                if c in (o, o[0]):
                    return o
            print("     choose one of:", "/".join(opts))

    print("\n" + "=" * 90)
    print(f"  EDITORIAL REVIEW — {package.get('issue_title') or package['issue']}")
    print("=" * 90)
    reviewer = ""
    while not reviewer:
        reviewer = input("Reviewer name (required): ").strip()
    bundle = {"reviewer": reviewer, "citation": {}, "proof": {}, "edges": {"accept": []}}

    for v in package.get("citation_flags", []):
        print(f"\n▐ CITATION {v.get('reference')} [{v.get('locus')}] → {v['status']} (conf {v['confidence']:.2f})")
        for d in v.get("divergences", []):
            print(w(f"↳ {d}"))
        print(w(f"reason: {v['reason']}"))
        print(w(f"claim: {v.get('claim', '')}"))
        bundle["citation"][v["id"]] = {"decision": choose("     decision", ["approve", "flag", "defer"]),
                                       "notes": input("     notes: ").strip()}

    a = package.get("proof_assessment", {})
    if a:
        print(f"\n▐ PROOF — verdict {a.get('verdict')} (conf {a.get('confidence', 0):.2f})")
        print(w(a.get("reason", ""), "  "))
        for p in package.get("proposed_response", {}).get("strengthened_response", []):
            print(w(p, "    "))
        for p in package.get("proposed_rebuttal", {}).get("blocks", []):
            print(w("[rebuttal] " + p, "    "))
        bundle["proof"] = {"action": choose("  decision", ["keep", "adopt", "revise", "defer"]),
                           "notes": input("  notes: ").strip()}

    edges = package.get("proposed_edges", [])
    if edges:
        print(f"\n▐ GRAPH LINKS — {len(edges)}")
        for i, e in enumerate(edges, 1):
            print(f"  {i}. → {e.get('targetLabel', e['target'])} (w={e['weight']})")
        raw = input("  accept which? ('1 3'/'all'/'none'): ").strip().lower()
        chosen = (edges if raw == "all" else [] if raw in ("", "none")
                  else [e for i, e in enumerate(edges, 1) if str(i) in raw.split()])
        bundle["edges"]["accept"] = [e["target"] for e in chosen]
    return bundle


if __name__ == "__main__":
    import sys
    args = sys.argv[1:]
    review = "review" in args
    limit = next((int(a) for a in args if a.isdigit()), None)
    out = run(review_fn=cli_review if review else None, limit=limit)
    print(f"\nOrchestrated {out['total']} issues · {len(out['needs_review'])} need review · "
          f"{len(out['errors'])} errored")
    for s in out["needs_review"]:
        print(f"  ⚠ review  {s}")
    for s in out["errors"]:
        print(f"  ✗ error   {s}")
