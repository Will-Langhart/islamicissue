"""Graph Linker — proposes 'related' edge deltas from shared concepts/citations.

Deterministic (no LLM, no hangs). Reads public/graph-index.json as a READ-ONLY corpus
singleton loaded once (exactly like the citation verifier reads verses.json). Emits only
edges NOT already in the graph; human-accepted edges feed the next build-graph.mjs run,
which folds them in — so the singleton only grows toward a human-curated fixpoint and the
linker never re-proposes what already exists.

Concepts come from the last build's node metadata (refreshes on the next graph:build);
the citation signal is fresh from the feeder. Both stated compromises, not silent staleness.
"""
import json
from pathlib import Path


def _load(path, default):
    p = Path(path)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default


# Loaded ONCE at import. Reflects the last `npm run graph:build`. NEVER mutated.
_G = _load("public/graph-index.json",
           {"nodes": [], "edges": [], "conceptIndex": [], "citationIndex": []})

NODES = dict(_G["nodes"])                                              # "issue-1-1" -> node
SLUG_TO_ID = {f'{n["partSlug"]}/{n["issueSlug"]}': i                   # "islamic-dilemma/..." -> id
              for i, n in NODES.items() if n.get("type") == "issue"}
CONCEPT_INDEX = {c: set(ids) for c, ids in _G["conceptIndex"]}         # "revelation" -> {ids}
CITATION_INDEX = {r: set(ids) for r, ids in _G["citationIndex"]}       # "3:3" -> {ids}
EXISTING_EDGES = {frozenset((e["source"], e["target"])) for e in _G["edges"]}

LINK_MIN_WEIGHT = 0.2
LINK_TOP_N = 12


def propose_link(state: dict) -> dict:
    """Propose up to LINK_TOP_N new 'related' edges for one issue (deltas only)."""
    me = SLUG_TO_ID.get(state["issue_slug"])
    if me is None:                        # a new issue not in the last build:
        return {"edges": []}              # it gets linked on the pass AFTER the next graph:build

    my_concepts = set(NODES[me].get("metadata", {}).get("concepts", []))  # as-of-last-build
    my_cites = {c["ref"] for c in state.get("citations", [])}             # FRESH from content

    tally: dict[str, list[int]] = {}   # other_id -> [shared_concepts, shared_citations]
    for concept in my_concepts:
        for other in CONCEPT_INDEX.get(concept, ()):
            if other != me:
                tally.setdefault(other, [0, 0])[0] += 1
    for ref in my_cites:
        for other in CITATION_INDEX.get(ref, ()):
            if other != me:
                tally.setdefault(other, [0, 0])[1] += 1

    edges = []
    for other, (sc, cc) in tally.items():
        if frozenset((me, other)) in EXISTING_EDGES:      # propose DELTAS, never re-propose
            continue
        weight = round(min(1.0, 0.2 * sc + 0.3 * cc), 2)  # shared citations weigh more
        if weight < LINK_MIN_WEIGHT:
            continue
        edges.append({"source": me, "target": other, "type": "related", "weight": weight,
                      "targetLabel": NODES[other]["label"],
                      "reason": f"{sc} shared concept(s), {cc} shared citation(s)"})
    edges.sort(key=lambda e: e["weight"], reverse=True)
    return {"edges": edges[:LINK_TOP_N]}


def propose_all(issues_path: str = "verifier/issues.json") -> list[dict]:
    """Standalone: propose link deltas for every issue → verifier/proposed-edges.json."""
    from verifier.feeder import feed
    all_edges: list[dict] = []
    for st in feed(issues_path):
        all_edges.extend(propose_link(st)["edges"])
    Path("verifier/proposed-edges.json").write_text(
        json.dumps(all_edges, indent=2, ensure_ascii=False), encoding="utf-8")
    return all_edges


if __name__ == "__main__":
    edges = propose_all()
    print(f"Proposed {len(edges)} new edge deltas → verifier/proposed-edges.json")
    print(f"(graph baseline: {len(NODES)} nodes, {len(EXISTING_EDGES)} existing edges)\n")
    for e in sorted(edges, key=lambda x: x["weight"], reverse=True)[:12]:
        src = NODES[e["source"]]["label"]
        print(f"  {e['weight']:.2f}  {src[:38]:38} → {e['targetLabel'][:38]:38}  ({e['reason']})")
