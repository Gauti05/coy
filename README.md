# Coy — Discover (take-home)

Privacy-first crush discovery: swipe profiles, and a user **never** learns who liked them unless it is mutual.

## Privacy promise

- Unilateral interest is never exposed in API responses, feed ordering, UI copy, or client state.
- Seeded “already liked me” data lives only in a server-side `IncomingLike` collection, used at swipe time to detect a mutual match.
- A match exists only when both sides have liked each other.

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- MongoDB via Mongoose
- Vitest + mongodb-memory-server
- framer-motion, lucide-react, zod

## Prerequisites

- Node.js 20+
- MongoDB locally **or** Atlas

## Setup

```bash
npm install
cp .env.example .env.local
# set MONGODB_URI in .env.local
```

`.env.example` includes a local URI and a commented Atlas example. Do not put real credentials in the repo.

## Run

```bash
npm run dev          # http://localhost:3000
npm run seed         # clear + reseed profiles / IncomingLike / swipes / matches
npm run reset        # same as seed; refuses NODE_ENV=production
npm test
npm run build
```

Seeded profile photos are hardcoded [randomuser.me](https://randomuser.me) placeholder portraits (`/api/portraits/women|men/{n}.jpg`), stable across reseeds. Gender folders are chosen only while writing seed URLs — gender is not stored on Profile or returned by any API.

## How to demo a match

1. `npm run reset` (or `seed`) so the deck is fresh.
2. Open **Discover → Swipe** and swipe right through the deck.
3. About **10 of the 36** seeded profiles will produce a match when you like them. Which ones is intentionally not listed.
4. Use `npm run reset` to restore the demo after swiping.

## API

All routes assume the hardcoded user id `me`. Responses use `Cache-Control: no-store`.

### `GET /api/feed`

Returns unswiped public profiles in stable `_id` order.

```http
GET /api/feed
```

```json
{
  "profiles": [
    {
      "id": "...",
      "name": "Ava Chen",
      "age": 22,
      "photoUrl": "https://randomuser.me/api/portraits/women/0.jpg",
      "bio": "...",
      "location": "UC Berkeley",
      "interests": ["design", "coffee", "film"]
    }
  ]
}
```

### `POST /api/swipe`

```http
POST /api/swipe
Content-Type: application/json

{ "targetId": "<profileId>", "direction": "like" | "pass" }
```

| Status | Meaning |
| --- | --- |
| 200 | `{ "matched": false }` or `{ "matched": true, "profile": { ... } }` |
| 400 | Invalid JSON / schema / ObjectId / self-swipe |
| 404 | Profile not found |
| 409 | Already swiped (unique index) |

Non-match bodies are identical for pass-on-liked-me, like-on-not-liked, and pass-on-not-liked (`{"matched":false}`).

### `GET /api/matches`

```http
GET /api/matches
```

```json
{
  "matches": [
    {
      "id": "...",
      "name": "...",
      "age": 24,
      "photoUrl": "...",
      "bio": "...",
      "location": "...",
      "interests": ["..."],
      "matchedAt": "2026-11-18T12:00:00.000Z"
    }
  ]
}
```

Newest first. Public fields only.

## Architecture

```
src/
  app/                 # routes + API handlers (thin)
  components/          # UI (swipe, match overlay, matches list, shell)
  lib/
    models/            # Mongoose schemas + indexes
    services/          # pure business logic (unit-tested)
    api/               # route helpers (errors → HTTP, no-store JSON)
    seed.ts            # shared reseed / ensureSeeded
scripts/               # seed + reset CLIs
```

Handlers call `connectToDatabase()`, map domain errors via `mapErrorToHttp`, and never return stack traces.

## How privacy is enforced

| Control | Detail |
| --- | --- |
| Separate collection | `IncomingLike` is server-only; never selected into API/UI |
| Public mapper | `toPublicProfile` is the only client-facing profile shape |
| Stable feed | Sort by `_id`; no IncomingLike filter/order |
| Identical non-matches | Same status, `no-store`, and JSON body for non-match paths |
| Unique indexes | `(swiperId, targetId)`, `(userA, userB)`, `IncomingLike.profileId` |
| Cache | `Cache-Control: no-store` on feed / swipe / matches |
| Tests | Feed fields, order vs IncomingLike changes, duplicate 11000, concurrent swipes, byte-identical non-matches |

## Data model

- **Profile** — name, age, photoUrl, bio, location, interests\[2–4\]
- **Swipe** — swiperId, targetId, direction, createdAt — **unique** (swiperId, targetId)
- **Match** — userA, userB (sorted), createdAt — **unique** (userA, userB)
- **IncomingLike** — profileId — **unique** — server-side only

## Tests

```bash
npm test
```

Covers services + route handlers (memory MongoDB), swipe helpers, match queue, relative time, and privacy response identity.

## Known limitations

- **No multi-document transactions** — a crash between Swipe insert and Match insert can leave a swipe without a match; Match create is idempotent on retry (duplicate key ignored).
- **Timing side channel** — every `like` runs an IncomingLike lookup; `pass` does not. Match creation still does extra work. Residual timing differences are minimized but not eliminated.
- **Single hardcoded user** (`me`) — no auth.
- **Demo seed** — IncomingLike is for local demo only.

## Possible future work

- Real auth and multi-user IncomingLike writes
- Replica-set transactions around swipe + match
- Push / in-app notifications for matches
- Profile editing and photo uploads
