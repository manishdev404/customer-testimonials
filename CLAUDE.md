# Agent instructions — Testify

Steering file for coding agents (Claude Code, Cursor, Cline, …) working in this repo.

## What this is

A testimonial platform: customers submit testimonials, the business owner moderates them, approved
ones appear on a public wall. `frontend/` is Next.js, `backend/` is Express + Firestore.

Read `README.md` before making structural changes.

## Hard rules

- **Never use** Axios, Redux, Material UI, Chakra or Bootstrap. HTTP is native `fetch`; styling is
  Tailwind only; client state is Zustand.
- **Never commit secrets.** `backend/.env` holds a Firebase Admin key. Anything prefixed
  `NEXT_PUBLIC_` is inlined into the browser bundle — never put a key there.
- **Never let a non-approved testimonial reach a public endpoint.** The status filter and the
  `toPublicTestimonial()` mapper are the guarantee. Do not add a public route that skips them.
- **Never widen the API envelope.** Every endpoint returns `{success, data}` or `{success, error}`.
  The frontend's HTTP client unwraps exactly this shape, and it is what keeps the Express backend
  and the Next.js fallback routes interchangeable.

## Architecture

Both sides layer the same way — keep it that way:

```
controller / component  →  service  →  repository
```

- **Repository** — storage mechanics only (Firestore queries). No business rules.
- **Service** — business rules: moderation defaults, duplicate checks, stats, the approved-only
  guarantee. No HTTP types, no SDK types.
- **Controller** — parse, delegate, respond. No logic.
- **Components** — presentational. Data fetching lives in feature hooks; endpoint URLs live only in
  `frontend/src/services/`.

New third-party integrations go behind an interface with a fallback, following
`modules/insights/` (Groq + heuristic) and `modules/storage/` (Cloud Storage + inline). A network
dependency must never be able to fail a user's submission.

## Conventions

- TypeScript strict, including `noUncheckedIndexedAccess`. No `any`; no non-null assertion unless
  the invariant is obvious from the line above it.
- Comments explain **why**, not what. Do not narrate code that reads clearly.
- Reuse the primitives in `frontend/src/components/ui/` rather than restyling ad hoc. If two
  components need the same chrome, extract it (see `field-shell.tsx`).
- Constants live in `constants/` — no magic numbers for limits, lengths or thresholds.
- Interactive elements need a keyboard path and an accessible name. Overlays use the shared
  `useEscapeKey` stack so layered dialogs dismiss in the right order.

## Verifying a change

Run these before claiming something works:

```bash
cd frontend && npm run build      # typecheck + build
cd backend  && npx tsc --noEmit
```

For anything touching the core loop, exercise it for real — submit, confirm `pending`, confirm
absent from `/api/testimonials`, approve, confirm present. A green typecheck is not evidence the
flow works.

`GET /health` reports which image store and AI provider are actually active; check it before
assuming Cloud Storage or Groq is in play.

## Gotchas

- `firestore.settings()` may be called **once**, before any other call on the instance. It is
  cached in `db/firebase.ts` — do not call it elsewhere.
- Firestore documents cap at 1 MiB. Inline image mode is guarded at 700 KB for this reason.
- Firestore cannot do substring search, and every `where` + `orderBy` combination needs a
  composite index. Reads deliberately fetch one ordered page and filter in memory; see
  `FETCH_LIMIT` before changing this.
- The seed script uses the heuristic analyser, not Groq — seeding must stay fast and deterministic.
