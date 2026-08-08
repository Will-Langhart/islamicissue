# Editorial AI Layer — Build Plan

A human-gated, multi-agent editorial pipeline (LangGraph) over this repo's real
artifacts. It **assists** the editorial board; it never publishes on its own.

## Non-negotiable invariants

1. **The AI never self-approves.** A `citation`/`proof` dimension only reaches
   `status: "reviewed"` via a *named human* at an interrupt (or a `--bless` backed
   by a clean deterministic run). A clean AI pass never sets `reviewed` by itself.
2. **Suggestions never auto-write `content.mjs`.** Generative nodes (steelman,
   rebuttal) emit proposals a human merges by hand.
3. **Grounding over recall.** The citation verifier judges against
   `content/verses.json`, never free-recalled scripture. Only the deterministic
   verifier is `--bless`-eligible; generative verdicts always pass through a human.
4. **`content.mjs` stays the single source of truth.** Everything derives from it;
   nothing in the pipeline edits it.

## Architecture (one issue-scoped spine, reused by every node)

```
export-claims.mjs → issues.json → feeder → [propose_* nodes] → consolidated gate → writer
                                                                                      ↓
        review-status.json (both dimensions) · steelman-suggestions.json · proposed-edges.json · verification-log.json
```

- **Feeder** (deterministic): parses citations from content, attaches a *claim*
  to each (quote text, or the containing sentence), assigns stable ids.
- **Citation Verifier** (deterministic + grounded on `verses.json`): existence
  gate → grounded support/fidelity check → flags → human interrupt. Governs the
  `citation` dimension.
- **Steelman + Rebuttal** (generative): audit response strength, draft stronger
  replies / counter-rebuttals. Governs the `proof` dimension.
- **Graph Linker** (deterministic, corpus singleton on `graph-index.json`):
  proposes `related` edge deltas from shared concepts/citations.
- **Orchestrator**: `plan` (incremental via content hash) → parallel `propose_*`
  via `Send` → one consolidated human gate → `writer`.

## Phases

### Phase 0 — Foundations (no API cost, no key) — ✅ DONE (2026-08-07)
- [x] `verifier/PLAN.md` (this file)
- [x] `scripts/export-claims.mjs` — flatten `content.mjs` → `verifier/issues.json`
      (reuses `lib/structure.mjs` slugs; stamps a per-issue `contentHash`). 55 issues.
- [x] `verifier/feeder.py` — citation parsing + claim attachment + id/dedup
- [x] `verifier/test_feeder.py` — 20 tests, all green
- [x] Green: `pytest verifier/test_feeder.py` → 20 passed

**Validation finding.** The feeder's per-issue citation count is lower than the
graph's `citationCount` because `build-graph.mjs:298` counts quran + hadith +
**scholar** refs, while the feeder extracts only quran + hadith. Proven corpus-wide
(`test_feeder_misses_no_quran_citation_corpus_wide`): **0/55 issues drop any Quran
citation.** The gap is entirely scholar refs — unverifiable against any corpus, so
correctly out of the verifier's scope.

**Deferred scoping decisions (not blockers):**
- Scholar citations: the verifier can't ground them; a future node could at least
  check name consistency. Out of scope for Phase 1.
- The `proof` field (only 3/55 items have one) is not exported/scanned. Its
  premise citations could be verified later; deferred.

### Phase 1 — Citation Verifier vertical slice — ✅ DONE (2026-08-07)
- [x] `verifier/citation_verifier.py` — existence gate, grounded support/fidelity
      check (range-aware, translation-hardened), human interrupt. Model `claude-sonnet-5`.
- [x] Validated on 3 real issues + adversarial test:
      - Real content: all `supported`; `5:68` correctly `variant_translation`.
      - Adversarial: reversed 4:157 → `misattributed/distorted` (conf 0.99); `2:999`
        → `not_found`; hadith → `unverifiable`.
      - **Fix:** `verses.json` is a PARTIAL corpus, so existence requires the *anchor*
        ayah of a range, not all → 0 false `not_found` across all 111 cited refs.
- [x] Refactor: `issueReviewStatus` → `content/review-status.json`; `review-workflow.mjs`
      reads it via fs (works under Next bundler + raw node). Build chain verified.
- [x] `verifier/resume.py` — scan (unattended) + review (interactive) modes; attests every issue
- [x] `scripts/apply-review.mjs` — merge (both dimensions) + `--bless`/`--bless-all`
- [x] Full-corpus run: 55 issues → **49 clean, 6 flagged**. Blessed 46 clean.
- [x] `reviewCoverage.citation`: **3 → 49 reviewed**, 6 unreviewed (the flagged).

**Full-run findings — the 6 flags are verifier-tuning signal, NOT content errors:**
1. Feeder prose claim-attachment is coarse for sentences citing multiple refs or
   mixing verse+hadith+exegesis (e.g. `46:9`, `4:3`): the wrong claim-slice is bound
   to a ref, so the verse doesn't support it. → Phase 1.5.
2. The model overloads `not_found` to mean "verse doesn't substantiate the claim"
   (intended: ref doesn't resolve). Add a distinct `unsupported` status. → Phase 1.5.
3. Confidence near the 0.6 flag threshold is non-deterministic (`women-in-the-quran`
   flipped clean on re-run). Consider a lower/steadier threshold. → Phase 1.5.

Flagged (left `unreviewed` for human review): stars-as-missiles, salvation-without-
atonement, women-in-the-quran, slavery-and-concubinage, temporary-marriage-mutah,
the-consensus-trap.

### Phase 1.5 — Verifier tuning — ✅ DONE (2026-08-07)
- [x] Split `not_found` (deterministic; ref doesn't resolve) from `unsupported`
      (LLM; verse doesn't back the claim). Model never emits `not_found`.
- [x] Feeder attaches `co_refs` (sibling refs co-cited in the same sentence); prompt
      judges CONTRIBUTION/RELEVANCE, not sole-proof, and understands criterion/premise
      citations ("by the Qur'an's own test in X, it fails").
- [x] Flag threshold is now STATUS-only (deterministic) — dropped the `confidence < 0.6`
      trigger that caused flaky flips.
- [x] Regression confirmed intact: reversed 4:157 → `misattributed` (0.97); irrelevant
      1:4 prose → `unsupported` (0.98); legitimate 2:79 prose → `supported` (0.97).

**Key finding — the verifier has TWO reliability tiers:**
- **Authoritative & stable:** quote-locus FIDELITY (misquotes) + existence (`not_found`).
  Deterministic, high-precision. **Across every run, the real corpus has ZERO misquotes
  and ZERO invalid refs** — the content is clean on these.
- **Advisory & variable:** prose-locus RELEVANCE (`unsupported`). Inherently fuzzy LLM
  judgment on "is this verse relevant enough to this argumentative claim"; the flagged
  set shifts run-to-run (e.g. `how-many-days`, `4:3` flip). Not fully fixable by prompting.

Persistent advisory items worth a human glance: `salvation.../46:9` (a feeder claim-
slicing artifact — a compound sentence split 46:9 from its own clause); `pagan-
continuity/2:158` (a legitimate interpretive dispute; arguably `unverifiable`).

### Phase 1.6 — PROPOSED (decision needed): tier the flags
Make quote/existence flags **blocking** (gate `reviewed`); make prose-relevance
`unsupported` **advisory** (surface as an info note, do NOT block a bless). This makes
`--bless` robust against prose variance and keeps flags meaningful. Alternative: keep
prose blocking and let a human clear the handful each run.
Also optional: clause-level claim slicing to fix the `46:9`-type compound-sentence artifact.

### Phase 2 — Steelman + Rebuttal (generative, `proof` dimension) — IN PROGRESS
- [x] `verifier/steelman.py` — assess → draft (charity-biased, named sources), gate,
      `assess_landscape()` (assess-only corpus map). Model `claude-sonnet-5` (opus-5 upgradable).
- [x] Validated on 3 issues (2026-08-07): trinity (drafted 5-para response: Griffith,
      Reynolds, Ibn Taymiyyah), slavery → `adequate` (missing maqasid/siyar/2014 letter),
      dilemma-stated → `strawman` (tahrif al-ma'na smuggled into the rebuttal — real finding).
      Guardrails held: named sources, no invented refs, self-flagged "PLEASE VERIFY".
- [x] Assess-only landscape scan (55 issues, incremental + resumable + hard 150s
      SIGALRM timeout). Distribution: adequate 26, missing 16, strawman 12, error 1,
      **strong 0** (every response section has room to strengthen). Flagship issue
      `what-the-quran-says.../torah-and-the-gospel` had an EMPTY response section.
- [x] `draft_for_issues` / `draft-weak` — drafts strawman+missing into
      `steelman-suggestions.json` (proposals; never `content.mjs`). Incremental,
      resumable (skip-if-drafted), hard-timeout. First pass: **16/28 drafted, 12
      errored** (socket-wedge hangs on long draft calls; retryable).
- [ ] Retry the 12 draft stragglers + 1 assess error (resumable — skip logic added)
- [ ] `propose_rebut` — counter-rebuttal draft conditioned on steelman
- [ ] Proof-review loop (keep/adopt/revise/defer); only `keep` reaches proof:reviewed;
      no bless for generative verdicts

**Infra note:** the Anthropic connection wedges intermittently (SDK read-timeout does
not fire; ~40% of long draft calls hung). Mitigated by a SIGALRM hard cap + incremental
resumable writes, so runs never hang or lose work — but drafting needs a few retry passes.

### Phase 3 — Graph Linker + Orchestrator
- [ ] `verifier/linker.py` — `graph-index.json` corpus singleton, edge deltas
- [ ] `verifier/orchestrator.py` — `plan` (content-hash incremental), `Send`
      fan-out + join, consolidated `editorial_gate`, `writer`
- [ ] `build-graph.mjs` folds accepted edges from `proposed-edges.json`

### Phase 4 — Human surface + ops
- [ ] `verifier/review_cli.py` — consolidated one-prompt reviewer
- [ ] Dry-run mode + `SqliteSaver` (compute once, review later, no recompute)
- [ ] `npm` targets: `ai:export`, `ai:dryrun`, `ai:review`, `ai:apply`

## Dependencies (installed into existing `.venv`)
- Phase 0: `pytest` only (feeder is stdlib)
- Phase 1+: `langgraph`, `langchain-anthropic`, `pydantic`
- Phase 4: `langgraph-checkpoint-sqlite`

## Run order (once built)
```
node scripts/export-claims.mjs      # content.mjs → issues.json (hashed)
python -m verifier.orchestrator dry-run   # unattended: compute proposals, render workload.md
#   ...read verifier/editorial-workload.md...
python -m verifier.orchestrator review    # sit down once, decide via consolidated gate
node scripts/apply-review.mjs verifier/review-decisions.json
npm run graph:build && npm run content:release-check
```

## Status
Phase 0 in progress. Nothing in Phases 1–4 built yet. LangGraph `Send`-join and
`SqliteSaver` resume are version-sensitive — verify against the installed version
when Phase 3/4 land.
