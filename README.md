# Recipe Scraper (Reciply)

Turn a social-media cooking video into a clean, structured, editable recipe you own — and optionally share.

Paste an Instagram/Facebook reel URL → the app pulls the video's caption/description, has an LLM parse it into `{ title, ingredients[], steps[] }`, and hands you an **editable preview**. Nothing is saved until you confirm, so the database never fills with AI guesses. Saved recipes belong to you, can carry a category and image, be favorited, and be published to a public community feed.

---

## Why it exists

Recipe reels are everywhere, but the actual recipe is trapped in a caption you have to scroll, screenshot, and retype. The goal: **one URL in, one structured recipe out**, saved to your own library — without hand-transcribing.

---

## Architecture

```
URL ─▶ Scraper service (yt-dlp)      ─▶ caption/description text
                                          │
text ─▶ AI parser service (Gemini)   ─▶ structured recipe (JSON, Zod-validated)
                                          │
recipe ─▶ editable preview (client)  ─▶ POST /recipes (auth) ─▶ MongoDB (scoped to userId)
                                          │
                                       optional: image → Cloudinary, publish → community feed
```

Two packages, one repo:

| Package                  | Stack                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `recipe-scraper-backend` | Express 5, Mongoose 9, Zod 4, TypeScript on native Node (`node --watch --conditions dev`) |
| `recipe-scraper-client`  | React 19, Vite 8, Tailwind 4, React Router 8, react-hook-form + Zod                       |

**Design principle — extract does _not_ persist.** `/extract` returns an ephemeral draft. The user edits it, then a separate save call writes it. Keeps the DB free of unconfirmed AI output.

### Backend layout (`src/`)

`routes/ → controllers/ → services/ + models/`, with `schemas/` (Zod) validating at the boundary and `middlewares/` for cross-cutting concerns. Path aliases (`#controllers`, `#services`, …) via `package.json` imports.

- **`services/scraper.ts`** — shells out to `yt-dlp --dump-json` to get caption/description/auto-subs without a browser. Covers ~80% of recipe reels. (Whisper transcription and headless-browser fallbacks are documented for later, not built — deliberate v1 scope.)
- **`services/aiParser.ts`** — Gemini (`@google/genai`) with `responseSchema` for structured output.
- **`services/cloudinary.ts`** — image upload + deletion. `public_id` is derived deterministically from the stored `secure_url` (we don't store it separately).
- **`services/extractCache.ts`** — `lru-cache` keyed on URL (1-day TTL); identical URLs skip yt-dlp + Gemini entirely.

### Auth & ownership

- **JWT**: short-lived access token (15 min) + rotating refresh token (7 days), stored as a SHA-256 hash in a `RefreshToken` collection, delivered as an HTTP-only cookie. Reuse detection on rotation. bcrypt (cost 12) for passwords.
- `protect` middleware sets `req.userId` / `req.role`; `adminOnly` gates admin routes.
- Every recipe is scoped to `req.userId` — reads, writes, and deletes filter on ownership (404 instead of leaking existence).

### Routes (`/api/v1`)

| Method                        | Route                       | Access                                               |
| ----------------------------- | --------------------------- | ---------------------------------------------------- |
| `POST`                        | `/recipes/extract`          | public, rate-limited                                 |
| `GET`                         | `/recipes/community`        | public (published recipes), cached 60s               |
| `POST` `GET` `PATCH` `DELETE` | `/recipes` · `/recipes/:id` | `protect`, scoped to `userId`                        |
| `POST`                        | `/recipes/:id/image`        | `protect` → formidable → Cloudinary                  |
| —                             | `/auth`, `/users`           | login / signup / refresh (rotating), user management |

All responses use a consistent `{ data: … }` / `{ message: … }` envelope.

### Community & dedup

Published recipes appear in a public feed. "Add to my library" creates an **independent snapshot** (its own document, `isPublished: false`) — editing your copy never touches the original. Recipe identity is the `sourceUrl`: the backend returns **409** if you already have that URL, or if publishing would collide with another published recipe's URL. Guards are app-level (no unique index → no migration risk on existing data).

### Client structure (`src/`)

`pages/` (Landing, Library, RecipeDetail, Community, CommunityDetail, Login, Signup) composed from `components/`. `AuthContext` holds the token in module state and auto-refreshes on 401. A single `utils/api` helper attaches the JWT and is the only thing `api/recipes.ts` talks to. `ProtectedRoute` gates `/library`.

---

## Running it

**Prerequisites:** `yt-dlp` and `ffmpeg` on the host (`brew install yt-dlp ffmpeg`), a reachable MongoDB.

**Backend** — `.env` (see `.env.example`): `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`, `CLOUDINARY_NAME/KEY/SECRET`. `validateEnv()` checks these at boot and `exit(1)`s if any are missing.

```bash
cd recipe-scraper-backend && npm install && npm run dev   # node --watch, port 3000
```

**Client** — `.env` (see `.env.example`): `VITE_API_URL` (leave empty in dev; Vite proxies `/api` → `localhost:3000`).

```bash
cd recipe-scraper-client && npm install && npm run dev
```

Behind a reverse proxy, set `app.set('trust proxy', …)` so rate limiters see the real client IP.

**Tests:** backend uses the native Node test runner — `npm test` (covers the Zod recipe schema, the Cloudinary URL→public_id parser, and the scraper).

---

## Production hardening (already in place)

- In-memory caching on the two expensive routes (`/extract`, `/community`) — Redis upgrade path marked with a `ponytail:` comment.
- Complete rate-limiter coverage: global (300/15min/IP) on `/api`, plus extract, image-upload, and refresh limiters.
- Boot-time env validation (Zod).
- Unified `{ message }` error envelope; central `errorHandler` maps Mongo `11000` → 409 and `CastError` → 400. Express 5's async auto-forwarding let us delete ~16 `try/catch { next(err) }` blocks.

---

## Case study notes (STAR)

Raw material for a STAR write-up. Facts are pulled from the sections above.

- **Situation** — Recipe content lives in social-media reels; the actual recipe is buried in a caption that users screenshot and retype by hand. No tool turned a video URL into a saved, structured recipe you own.
- **Task** — Build a full-stack app that takes a reel URL and produces a clean, editable, persisted recipe with user accounts, images, and optional community sharing — without polluting the DB with unconfirmed AI output, and hardened enough to deploy.
- **Action**
    - Chose a **caption-first scraping ladder** (yt-dlp `--dump-json`, no browser) covering ~80% of reels; explicitly deferred Whisper/headless fallbacks to avoid over-building v1.
    - Fed captions to **Gemini with a `responseSchema`** and validated the result with **Zod** before it ever reached the client.
    - Enforced an **extract-does-not-persist** flow: ephemeral draft → user edits → separate authenticated save, keeping the DB clean.
    - Implemented **JWT auth with rotating refresh tokens + reuse detection**, bcrypt, and per-`userId` ownership scoping on every recipe operation.
    - Added **Cloudinary** image upload/cleanup (deriving `public_id` from the stored URL) and a **community feed** with independent snapshots and `sourceUrl`-based dedup (app-level 409 guards, no risky unique index).
    - **Hardened for deploy**: LRU/module caching on expensive routes, full rate-limiter coverage, boot-time env validation, a unified error envelope, and removal of ~16 redundant try/catch blocks using Express 5 async forwarding.
- **Result** — v1 runs end-to-end: URL → yt-dlp → Gemini → editable preview → MongoDB, with auth, per-user libraries, favorites, image uploads, and a public community feed with dedup. Deploy-hardened (caching, rate limits, env validation, ownership isolation). Deliberately scoped to caption-based extraction with documented upgrade paths, so the codebase stays small enough to reason about.

```

```
