# Darshita's Virtual Birthday ✨

> A cozy, dreamy **pixel-art birthday venue** built for the web. Accept the
> invitation, choose an avatar, leave a wish, and celebrate with confetti,
> balloons, and lo-fi music.

**🌐 Live demo:** <https://virtual-birthday-party-mu.vercel.app>
**📸 Screenshots:** [see below](#screenshots)
**📚 Design docs:** [PRD](PRD.md) · [Architecture](ARCHITECTURE.md) · [Design System](DESIGN_SYSTEM.md) · [Asset Bible](ASSET_BIBLE.md)

---

## Demo

![Demo](birthday/docs/screenshots/Demo.gif)

## Highlights

- 🎨 **Fully original visual identity.** A magical purple-night pixel garden — 400+
  lines of design tokens, three self-hosted fonts, and a locked palette.
- 🕹 **Interactive world, not a static page.** Scrollable/zoomable room, pan with
  wheel or trackpad, Ctrl/pinch to zoom; fixed HUD stays out of the way.
- 💌 **Real, honest interactions.** RSVP with name + avatar (15 hand-cropped
  transparent-PNG choices), leave wishes that persist in `localStorage`, and
  trigger a portalled celebration overlay (confetti + 20 pastel balloons +
  sparkles + shimmer + banner).
- 🎵 **Ambient music player** with autoplay attempt, silent fallback, live
  progress bar, and graceful "Unavailable" state if the file is missing.
- 🛠 **Production-shaped monorepo.** pnpm + Turborepo, Next.js 15 App Router,
  React 19, strict TypeScript, ESLint flat config, Vercel deploy.
- 📄 **Design-first workflow.** Every visual and architectural decision is
  captured in four planning docs before code, then executed milestone-by-
  milestone (M0 → M8) with locked scope.

## Screenshots

<!-- Drop PNGs into docs/screenshots/ with these filenames and they'll render. -->

| Landing | RSVP | Room |
|---|---|---|
| ![landing](docs/screenshots/01-landing.png) | ![rsvp](docs/screenshots/02-rsvp.png) | ![room](docs/screenshots/03-room.png) |

| Wishes | Celebrate | Music |
|---|---|---|
| ![wishes](docs/screenshots/04-wishes.png) | ![celebrate](docs/screenshots/05-celebrate.png) | ![music](docs/screenshots/06-music.png) |

## Tech Stack

- **Framework:** Next.js 15 (App Router) · React 19 · TypeScript (strict)
- **Styling:** CSS Modules + design tokens (CSS custom properties) — no Tailwind
- **Fonts:** `next/font` self-hosting Press Start 2P, Pixelify Sans, Nunito
- **State:** React hooks + `localStorage` (guest session, wishes) — cross-tab
  sync via `storage` events
- **Media:** portalled celebration overlay (`ReactDOM.createPortal`),
  `HTMLAudioElement` wrapped in a custom hook with `AbortController`-based
  teardown
- **Monorepo:** pnpm workspace + Turborepo (`apps/*`, `packages/*`)
- **Deployment:** Vercel (frontend-only, no env vars required)
- **Tooling:** ESLint flat config + Next plugin, Prettier

## Features

**Entry**
- Invitation landing with drifting SVG clouds, twinkling stars, first-click
  audio unlock, and a smooth fade transition to the room.
- RSVP modal with a live-search-free 15-avatar grid, name validation, and
  Enter-to-continue.

**Room**
- Full room background rendered at natural resolution — never cropped.
- Camera with fit-width minimum zoom (no dark side gaps) and Ctrl/pinch zoom-in
  toward the cursor.
- Darshita anchored in front of the cake as the fixed host; the current guest's
  chosen avatar appears on the plaza.
- Honest "0 / 1 Guest Joined" counter tied to the actual local session.

**Social**
- Wishes wall with inline compose (280-char limit, live counter, Ctrl/Cmd + Enter
  to post), duplicate-guard, cross-tab sync.
- Real wishes only — no seeded fake content.

**Celebration**
- Portalled fullscreen overlay: 20 pastel balloons rising, 36 twinkling
  sparkles, edge-biased confetti, golden shimmer, centered banner.
- Dock-clip zone keeps effects off the HUD; `pointer-events: none` never
  swallows clicks.

**Music**
- Compact 190×50px mini player card with autoplay attempt + one-shot gesture
  fallback + live progress rail.
- Graceful "Unavailable" state when the audio file is missing — no crash, no
  console noise.

## Architecture

Client-only for now. All state (guest session, wishes, music preference) lives
in the browser's `localStorage`, so the site works entirely without a backend.
Realtime, presence, and DB persistence are **designed** in [ARCHITECTURE.md](ARCHITECTURE.md)
and scoped for later milestones (Colyseus + Supabase).

```
apps/
  web/          Next.js (App Router) — shipped to Vercel
  server/       Colyseus realtime server — scaffolded, not deployed yet
packages/
  config/       @dvb/config   — event, world, realtime tunables
  protocol/     @dvb/protocol — shared event names + payload types
supabase/       DB migrations placeholder
art/            source art (built assets emit to apps/web/public/assets)
docs/           screenshots + supporting media
scripts/        tooling (e.g. avatars-remove-bg.py)
```

## Getting started

**Prerequisites:** Node ≥ 22 (see `.nvmrc`), pnpm 9 (`corepack enable`).

```bash
git clone https://github.com/<you>/virtual-birthday-party.git
cd virtual-birthday-party
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run web + server in watch mode (Turborepo) |
| `pnpm build` | Build all packages/apps |
| `pnpm typecheck` | Type-check the whole workspace |
| `pnpm lint` | ESLint (flat config) across the repo |
| `pnpm format` | Prettier write |

## Deployment

Deployed to **Vercel** from `apps/web`.

- **Root Directory:** `apps/web`
- **Framework:** Next.js (auto-detected)
- **Install / Build / Output:** defaults (pnpm install + `next build`)
- **Environment variables:** none required
- **Node.js Version:** 22.x

## Design decisions

- **Local-first shipping order.** Backend and multiplayer are designed but
  intentionally deferred, so the visual, interaction, and asset work could be
  polished end-to-end without waiting on infrastructure.
- **No fake data.** No seeded sample wishes or fake guest counts — everything on
  screen reflects real local state. The "1 Guest Joined" counter, the current
  avatar in the room, and the wishes wall all read directly from `localStorage`.
- **Design-doc-driven milestones.** Each milestone (M0 → M8) begins with an
  approved plan (files to create/modify, why, risks), avoids scope creep, and
  ends with locked surface. See the four planning docs above.
- **Preserve pixel character.** Sprite backgrounds cleaned to real alpha
  transparency via a custom edge-flood-fill pass (`scripts/avatars-remove-bg.py`)
  rather than a global white-key that would eat highlights.

## Roadmap / current limitations

Shipped: **M0 Foundations · M1 Landing · M2 Room + camera · M3 Host placement ·
M4a RSVP + avatar picker · M4b Local guest rendering · M5 Cake Moment ·
M6 Birthday Wishes · M7 / M7b Music player · M8 Vercel deployment ·
M9 Portfolio polish + share previews.**

Deferred (designed in the docs):
- Real multi-user presence and movement (Colyseus room).
- Server-persisted wishes and RSVPs (Supabase).
- Host role via a secret host link.
- Additional in-room affordances (chat, emotes, dance, photo, map).

## Credits

- Fonts: Press Start 2P, Pixelify Sans, Nunito (Google Fonts, self-hosted via `next/font`).
- Ambient audio: royalty-free lo-fi loop (place a `lofi-birthday.mp3` at
  `apps/web/public/assets/audio/`).
- Character art: original pixel-art sprites cropped and cleaned in this repo.

Built end-to-end as a portfolio project. Feedback welcome.
