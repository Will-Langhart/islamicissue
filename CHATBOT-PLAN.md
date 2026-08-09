# Ask-the-Compendium — Chatbot Plan

A Claude-style Q&A chatbot that lets readers ask questions about the material in
_Examining Islam from Within_ and get grounded, cited answers that argue the
site's thesis.

## Locked decisions (v1)

| Dimension | Decision |
|---|---|
| **Stance** | The bot **argues the site's thesis** (the internal critique). Confident about the arguments, scrupulously fair to a Muslim interlocutor asking in good faith, scholarly, never inflammatory. |
| **Scope** | **Refuse-and-redirect.** Questions outside the reviewed issues get a short "that's outside this compendium" plus a pointer to the closest reviewed issue(s). |
| **Sidebar** | **Conversation history** (Claude-style): list of past chats + "New chat". |
| **Persistence** | **localStorage only** — no auth, no database. |
| **Retrieval** | **Full-context + prompt caching.** The reviewed corpus (~50–90K tokens) is stuffed into the cached system prompt every call. No Pinecone, no embeddings, no vector DB. |
| **Model access** | Direct `ANTHROPIC_API_KEY` (already in `.env`), official `@anthropic-ai/sdk`, streaming. |
| **Model** | `claude-opus-5` (see cost lever below). |

## Why this shape (and not Pinecone + LangGraph)

The corpus is **55 issues / 82 graph nodes** — small, structured, and already
human-reviewed. It fits in a single context window, so:

- **No vector DB.** In-memory full-context beats a network hop for a corpus this
  size; Pinecone earns its keep at ~10⁵+ vectors, not 82.
- **No multi-agent orchestration.** Reader Q&A is `retrieve → answer-with-citations`.
  The heavy multi-agent work already lives in `verifier/` (authoring side).
- The hard problem is **citation integrity + stance**, not search. Engineering
  budget goes there.

The vector-store / agentic-research path (`vercel:ai-architect`, Pinecone,
LangGraph-style loops) is **v2/v3** — worth it only when the corpus grows to
thousands of chunks (full hadith collections, tafsir, manuscripts) or the bot
must _construct_ arguments rather than _retrieve_ them.

## Architecture

```
content/content.mjs ──┐
review-status.json ───┤ build → reviewed-only corpus string (memoized, server-only)
lib/structure.mjs ────┘                    │
                                           ▼
              app/api/chat/route.js  ──► Anthropic Messages API (streaming)
              system = [persona + corpus]  (corpus cached via cache_control)
                                           │  text stream
                                           ▼
              app/chat/page.js → components/chat/ChatApp.js
              sidebar (localStorage history) + message list + input bar
```

### Files

| File | Role |
|---|---|
| `lib/chatbot/corpus.mjs` | Builds the reviewed-only corpus string from `site` + `review-status.json`. Memoized at module load. Server-only (never shipped to the browser). |
| `lib/chatbot/prompt.mjs` | System prompt: persona (argues thesis), grounding + citation rules, refuse-and-redirect. Assembles `[persona, corpus]` system blocks with prompt caching. |
| `app/api/chat/route.js` | `POST` handler. Validates messages, streams Claude, returns a text stream. `runtime = "nodejs"`. |
| `components/chat/useConversations.js` | localStorage-backed conversation store (list, active, CRUD). |
| `components/chat/markdown.js` | Tiny, HTML-safe markdown → React renderer (paragraphs, lists, bold, code, links). No `dangerouslySetInnerHTML`. |
| `components/chat/ChatMessage.js` | One message bubble. |
| `components/chat/ChatSidebar.js` | Conversation history + "New chat". |
| `components/chat/ChatApp.js` | Client orchestrator: state, streaming fetch, layout. |
| `app/chat/page.js` | Server page hosting `ChatApp`. |

### Grounding & citation rules (the point of the whole thing)

1. Answer **only** from the corpus. If it's not there → refuse-and-redirect.
2. Every substantive claim cites its Issue as a markdown link to the issue URL.
3. Verse/hadith references are quoted **exactly as they appear in the corpus** —
   never invented.
4. Only **reviewed** issues enter the corpus (gated by `review-status.json`), so
   the bot can never cite an unreviewed draft.
5. Surface the `proof` premises when the user presses on reasoning; flag low
   confidence.

### Corpus freshness

The corpus is built from the same `content/content.mjs` that feeds the site and
the Word doc — so it is always in sync with reviewed content. For v1 it is built
in-process (memoized) with no separate build step. If corpus size or cold-start
ever matters, promote it to a `build-chatbot-corpus.mjs` step alongside
`build-graph.mjs`.

## Cost lever

`claude-opus-5` is the default. Switching `CHAT_MODEL` in `lib/chatbot/prompt.mjs`
to `claude-sonnet-5` cuts token cost ~40% with near-Opus quality on this grounded
Q&A task. Prompt caching makes the large cached corpus cheap on cache **reads**
(~0.1× input price) after the first call.

## Growth path

- **v1 (this):** full-context + graph-aware persona, streaming, localStorage history.
- **v2:** swap in a real vector store (Neon+pgvector / Pinecone) **only when corpus
  size demands it**; keep everything else.
- **v3:** agentic research loop (retrieve → cross-reference counter-hadith → pull
  steelman → synthesize) — an online port of the `verifier/` orchestration.

## Not in v1 (deliberately deferred)

- Auth / cross-device history (localStorage only).
- Server-side conversation storage / analytics.
- A second verify pass over citations (guardrail hardening) — persona-level
  grounding first; add a citation-resolver check in v1.1 if hallucinated links appear.

## Rate limiting

`app/api/chat/route.js` rate-limits per IP (12 req/min) via
`lib/chatbot/rate-limit.mjs`:

- **Durable (production):** `@upstash/ratelimit` sliding window over Upstash
  Redis — a hard global limit shared across all serverless instances. Active
  whenever `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or the
  `KV_REST_API_*` aliases) are set.
- **Fallback:** in-memory sliding window when those vars are absent (local dev /
  preview), and on any Upstash error the request degrades to it rather than failing.

To provision: Vercel project → **Storage → Marketplace → Upstash → Redis**
(auto-injects the env vars), then `vercel env pull .env` for local use.
