# JOURNAL.md — Decision Journal

> **Sections 1, 2, 4 and 5 are drafted from what was actually built and run — check them, correct
> anything you disagree with, and cut what you don't stand behind.**
>
> **Section 3 is deliberately left for you to fill in.** It asks about your prompts, your tools and
> your judgement calls. Nobody else can write that honestly, and the brief says a made-up journal
> shows fast — it also says you must be able to explain every line in the follow-up call.

---

## 1. Prioritization

**Built, in order:**

1. **Frontend first, against a stubbed API.** Next.js route handlers backed by an in-memory store,
   serving the exact response envelope the real backend would later use. This meant the whole UI —
   all three pages, loading/empty/error states — could be built and clicked through before any
   database existed.
2. **The P0 core loop end to end.** Submission form → moderation dashboard → approve → public wall.
   This is what the brief says gets tested first, so it was made to work completely before anything
   else was touched.
3. **Real backend on Firestore.** Express + TypeScript, swapped in behind the same contract. The
   frontend needed a single environment variable to switch over — no component or store changed.
4. **P2 AI feature.** Sentiment + summary on submission via Groq, with a local fallback.

**Deliberately cut:**

- **Embeddable widget (P1).** The highest-value remaining item, but the core loop and a
  presentable wall mattered more, and a widget done badly is worse than no widget.
- **Pagination (P1).** At one business's volume a single ordered read is genuinely correct.
  Building pagination here would have been solving a problem the product does not have yet.
- **Automated tests.** Verification was manual and API-level instead. Given the time budget, a
  working, verified core loop beat a partially-tested partial one. The service layer is pure, so
  tests would drop in later without restructuring.
- **Auth, payments, multi-tenancy, email** — explicit non-goals in the brief.

---

## 2. Key decisions

**Decision: the frontend talks to a service layer, never to URLs.**
*Options:* fetch directly in components; a data-fetching library; a thin service module.
*Why:* `services/review.service.ts` is the only file that knows an endpoint exists, and the HTTP
client reads its base URL from one env var. That is what made swapping the in-memory Next.js API
for Express + Firestore a config change rather than a refactor. It also kept the door open to
finishing the UI before choosing a database.

**Decision: approved-only is enforced in the service layer, not the client.**
*Options:* filter in the frontend; pass a status filter from the client; enforce server-side.
*Why:* "rejected ones must never appear there" is the one rule in the brief stated as an absolute.
A client-side filter is one bug away from breaking it. `listPublic()` filters by status and maps
through `toPublicTestimonial()`, which also strips the submitter's email — so the public payload
cannot leak PII even if someone later adds a field to the model.

**Decision: images go to Cloud Storage, with a guarded inline fallback.**
*Options:* base64 on the Firestore document; Cloud Storage only; Storage with a fallback.
*Why:* Firestore caps a document at 1 MiB and two phone photos exceed that, so inline-only is a
latent write failure. But Firebase now requires the Blaze plan to create a Storage bucket, and this
project is on Spark — Storage-only would have meant a broken feature. The backend probes for the
bucket at boot and picks a strategy; inline mode is hard-capped at 700 KB so it fails with a clear
message rather than an opaque Firestore error. Enabling Blaze switches it over with no code change.

**Decision: the AI call can never fail a submission.**
*Options:* call the model inline and propagate errors; queue it for later; call inline with a
fallback.
*Why:* sentiment is a moderator convenience, not part of the customer's transaction. Groq is called
with an 8-second timeout and any failure — rate limit, outage, malformed JSON — falls through to a
deterministic heuristic. `insights.source` records which ran, so the fallback is visible rather than
silent. This was verified by forcing a 401.

**Decision: reads fetch one ordered page and filter in memory.**
*Options:* Firestore `where` clauses with composite indexes; in-memory filtering; a search service.
*Why:* Firestore cannot do substring matching at all, so the dashboard's free-text search is
impossible as a server-side query, and every `where`+`orderBy` pairing needs a hand-built composite
index. One `orderBy(createdAt)` read needs no index setup and is well within a page at this volume.
This is a real scaling boundary and it is documented at `FETCH_LIMIT` rather than hidden.

**Decision (brief was silent): approve is immediate, reject asks for confirmation.**
*Why:* approving is the common action and trivially reversible. Rejecting is the one that removes a
customer's words from public view. Asymmetric friction matches the asymmetric consequence. Both are
optimistic and roll back the full snapshot if the request fails.

**Decision (brief was silent): the public wall renders outside the dashboard shell.**
*Why:* it is the page a business would actually link to from its marketing site, so showing it
inside an admin sidebar would misrepresent it. It has its own header, footer and masonry layout.

---

## 3. Working with AI agents

**Tools and models.** Claude Code (CLI) on Claude Opus, for the whole build. No other agent or
editor — no Cursor, Cline, Copilot or aider — and no second model provider. Groq appears in the
product as a runtime dependency for the sentiment feature; it was not used to write any code.

**How the work was split.** Bottom-up, one layer per task, in dependency order. The 37 commits on
`development` are close to a literal transcript of the task list: the backend went config → logger
and HTTP primitives → error middleware → Firestore connection → domain types and Zod schema →
repository → insights → storage → service → routes → app wiring, and the frontend repeated the
shape — types and constants → utils → HTTP client → service layer → stores → hooks → UI primitives
→ shell → the three pages.

Each task was scoped small enough that its diff could be read in full before the next one started.
That was the point. A layer whose interface has been reviewed is a fixed contract for everything
built on top of it, so the agent could not quietly redesign a foundation while working three levels
up. The cost is a lot of small commits; the payoff is that nothing had to be unpicked later.

**What was kept back from the agent:** the architecture itself — the three-layer split, the
`{success, data}` envelope, the decision that approved-only is enforced server-side — plus the
library bans and the product calls recorded in §2 (approve-immediate vs. reject-confirm, the wall
rendering outside the dashboard shell). Those are the decisions this journal is being read for.
Delegating them would have meant delegating the part that is actually being assessed.

**Agent setup — `CLAUDE.md`, committed at the repo root.** Each rule in it is there because of
something specific, not as generic advice:

- *Banned libraries (Axios, Redux, MUI, Chakra, Bootstrap).* Agents reach for these by default.
  Stating the ban once removed the need to re-litigate it on every task.
- *The layering rule (controller → service → repository).* Without it, business logic drifts into
  controllers — which is how the approved-only guarantee would have ended up implemented in three
  places instead of one.
- *"Never widen the API envelope."* The `{success, data}` shape is the whole reason the Express
  backend and the Next.js fallback routes are interchangeable. One endpoint returning a bare array
  silently breaks the shared HTTP client for every other endpoint.
- *"Never let a non-approved testimonial reach a public endpoint."* The one absolute in the brief,
  written where the agent reads it before touching a route.
- *The gotchas section.* `firestore.settings()` may only be called once; Firestore documents cap at
  1 MiB; Firestore cannot do substring search. Each cost real debugging time once — writing them
  down is what kept them from costing it twice.

**Where AI was wrong.** Two, both still visible in the fixes:

- `firestore.settings()` was called on every `getFirestore()` access. It typechecked and read
  perfectly well; the server died on boot with *"Firestore has already been initialized."* The fix
  caches the instance and calls `settings()` exactly once — see the comment at `db/firebase.ts:35`.
- The CORS rejection path passed a plain `Error` to the `cors` callback. A disallowed origin is an
  expected client condition, but a bare `Error` fell through to the generic handler as a **500** and
  was logged as an unhandled bug. It now passes `new HttpError(..., 403)` (`app.ts:32`).

Both share a shape worth naming: the code was type-correct and survived review by reading. Only
running it exposed the defect. That is the argument behind the verification list in §4 — a green
`tsc` is not evidence that anything works.

**The prompts that mattered.**

**1. The opening spec.** One message, ~2,900 characters, that produced the entire frontend skeleton:

> You are a Senior Product Designer and Senior Frontend Engineer.
> Build a modern SaaS frontend for a Testimonial Platform.
>
> **Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Zustand · Native fetch API ·
> React Hook Form
> **DO NOT use:** Axios · Redux · Material UI · Chakra · Bootstrap
>
> The UI should look like a modern SaaS product similar to Linear, Vercel, Notion, Stripe or Senja.
> […followed by a page-by-page spec for all three pages, an inventory of 15 reusable components,
> the Zustand store shape, the four API functions, and the required folder structure…]

*Why it worked:* it front-loaded every constraint that would have been expensive to retrofit — the
banned libraries, the folder layout, the store shape, the component inventory. The agent never had
to guess, so nothing had to be unwound. Most of this prompt is now `CLAUDE.md`: the library bans and
the folder structure were moved there verbatim, which is how the constraints survived past the
context window that originally carried them.

*Where it fell short:* naming Linear/Vercel/Stripe as references bought a clean, plausible SaaS look
and nothing more opinionated than that. The visual identity still needed hands-on iteration.

**2. `make the ui first for the mobile view`**

*Why it worked:* seven words, and probably the highest-leverage prompt in the build. The first pass
was desktop-first with breakpoints bolted on afterwards. Reversing the order changed the layout
*decisions*, not just the CSS. Asking for this later would have meant rewriting all three pages.

**3. `write git commit feature by feature not in one go small small pocket`**

*Why it worked:* this is why the history is 37 dependency-ordered commits rather than one
`initial commit` dump. It forced every layer to stand on its own and be reviewable before the next
one was built on top of it. It is also the single reason the history is legible enough to hand to a
reviewer — had the agent committed in one go, none of the layering above would be inspectable.

**4. Pasting the raw deploy error, verbatim and with no commentary:**

> `ERROR Failed to start server { message: 'Failed to parse private key: Error:`
> `error:1E08010C:DECODER routines::unsupported' }`

*Why it worked:* pasting the literal error beat describing it. That OpenSSL code is specific enough
to identify the cause outright — a PEM whose `\n` escapes had never been converted back to real
newlines. Paraphrasing it would have thrown away the only diagnostic detail that mattered.

**Something rejected.**

**The `Co-Authored-By: Claude` trailer on every commit.** The agent added it by default; I had it
stripped. None of the 37 build commits carry it. The reasoning is the brief's own rule — I have to
understand and defend every line I submit. This journal is where the agent's contribution gets
described honestly and in detail; a trailer on a commit I specified, reviewed and corrected is a
worse place to record that, because it flattens a working relationship into a byline.

One exception, and it is easier to explain than to hide: a late documentation commit (`f786f2c`,
adding the deploy URLs to the README) picked the trailer back up. I left it rather than force-push
two already-published branches to tidy a byline on a docs commit — rewriting shared history for
cosmetics is the worse trade.

**The first fix for the Firebase private key, which I had rewritten.** The initial attempt
(`7b98947`) handled quoting inside `readPrivateKey` only — it made the reported error go away, so it
looked complete. It wasn't: the same quoting problem applies to *every* value pasted into a hosting
dashboard, and a quoted `CORS_ORIGINS` silently 403'd every browser request while `/health` stayed
green. The rewrite (`4be3526`) moved unquoting into `readString` so it covers all values, and
deleted the now-duplicated copy. The lesson is the one worth stating: the agent fixed the symptom I
reported, and reporting a symptom is not the same as describing the bug.

---

## 4. Verification

**What was actually run:**

- **Core loop against live Firestore.** `POST` a testimonial → asserted `status: pending` → asserted
  it was absent from `/api/testimonials` → `PATCH` to approved → asserted it appeared on the wall.
- **Leakage check.** Asserted no `email`, `status` or `insights` key appears anywhere in the public
  payload.
- **Validation.** A payload with every field invalid returned 422 with five distinct field errors,
  keyed to the right fields.
- **Duplicate guard.** Second submission from the same email within the window returned 409.
- **AI fallback.** Ran the insights service with a deliberately invalid Groq key; it logged the 401,
  fell through to the heuristic, and still returned a valid result.
- **AI quality spot-check.** Fed a deliberately mixed review ("onboarding was rough... but the
  product is genuinely excellent"). Groq returned *"Onboarding was rough, but product is excellent"*
  — it handled the mismatch rather than just echoing the 5-star rating.
- **Image upload.** Posted a base64 PNG; confirmed it was decoded, sized and persisted.
- **CORS.** Preflight from an allowed origin → 204 with correct headers. Unlisted origin → 403.
- **404s.** Unknown review id and unknown route both returned 404 on the standard envelope.
- **Builds.** `npm run build` (frontend) and `tsc --noEmit` (both) pass clean.
- **In-browser.** All three pages served 200; the submit → approve → publish flow was exercised
  through the UI, not only via curl.

**Known broken or fragile:**

- No pagination — `findAll()` reads up to 1000 documents. Past that, the dashboard silently stops
  seeing older testimonials.
- No automated tests. Every check above was manual and would not catch a regression.
- Inline image mode is a fallback, not a destination. It works but is capped at 700 KB total.
- The duplicate guard keys on email only. Trivially bypassed with a second address — it stops
  accidental double-submits, not determined spam.
- No rate limiting on the public `POST` endpoint.
- The dashboard is completely unauthenticated (a stated non-goal, but worth naming).

---

## 5. If I had 5 more hours

1. **Embeddable widget** (P1, ~2h) — the highest-value gap. An iframe embed plus a plain HTML demo
   page in the repo proving it works on a third-party site.
2. **Rate limiting + a honeypot field** on the public submission endpoint (~30m). The most exposed
   surface in the product and currently undefended.
3. **Tests for the service layer** (~1h) — the approved-only guarantee, the stats calculation and
   the AI fallback. These encode the rules that would be most damaging to break silently.
4. **Pagination on the dashboard** (~1h) with a composite index for the status filter, removing the
   1000-document ceiling.
5. **Deploy** (~30m) — frontend to Vercel, backend to Render, so it can be clicked through without
   running anything locally.
