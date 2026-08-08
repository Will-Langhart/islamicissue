"""Human-gated apply flow for steelman drafts (proof dimension).

The drafts are AI proposals with UNVERIFIED scholarly attributions — each self-flags what
to check. This tool NEVER writes content.mjs and NEVER flips proof:reviewed on its own.

Two modes:
  python -m verifier.review_proof patches   # PREVIEW: emit ready-to-paste content patches
                                            # + verify checklists for ALL drafts (no decisions)
  python -m verifier.review_proof           # INTERACTIVE: walk each draft, record your
                                            # keep/adopt/revise/defer → steelman-decisions.json

Then apply:
  node scripts/apply-review.mjs verifier/steelman-decisions.json   # merge proof status
  (paste verified 'adopt' snippets from content-patches.md into content/content.mjs)
  npm run graph:build && npm run content:release-check
"""
import json
from datetime import date
from pathlib import Path


def js_response(paragraphs: list[str]) -> str:
    """Render paragraphs as a content.mjs `response: [...]` block (json.dumps → valid JS strings)."""
    inner = ",\n        ".join(json.dumps(p, ensure_ascii=False) for p in paragraphs)
    return "      response: [\n        " + inner + ",\n      ],"


def write_patches(slugs, sugg, out_path="verifier/content-patches.md"):
    L = ["# Content patches — steelman 'adopt' proposals", "",
         "> **Verify every attribution before pasting.** These are AI drafts. For each issue:",
         "> (1) check the ⚠ verify list, (2) confirm the named sources/citations, (3) paste the",
         "> `response:` block into the matching item in `content/content.mjs`, (4) run",
         "> `node scripts/apply-review.mjs verifier/steelman-decisions.json` then `npm run graph:build`.", ""]
    for slug in slugs:
        v = sugg.get(slug)
        if not v:
            continue
        s = v["suggestion"]
        L += ["", "---", "", f"## {slug}", f"verdict: **{v['verdict']}** (conf {v['confidence']:.2f})", "",
              f"**⚠ Verify first.** {s['note_to_editor']}", "",
              "**Positions covered:** " + "; ".join(s.get("positions_covered", [])), "",
              "**Paste into `content/content.mjs` as this item's `response`:**", "",
              "```js", js_response(s["strengthened_response"]), "```"]
    Path(out_path).write_text("\n".join(L) + "\n", encoding="utf-8")
    return len([s for s in slugs if s in sugg])


def cli():
    sugg = json.loads(Path("verifier/steelman-suggestions.json").read_text(encoding="utf-8"))
    dec_path = Path("verifier/steelman-decisions.json")
    decisions = json.loads(dec_path.read_text(encoding="utf-8")) if dec_path.exists() else {}
    today = date.today().isoformat()

    reviewer = ""
    while not reviewer:
        reviewer = input("Reviewer name (required): ").strip()

    todo = [s for s in sugg if s not in decisions]      # resume: skip already-decided
    print(f"{len(todo)} drafts to review ({len(decisions)} already done).\n")
    for slug in todo:
        v = sugg[slug]
        s = v["suggestion"]
        print("=" * 90)
        print(f"{slug}   verdict={v['verdict']} (conf {v['confidence']:.2f})")
        print("-" * 90)
        print(v["assessment_reason"][:400])
        print(f"\n⚠ verify: {s['note_to_editor'][:400]}")
        print(f"\nproposed: {len(s['strengthened_response'])} paragraph(s); "
              f"positions: {len(s.get('positions_covered', []))}")
        choice = ""
        while choice not in ("keep", "adopt", "revise", "defer", "quit"):
            choice = input("  keep / adopt / revise / defer / quit: ").strip().lower()
        if choice == "quit":
            break
        notes = input("  notes: ").strip()
        status = "reviewed" if choice == "keep" else "in_review"
        decisions[slug] = {"proof": {"status": status, "reviewer": reviewer, "reviewedAt": today,
                                     "notes": f"Steelman {v['verdict']} → {choice}. {notes}".strip()},
                           "_action": choice, "_notes": notes}
        dec_path.write_text(json.dumps(decisions, indent=2, ensure_ascii=False), encoding="utf-8")  # incremental

    adopts = [s for s, d in decisions.items() if d.get("_action") in ("adopt", "revise")]
    if adopts:
        n = write_patches(adopts, sugg)
        print(f"\nWrote {n} content patch(es) → verifier/content-patches.md")
    print(f"Recorded {len(decisions)} decision(s) → verifier/steelman-decisions.json")


if __name__ == "__main__":
    import sys
    sugg = json.loads(Path("verifier/steelman-suggestions.json").read_text(encoding="utf-8"))
    if len(sys.argv) > 1 and sys.argv[1] == "patches":
        n = write_patches(list(sugg), sugg)   # preview: all drafts, no decisions needed
        print(f"Wrote {n} content patches (preview, all drafts) → verifier/content-patches.md")
    else:
        cli()
