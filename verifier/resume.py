"""Driver for the Citation Verifier.

Runs every issue through the graph, logging a machine attestation for each (clean
or not — so `--bless` has evidence). Two modes:

  * scan   (review_fn=None): unattended. Flagged issues are left paused/unreviewed
           and reported; the AI never decides. Produces verification-log.json.
  * review (review_fn given): resumes each interrupt with human decisions and writes
           review-decisions.json + review-audit.json.

Usage:
  python -m verifier.resume            # scan (unattended) — safe, no writes to review-status
  python -m verifier.resume review     # interactive review of flagged issues
"""
import json
import sys
from datetime import date
from pathlib import Path

from langgraph.types import Command

from verifier.feeder import feed
from verifier.citation_verifier import build_verifier, _blocking, _advisory


def summarize(verdicts: list[dict]) -> dict:
    by_status: dict[str, int] = {}
    for v in verdicts:
        by_status[v["status"]] = by_status.get(v["status"], 0) + 1
    blocking = sum(1 for v in verdicts if _blocking(v))
    advisory = sum(1 for v in verdicts if _advisory(v))
    # clean = no BLOCKING flags — advisory (prose-relevance) notes never block a bless.
    return {"citations": len(verdicts), "blocking": blocking, "advisory": advisory,
            "clean": blocking == 0, "byStatus": by_status}


def rollup_citation_status(decisions: dict) -> str:
    """reviewed only when a human cleared EVERY flag; otherwise in_review."""
    if not decisions:
        return "in_review"
    return "reviewed" if {d["decision"] for d in decisions.values()} == {"approve"} else "in_review"


def cli_review(payload: dict) -> dict:
    print(f'\n=== Review needed: {payload["issue"]} ===')
    reviewer = ""
    while not reviewer:
        reviewer = input("Reviewer name (required): ").strip()
    decisions = {}
    for item in payload["review_this"]:
        print(f'\n  {item["reference"]}  [{item["locus"]}]  '
              f'verdict={item["verdict"]}  conf={item["confidence"]:.2f}')
        if item.get("divergences"):
            print("  divergences:", "; ".join(item["divergences"]))
        print(f'  claim: {item["claim"]}')
        choice = ""
        while choice not in ("a", "f", "d"):
            choice = input("  [a]pprove / [f]lag / [d]efer: ").strip().lower()
        decisions[item["id"]] = {
            "decision": {"a": "approve", "f": "flag", "d": "defer"}[choice],
            "reviewer": reviewer,
            "notes": input("  notes: ").strip(),
        }
    return decisions


def run(review_fn=None, issues_path="verifier/issues.json", today=None):
    app = build_verifier()
    today = today or date.today().isoformat()
    review_out, audit_out, verify_log, flagged = {}, {}, {}, []

    errors = []
    for state in feed(issues_path):
        slug = state["issue_slug"]
        cfg = {"configurable": {"thread_id": slug}}
        try:
            result = app.invoke(state, cfg)
        except Exception as e:  # transient API failure — record, keep going, never bless
            errors.append(slug)
            verify_log[slug] = {"citations": len(state["citations"]), "blocking": 0,
                                "advisory": 0, "clean": False, "byStatus": {}, "advisories": [],
                                "checkedAt": today, "contentHash": state.get("content_hash", ""),
                                "error": str(e)[:200]}
            continue

        attest = summarize(result.get("verdicts", []))
        attest["checkedAt"] = today
        attest["contentHash"] = state.get("content_hash", "")
        attest["advisories"] = [{"reference": w["reference"], "reason": w["reason"],
                                 "locus": w["locus"]}
                                for w in result.get("warnings", []) if w.get("status") == "info"]
        verify_log[slug] = attest

        interrupts = result.get("__interrupt__")   # only fires on BLOCKING flags now
        if not interrupts:
            continue
        if review_fn is None:                 # scan mode: leave paused, never self-decide
            flagged.append(slug)
            continue

        decisions = review_fn(interrupts[0].value)
        app.invoke(Command(resume=decisions), cfg)
        reviewer = next((d.get("reviewer") for d in decisions.values() if d.get("reviewer")), "")
        status = rollup_citation_status(decisions)
        if status == "reviewed" and not reviewer:
            status = "in_review"
        cleared = sum(d["decision"] == "approve" for d in decisions.values())
        problems = sum(d["decision"] == "flag" for d in decisions.values())
        review_out[slug] = {"citation": {
            "status": status, "reviewer": reviewer, "reviewedAt": today,
            "notes": f"Citation verifier: {cleared} cleared, {problems} confirmed problem(s)."}}
        audit_out[slug] = {cid: {"decision": d["decision"], "notes": d.get("notes", "")}
                           for cid, d in decisions.items()}

    Path("verifier/verification-log.json").write_text(
        json.dumps(verify_log, indent=2, ensure_ascii=False), encoding="utf-8")
    if review_out:
        Path("verifier/review-decisions.json").write_text(
            json.dumps(review_out, indent=2, ensure_ascii=False), encoding="utf-8")
        Path("verifier/review-audit.json").write_text(
            json.dumps(audit_out, indent=2, ensure_ascii=False), encoding="utf-8")
    return {"total": len(verify_log), "flagged": flagged, "errored": errors,
            "clean": sum(1 for a in verify_log.values() if a["clean"]),
            "advisory_issues": sorted(s for s, a in verify_log.items() if a.get("advisory", 0) > 0)}


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "scan"
    out = run(cli_review if mode == "review" else None)
    print(f"\nVerified {out['total']} issues · {out['clean']} clean (bless-eligible) · "
          f"{len(out['flagged'])} blocking · {len(out['advisory_issues'])} with advisories · "
          f"{len(out['errored'])} errored")
    for slug in out["flagged"]:
        print(f"  ⚠ BLOCKING  {slug}")
    for slug in out["errored"]:
        print(f"  ✗ ERROR     {slug}")
    for slug in out["advisory_issues"]:
        print(f"  · advisory  {slug}")
