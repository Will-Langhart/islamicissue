"""Behavior lock for feeder.py — pure extraction, no LLM, no I/O beyond a tmp file.

Run from the repo root:  pytest verifier/test_feeder.py -v
"""
import json

import pytest

from verifier.feeder import (
    _claims_from_blocks, _dedup_and_id, feed, find_citations, sentence_spans,
    QURAN_CHAIN, QURAN_TOKEN,
)


# --- Quran parsing ---------------------------------------------------------
def test_single_quran_ref():
    hits = find_citations("The Quran denies it (Quran 4:157) plainly.")
    assert len(hits) == 1
    assert hits[0]["kind"] == "quran" and hits[0]["ref"] == "4:157"


def test_semicolon_chain_splits_into_tokens():
    hits = find_citations("Both are abrogated (Quran 2:106; 16:101).")
    assert [(h["kind"], h["ref"]) for h in hits] == [("quran", "2:106"), ("quran", "16:101")]


def test_comma_chain_splits_into_tokens():
    hits = find_citations("See Quran 10:3, 19:87, 20:109 for parallels.")
    assert [h["ref"] for h in hits] == ["10:3", "19:87", "20:109"]


@pytest.mark.parametrize("text,ref", [
    ("Quran 3:3–4", "3:3–4"),   # en-dash (what content.mjs actually uses)
    ("Quran 3:3-4", "3:3-4"),   # hyphen
    ("Quran 3:3—4", "3:3—4"),   # em-dash
])
def test_range_dashes_preserved(text, ref):
    hits = find_citations(text)
    assert len(hits) == 1 and hits[0]["kind"] == "quran" and hits[0]["ref"] == ref


def test_bare_ratio_is_not_a_citation():
    # No "Quran" prefix must not match — guards against ratios, times, score-lines.
    assert find_citations("The ratio was 3:16 and kickoff at 4:157 pm.") == []


# --- Hadith parsing --------------------------------------------------------
def test_hadith_ref_format_and_multiple_collections():
    hits = find_citations("Reported in Sahih al-Bukhari 3017 and Sahih Muslim 1676.")
    refs = {(h["kind"], h["ref"]) for h in hits}
    assert ("hadith", "Sahih al-Bukhari 3017") in refs
    assert ("hadith", "Sahih Muslim 1676") in refs


def test_hadith_number_range():
    hits = find_citations("As in Sunan Abi Dawud 4390–4391 on apostasy.")
    assert hits[0]["kind"] == "hadith" and hits[0]["ref"] == "Sunan Abi Dawud 4390–4391"


# --- Sentence-level claim attachment (prose locus) -------------------------
def test_prose_attaches_each_citation_to_its_own_sentence():
    text = ("The Quran denies the crucifixion (Quran 4:157). "
            "Yet it affirms Jesus was raised (Quran 3:55).")
    cits = list(_claims_from_blocks([{"type": "para", "text": text}]))
    assert [c["ref"] for c in cits] == ["4:157", "3:55"]
    assert "denies the crucifixion" in cits[0]["claim"] and "raised" not in cits[0]["claim"]
    assert "raised" in cits[1]["claim"]
    assert all(c["locus"] == "prose" for c in cits)


def test_abbreviation_fragment_merges_not_orphaned():
    text = "See v. 3. The forgery charge rests on this verse (Quran 2:79)."
    cits = list(_claims_from_blocks([{"type": "para", "text": text}]))
    assert len(cits) == 1
    assert "forgery charge" in cits[0]["claim"] and cits[0]["ref"] == "2:79"


# --- Quote locus -----------------------------------------------------------
def test_quote_block_claim_is_the_quotation_itself():
    blocks = [{"type": "quote",
               "q": "He revealed the Torah and the Gospel.",
               "ref": "Quran 3:3–4"}]
    cits = list(_claims_from_blocks(blocks))
    assert len(cits) == 1
    c = cits[0]
    assert c["locus"] == "quote"
    assert c["kind"] == "quran" and c["ref"] == "3:3–4"
    assert c["claim"] == "He revealed the Torah and the Gospel."  # NOT surrounding prose


def test_quote_block_missing_ref_yields_nothing():
    assert list(_claims_from_blocks([{"type": "quote", "q": "text", "ref": ""}])) == []


# --- Bullets ---------------------------------------------------------------
def test_bullet_items_are_independent_claims():
    blocks = [{"type": "bullet", "items": [
        "The scribes wrote it themselves (Quran 2:79).",
        "None can change His words (Quran 18:27)."]}]
    cits = list(_claims_from_blocks(blocks))
    assert [c["ref"] for c in cits] == ["2:79", "18:27"]
    assert cits[0]["claim"] == "The scribes wrote it themselves (Quran 2:79)."
    assert cits[1]["claim"] == "None can change His words (Quran 18:27)."


# --- No-citation inputs ----------------------------------------------------
def test_text_without_citations_is_empty():
    assert list(_claims_from_blocks([{"type": "para", "text": "An internal critique only."}])) == []
    assert find_citations("No references here at all.") == []


# --- id assignment + dedup -------------------------------------------------
def test_dedup_collapses_identical_ref_and_claim():
    cits = [
        {"id": "", "ref": "4:157", "kind": "quran", "claim": "A", "locus": "prose"},
        {"id": "", "ref": "4:157", "kind": "quran", "claim": "A", "locus": "prose"},  # dup
    ]
    out = _dedup_and_id(cits)
    assert len(out) == 1 and out[0]["id"] == "4:157::prose::0"


def test_same_ref_different_claim_kept_with_distinct_ids():
    cits = [
        {"id": "", "ref": "4:157", "kind": "quran", "claim": "prose sentence", "locus": "prose"},
        {"id": "", "ref": "4:157", "kind": "quran", "claim": "the quotation", "locus": "quote"},
    ]
    out = _dedup_and_id(cits)
    assert [c["id"] for c in out] == ["4:157::prose::0", "4:157::quote::1"]


# --- Sentence splitter sanity ---------------------------------------------
def test_sentence_spans_cover_text_without_gaps():
    text = "A first sentence here now. A second one follows on. A third and last."
    spans = sentence_spans(text)
    assert spans[0][0] == 0 and spans[-1][1] == len(text)
    assert all(spans[i][1] == spans[i + 1][0] for i in range(len(spans) - 1))  # contiguous


# --- feed() integration ----------------------------------------------------
def test_feed_yields_ready_verifier_state(tmp_path):
    issues = [{"slug": "islamic-dilemma/the-dilemma-stated", "title": "The Dilemma Stated",
               "contentHash": "deadbeef",
               "blocks": {
                   "critique": [{"type": "para", "text": "Critique cites Quran 2:79 openly."}],
                   "response": [{"type": "para", "text": "The response leans on Quran 3:3 here."}],
                   "rebuttal": [{"type": "quote", "q": "None can alter His words.", "ref": "Quran 6:115"}],
               }}]
    p = tmp_path / "issues.json"
    p.write_text(json.dumps(issues), encoding="utf-8")

    states = list(feed(str(p)))
    assert len(states) == 1
    s = states[0]
    assert s["issue_slug"] == "islamic-dilemma/the-dilemma-stated"
    assert s["issue_title"] == "The Dilemma Stated"
    assert s["content_hash"] == "deadbeef"
    assert s["existence"] == {} and s["verdicts"] == [] and s["warnings"] == []
    assert sorted(c["ref"] for c in s["citations"]) == ["2:79", "3:3", "6:115"]
    loci = {c["ref"]: c["locus"] for c in s["citations"]}
    assert loci["6:115"] == "quote"
    assert all(c["id"] for c in s["citations"])  # every citation got an id


# --- Corpus-wide completeness (integration; needs the exported issues.json) ---
def test_feeder_misses_no_quran_citation_corpus_wide():
    """Every Quran token anywhere in an issue's blocks is captured by the feeder.

    The verifier's credibility depends on never silently dropping a citation.
    (The graph's higher citationCount is scholar refs, which are out of scope.)
    """
    import os
    path = "verifier/issues.json"
    if not os.path.exists(path):
        pytest.skip("run `node scripts/export-claims.mjs` first")
    issues = json.loads(open(path, encoding="utf-8").read())
    for iss in issues:
        blob = json.dumps(iss["blocks"], ensure_ascii=False)
        blob_tokens = [t.group(0) for m in QURAN_CHAIN.finditer(blob)
                       for t in QURAN_TOKEN.finditer(m.group(0))]
        feeder_tokens = []
        for f in ("critique", "response", "rebuttal"):
            for b in iss["blocks"][f]:
                txt = (b["text"] if b["type"] == "para"
                       else b.get("ref", "") if b["type"] == "quote"
                       else " ".join(b["items"]))
                feeder_tokens += [h["ref"] for h in find_citations(txt) if h["kind"] == "quran"]
        for tok in set(blob_tokens):
            assert blob_tokens.count(tok) <= feeder_tokens.count(tok), \
                f"{iss['slug']} drops Quran {tok}"
