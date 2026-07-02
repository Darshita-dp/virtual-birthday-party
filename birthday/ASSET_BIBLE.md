# Asset Bible
## Darshita's Virtual Birthday — Asset Specification & Pipeline

**Status:** Draft v1.0 (asset spec only — no code)
**Companion docs:** [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
**Source of truth:** attached pixel references. Pixel-only v1 (anime sheet excluded). **No restyle.**

> Conventions here are written for **Phaser 3 + Tiled + TexturePacker**, served from **Supabase Storage + CDN** per ARCHITECTURE.md. All dimensions are *recommendations to validate* in M0 (flagged in §Open Questions) — once locked, they are fixed for the project.

---

## 1. Required Asset Categories (master list)

| # | Category | Primary tech | Where it lives |
|---|---|---|---|
| 1 | **Fonts** | webfont (woff2) | `art/fonts` → `next/font` |
| 2 | **Landing** (sky, clouds, stars, wordmark) | CSS + sprites | `public/landing` |
| 3 | **Room background** (the set) | image layer(s) | atlas/CDN |
| 4 | **Tilemap / world** (collision, spawns, zones) | Tiled JSON | `public/assets/tilemap` |
| 5 | **Host sprite** (birthday girl) | atlas | `host` atlas |
| 6 | **Guest avatars** | atlas (multipack) | `avatars` atlas |
| 7 | **UI assets** (mostly CSS; few icons/bubble) | CSS + small sprites | `public/ui` |
| 8 | **Cake** (animated centerpiece) | atlas | `room-props`/`cake` atlas |
| 9 | **Confetti / celebration FX** | particle textures | `fx` atlas |
| 10 | **Decorations** (gifts, balloons, lanterns, plants, piano, arch…) | baked + few animated sprites | bg image + `room-props` atlas |
| 11 | **Music & sound** | ogg + mp3 | `audio` / CDN |
| 12 | **FX overlays** (lights twinkle, petals, fountain, vignette) | sprites + particles | `fx`/`room-props` |

---

## 2. Landing Page Assets

| Asset | Form | Spec | Notes |
|---|---|---|---|
| Night sky | CSS gradient (`--grad-sky`) + star sprites | full-viewport | parallax stars optional |
| Stars / sparkles | sprite or CSS, 3–4 sizes | 4×4–12×12px | twinkle (opacity loop) |
| Floating pixel clouds | sprites, 3–5 variants | ~128×64 to 256×128 | the lavender blocky clouds; slow horizontal float + parallax |
| Star accents (✦ ★) | inline glyph or sprite | display size | above the title |
| Wordmark "DARSHITA'S VIRTUAL BIRTHDAY" | **CSS text** (Press Start 2P + `--grad-hero-gold`/`--c-text-neon` + `--glow`) preferred; image fallback | — | keep editable per event; image only if effect can't be matched |
| Modal panel | CSS (`--c-panel`, `--radius-xl`) | max-w ~640 | no image needed |
| CTAs (Accept / Already Accepted) | CSS buttons | per Design System §7 | no image needed |
| Ambient sparkle particles (optional) | particle | tiny | low density |

> Landing is **DOM/CSS-first** — minimal image assets (just clouds + stars). This keeps it crisp and editable.

---

## 3. Room Background Assets (the "set")

**Approach (recommended): baked background image + Tiled collision overlay + animated prop sprites on top.** The room reference is one cohesive illustration; we bake the static set as image layer(s) and overlay only the things that move/glow.

| Layer | Asset | Spec |
|---|---|---|
| Sky (behind windows) | `room-sky.png` (or CSS) | tiled/parallax; deep purple + stars/clouds |
| Back wall + windows + neon sign + hanging lights (static) | `room-wall.png` | world-width × wall-height |
| Mid/foreground static decor baked into floor scene | `room-floor.png` / `room-set.png` | full world size |
| Animated overlays | separate sprites (see §10/§12) | placed via Tiled anchors |

**World (logical) size — recommended:** **2304 × 1536 px** (3:2), scrollable, comfortably holds 150 avatars in the central clearing at the design camera zoom. (Validate in §Open Questions; alt: 2560×1600.)

> If we later prefer a fully tile-built floor, a `floor` tileset can replace `room-floor.png`; collision/zones stay identical. Decision recorded: **baked image for v1** (fastest path, exact match to the reference art).

---

## 4. Tilemap / Room World Assets (Tiled)

`room.tmj` (Tiled JSON), **tile size 32×32**, map = world size in tiles (72×48 at 2304×1536).

**Layers:**
| Layer | Type | Purpose |
|---|---|---|
| `image_*` (optional) | image layers | the baked background images |
| `collision` | object layer (rects/polys) | solid prop footprints + perimeter boundary |
| `spawn` | object layer (points/rect) | guest spawn band (bottom/entrance) |
| `zones` | object layer | `host_spot`, `stage`, `photo_spot`, `piano`, `cake` interaction zones |
| `decor_anchors` | object layer (points) | exact placement of animated overlay sprites (candles, balloons, lights, fountain) |

Export JSON; embed nothing binary; keep object `name`/`type` stable (the net/game layer references them by name).

---

## 5. Birthday Girl (Host) Sprite Assets

Dedicated avatar id **`birthday-girl`** (gown + sash + rainbow party hat + daisies, per reference). Same floor footprint as guests; may be **taller** canvas due to the gown.

| State | Frames | FPS | Notes |
|---|---|---|---|
| `idle` (front) | 2 | 2–3 | gentle breathing bob; primary state (she stands at the cake facing the crowd) |
| `wave` | 4 | 6 | greeting guests |
| `celebrate` | 6 | 8 | arms-up cheer (plays on cake-cut) |
| `blow-candles` (optional, later) | 4 | 6 | lead-in to cake-cut |

- Facing: **front only required** (she's stationary at the stage). Directional walk is *optional/later* (only if host can roam).
- Canvas: **64 × 80 px** (taller than guests to fit the gown), feet-anchored.
- One `host` atlas.

---

## 6. Guest Avatar Sprite Assets

Derived from the **pixel guest sprite sheet** (~50–60 usable characters: party hats, dresses, hoodies w/ cat ears, animal onesies, varied hair colors, etc.). The sheet currently provides **front-facing idle only** — additional animation frames must be produced (see §Open Questions / now-vs-later).

**Per-avatar animation set (v1 target):**
| State | Frames | FPS | Notes |
|---|---|---|---|
| `idle-down` (front) | 2 | 2–3 | bob; available from the sheet today |
| `walk-down` | 4 | 8 | toward camera |
| `walk-up` | 4 | 8 | away |
| `walk-side` | 4 | 8 | **left = right flipped** (author right only) |
| `dance` | 4–6 | 8 | social emote loop |

- Up/idle-up may reuse `walk-up` frame 0; keep set minimal (cozy venue, not a fighting game).
- Canvas: **48 × 64 px**, feet-anchored (origin 0.5, 1).
- IDs: `avatar-01 … avatar-NN` (stable map to sheet cells; documented in a `roster.json`).
- **Avatars multipacked** into `avatars-0.png/.json`, `avatars-1.png …` (large set).
- Non-character cells in the sheet (confetti popper, balloon props) are **decor/FX**, not avatars.

---

## 7. UI Assets

Per Design System, the HUD is **CSS/DOM** — very few image assets:
| Asset | Form |
|---|---|
| Toolbar/action icons (envelope, emote face, music note, camera, map pin, gear, sound, fullscreen, send) | **emoji** in v1 (matches mockup); optional pixel icon set later |
| Speech bubble | CSS (preferred) or 9-slice sprite for the tail |
| Scrollbars, panels, buttons, tabs, inputs, progress bar | pure CSS (tokens) |
| Loading screen art | small themed sprite + CSS (cake/star motif) |

> No large UI sprite sheet needed for v1. Revisit a custom pixel icon set in a later polish pass.

---

## 8. Cake Assets (animated centerpiece)

Separate overlay sprite over the baked stage (so candles can flicker / cut can animate). Id **`cake`**.

| State | Frames | FPS | Notes |
|---|---|---|---|
| `idle` (candles lit) | 3–4 | 6 | candle-flame flicker (opacity/shape) |
| `candles-out` | 3 | 8 | transition: flames → smoke wisps |
| `cut` / `celebrate` | 6 | 10 | sparkle/shine + slice cue; pairs with confetti burst |

- Canvas: **256 × 256 px** (3-tier), bottom-anchored to the stage zone.
- Glow handled by an additive halo sprite, not baked, so it can pulse.

---

## 9. Confetti / Celebration Assets

For Phaser particle emitters (the cake-cut moment + emotes):
| Asset | Spec | Use |
|---|---|---|
| Confetti pieces | 6–10 tiny sprites, 6×6–12×12px, palette colors (pink/purple/gold/blue/white) | burst on cut cake |
| Sparkle / 4-point star | 8×8, 12×12 | ambient + celebration |
| Heart particle | 10×10 (pink + purple) | emote / love |
| Petal | 8×12 | drifting floor ambience |
| Balloon (release, optional) | sprite | later |

All in one `fx` atlas. Emitter configs (counts, gravity, lifespan) documented later; **counts cap + scale down on mobile/performance mode.**

---

## 10. Decoration Assets

From the room reference. **Mostly baked into the background image**; only a few are separate animated sprites.

| Decoration | Baked vs sprite | Animated? | Collision? |
|---|---|---|---|
| Gift stacks (L) | baked | no | **yes** (base) |
| Balloons (L/R) | sprite | sway | base only |
| Floral arch (R) | baked | no | **yes** (posts) |
| Piano + bench (R) | baked | no | **yes** |
| Stone bench / bistro tables + chairs | baked | no | **yes** |
| Chalkboard "Make a Wish" | baked | no | **yes** (could be an interaction zone) |
| Potted plants / flowers / wisteria | baked | subtle sway (optional) | base only / no |
| Lanterns + candles | sprite overlay | flicker glow | no |
| Fairy lights / string lights / hanging stars | sprite overlay | twinkle | no |
| Fountain / pond (if used) | sprite overlay | ripple | base only |
| Floor petals / sparkles | sprite/particle | drift | **no** |
| Neon "Happy Birthday Darshita" sign | baked + glow overlay | glow pulse | no |

Animated overlays placed via Tiled `decor_anchors`. Collisions defined in `collision` layer (see §17–18), **footprint only** (feet/base), not full visual height.

---

## 11. Music & Sound Assets

| Asset | Format | Spec | Use |
|---|---|---|---|
| `lofi-birthday` (ambient track) | `.ogg` + `.mp3` fallback | ~96–128 kbps, seamless **loop points**, −16 LUFS | the named background track |
| `sfx-click` | ogg/mp3 | short | button presses |
| `sfx-emote-pop` | " | short | emote trigger |
| `sfx-join-chime` | " | short, soft | guest arrival (throttled) |
| `sfx-wish-sent` | " | short | wish submitted |
| `sfx-cake-fanfare` | " | 1–2s | cake-cut moment |
| `amb-garden` (optional) | ogg | loop, low | subtle ambience bed |

- Autoplay only after first user gesture (landing first-click). All SFX respect master mute. Keep total audio payload modest; lazy-load SFX after room entry. Confirm licensing/source (§Open Questions).

---

## 12. FX Overlays (summary)

Twinkle (fairy lights/stars), candle/lantern flicker, neon pulse, balloon sway, petal drift, fountain ripple, vignette, contact shadows. All ambient, all reduced/disabled under `prefers-reduced-motion` and performance mode.

---

## 13. Sprite Naming Conventions

Atlas **frame keys** (inside the atlas JSON):
```
<category>_<id>_<state>_<dir>_<frame2digits>
```
Examples:
- `avatar_avatar-07_walk_down_01`
- `avatar_avatar-07_idle_down_00`
- `host_birthday-girl_celebrate_03`
- `cake_idle_02`
- `fx_confetti_pink_00`
- `decor_lantern_flicker_01`

Rules: lowercase, **kebab for ids**, **snake between fields**, zero-padded 2-digit frame index, `dir ∈ {down,up,side}` (side is flipped for left/right at runtime), omit `dir` when not applicable (cake, fx).

Phaser **animation keys** mirror this without the frame index: `avatar-07:walk-down`, `host:celebrate`, `cake:cut`.

---

## 14. File Naming Conventions

- All lowercase, **kebab-case**, no spaces.
- Atlases: `avatars-0.{png,json}`, `host.{png,json}`, `room-props.{png,json}`, `fx.{png,json}`.
- Backgrounds: `room-wall.png`, `room-floor.png`, `room-sky.png`.
- Tilemap: `room.tmj`.
- Audio: `lofi-birthday.ogg`, `sfx-*.ogg`.
- Fonts: `press-start-2p.woff2`, `pixelify-sans.woff2`, `nunito-*.woff2`.
- **Deploy-time:** content-hash filenames (e.g. `avatars-0.a1b2c3.png`) for long-cache CDN immutability (handled by the build/CDN, not in source).

---

## 15. Folder Organization

```
art/                         # SOURCE (design-time, in repo)
├─ fonts/
├─ landing/        clouds, stars
├─ avatars/        per-character source frames + roster.json
├─ host/           birthday-girl source frames
├─ room/           room-wall, room-floor, room-sky, decor source
├─ fx/             confetti, sparkle, heart, petal
├─ audio/          source wavs
├─ tilemap/        room.tmj + Tiled project
└─ texturepacker/  *.tps atlas-packing projects

apps/web/public/assets/      # BUILT (served; or uploaded to Supabase CDN)
├─ atlases/   avatars-*.{png,json}, host.*, room-props.*, fx.*
├─ backgrounds/ room-*.png
├─ tilemap/   room.tmj
├─ audio/     *.ogg, *.mp3
└─ ui/        speech-bubble (if sprite), loading art
```
Source → build (TexturePacker + audio encode + image optimize) → `public/assets` (dev) and/or Supabase Storage (prod CDN). The build is a `scripts/` task (defined in M0, not now).

---

## 16. Recommended Image Dimensions (summary)

| Asset | Source canvas | Notes |
|---|---|---|
| World (room) | **2304 × 1536** | scrollable; tile 32 → 72×48 |
| Guest avatar frame | **48 × 64** | feet-anchored |
| Host frame | **64 × 80** | taller gown |
| Cake overlay | **256 × 256** | bottom-anchored |
| Clouds (landing) | 128×64 – 256×128 | 3–5 variants |
| Confetti/particles | 6×6 – 16×16 | tiny |
| Stars/sparkle | 4×4 – 12×12 | twinkle |
| Lantern/candle glow | ~32–64 | additive |
| Speech bubble (if sprite) | 9-slice ~32×32 | prefer CSS |
| UI icons (if sprite) | 24×24 / 32×32 | prefer emoji v1 |

Atlas pages: max **2048×2048** (4096 only if needed). Tile size **32**. Keep one consistent pixel scale across all art.

---

## 17. Collision Rules for Props

- Collisions live in Tiled `collision` (object layer), as **rectangles/polygons over the base/footprint only** — the part the avatar's feet can't pass — not the full visual height (so avatars can overlap the *tops* of tall props for depth).
- The **perimeter** is a closed collision boundary keeping avatars inside the room.
- **Stage/cake** = solid island; **host_spot** sits on it (host is non-walkable).
- Footprints sized slightly **smaller** than the art to avoid avatars getting visually "stuck" on edges.
- Collision bodies are **static Arcade physics bodies** generated from the object layer at load.

## 18. Walkable vs Non-Walkable Rules

| Walkable | Non-walkable |
|---|---|
| Central floor clearing (the heart-shaped open area) | All perimeter decor footprints |
| Spawn band (bottom/entrance) | Stage + cake island + host_spot |
| Open paths to the stage | Gift stacks, piano, arch posts, tables, benches, planters, fountain base |
| Floor petals/sparkles (decorative, no body) | Walls / windows / boundary |

Target ≥ 55–60% of floor walkable (per Design System §22). No solid bodies inside the central clearing.

## 19. Sprite Animation Requirements (consolidated)

| Sprite | States (frames@fps) |
|---|---|
| Guest avatar | idle-down (2@3), walk-down/up/side (4@8), dance (4–6@8); side flips for L/R |
| Host | idle (2@3), wave (4@6), celebrate (6@8), [blow-candles 4@6 later] |
| Cake | idle (3–4@6), candles-out (3@8), cut (6@10) |
| Lanterns/candles | flicker (2–3@6) |
| Fairy lights/stars | twinkle (opacity, 2@ slow) |
| Balloons | sway (2–3@ slow) |
| Fountain | ripple (3@6) |

Randomize loop phase per instance (avatars, lights) to avoid synchronized motion. No animation > 3Hz flashing.

## 20. Avatar Animation States
`idle-down`, `walk-down`, `walk-up`, `walk-side` (L=flip R), `dance`. (Optional later: `sit`, `wave`, `emote-react`.)

## 21. Host Animation States
`idle`, `wave`, `celebrate` (cake-cut). Optional later: `blow-candles`, directional walk.

## 22. Cake Animation States
`idle` (candles lit, flicker) → `candles-out` (transition) → `cut`/`celebrate` (sparkle + confetti). State machine driven by the host-only `cut_cake` event; broadcast so all guests see the same state.

## 23. Asset Loading Strategy

- **Landing:** loads only its light assets (fonts, clouds/stars) — instant.
- **Room preloader (Phaser BootScene):** before entering, preload **critical**: room backgrounds, tilemap, host atlas, the **player's chosen avatar + a small common set**, cake, core fx, ambient music, UI fonts. Show a themed loading screen with a progress bar.
- **Lazy/after entry:** remaining avatar atlas pages (load on demand as those avatars appear), SFX, photo-mode frame, non-critical decor anims.
- Use **texture atlases** to minimize requests. Split avatars into multipack pages so the player isn't blocked on the full roster.
- Decode audio after first gesture; loop the ambient track.
- Target initial room payload **≤ ~3–4 MB**.

## 24. Asset Optimization Strategy

- **Atlases** (trim transparency, 2px padding to prevent bleeding) for all sprites.
- PNG optimization (pngquant/oxipng); audio encoded to ogg (+mp3 fallback) at modest bitrate.
- Ship art at a modest base resolution and **upscale with `pixelArt`/`pixelated`** (small files, crisp pixels) — don't ship oversized bitmaps.
- **Mobile variant** of the room background (smaller) optional if payload is high.
- Long-cache **content-hashed** filenames on CDN; cache atlases/audio aggressively.
- Cap particle counts; LOD name tags; cull off-screen sprites (Phaser camera culling).

## 25. CDN / Storage Recommendations

- Per ARCHITECTURE.md: **Supabase Storage + CDN** for atlases, backgrounds, tilemap, audio; **separate bucket** for user-generated photos.
- Static landing assets via Vercel/its CDN.
- Set `Cache-Control: public, max-age=31536000, immutable` on hashed assets.
- Fonts self-hosted via `next/font` (no third-party font CDN at runtime).

## 26. Phaser Integration Notes

- Game config: `pixelArt: true`, `roundPixels: true`, `antialias: false`, Scale mode RESIZE to fill viewport.
- Load: `this.load.atlas(...)`, `this.load.tilemapTiledJSON('room','room.tmj')`, `this.load.audio(...)`.
- Build animations centrally from atlas frames (a registry keyed by avatar/host/cake state); reuse across instances.
- **Avatar entity = Phaser Container** (sprite + name tag + bubble + contact shadow); origin (0.5, 1).
- **Depth/Y-sort:** set `depth = y` for avatars/props so closer (lower) draws in front (matches Design System layering).
- Camera: `setBounds(worldSize)`, `startFollow(player)`, deadzone; zoom per breakpoint.
- Collisions: build static bodies from Tiled `collision`; arcade overlap for interaction `zones`.
- Left/right walk: play `walk-side` with `flipX`.
- Network: the net layer creates/updates/removes avatar containers from Colyseus state patches (positions never go through React).
- Performance mode: cap visible animated avatars, drop ambient particles, disable backdrop blur, simplify tags.

## 27. Tiled Map Recommendations

- Tile size **32**, map **72×48** (= 2304×1536 world).
- Layers as in §4 (`collision`, `spawn`, `zones`, `decor_anchors`, optional image layers).
- Use **object names/types** as the stable contract with code (`host_spot`, `photo_spot`, `cake`, `stage`, `spawn`).
- Keep polygons simple (few points) for cheap physics.
- Export `room.tmj` (JSON); commit the `.tiled-project` for editing.

## 28. Atlas Packing Recommendations

- Tool: **TexturePacker** (or free `free-tex-packer`); commit `.tps` projects.
- Format: **Phaser 3 / JSON (Hash)**; `trim` on; `extrude`/padding **2px**; allow rotation **off** (simpler for flip logic).
- Separate atlases: `avatars-*` (multipack, page cap 2048), `host`, `room-props` (decor + cake + lights), `fx`.
- Power-of-two pages preferred; never mix pixel scales within an atlas.

## 29. What Assets Are Needed NOW vs LATER

### Needed NOW (to unblock M0 foundations → M1 landing → M2 room)
- **Fonts:** Press Start 2P, Pixelify Sans, Nunito (woff2).
- **Landing:** cloud sprites (3) + star sprites; wordmark via CSS.
- **Room:** `room-wall.png` + `room-floor.png` (+ `room-sky`), `room.tmj` with `collision`/`spawn`/`zones`/`host_spot`.
- **Host:** `birthday-girl` `idle` (front) — minimum to place her at the cake.
- **Avatars:** a **small starter set (~6–10)** with `idle-down` + `walk-*` so multiplayer movement is testable.
- **Cake:** `cake idle` (flicker).
- **FX:** sparkle + a few confetti pieces.
- **Audio:** `lofi-birthday` loop.

### Needed LATER (polish milestones)
- Full **50–60 avatar roster** with complete `walk`/`dance` frames.
- Host `wave` + `celebrate` (+ optional `blow-candles`), optional directional walk.
- Cake `candles-out` + `cut` full sequence + confetti system.
- Full **SFX set**, ambient garden bed.
- Animated decor (balloons sway, lanterns flicker, fountain, petals), neon glow pulse.
- Photo-mode frame, minimap art, optional custom pixel icon set, mobile bg variant.

---

*End of Asset Bible v1.0 — pairs with DESIGN_SYSTEM.md. Lock dimensions, avatar count, and the "how do we generate non-idle frames" question (§Open) before producing art in earnest.*
