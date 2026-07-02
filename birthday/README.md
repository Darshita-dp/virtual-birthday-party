# Darshita's Virtual Birthday

A cozy, dreamy **pixel-art birthday venue**. Guests arrive through an invitation
link, RSVP with a name + avatar, then enter a scrollable birthday garden where
the birthday girl stands in front of the cake. Guests can leave wishes on the
wall, celebrate with a burst of confetti + balloons, and listen to a lo-fi
ambient track — all locally, no backend required.

> **🌐 Live demo:** <https://virtual-birthday-party-5abxpque0.vercel.app/>

> **Status: M0 → M7b shipped, deployed on Vercel (frontend-only).** The
> multiplayer and persistence milestones (Colyseus realtime + Supabase) are
> designed in the planning docs but intentionally deferred — the current build
> stores identity and wishes in `localStorage` and does not require any server.

## Planning docs (source of truth)

| Doc | What it defines |
|---|---|
| [PRD.md](PRD.md) | Product vision, journey, features, requirements |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, layers, schema, realtime, scaling |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Colors, type, components, rules |
| [ASSET_BIBLE.md](ASSET_BIBLE.md) | Assets, naming, dimensions, pipeline |

## What's built (M0 → M7b)

- **M0 Foundations** — pnpm + Turborepo monorepo, Next.js 15 + React 19 + TS,
  design tokens (`tokens.css`), fonts (Press Start 2P / Pixelify Sans / Nunito),
  asset & Supabase skeletons.
- **M1 Landing** — invitation card, drifting clouds, twinkling stars, Accept /
  Already Accepted, first-click audio unlock, fade transition to `/party`.
- **M2 Static Room** — full room background (no crop), responsive
  fit-to-width camera with Ctrl / trackpad-pinch zoom, native pan, fixed HUD.
- **M3 Host Placement** — Darshita rendered from a real transparent PNG in front
  of the cake, feet-anchored, with a name tag.
- **M4a Avatar Catalog + RSVP** — 15 cropped RGBA avatar PNGs, RSVP modal (name
  + avatar picker), local session persisted to `localStorage`.
- **M4b Local Guest Rendering** — the current guest's chosen avatar appears in
  the room alongside Darshita. No fake sample guests.
- **M5 Cake Moment** — Celebrate button portalled above the room: confetti,
  20 pastel sparkly balloons rising from the floor, twinkling sparkles, gold
  shimmer, centered "Happy Birthday Darshita! ✨" banner. Cooldown, reduced-
  motion honored, HUD stays clean.
- **M6 Birthday Wishes** — real, locally-persisted wishes wall with inline
  compose form, 280-char limit, live counter, Ctrl / Cmd + Enter to post,
  cross-tab sync via storage events. No fake wishes.
- **M7 / M7b Music / Ambience** — compact mini music player card with autoplay
  attempt (silent fallback + one-shot gesture retry), live progress bar,
  play/pause, loop, graceful "Unavailable" state if the file is missing.

Honest guest count (**0 Guests Joined** / **1 Guest Joined**) reflects the
actual local session — no inflated numbers.

## Monorepo layout

```
apps/
  web/         Next.js (App Router) — shell, UI, room, HUD (DEPLOYED)
  server/      Colyseus realtime server — scaffolded, not deployed yet
packages/
  config/      @dvb/config   — event, world, realtime tunables
  protocol/    @dvb/protocol — shared event names + payload types
supabase/      DB migrations — placeholder until backend milestones
art/           source art (built assets emit to apps/web/public/assets)
scripts/       tooling (e.g. scripts/avatars-remove-bg.py)
```

## Prerequisites

- **Node ≥ 22** (see `.nvmrc`; `package.json` engines: `>=22 <25`)
- **pnpm 9** (`corepack enable` then `corepack prepare pnpm@9.12.3 --activate`)

> **Windows + OneDrive:** keep this repo **outside** your OneDrive folder (e.g.
> `C:\dev\birthday`). OneDrive syncing `node_modules` / `.next` / `.turbo`
> causes file locks and slow installs.

## Getting started

```bash
pnpm install
pnpm dev
```

- Web app → <http://localhost:3000>
- Realtime server (health only, not deployed) → <http://localhost:2567/health>

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run web + server in watch mode (Turborepo) |
| `pnpm build` | Build all packages/apps |
| `pnpm typecheck` | Type-check the whole workspace |
| `pnpm lint` | ESLint (flat config) across the repo |
| `pnpm format` | Prettier write |
| `pnpm assets:build` | Asset pipeline (placeholder until real art tooling lands) |

## Environment

Copy `.env.example` to set values. **Nothing is required to run the current
web app** — the variables are placeholders for realtime and Supabase, which
are wired up in later milestones.

## Deployment

The web app deploys to **Vercel** from `apps/web`:

- **Root Directory:** `apps/web`
- **Framework:** Next.js (auto-detected)
- **Install / Build / Output:** defaults (Vercel uses `pnpm install` + `next build`)
- **Environment variables:** none required for the current milestones
- **Node.js Version:** 22.x

Live demo: <https://virtual-birthday-party-5abxpque0.vercel.app/>

## Roadmap

Shipped: **M0** → **M1** → **M2** → **M3** → **M4a** → **M4b** → **M5** →
**M6** → **M7 / M7b** → **M8 Deployment** (this milestone).

Next (deferred, designed in docs):
- Real multi-user realtime (Colyseus room, presence, movement).
- Server-persisted wishes and RSVPs (Supabase).
- Host role + secret host-link controls.
- Additional in-room affordances (chat, emotes, dance, photo, map).

## Conventions

- Pixel art is canonical (v1); anime style excluded.
- Pixel fonts for headings / chips / buttons / counters; **Nunito** for body,
  chat, wishes.
- Design values come from `apps/web/src/styles/tokens.css` (mirrors DESIGN_SYSTEM.md).
- Shared types / contracts live in `@dvb/protocol`; tunables in `@dvb/config`.
