# Darshita's Virtual Birthday

A cozy, dreamy **pixel-art multiplayer birthday venue**. Guests arrive through an
invitation link, then enter a scrollable birthday garden room where they appear as
pixel avatars, move around, chat, send wishes, use emotes, and join the host's
cake-cutting moment.

> **Status: M0 — Foundations.** This repo currently contains only the project
> scaffold (monorepo, design tokens, fonts, folder skeleton) and a temporary
> tokens/fonts smoke-test page. The landing page, the room, multiplayer, and the
> database are **not** built yet — they land in later milestones.

## Planning docs (source of truth)

| Doc | What it defines |
|---|---|
| [PRD.md](PRD.md) | Product vision, journey, features, requirements |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, layers, schema, realtime, scaling |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Colors, type, components, rules |
| [ASSET_BIBLE.md](ASSET_BIBLE.md) | Assets, naming, dimensions, pipeline |

## Monorepo layout

```
apps/
  web/         Next.js (App Router) — shell, UI, design tokens, fonts, Phaser mount
  server/      Colyseus realtime server (boots /health only in M0)
packages/
  config/      @dvb/config   — event, world, realtime tunables
  protocol/    @dvb/protocol — shared event names + payload types
supabase/      DB migrations (placeholder until M5)
art/           source art (built assets emit to apps/web/public/assets)
scripts/       asset build (placeholder), tooling
```

## Prerequisites

- **Node 20 LTS** (see `.nvmrc`)
- **pnpm 9** (`corepack enable` then `corepack prepare pnpm@9.12.3 --activate`)

> **Windows + OneDrive:** keep this repo **outside** your OneDrive folder (e.g.
> `C:\dev\birthday`). OneDrive syncing `node_modules`/`.next`/`.turbo` causes file
> locks and slow installs.

## Getting started

```bash
pnpm install
pnpm dev
```

- Web shell → http://localhost:3000 (the temporary M0 foundation check page)
- Realtime server → http://localhost:2567/health (returns `{ "status": "ok" }`)

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run web + server in watch mode (Turborepo) |
| `pnpm build` | Build all packages/apps |
| `pnpm typecheck` | Type-check the whole workspace |
| `pnpm lint` | ESLint (flat config) across the repo |
| `pnpm format` | Prettier write |
| `pnpm assets:build` | Asset pipeline (placeholder until real art lands) |

## Environment

Copy `.env.example` to set values. **Nothing is required to run the M0 shell** —
the variables are placeholders for realtime (M3+), Supabase (M5+), and host links.

## Roadmap

`M0 Foundations` → M1 Landing → M2 Room (single-player) → M3 Multiplayer →
M4 Chat → M5 Wishes/Emotes/Dance → M6 Cake + Music → M7 Photo/Map →
M8 Scale/Moderation/Polish.

## Conventions

- Pixel art is canonical (v1); anime style excluded.
- Pixel fonts for headings/chips/buttons/counters; **Nunito** for body/chat/wishes.
- Design values come from `apps/web/src/styles/tokens.css` (mirrors DESIGN_SYSTEM.md).
- Shared types/contracts live in `@dvb/protocol`; tunables in `@dvb/config`.
