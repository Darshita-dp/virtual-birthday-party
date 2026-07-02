# Technical Architecture
## Darshita's Virtual Birthday — Multiplayer Pixel-Art Venue

**Status:** Draft v1.0 (architecture only — no feature code)
**Last updated:** 2026-06-29
**Companion doc:** [PRD.md](PRD.md)
**Locked decisions:** pixel-only · no anime v1 · name-only identity · invite-link entry · target 150 guests, scale beyond · scrollable room · host = birthday girl at cake/stage · host-only cake-cut · wishes auto-publish (moderation-ready) · social venue, not a game.

---

## 0. Stack Comparison (brief)

### Realtime / multiplayer (the decision that drives the architecture)

| Option | Model | Fit for 150 smooth avatars | Ops & cost | Verdict |
|---|---|---|---|---|
| **Supabase Realtime** | Postgres-backed pub/sub (Broadcast + Presence) | Good for chat/presence/wishes; **not** an authoritative mover — no server tick, no interest management you control, no anti-cheat | Fully managed, cheap | **Use for the Wishes wall only**, not movement |
| **Socket.IO** | Raw WebSocket server (Node) | Capable, but you hand-build authority, tick loop, delta encoding, Redis scaling, sticky sessions | Most engineering + ops | Too much to build from scratch |
| **PartyKit** (Cloudflare Durable Objects) | One stateful actor per room at the edge | Fine for ~150 with batching; **single-threaded DO** per room; you implement diffing/tick yourself | Excellent — scale-to-zero, edge, low ops | **Strong alternative** if cost/serverless is the priority |
| **Colyseus** | Purpose-built **authoritative** room server (Node) | Built for exactly this: automatic **binary delta** state sync, interest management (`@filter`), matchmaking, multi-node scaling via Redis | Needs a warm stateful node (Railway/Fly); not scale-to-zero | **✅ Recommended** |

**Why Colyseus wins here:** the single hardest part of this product is syncing 150 moving avatars efficiently and authoritatively. Colyseus solves it out of the box — binary delta patches, a server tick, server authority (critical for **host-only cake** and moderation), interest management, and clean horizontal scaling (more room instances across nodes, coordinated by Redis). PartyKit is the close second if you'd rather have serverless/scale-to-zero and accept writing the diffing/tick yourself. Since this is a planned event (we'll warm the server before the window anyway), Colyseus's "not scale-to-zero" downside barely applies.

### Rendering: **Phaser 3** over PixiJS

PixiJS is a pure WebGL renderer — fast, but you build camera, culling, input, and sprite animation yourself. Phaser is a 2D game framework that gives us, out of the box, exactly our needs: **tilemap floor, camera-follow on a room larger than the viewport, sprite-sheet animations (we literally have a sprite sheet), arcade-physics prop collision, and pointer/keyboard input for click-to-move.** For a social venue, Phaser gets us to a walkable room far faster with no aesthetic compromise.

### Shell: **Next.js (App Router) + React + TypeScript**

SSR landing page (fast first paint + rich invite-link previews), API route handlers for the stateless app/API (wishes, config, photo signing), great DX, first-class Vercel deploy. The room canvas is a **client-only** component (`dynamic(..., { ssr: false })`) because Phaser needs the browser.

### Data/Storage/Identity: **Supabase** over Firebase

Relational Postgres fits structured wishes/guests/moderation cleanly (and enables future moderation/analytics SQL), with Storage+CDN for assets/photos, anonymous identity for name-only entry, and **Row Level Security** for safety. Firestore's NoSQL modeling makes moderation/queries clunkier with heavier lock-in. Bonus: Supabase Realtime cleanly powers the live Wishes wall **without touching the game server**.

---

## 1. Recommended Architecture

```
 Invite link
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT (browser, no install) — Next.js + React + TS              │
│  ┌───────────────────────────┐   ┌────────────────────────────┐  │
│  │ Phaser 3 Scene (WORLD)    │   │ React HUD (CHROME)         │  │
│  │ tilemap room, avatars,    │◄─►│ chat, wishes, music,       │  │
│  │ camera, movement, anims   │   │ toolbar, settings, counter │  │
│  └────────────┬──────────────┘   └─────────────┬──────────────┘  │
│               │  Network layer (singleton)      │ Zustand store    │
│               └──────────────┬──────────────────┘                 │
└──────────────────────────────┼───────────────────────────────────┘
            WSS (Colyseus)      │            HTTPS (REST)
                                │                       │
                ┌───────────────▼─────────────┐   ┌─────▼───────────────┐
                │ COLYSEUS REALTIME SERVER     │   │ NEXT.JS API ROUTES  │
                │ (Node + TS, authoritative)   │   │ (stateless)         │
                │ • BirthdayRoom (state+tick)  │   │ • /api/session      │
                │ • presence, movement, chat   │   │ • /api/event        │
                │ • emote/dance/cake (host)    │   │ • /api/wishes       │
                │ • matchmaking + instances    │   │ • /api/photos/sign  │
                │ • validation + rate limit    │   │ • /api/moderation   │
                └───────┬──────────────┬───────┘   └─────────┬───────────┘
                        │ Redis        │ read/write          │ read/write
                        ▼ (presence,   ▼                     ▼
                ┌──────────────┐   ┌────────────────────────────────────┐
                │ REDIS        │   │ SUPABASE                           │
                │ • driver/    │   │ • Postgres (events, guests,        │
                │   presence   │   │   wishes, photos, moderation)      │
                │ • global     │   │ • Storage + CDN (atlases, audio,   │
                │   counters   │   │   photos)                          │
                └──────────────┘   │ • Anonymous identity + RLS         │
                                   │ • Realtime (Wishes wall only)      │
                                   └────────────────────────────────────┘
```

**Separation of concerns (the core idea):**
- **Phaser = the world** (high-frequency: positions, animation, camera). Driven directly by the network layer — never through React state.
- **React = the chrome** (low-frequency: chat, wishes, counts, music, settings). Driven by Zustand.
- **Colyseus = the source of truth** for live state (authoritative, server-validated).
- **Supabase = the keepsake** (durable wishes/photos/guests), independent of the ephemeral realtime layer.

---

## 2. Why This Stack Is Best for This Project

1. **It solves the hard problem first.** 150 authoritative, smoothly-synced avatars is the make-or-break; Colyseus delivers binary delta sync + server authority + interest management + multi-node scaling without us reinventing a game server.
2. **No install, global reach.** Pure web client (Next.js/React) + WebSocket; runs on any modern browser.
3. **Server authority where it matters.** Host-only cake, anti-spam, and moderation are enforced server-side — clients are never trusted.
4. **The keepsake never depends on the party.** Wishes/photos live in durable Postgres, isolated from the realtime layer; the Wishes wall updates live via Supabase Realtime without loading the game server.
5. **Right tool per layer, clean seams.** A shared `protocol` package isolates the realtime contract so the realtime provider could even be swapped later (de-risks vendor lock-in).
6. **Incremental-friendly.** Each PRD milestone slots into an existing layer (landing→web, movement→Phaser+Colyseus, wishes→API+DB, etc.) with no rebuilds — honoring the project rules.
7. **Config-driven & reusable.** Event details and theme live in config/DB, so the same engine re-skins for future events without code changes.

---

## 3. Folder Structure

A **pnpm + Turborepo monorepo** so client and server share one typed protocol contract.

```
darshita-birthday/
├─ apps/
│  ├─ web/                         # Next.js (App Router) — shell, UI, API
│  │  ├─ app/
│  │  │  ├─ (landing)/[slug]/      # invitation landing route
│  │  │  ├─ party/                 # the room (client-only canvas)
│  │  │  ├─ api/                   # route handlers (session, wishes, event…)
│  │  │  └─ layout.tsx
│  │  ├─ src/
│  │  │  ├─ game/                  # Phaser integration
│  │  │  │  ├─ scenes/             # BootScene, RoomScene
│  │  │  │  ├─ entities/           # Avatar, RemotePlayer, HostAvatar
│  │  │  │  ├─ systems/            # movement, camera, animation, culling
│  │  │  │  └─ PhaserGame.tsx      # mount point (ssr:false)
│  │  │  ├─ net/                   # Colyseus client + state→Phaser bridge
│  │  │  ├─ components/            # React HUD (chat, wishes, music, toolbar…)
│  │  │  ├─ store/                 # Zustand slices
│  │  │  ├─ hooks/
│  │  │  └─ lib/                   # supabase client, api client, audio
│  │  └─ public/assets/            # built atlases, tilemap, audio (or CDN)
│  └─ server/                      # Colyseus (Node + TS)
│     ├─ src/
│     │  ├─ rooms/BirthdayRoom.ts  # authoritative room
│     │  ├─ schema/                # Colyseus state schemas
│     │  ├─ logic/                 # movement, interest mgmt, rate limit
│     │  ├─ moderation/            # profanity filter, limits
│     │  └─ index.ts               # server + matchmaker bootstrap
│     └─ Dockerfile
├─ packages/
│  ├─ protocol/                    # SHARED: message names, payload types,
│  │                               #   state schema types, constants/limits
│  └─ config/                      # event config, tunables (tick, caps)
├─ art/                            # SOURCE art + atlas packing config
│  ├─ avatars/  rooms/  audio/
│  └─ texturepacker/               # atlas project files
├─ scripts/                        # asset build, load-test bot harness
├─ supabase/                       # migrations, RLS policies, seed
└─ turbo.json / pnpm-workspace.yaml
```

---

## 4. Component Hierarchy (React)

```
<RootLayout>
 ├─ <Providers>                       # Supabase, Zustand, Network, Audio
 │
 ├─ Route "/[slug]"  → <LandingPage>
 │     └─ <InvitationCard>            # title/date, Accept / Already Accepted
 │           └─ <IdentityStep>        # name input + <AvatarPicker>
 │                                    # first click → unlock audio
 │
 └─ Route "/party"   → <RoomPage>     # client-only
       ├─ <PhaserGame/>               # the world (canvas), ssr:false
       └─ <HUD>                       # overlay chrome
            ├─ <TopBar>               # event title · <OnlineCounter> · sound · fullscreen
            ├─ <LeftToolbar>          # Wishes · Emotes · Dance · Photo · Map
            ├─ <ChatPanel>            # tabs All/Nearby · list · input · bubbles*
            ├─ <WishesPanel>          # list + "Send a Wish" (live via Supabase)
            ├─ <MusicPlayer>          # Lo-fi Birthday · transport · progress
            ├─ <EmoteWheel> <DancePicker>
            ├─ <PhotoMode> <Minimap>
            ├─ <CutCakeButton>        # rendered only if isHost
            └─ <SettingsPanel>        # volume · performance mode · name/avatar
```
\*Speech bubbles render in the **Phaser** layer (attached to avatars), fed by chat events — not as React DOM over moving sprites.

---

## 5. State Management Plan

**Principle: keep high-frequency data out of React.** Positions/animation flow `Colyseus → net layer → Phaser` directly (mutable refs / emitter). Only low-frequency, UI-relevant state enters **Zustand** and triggers React renders.

**Zustand slices:**
| Slice | Holds | Updated by |
|---|---|---|
| `session` | guestId, name, avatarId, isHost, token | identity step / `/api/session` |
| `connection` | status, instanceId, onlineCount, reconnecting | net layer (Colyseus lifecycle) |
| `ui` | activePanel, settings, volume, performanceMode | user actions |
| `chat` | rolling message buffer, activeTab (All/Nearby) | net layer (chat messages) |
| `wishes` | wishes list, submitting | `/api/wishes` + Supabase Realtime |
| `music` | track, isPlaying, progress | music player |

**Explicitly NOT in Zustand:** remote player positions/animations (live in the Phaser scene), to avoid React re-render thrash at 20 Hz.

**The net layer (singleton):** owns the Colyseus `Room`; on state patches it updates/creates/removes Phaser avatar entities; on message events (chat/emote/cake/system) it pushes into Zustand or emits to Phaser as appropriate; exposes intent methods (`move`, `sendChat`, `emote`, `setDance`, `cutCake`).

---

## 6. API Structure (stateless HTTP — Next.js route handlers)

| Method · Route | Purpose | Notes |
|---|---|---|
| `GET /api/event/:slug` | Event config (title, date, theme, caps, moderation mode) | public |
| `POST /api/session` | Create/restore guest (name+avatar) → signed session token (+ host claim if host link) | token consumed by Colyseus `onAuth` |
| `GET /api/wishes` | Paginated published wishes | for Wishes wall initial load |
| `POST /api/wishes` | Submit a wish → filtered → persisted (auto-publish) | rate-limited; profanity filter |
| `POST /api/photos/sign` | Signed upload URL for a photo-mode capture | Supabase Storage |
| `GET /api/photos` | List published photos (gallery, optional) | |
| `POST /api/moderation/*` | Admin: hide/remove wish, mute/kick guest (later) | host/admin auth |

**Identity flow:** `/api/session` issues a short-lived signed JWT carrying `{guestId, name, avatarId, isHost}`. The browser persists name/avatar locally; the JWT is passed to Colyseus on join, where `onAuth` verifies signature + host claim (host claim only granted when the request came via the secret host link).

---

## 7. Database Schema (Postgres / Supabase)

```sql
-- Generic by design so the engine re-skins for future events.
events (
  id            uuid pk,
  slug          text unique,
  title         text,
  subtitle      text,
  event_date    timestamptz,
  theme         text default 'pixel-garden',
  max_per_instance int default 150,
  moderation_mode  text default 'auto'   -- 'auto' | 'approval'
  host_token_hash  text,                 -- hashed host secret
  created_at    timestamptz default now()
)

guests (
  id            uuid pk,
  event_id      uuid fk -> events,
  display_name  text,
  avatar_id     text,                     -- references atlas avatar key
  is_host       bool default false,
  session_hash  text,                     -- hashed session token
  status        text default 'active',    -- 'active' | 'muted' | 'banned'
  first_seen    timestamptz default now(),
  last_seen     timestamptz
)

wishes (
  id            uuid pk,
  event_id      uuid fk -> events,
  guest_id      uuid fk -> guests,
  author_name   text,                     -- denormalized for display
  body          text,
  status        text default 'published', -- 'published' | 'pending' | 'hidden'
  created_at    timestamptz default now(),
  moderated_by  uuid null,
  moderated_at  timestamptz null
)   -- index (event_id, status, created_at desc)

photos (
  id            uuid pk,
  event_id      uuid fk -> events,
  guest_id      uuid fk -> guests,
  storage_path  text,
  status        text default 'published',
  created_at    timestamptz default now()
)

moderation_actions (            -- audit log for "moderation later"
  id            uuid pk,
  event_id      uuid fk -> events,
  actor         text,
  target_type   text,           -- 'wish' | 'guest' | 'photo'
  target_id     uuid,
  action        text,           -- 'hide' | 'mute' | 'kick' | 'ban'
  reason        text null,
  created_at    timestamptz default now()
)

chat_messages (                 -- OPTIONAL: persist for moderation/audit
  id, event_id, instance_id, guest_id, scope, body, created_at
)   -- v1 may keep chat ephemeral; enable when audit needed
```

**RLS:** wishes/photos publicly readable only when `status='published'`; inserts allowed for valid sessions; updates/moderation restricted to host/admin role. Auto-publish today = default `published`; flip `moderation_mode='approval'` later to default new wishes to `pending` with no schema change.

---

## 8. Realtime Events (Colyseus contract — lives in `packages/protocol`)

**State (auto-synced via binary delta patches):**
```
RoomState {
  cakeCut: boolean
  players: Map<sessionId, Player {
     name, avatarId, x, y, dir, anim, isHost, danceOn, lastEmote
  }>
}
```

**Client → Server (intents):**
| Event | Payload | Server action |
|---|---|---|
| `move` | `{ targetX, targetY }` (click-to-move) | validate bounds + speed clamp; authoritatively move toward target each tick |
| `chat` | `{ scope: 'all'|'nearby', text }` | filter + rate-limit; route (nearby = within radius) |
| `emote` | `{ type }` | rate-limit; broadcast to nearby |
| `dance` | `{ on: bool }` | set player.danceOn |
| `wish_added` | `{ }` (nudge only) | broadcast sparkle; actual persist via HTTP |
| `cut_cake` | `{ }` | **host-only**; if isHost → set state.cakeCut, broadcast `cake_cut` |

**Server → Client (messages, beyond state patches):**
| Event | Payload | Purpose |
|---|---|---|
| `chat` | `{ from, name, scope, text, ts }` | deliver chat + drive avatar speech bubble |
| `emote` | `{ from, type }` | render floating emote |
| `system` | `{ kind: 'join'|'leave'|'announce', ... }` | join/leave notices |
| `cake_cut` | `{ by }` | trigger the synchronized cake celebration |
| `rate_limited` | `{ action }` | client feedback |
| `error` | `{ code, message }` | join/validation failures |

**Lifecycle:** `onAuth` (verify JWT + host claim) → `onJoin` (spawn player; host spawns as birthday-girl near cake) → tick loop (~20 Hz, default Colyseus patchRate) → `onLeave` (`allowReconnection` window) → reconnect pulls full state snapshot.

---

## 9. Asset Organization Plan

**Source → build → serve.**
```
art/ (source, in repo)                 →  build step (TexturePacker/CLI)  →  served via CDN
  avatars/  <pixel sprite sheet sliced per character>     packed atlas (PNG + JSON)
  rooms/    garden background layers, props               tilemap (Tiled JSON) + atlas
  audio/    lo-fi birthday track(s), SFX                   compressed (ogg/mp3)
```

**Conventions (locked to the pixel references):**
- **Texture atlases** (TexturePacker JSON Hash — Phaser-native), multipacked if large. Avatars in one atlas, room props in another.
- **Tile size standard** (e.g. 32 px); room built as a Tiled tilemap with a collision layer for solid props (cake stage, gifts, fountain, sofa, arch).
- **Avatar frame naming:** `<avatarId>_idle_<dir>`, `<avatarId>_walk_<dir>_<n>`, `<avatarId>_dance_<n>` where `dir ∈ {down,up,left,right}`. The **host** is a dedicated `avatarId = "birthday_girl"` (gown + sash + hat) pinned near the cake.
- **Delivery:** static atlases/audio from **Supabase Storage + CDN**; lazy-load non-critical assets; preload core avatar atlas + room before room entry. User **photos** uploaded to a separate Storage bucket.
- **Palette/style** taken directly from the reference images; no restyle without sign-off.

---

## 10. Deployment Plan

| Layer | Platform | Notes |
|---|---|---|
| Web (Next.js) | **Vercel** | SSR landing + API routes; env: Supabase keys, Colyseus URL |
| Realtime (Colyseus) | **Railway / Fly.io** (Docker, WS-friendly) | stateful, warmed before the event window; sticky per room via matchmaking |
| Coordination | **Redis** (Upstash) | Colyseus presence/driver across nodes + global online counter |
| DB / Storage / CDN | **Supabase** (managed) | Postgres + Storage + CDN + RLS |
| Observability | **Sentry** + Colyseus monitor + host metrics | errors, room/connection metrics |
| CI/CD | GitHub → Vercel auto-deploy; server via Docker deploy | preview envs for web |
| Pre-event | **Load-test bot harness** (`scripts/`) | simulate 150–300 bots moving/chatting; validate before the night |

**Event-day plan:** pre-scale Colyseus nodes for the expected peak, warm them ahead of the window, monitor live, scale instances via matchmaking caps, tear down after.

---

## 11. Scaling Approach (100 → 150 → beyond)

**Within one room instance (target 150):**
- Colyseus **binary delta patches** at ~20 Hz (tune `patchRate`).
- **Position quantization** (round coords) to shrink each patch.
- **Server-authoritative movement** so only resolved positions are sent (not raw spam).
- **Area-of-interest filtering** (`@filterChildren`) to send each client only nearby players when the crowd is large.
- **Client render culling** + **performance mode** (cap animated/labeled avatars off-screen).

**Beyond 150 (horizontal):**
- Matchmaker caps `maxClients` per `BirthdayRoom`; overflow spins a **new instance** of the identical room ("Garden · Room 2").
- Multiple instances across nodes coordinated by **Redis**; **global online count** aggregated in Redis.
- **Wishes are global** (DB-backed) so they're shared across all instances; **chat is per-instance** in v1 (optionally relay "All" globally via Redis pub/sub later).

---

## 12. Risks & Mitigations (architecture-level)

| Risk | Mitigation |
|---|---|
| **O(N²) bandwidth** from 150 movers | delta encoding + quantization + interest management + tuned patch rate |
| **Single-thread CPU** (one room = one process for 150) | keep per-tick work cheap; shard into instances; offload filtering |
| **WebSocket scaling / sticky sessions** | Colyseus matchmaking + Redis presence; WS-friendly host (Fly/Railway) |
| **React re-render thrash** from positions | positions bypass React → fed straight to Phaser |
| **Reconnect storms** on flaky mobile | `allowReconnection` + exponential backoff + snapshot-on-rejoin |
| **Autoplay audio blocked** | unlock on first click (built into landing flow) |
| **Always-on server cost** for one night | small warmed node, pre-scale for window, tear down after (PartyKit is the scale-to-zero fallback) |
| **Asset payload** on mobile | atlases + CDN + lazy-load + compression |
| **Inappropriate content** | server-side profanity filter + rate limits + name filtering + `moderation_mode` switch + audit log |
| **Vendor lock-in** | shared `protocol` package isolates the realtime contract for swap-ability |

---

## 13. Decisions to Confirm Before M0

1. **Realtime layer:** **Colyseus** (recommended) vs PartyKit (serverless/scale-to-zero alternative).
2. **Hosting for Colyseus:** Railway vs Fly.io (both fine; Fly = global edge regions, Railway = simplest DX).
3. **Monorepo tooling:** pnpm + Turborepo (recommended) acceptable?
4. **Movement model:** click-to-move (matches the cozy venue vibe) vs WASD vs both. *(Assumed: both, click-to-move primary.)*
5. **Chat scope at scale:** per-instance chat in v1 (global wishes) acceptable?
6. **Host link:** separate secret host URL to grant the birthday-girl avatar + cake control — OK?

*End of Architecture v1.0 — awaiting sign-off on §13 before M0 (foundations) begins.*
