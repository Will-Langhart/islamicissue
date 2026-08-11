# Accounts & Auth — Design Spec

Add optional user accounts (Google + Microsoft sign-in via Supabase) to
_Examining Islam from Within_, unlocking cross-device chat history,
personalization, attributed contributions, and role-gated editorial tooling —
**without** breaking the anonymous, static-first reading experience.

This is the natural follow-up to [`CHATBOT-PLAN.md`](CHATBOT-PLAN.md), which
deliberately deferred "Auth / cross-device history" to a later milestone.

---

## Goal

> A returning reader signs in with Google or Microsoft and finds their chats,
> bookmarks, and reading progress waiting on any device. A contributor submits a
> correction that carries their identity into a moderation queue. An editor —
> and only an editor — sees that queue. Everyone else keeps using the site
> exactly as they do today, signed in or not.

## Locked decisions (v1)

| Dimension | Decision | Source |
|---|---|---|
| **Provider** | **Supabase** — auth *and* Postgres, one vendor. | chosen |
| **Identity providers** | **Google** + **Microsoft** (Supabase "Azure" / Entra ID) OAuth **and** email + password. No magic links in v1. | chosen |
| **Access model** | **Optional / progressive.** The whole site + chatbot stay fully usable anonymously. Sign-in only *adds* capability; it never gates reading or asking. | chosen |
| **Session transport** | **Cookie-based** via `@supabase/ssr` (not the legacy localStorage-JWT flow). Required for App Router server components + route handlers. | required by stack |
| **Data store** | **Supabase Postgres**, every user-writable table protected by **Row-Level Security** keyed on `auth.uid()`. | chosen |
| **Anonymous → signed-in** | **One-time, non-destructive merge.** On first sign-in, the local `eiw-chat-conversations-v1` blob is pushed to the account; Postgres then becomes the source of truth. Signing in never loses local data. | design |
| **Microsoft tenancy** | **Multi-tenant + personal accounts** (permissive). Covers consumer Outlook *and* any org. Tenant restriction / institutional verification deferred until a real use case appears. | see Open Questions |
| **Feature scope** | Four families, phased: **(1)** chat sync + per-user limits, **(2)** personalization, **(3)** contributions/moderation, **(4)** editor/admin gating. | chosen |

## Non-goals (v1)

- **No login wall.** Anonymous reading and anonymous chat remain first-class.
- **No magic-link auth.** Email+password and OAuth only; revisit magic links later.
- **No move of the AI proof pipeline into the browser.** The `verifier/` Python
  orchestration and `scripts/apply-review.mjs` stay a local/CI workflow. Editor
  gating in v1 governs a **web view of user submissions**, not the proof engine
  (see [Reality check](#reality-check-what-editor-gating-does-and-doesnt-mean)).
- **No comments / public discussion threads.** Out of scope for this milestone.
- **No self-serve role elevation.** Every new account is a `reader`; higher roles
  are granted manually.

---

## Architecture

```
                         Supabase project
                 ┌──────────────────────────────────┐
   Google  ───►  │  auth.users   (OAuth identities)  │
   Microsoft ─►  │  public.*     (RLS-protected data)│
                 └──────────────────────────────────┘
                      ▲                     ▲
      cookie session  │                     │  server (service role)
                      │                     │
  browser client ─────┤                     ├───── server client
  (@supabase/ssr)     │                     │      (@supabase/ssr)
        │             │                     │
        ▼             ▼                     ▼
  Sign-in button   middleware.js       app/api/* route handlers
  (Header)         (refresh session)   + server components
                      │
                      ▼
              app/auth/callback/route.js   (OAuth code exchange)
```

### OAuth flow (both providers, identical shape)

1. User clicks **Sign in → Google / Microsoft** in the header.
2. Browser client calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: <origin>/auth/callback } })`.
3. Provider authenticates → redirects to Supabase's callback
   (`https://<project>.supabase.co/auth/v1/callback`) → Supabase redirects back
   to **our** `/auth/callback?code=…`.
4. `app/auth/callback/route.js` calls `exchangeCodeForSession(code)`, sets the
   session cookie, redirects to the page the user came from.
5. `middleware.js` refreshes that cookie on every subsequent request so server
   components and route handlers see a live session.

### New files

| File | Role |
|---|---|
| `lib/supabase/client.js` | Browser Supabase client (`createBrowserClient` from `@supabase/ssr`). Uses `NEXT_PUBLIC_*` keys only. |
| `lib/supabase/server.js` | Server Supabase client (`createServerClient`) wired to Next's `cookies()`. Used in server components + route handlers. |
| `lib/supabase/middleware.js` | Shared session-refresh helper. |
| `middleware.js` (root) | Next middleware calling the refresh helper. **This repo has none today** — it is new. |
| `app/auth/callback/route.js` | OAuth code-exchange endpoint. |
| `app/auth/signout/route.js` | `POST` sign-out (clears cookie, redirects). |
| `components/auth/AuthButton.js` | Header entry point: "Sign in" (menu: Google / Microsoft) when logged out; avatar + menu when logged in. Client component. |
| `components/auth/UserMenu.js` | Signed-in dropdown: account, sign out, links to bookmarks/history. |
| `lib/supabase/profile.js` | Helpers: `getSessionUser()`, `getProfile()`, `requireRole(role)`. |
| `supabase/migrations/*.sql` | Schema + RLS policies (see [Data model](#data-model)). Version-controlled. |

### Touched existing files

| File | Change |
|---|---|
| [`app/layout.js`](app/layout.js) | No structural change; `Header` gains the auth button. Layout stays a server component. |
| [`components/Header.js`](components/Header.js) | Add `<AuthButton />` to the nav (right of `SearchDialog`). |
| [`app/api/chat/route.js`](app/api/chat/route.js) | Read the session server-side; rate-limit by `user_id` (higher quota) when signed in, else keep IP limit. |
| [`components/chat/useConversations.js`](components/chat/useConversations.js) | Becomes an adapter: anonymous → localStorage (unchanged); authed → Supabase. Component API preserved so [`ChatApp.js`](components/chat/ChatApp.js) is nearly untouched. |
| [`app/corrections/page.js`](app/corrections/page.js) | Replace the "a public contact channel should be connected here before launch" placeholder with a real (auth-gated-optional) submission form. |

---

## Provider setup (dashboard, not code)

### Google
1. Google Cloud Console → OAuth consent screen (External) → publish.
2. Create **Web application** OAuth client.
3. Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`.
4. Paste client ID + secret into Supabase → Auth → Providers → **Google**.

### Microsoft (Supabase "Azure" provider = Entra ID)
1. Microsoft Entra ID → App registrations → New registration.
2. **Supported account types: "Accounts in any organizational directory and
   personal Microsoft accounts"** (multi-tenant + consumer — the permissive
   default we locked).
3. Redirect URI (Web): `https://<project>.supabase.co/auth/v1/callback`.
4. Create a client secret.
5. Supabase → Auth → Providers → **Azure**: client ID, secret, and the
   Azure tenant URL (use `common` for multi-tenant).

### Environment variables

| Var | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Publishable anon key. RLS is what makes this safe to expose. |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Bypasses RLS. **Never** prefix with `NEXT_PUBLIC_`. Used only in trusted server code (e.g. admin/moderation reads). |

Provision on Vercel via `vercel env add`, then `vercel env pull .env` for local
dev — the same pattern the Upstash integration already uses in
[`rate-limit.mjs`](lib/chatbot/rate-limit.mjs).

---

## Data model

All tables in `public`, all with RLS enabled. `user_id` columns reference
`auth.users(id)`.

```sql
-- Identity + role (1:1 with auth.users; created by trigger on signup)
profiles      (id PK/FK→auth.users, display_name, avatar_url,
               role text default 'reader'    -- reader|contributor|editor|admin
               created_at)

-- Chat sync (Phase 2)
conversations (id PK, user_id FK, title, created_at, updated_at)
messages      (id PK, conversation_id FK, role, content, created_at)

-- Personalization (Phase 3)
bookmarks     (user_id FK, issue_id text, created_at,  PK(user_id, issue_id))
progress      (user_id FK, issue_id text, status, updated_at, PK(user_id, issue_id))
annotations   (id PK, user_id FK, issue_id text, anchor text, note text, created_at)

-- Contributions (Phase 4)
submissions   (id PK, user_id FK nullable, issue_id text, kind text,
               body text, status text default 'new',   -- new|triaged|accepted|declined
               created_at, reviewed_by FK nullable, reviewed_at)
```

`issue_id` is the existing `"<partSlug>/<issueSlug>"` key already used as the
map key in [`content/review-status.json`](content/review-status.json) — reuse it
verbatim so app content and user data share one addressing scheme.

### RLS policy shape

- **Owner-scoped tables** (`conversations`, `messages`, `bookmarks`, `progress`,
  `annotations`): `USING (auth.uid() = user_id)` for select/insert/update/delete.
  A user sees and mutates only their own rows. This is the entire authorization
  model — no per-route checks needed.
- **`submissions`**: insert allowed for any authenticated user (and optionally
  anonymous via a service-role route); select/update of *others'* rows requires
  `role in ('editor','admin')`, enforced by a policy that joins `profiles`.
- **`profiles`**: a user may read/update their own row **except** `role`
  (protect `role` with a column policy / trigger so self-elevation is impossible).

### New-user bootstrap

A Postgres trigger on `auth.users` insert creates the matching `profiles` row
with `role='reader'`. Role promotion is a manual `update profiles set role=…`
(SQL editor) or a tiny admin action — never self-serve.

---

## Progressive identity — the merge

Because sign-in is optional, every feature degrades to anonymous:

| State | Chat history | Bookmarks / progress |
|---|---|---|
| Anonymous | localStorage (today's behavior, unchanged) | not available (or localStorage-only) |
| Signed in | Supabase, synced across devices | Supabase, synced |

**On first sign-in**, `useConversations` (or a small `mergeLocalData()` helper)
detects a non-empty `eiw-chat-conversations-v1`, uploads those conversations to
the account (idempotently — tag merged blobs so a second device doesn't
double-import), and then switches its source of truth to Postgres. The local
blob is left intact as a backup but no longer read. **No data is lost by signing
in**, which is the whole point of a progressive model.

---

## Per-user rate limiting

[`rate-limit.mjs`](lib/chatbot/rate-limit.mjs) already keys on an opaque string
via `clientIp(req)`. Generalize it:

- Signed in → key on `user:<uid>`, higher ceiling (e.g. 40/min).
- Anonymous → key on IP, keep today's 12/min.

This is a small change in [`route.js`](app/api/chat/route.js:38) (read session,
pick the key + limit) plus an optional second limiter config. It gives anonymous
users a concrete reason to sign in without ever blocking them.

---

## Reality check: what "editor gating" does and doesn't mean

The site's editorial review state lives in
[`content/review-status.json`](content/review-status.json) and is produced by a
**local/CI workflow** — the Python `verifier/` package (citation verify,
steelman, orchestrator) plus [`scripts/apply-review.mjs`](scripts/apply-review.mjs),
committed to git. That pipeline is **not** a web app and this spec does not move
it into the browser.

So in v1, **editor/admin gating governs one new web surface: the submissions
moderation queue** (`/corrections` inbox). An `editor` can list, triage, and
mark submissions accepted/declined; a `reader` cannot see the queue at all.
Turning accepted submissions into actual content revisions remains the existing
git-based editorial process. A future milestone *could* add a web dashboard over
the proof pipeline, but that's explicitly out of scope here.

---

## Phased roadmap

Each phase is independently shippable and leaves the site fully working.

### Phase 1 — Identity foundation *(prerequisite for all others)* — ✅ CODE COMPLETE
**Delivered:** Supabase project `islamicissue` (`qgrwxuhqngohixzgpxiv`);
`@supabase/ssr` browser + server clients; root `proxy.js` (Next 16 session
refresh); `/auth/callback` + `/auth/signout`; email/password + Google + Microsoft
sign-in form at `/login`; `profiles` table + RLS + signup trigger + self-role-
change guard (migration `0001_profiles`); `<AuthButton />` in the header.
**Nothing gated.**
**Verified so far:** dev server runs clean (both env files loaded, no console
errors); `/login` renders all three sign-in methods in the site's design system;
an email signup created a `profiles` row with `display_name` from the email and
`role='reader'`; deleting the auth user cascaded the profile away; Supabase
security advisors report zero lints.
**Providers configured + verified:** Google (done, env in Vercel). Microsoft /
Entra (Azure provider enabled, multitenant + personal accounts; authorize
endpoint 302s to `login.microsoftonline.com/common` with the right client_id and
callback; the "Continue with Microsoft" button drives all the way to Microsoft's
real sign-in page). `AuthForm` requests `openid profile email` for Azure so the
profile trigger gets a name + email.
**Remaining:** one real Microsoft sign-in to confirm a `reader` profile is
created (analog to the email test); add `http://localhost:3000/**` to the
Supabase redirect allow-list if testing OAuth locally; decide on email-
confirmation UX.

### Phase 2 — Chat sync + per-user limits *(highest value)*
**Deliver:** `conversations` + `messages` tables + RLS; `useConversations`
authed adapter; the local→Postgres merge; per-user rate limit in `route.js`.
**Verify:** Start a chat anonymously, sign in → the conversation appears in the
account; open a second device/browser signed into the same account → history is
present; confirm RLS blocks reading another user's conversations; confirm
anonymous chat still works and is still IP-limited.

### Phase 3 — Personalization
**Deliver:** `bookmarks`, `progress`, `annotations` tables + RLS; bookmark
toggle + "mark read" on issue pages ([`app/[part]/[issue]/page.js`](app/[part]/[issue]/page.js));
a "Saved" view; optional annotations UI.
**Verify:** Bookmark an issue, reload, sign in elsewhere → bookmark syncs;
reading progress reflects across devices; RLS isolation holds.

### Phase 4 — Contributions + roles
**Deliver:** `submissions` table + RLS; a real submission form on
[`/corrections`](app/corrections/page.js); an `editor`-gated moderation queue;
`requireRole()` guard + `profiles.role` protection.
**Verify:** A reader submits a correction (signed in, and — if enabled —
anonymously); an editor sees it in the queue and a reader gets 404/blocked;
confirm no account can elevate its own `role`.

---

## Security & privacy notes

- **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** It bypasses RLS; it must never
  reach the client bundle or a `NEXT_PUBLIC_` var.
- **RLS is the authorization model.** Do not rely on client-side checks; every
  table ships with policies before it holds real data.
- **`role` is not self-editable.** Protect it at the DB layer (column policy /
  trigger), not just the UI.
- **Minimal PII.** Store `display_name` + `avatar_url` from the OAuth profile and
  nothing more; never put user identifiers in URLs (consistent with the site's
  existing privacy posture).
- **Availability.** A Supabase outage disables sign-in and sync, but by design
  anonymous reading **and** anonymous chat keep working (localStorage + IP
  limiting), so the core site never hard-depends on Supabase being up.
- **Consent surfaces.** OAuth adds a third-party auth hop; note it in the privacy
  copy before launch.

## Dependency & cost trade-offs

- Adds one stateful vendor (Supabase) beyond the current near-static + Upstash
  setup. Supabase free tier comfortably covers this workload; Postgres row
  volume here is tiny (chats, bookmarks, submissions).
- New npm deps: `@supabase/supabase-js`, `@supabase/ssr`. No change to the build
  pipeline (`build-graph.mjs` etc.) or the content-as-code model.

---

## Open questions

1. **Microsoft audience.** Locked to permissive multi-tenant for now. If an
   institutional use case (universities, seminaries, apologetics orgs on
   Microsoft 365) becomes real, we may add tenant restriction or a "verified
   institution" badge — additive, no re-plumbing.
2. **Anonymous submissions.** Should `/corrections` accept submissions *without*
   sign-in (service-role route, IP-limited), or require an account for
   attribution? Leaning: allow anonymous but flag them differently in the queue.
3. **Annotations depth.** Phase 3 annotations can be as light as a per-issue
   private note or as rich as text-anchored highlights. Start light; expand only
   if used.
4. **Sidebar-collapse & other prefs.** Currently localStorage
   ([`ChatApp.js`](components/chat/ChatApp.js:39)). Leave device-local, or sync
   as user settings? Leaning: leave local (not worth a table).

---

## Not in v1 (deliberately deferred)

- Email/password + magic-link auth.
- Public comments / discussion threads.
- A web dashboard over the `verifier/` proof pipeline.
- Team/organization accounts, shared workspaces.
- Notification / email digests.
