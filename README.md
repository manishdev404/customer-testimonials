# Testify — Testimonial Platform

Collect customer testimonials, moderate them, and publish the approved ones on a public wall.

**The core loop:** a customer submits a testimonial → it appears as `pending` in the moderation
dashboard → the owner approves it → it appears on the public wall. Rejected and pending
testimonials never reach the wall.

---

## Stack

| Layer    | Choice                                                                    |
| -------- | ------------------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Zustand, React Hook Form |
| Backend  | Node.js, Express 5, TypeScript, Zod                                       |
| Database | Firebase Firestore                                                        |
| Images   | Firebase Cloud Storage, with an inline fallback (see below)               |
| AI       | Groq (`llama-3.3-70b-versatile`), with a local heuristic fallback         |

No Axios, Redux, Material UI, Chakra or Bootstrap. HTTP is the native `fetch` API on both sides.

---

## Running it

Requires Node.js 20+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in your Firebase service-account values
npm run dev               # http://localhost:4000
```

On first boot it verifies the Firestore connection, picks an image store, and seeds 10 demo
testimonials if the collection is empty. Check it with `curl http://localhost:4000/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
npm run dev               # http://localhost:3000
```

### Running the frontend without Firebase

The frontend ships with Next.js route handlers that serve the same API contract from in-memory
data. **Leave `NEXT_PUBLIC_API_BASE_URL` unset** and the app runs standalone — no credentials, no
backend process. This exists so the UI can be worked on in isolation; the Express + Firestore
service is the real backend.

---

## API

All endpoints return the same envelope, which is what makes the two backends interchangeable:

```jsonc
{ "success": true,  "data": { /* ... */ } }
{ "success": false, "error": { "message": "...", "fields": { "email": "..." } } }
```

| Method  | Route                | Purpose                                            |
| ------- | -------------------- | -------------------------------------------------- |
| `GET`   | `/health`            | Liveness, active image store, active AI provider    |
| `GET`   | `/api/reviews`       | Moderation list. `?status=&rating=&sort=&search=`   |
| `POST`  | `/api/reviews`       | Submit a testimonial (always created as `pending`)  |
| `GET`   | `/api/reviews/:id`   | Single review                                       |
| `PATCH` | `/api/reviews/:id`   | Set status to `approved` / `rejected`               |
| `GET`   | `/api/testimonials`  | **Public.** Approved only, email/status/AI stripped |

`GET /api/reviews` returns stats computed over the **whole** collection, not the filtered subset,
so the dashboard cards stay stable while a moderator narrows the list.

---

## Notable behaviour

**Approved-only is enforced server-side.** `/api/testimonials` filters by status in the service
layer and maps through `toPublicTestimonial()`, which drops `email`, `status` and `insights`. A
client-side bug cannot leak a pending or rejected testimonial.

**Images.** Firebase requires the Blaze plan to create a Cloud Storage bucket. The backend probes
for the bucket at boot: if it exists, images are uploaded as objects and only the URL is stored;
if not, it falls back to storing compressed images inline on the Firestore document, guarded at
700 KB total so it cannot breach Firestore's 1 MiB document cap. Enabling Blaze switches it over
with no code change. The active mode is reported by `/health`.

The browser downscales images to 1400px and re-encodes them as JPEG before upload, so a 10 MB
phone photo travels as a few hundred KB.

**AI insights.** Sentiment and a one-line summary are generated on submission. Groq is called with
an 8-second timeout; on any failure — rate limit, outage, malformed response — it falls back to a
deterministic keyword-and-rating heuristic. A submission never fails because a third party is
down. `insights.source` records which one ran.

**Duplicate guard.** A second submission from the same email within 24 hours is rejected with a
409.

**Moderation UX.** Approve applies immediately (common, easily reversed). Reject asks for
confirmation first. Both update optimistically and roll back the full snapshot on failure.

---

## Layout

```
frontend/src/
  app/            routes; (dashboard) group is the admin shell, /testimonials is public
    api/          route handlers — the standalone fallback API
  components/ui/  design system: button, input, modal, toast, badge, skeleton, ...
  components/layout/  sidebar, navbar, app shell
  features/       write-review · review-management · public-testimonials
  services/       the only module that knows endpoint URLs
  store/          Zustand: reviews, filters, search, loading + toasts
  lib/ hooks/ utils/ types/ constants/

backend/src/
  app.ts index.ts    express wiring, bootstrap with fail-fast dependency checks
  config/            env parsed and validated once at boot
  db/                firebase admin init, typed collection refs
  modules/reviews/   types · schema (zod) · repository · service · controller · routes
  modules/insights/  provider interface + groq and heuristic implementations
  modules/storage/   ImageStore interface + cloud-storage and inline implementations
  middleware/        error handler, request logger, 404
```

The layering is the same on both sides: **controller/component → service → repository**. Business
rules live in services, storage mechanics in repositories, and the UI depends on `services/`
rather than on URLs.

---

## Verification

What was actually run, not just intended:

- **Core loop against live Firestore** — submitted via `POST`, confirmed `status: pending`,
  confirmed absent from `/api/testimonials`, approved via `PATCH`, confirmed present on the wall.
- **Leakage check** — asserted no `email`, `status` or `insights` key appears in any public
  payload.
- **Validation** — a payload with every field invalid returns 422 with five distinct field errors.
- **Duplicate guard** — second submission from the same email returns 409.
- **AI fallback** — forced a 401 from Groq; the analyser fell through to the heuristic and the
  submission still succeeded.
- **Image upload** — posted a base64 PNG, confirmed it was decoded, sized and stored.
- **CORS** — preflight from an allowed origin returns 204 with the right headers; an unlisted
  origin returns 403.
- **404s** — unknown review id and unknown route both return 404 on the standard envelope.
- **Builds** — `npm run build` (frontend) and `tsc --noEmit` (both) pass clean.
- **In-browser** — all three pages served 200 and the full submit → approve → publish flow was
  exercised through the UI.

### Known gaps

- **No authentication.** The dashboard is unprotected. Explicitly a non-goal in the brief.
- **No pagination.** `findAll()` reads up to 1000 documents and filters in memory. This is a
  deliberate trade: Firestore needs a hand-built composite index per `where`+`orderBy` pairing and
  cannot do substring search at all, so free-text search would be impossible server-side. Correct
  at one business's volume; the boundary is documented at `FETCH_LIMIT`.
- **No automated tests.** Verification was manual and API-level. The service layer is pure and
  injectable, so unit tests would drop in without restructuring.
- **No embeddable widget** (P1) — not built.
- **Inline image mode is a fallback, not a destination.** It works, but Cloud Storage is the
  correct path once Blaze is enabled.

---

## Security note

`backend/.env` holds a Firebase **Admin** service-account key, which bypasses all Firestore
security rules. Both `.env` files are gitignored. If a key has ever been pasted into a chat, a
ticket or a commit, rotate it: Firebase Console → Project Settings → Service Accounts → *Generate
new private key*, then delete the old one.
