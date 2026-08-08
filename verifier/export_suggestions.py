"""Render steelman-suggestions.json into a human-readable review document.

The drafts are AI proposals for the editorial board — NOT merged into content.mjs.
Every scholarly attribution and citation must be verified before use. Output ordered
by the site's natural issue order for navigable review.

  python -m verifier.export_suggestions   ->   verifier/steelman-review.md
"""
import json
from collections import Counter
from datetime import date
from pathlib import Path


def export(sugg_path="verifier/steelman-suggestions.json",
           issues_path="verifier/issues.json",
           out_path="verifier/steelman-review.md") -> int:
    sugg = json.loads(Path(sugg_path).read_text(encoding="utf-8"))
    issues = json.loads(Path(issues_path).read_text(encoding="utf-8"))
    order = [i["slug"] for i in issues]
    titles = {i["slug"]: i["title"] for i in issues}
    dist = Counter(v["verdict"] for v in sugg.values())

    L = [
        "# Steelman Review — Strengthened Muslim Responses",
        "",
        f"_Generated {date.today().isoformat()} · {len(sugg)} AI-drafted proposals._",
        "",
        "> **These are AI proposals, NOT merged into `content.mjs`.** Every scholarly attribution and "
        "citation must be verified before use. Verdicts and drafts are generative and may vary run-to-run.",
        "",
        "**Summary:** " + ", ".join(f"{k} {n}" for k, n in dist.items()) + f"  (total {len(sugg)})",
        "",
        "---",
    ]
    for slug in order:
        v = sugg.get(slug)
        if not v:
            continue
        s = v["suggestion"]
        L += ["", f"## {titles.get(slug, slug)}",
              f"`{slug}` · verdict: **{v['verdict']}** (confidence {v['confidence']:.2f})", "",
              f"**Assessment.** {v['assessment_reason']}", ""]
        if v.get("missing_responses"):
            L.append("**Missing / under-developed replies:**")
            L += [f"- {m}" for m in v["missing_responses"]]
            L.append("")
        L += ["### Proposed strengthened response", ""]
        for i, p in enumerate(s["strengthened_response"], 1):
            L += [f"> **({i})** {p}", ">"]
        L.append("")
        if s.get("positions_covered"):
            L.append("**Positions covered:**")
            L += [f"- {p}" for p in s["positions_covered"]]
            L.append("")
        L += [f"**⚠ Verify before use.** {s['note_to_editor']}", "", "---"]

    Path(out_path).write_text("\n".join(L) + "\n", encoding="utf-8")
    return len(sugg)


if __name__ == "__main__":
    n = export()
    print(f"Wrote verifier/steelman-review.md ({n} drafts)")
