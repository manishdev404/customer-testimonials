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

> **Yours to write.** Notes on what to cover:

- **Tools and models used:** which agent/editor, which models, for what kind of work.
- **How you split the work:** what you delegated vs. kept, and why.
- **Your agent setup:** `CLAUDE.md` is committed at the repo root — describe what problem each rule
  in it was written to solve. (It encodes the banned libraries, the layering, the response-envelope
  invariant, and the gotchas that actually bit during the build.)
- **Your 3–5 most important prompts:** paste them verbatim and say why each worked or didn't.
- **At least one time AI was wrong.** Two real candidates from this build, if they match your
  recollection:
  - `firestore.settings()` was called on every `getFirestore()` access. It typechecked and looked
    fine; the server crashed on boot with *"Firestore has already been initialized."* Caught by
    actually starting the process, not by review.
  - The CORS rejection path passed a plain `Error` to the `cors` callback, which surfaced as a
    **500** and got logged as an unhandled bug. A disallowed origin is an expected client condition
    and should be a **403**. Caught by testing with a hostile `Origin` header.
- **Something you rejected:** what you threw away or rewrote, and why.

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
