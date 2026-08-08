# Editorial AI layer

A human-gated, multi-agent LangGraph pipeline that helps the editorial board review the
compendium. It **assists**; it never publishes on its own. See [PLAN.md](PLAN.md) for the
full build history.

## Invariants (non-negotiable)

1. **The AI never self-approves.** A `citation`/`proof` dimension reaches `reviewed` only
   via a named human (or a `--bless` backed by a clean deterministic run). `apply-review.mjs`
   refuses to write `reviewed` without a reviewer, and refuses to downgrade an existing one.
2. **Suggestions never auto-write `content.mjs`.** Generative nodes emit proposals a human
   verifies and pastes.
3. **Grounding over recall.** The citation verifier judges against `content/verses.json`,
   never free-recalled scripture.
4. **`content.mjs` stays the single source of truth.**

## The agents

| Node | Kind | Governs | Grounding |
|---|---|---|---|
| **citation verifier** (`citation_verifier.py`) | deterministic + LLM | `citation` | `verses.json` |
| **steelman + rebuttal** (`steelman.py`) | generative | `proof` | none (named sources, human-verified) |
| **graph linker** (`linker.py`) | deterministic | graph edges | `graph-index.json` |

Two flag tiers: **blocking** (quote misquote / invalid ref — gates review) vs **advisory**
(prose relevance — surfaced, non-blocking). Standalone results so far: **55/55 citation-reviewed**,
**29 steelman drafts**.

## The orchestrator (`orchestrator.py`)

One graph runs the agents per issue with a single consolidated human gate:

```
START → plan ─┬→ verify ───────────┐
              ├→ steelman → rebut ──┤→ editorial_gate → writer → END
              └→ link ──────────────┘
```

- `plan` is **incremental**: reads `review-status.json` + `verification-log.json` + content
  hash, dispatches only stale dimensions. A reviewed+unchanged issue costs ~0 (no LLM).
- `editorial_gate` is **one** interrupt bundling citation flags + proof assessment + drafted
  response/rebuttal + edges; `writer` fans the one decision back to both dimensions.
- Hang-proof (SIGALRM cap on node LLM calls) + per-issue error-isolated + resumable.

## Run it (`npm run …`)

```bash
npm run ai:export        # content.mjs → verifier/issues.json (hashed)
npm run ai:verify        # citation verifier scan (unattended) → verification-log.json
npm run ai:steelman      # proof-dimension landscape (assess-only)
npm run ai:orchestrate   # full orchestrator scan (unattended; lists issues needing review)
npm run ai:review        # orchestrator with the consolidated human gate (interactive)
npm run ai:proof         # review steelman drafts (keep/adopt/revise/defer)
npm run ai:patches       # emit content-patches.md (ready-to-paste response blocks)
npm run ai:apply         # merge decisions → review-status.json + rebuild
```

Python entrypoints (`.venv/bin/python -m verifier.<mod>`): `feeder`, `resume [scan|review]`,
`steelman [draft-weak]`, `orchestrator [review] [N]`, `review_proof [patches]`,
`export_suggestions`, `linker`. Tests: `pytest verifier/test_feeder.py`.

## Artifacts

Source (tracked): the `.py`/`.mjs` above, `content/review-status.json`, `steelman-review.md`,
`content-patches.md`, `steelman-triage.md`. Generated (gitignored `verifier/*.json`):
`issues.json`, `verification-log.json`, `steelman-suggestions.json`, `steelman-decisions.json`,
`proposed-edges.json`, `orchestrator-log.json`.

## Known limitations

- **Connection hangs** — the Anthropic connection wedges intermittently (~40% of long draft
  calls); the SDK read-timeout doesn't fire. Mitigated by a SIGALRM hard cap + incremental
  resumable writes, so runs never hang or lose work — but drafting needs a few retry passes.
- **Prose-relevance is advisory** — fuzzy and run-to-run variable; only quote/existence flags
  gate review.
- **Deterministic linker is redundant** with `build-graph.mjs` (0 deltas); a semantic (LLM)
  linker is the version worth building, deferred.
- **Any content module reached from `structure.mjs` must not use `fs`** — it's bundled into
  client components. Use JSON imports; verify with a full `npm run build`, not just `node`.
