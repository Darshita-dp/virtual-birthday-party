# Design System
## Darshita's Virtual Birthday — Global Visual Language

**Status:** Draft v1.0 (design system only — no code)
**Companion docs:** [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [ASSET_BIBLE.md](ASSET_BIBLE.md)
**Source of truth:** the attached pixel references (room background, UI mockup, landing page, birthday-girl sprite, pixel guest sheet). Pixel-only v1; the anime sheet is excluded. **No new aesthetic may be invented.**

> All tokens below are written to be implemented later as **CSS custom properties** (`--c-*`, `--space-*`, etc.) in a single `tokens.css` and mirrored in a Phaser theme constants file. Hex values are derived from the references; any flagged in §Open Questions need a pixel-eyedropper confirmation pass before lock.

---

## 1. Visual Identity Summary

A **dreamy nighttime pixel-art garden conservatory** lit by fairy lights, candles, and a pink neon sign, rendered in a **purple / lavender / pink** palette. Two visual registers coexist:

- **In-world (Phaser canvas):** detailed cozy pixel art (Stardew-Valley-adjacent), warm glows against a deep purple night.
- **HUD (React DOM over the canvas):** soft, rounded, semi-transparent deep-purple "glass" panels with gentle glow, pixel-flavored headings, and **clean readable sans body text** (as seen in the mockup's chat/wishes — those are *not* pixel font).

The brand feeling, translated to concrete rules: **magical** = layered glows + twinkle animations; **cozy** = rounded corners + warm light pools + generous spacing; **social** = presence-forward UI (counters, name tags, bubbles); **birthday** = pink/gold celebratory accents + cake/confetti motifs.

---

## 2. Mood & Art Direction

| Mood word | Concrete implementation |
|---|---|
| Dreamy | Deep purple gradient sky, parallax stars, soft bloom/glow on all light sources, low overall brightness with bright accent pools |
| Cozy | `border-radius` 12–20px on panels, warm candle glows (`#FFE2A0`), no harsh edges, comfortable padding (16–24px) |
| Magical | Twinkling stars/fairy lights (opacity pulse), floating clouds/balloons, sparkle particles, neon glow on the sign |
| Social | Persistent online counter, floating name tags, speech bubbles, emote/dance feedback |
| Birthday | Pink→purple gradient CTAs, gold "DARSHITA'S" wordmark, cake centerpiece, confetti on the cake moment |
| Calm / not-a-game | Slow easing (200–300ms), no aggressive flashes, no score/timer chrome, muted ambient motion |

**Rendering law:** everything in-canvas is **pixel art** at integer scale with `pixelArt: true` / `image-rendering: pixelated`. HUD is vector/CSS (crisp at any DPI) — we never pixelate text or panels.

---

## 3. Color Palette (hex)

### 3.1 Night / background
| Token | Hex | Use |
|---|---|---|
| `--c-night-950` | `#14092B` | Deepest backdrop, landing outer sky, modal overlay base |
| `--c-night-900` | `#1B0F38` | App background behind the canvas |
| `--c-night-800` | `#241544` | Panel base color (before opacity) |
| `--c-night-700` | `#2E1A55` | Raised surfaces, input fields |
| `--c-night-600` | `#3A2168` | Inner cards, hover surfaces |

### 3.2 Brand purple / lavender
| Token | Hex | Use |
|---|---|---|
| `--c-purple-700` | `#5A3DA6` | Pressed/active purple, borders |
| `--c-purple-600` | `#6E4FC2` | **Primary brand purple** |
| `--c-purple-500` | `#8A66E0` | Interactive purple, gradient end |
| `--c-lavender-400` | `#A98CE8` | Secondary text accents, glows |
| `--c-lavender-300` | `#C6B2F2` | Soft highlights, secondary buttons |
| `--c-lavender-200` | `#DED2F8` | Lightest lavender, subtle fills |

### 3.3 Pink (accent / birthday)
| Token | Hex | Use |
|---|---|---|
| `--c-pink-600` | `#E85A9B` | Neon sign core, strong accent |
| `--c-pink-500` | `#F77AB0` | CTA gradient start, links |
| `--c-pink-400` | `#FF9DC8` | Soft pink button face (Accept) |
| `--c-pink-300` | `#FFC2DD` | Pink tint, hearts |

### 3.4 Gold / warm (highlights, light)
| Token | Hex | Use |
|---|---|---|
| `--c-gold-500` | `#F4C95B` | "DARSHITA'S" wordmark core, stars |
| `--c-gold-400` | `#F9DA86` | Gold text, candle highlight |
| `--c-gold-300` | `#FDEBB4` | Light gold sparkle |
| `--c-warm-glow` | `#FFE2A0` | Candle / fairy-light / lantern glow |

### 3.5 Blue (secondary — windows, gown, night accents)
| Token | Hex | Use |
|---|---|---|
| `--c-blue-500` | `#6FA3E0` | Window glass, gown stripe |
| `--c-blue-400` | `#93BEEC` | Cool highlight |
| `--c-blue-300` | `#B8D6F4` | Lightest blue, ice sparkle |

### 3.6 Surfaces / functional
| Token | Value | Use |
|---|---|---|
| `--c-panel` | `rgba(36, 21, 68, 0.86)` | Standard glass panel fill (#241544 @ 86%) |
| `--c-panel-solid` | `#2A1850` | Opaque fallback (mobile / reduced-transparency) |
| `--c-panel-inner` | `rgba(58, 33, 104, 0.50)` | Inner cards (wish cards, chat rows) |
| `--c-input` | `#241A40` | Text input background |
| `--c-border` | `#6A55A8` | Panel/button border (1–2px) |
| `--c-border-soft` | `rgba(168,140,232,0.35)` | Subtle dividers, inner strokes |
| `--c-overlay` | `rgba(10, 5, 24, 0.60)` | Modal backdrop scrim |

### 3.7 Text
| Token | Hex | Use |
|---|---|---|
| `--c-text` | `#F4EEFF` | Primary text on dark panels |
| `--c-text-2` | `#CBBEE8` | Secondary text (meta, authors) |
| `--c-text-muted` | `#9A8BC0` | Placeholder, disabled, timestamps |
| `--c-text-on-accent` | `#5C2247` | Dark plum text on pink buttons (matches mockup) |
| `--c-text-gold` | `#F9DA86` | Gold display text |
| `--c-text-neon` | `#FF8FC6` | Neon pink display text |

### 3.8 Status / utility
| Token | Hex | Use |
|---|---|---|
| `--c-online` | `#5FE093` | Online green dot |
| `--c-online-glow` | `rgba(95,224,147,0.55)` | Online dot glow/pulse |
| `--c-heart-pink` | `#FF8FC6` | Pink heart emote |
| `--c-heart-purple` | `#C9A6FF` | Purple heart emote (mockup bubbles) |
| `--c-danger` | `#FF7A8A` | Errors, rate-limit, moderation |

### 3.9 Gradients
| Token | Definition | Use |
|---|---|---|
| `--grad-cta` | `linear-gradient(180deg, #FF9DC8 0%, #C49BF0 100%)` | Accept / Send a Wish / Cut Cake faces |
| `--grad-cta-strong` | `linear-gradient(135deg, #F77AB0 0%, #8A66E0 100%)` | Cut Cake (glowing CTA) |
| `--grad-secondary` | `linear-gradient(180deg, #CBB6F2 0%, #A98CE8 100%)` | "Already Accepted" / secondary buttons |
| `--grad-hero-gold` | `linear-gradient(180deg, #FDEBB4 0%, #F4C95B 100%)` | "DARSHITA'S" wordmark |
| `--grad-sky` | `radial-gradient(120% 100% at 50% 0%, #2E1A55 0%, #1B0F38 60%, #14092B 100%)` | Landing / app sky |

---

## 4. Typography

The references use a **dual-track** system (confirmed by the mockup: pixel display + smooth sans body). We codify it:

- **Track A — Pixel display** (flavor): headlines, wordmark, section chips, counters. Crisp, retro, never used for paragraphs.
- **Track B — Readable sans** (legibility): chat, wishes, descriptions, inputs, any text > ~12 words.

### 4.1 Font recommendations (Google Fonts, free, self-hostable)
| Role | Font | Notes |
|---|---|---|
| Hero / wordmark | **Press Start 2P** | Matches "DARSHITA'S VIRTUAL BIRTHDAY". Use only at large sizes (≥16px); render only at integer multiples to stay crisp. |
| Pixel headings / chips / counters | **Pixelify Sans** (primary) or **Silkscreen** (all-caps chips) | Readable pixel face for "You are cordially invited", panel titles, "Online: 58". |
| UI body / chat / wishes / inputs | **Nunito** (primary) — fallback **Quicksand** | Warm, rounded, highly legible; matches the smooth body text in the mockup. |
| Numeric emphasis | Nunito (700/800) | Online counter big number. |

**Loading rule:** self-host via `next/font` (no layout shift); preload Press Start 2P + Pixelify Sans + Nunito (400/600/700/800). Pixel fonts get `-webkit-font-smoothing: none` where supported; sans gets antialiasing.

### 4.2 Type scale (px → rem at 16px root)
| Step | Size | Line-height | Track | Example |
|---|---|---|---|---|
| `display` | 48 (40 mobile) | 1.1 | A pixel | Landing title |
| `h1` | 24 | 1.2 | A pixel | "Birthday Wishes" header (pixel) OR 20 |
| `h2` | 18 | 1.25 | A/B | Panel titles |
| `body-lg` | 16 | 1.5 | B sans | Wish body |
| `body` | 14 | 1.5 | B sans | Chat messages |
| `meta` | 13 | 1.4 | B sans | "– Ananya", timestamps |
| `chip` | 12 | 1.2 | A pixel | "All / Nearby" tabs, invite chip |
| `nametag` | 11 | 1.1 | B sans | Avatar name tags (legibility first) |

**Pixel-font sizing law:** Track A only at integer px that keep the glyph grid crisp (12, 16, 24, 32, 48). Never scale pixel text with fractional transforms.

---

## 5. Spacing System

4px base unit. Tokens: `--space-1:4` `--space-2:8` `--space-3:12` `--space-4:16` `--space-5:24` `--space-6:32` `--space-7:48` `--space-8:64`.

- Panel inner padding: `--space-4` (16) mobile, `--space-5` (24) desktop.
- Gap between toolbar buttons: `--space-3` (12).
- Gap between wish/chat cards: `--space-3` (12).
- Section gaps inside modal: `--space-5`/`--space-6`.

---

## 6. Border Radius System

Cozy = rounded. Tokens:
| Token | px | Use |
|---|---|---|
| `--radius-sm` | 8 | Chips, tags, small inputs |
| `--radius-md` | 12 | Buttons, chat rows, wish cards |
| `--radius-lg` | 16 | Standard panels |
| `--radius-xl` | 20 | Modal / large panels |
| `--radius-pill` | 999 | CTAs (Cut Cake, Send a Wish, Accept), tab toggles, online pill |

---

## 7. Button Styles

Cozy "chunky" buttons with a soft 3D lip (visible on the landing Accept button — darker bottom edge) and glow on primary CTAs.

| Variant | Face | Text | Border / lip | Glow | Use |
|---|---|---|---|---|---|
| **Primary CTA** | `--grad-cta` | `--c-text-on-accent` (#5C2247) | 2px darker pink bottom lip | `--glow-pink` on hover | Accept, Send a Wish |
| **Hero CTA (cake)** | `--grad-cta-strong` | `#FFFFFF` | subtle | persistent `--glow-pink` | Cut Cake (host) |
| **Secondary** | `--grad-secondary` | `--c-text-on-accent` | lavender lip | none → soft on hover | Already Accepted |
| **Toolbar** | `--c-panel` | `--c-text` | 1px `--c-border` | soft on hover | Wishes/Emotes/Dance/Photo/Map |
| **Icon** | `--c-panel` | icon | 1px `--c-border` | soft on hover | sound, fullscreen, settings, send |
| **Ghost/text** | transparent | `--c-text-2` | none | none | close X, minor links |

**States (all variants):**
- *Default* → base.
- *Hover* → translateY(-1px), brighten face ~6%, add glow (120ms).
- *Active/press* → translateY(+1px), remove lip (button "depresses"), 80ms.
- *Focus-visible* → 2px `--c-lavender-300` outline offset 2px (keyboard a11y).
- *Disabled* → desaturate ~60%, opacity 0.5, no glow, `cursor:not-allowed`.
- *Loading* → spinner replaces label; keep width.

Min tap target 44×44px. Label = sentence/Title case + emoji where the mockup shows one.

---

## 8. Panel Styles ("glass")

- Fill `--c-panel` (translucent deep purple), 1px `--c-border`, `--radius-lg`/`--radius-xl`.
- Outer shadow `--shadow-panel`; optional inner top highlight `inset 0 1px 0 rgba(255,255,255,0.06)`.
- Header row: title (pixel or sans h2) + optional emoji + optional close X; `--space-4` padding.
- Body scrolls with a custom thin lavender scrollbar (track `--c-night-700`, thumb `--c-lavender-400`).
- **Reduced-transparency / mobile fallback:** swap `--c-panel` → `--c-panel-solid` for performance + contrast.
- Backdrop blur: `backdrop-filter: blur(8px)` on desktop only (perf-gated; off in performance mode).

---

## 9. Modal / Popup Styles

Per the landing card:
- Centered panel, max-width ~640px, `--radius-xl`, `--space-6` padding.
- Backdrop `--c-overlay` over the starry sky (sky still animates faintly behind).
- Star accents (✦/★) above title; gold + pink wordmark; lavender subtitle; CTAs row.
- **Entrance:** fade (0→1) + scale (0.96→1) + 4px float-up, 220ms ease-out.
- **Exit:** reverse, 160ms ease-in.
- One primary + one secondary action max in a row; stack on mobile.
- Dismiss: X, backdrop click (non-critical modals), Esc.

---

## 10. Chat Style

- **Panel (preview + full):** dark glass; rows = small round avatar + name (`--c-text`) + message (`--c-text-2`, sans `body`). Row radius `--radius-md`, hover tint `--c-night-600`.
- **Tabs:** "All / Nearby" pill toggle; active = filled `--c-purple-600` + `--c-text`; inactive = ghost + `--c-text-muted`. (Track A pixel `chip` size.)
- **Input bar:** rounded `--radius-pill` field (`--c-input`), placeholder `--c-text-muted` ("Type a message…"), emoji button (ghost), send button (icon, `--grad-cta-strong` face).
- **In-world speech bubbles (Phaser):** near-white fill (`#FBF7FF`), `--c-text-on-accent`-dark text, `--radius-md`, small downward tail, max-width ~160px, drop shadow `--shadow-sm`. Appear above avatar head, **auto-fade after 4s** (fade 300ms). Stack/replace if rapid. Emoji inline supported. Bubbles are a Phaser layer, not DOM.
- Rate-limit feedback: subtle `--c-danger` shake + "slow down" toast.

---

## 11. Wishes Panel Style

Per mockup right dock:
- Header "Birthday Wishes 💌" (h2) + close X.
- Scrollable list of **wish cards**: `--c-panel-inner` fill, `--radius-md`, `--space-4` padding, `--space-3` gap. Body = sans `body-lg` `--c-text`; author line "– Name" = `meta` `--c-text-2`/`--c-pink-300`.
- Newest first; gentle slide+fade-in when a new wish arrives live (Supabase Realtime).
- Pinned bottom: **"+ Send a Wish"** primary CTA (`--grad-cta`, pill, full width of panel).
- Compose: opens a modal/inline field (textarea sans, char counter, Send). Optimistic insert on submit.

---

## 12. Music Player Style

Bottom-right small glass panel:
- Header "♪ Music" (`meta`/chip).
- Track row: title "Lo-fi Birthday" (`body` `--c-text`) + chevron (track switch).
- Progress bar: track `--c-night-700`, fill `--grad-cta`, round knob `--c-lavender-200`; height 4px; knob 10px.
- Transport: prev / play-pause / next icon buttons (icon variant). Play-pause is primary emphasis.
- Mute reflects the top-bar sound toggle (shared `music` state). Compact/collapsible on mobile (becomes a single floating note button that expands).

---

## 13. Emote Button Style

- Toolbar **Emotes** button opens an **emote popover/wheel** anchored above it.
- Emote items: rounded-square buttons (`--radius-md`, `--c-panel-inner`), emoji centered (🎉 💜 ❤️ ✨ 😊 …), grid 4-wide, hover glow + scale 1.06.
- Triggering an emote: floats the emoji up from the player's avatar (Phaser FX): rise ~40px + fade over 1.2s, slight horizontal drift. Visible to nearby guests.
- Rate-limited (token bucket); disabled state during cooldown.

---

## 14. Online Counter Style

Two placements from the mockup:
- **Top-left inline:** green dot (`--c-online`, soft pulsing `--c-online-glow`) + "Online: 58" (`chip`). Dot pulse = opacity 0.6→1 over 1.6s (paused under reduced-motion → static).
- **Top-right card:** 👥 icon + big number (Nunito 800, `h1`) + "Guests Online" label (`meta` `--c-text-2`), in a glass pill/card.
- Number animates by counting up/down on change (150ms). Per-instance count; tooltip shows global total when sharded.

---

## 15. Name Tag Style (in-world)

- Small label anchored above each avatar's head (Phaser layer).
- Fill: `rgba(20,9,43,0.55)` pill (`--radius-pill`), `--space-1` vertical / `--space-2` horizontal padding.
- Text: sans `nametag` (11px), `--c-text`, 1px dark text-shadow for legibility over any background.
- **Host tag:** gold text (`--c-text-gold`) + 👑 prefix + faint `--glow-gold`.
- LOD: tags fade out beyond a camera distance / when zoomed out / in performance mode to reduce clutter at 150 guests; always show own + hovered.

---

## 16. Tooltip Style

- Small dark glass (`--c-panel-solid`), `--radius-sm`, `--space-2` padding, `meta` text, max-width 220px.
- Appears on hover/focus of icon buttons after 400ms; 8px offset; optional caret.
- Keyboard-accessible (shows on focus). Never used for essential info (a11y).

---

## 17. Shadow & Glow System

**Shadows (elevation, purple-tinted):**
| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(10,5,24,0.4)` |
| `--shadow-panel` | `0 8px 24px rgba(10,5,24,0.45)` |
| `--shadow-modal` | `0 16px 48px rgba(10,5,24,0.6)` |

**Glows (accent light):**
| Token | Value | Use |
|---|---|---|
| `--glow-pink` | `0 0 12px rgba(255,120,180,0.55)` | CTAs, neon sign |
| `--glow-purple` | `0 0 14px rgba(138,102,224,0.5)` | Active purple elements |
| `--glow-gold` | `0 0 10px rgba(255,226,160,0.6)` | Candles, gold text, host tag |
| `--glow-soft` | `0 0 20px rgba(168,140,232,0.35)` | Ambient panel/hover halo |

**In-canvas glow** (candles, fairy lights, neon, cake) uses additive soft radial sprites / Phaser bloom-like overlays, NOT CSS box-shadow. Keep glow color-matched to the source.

---

## 18. Animation Rules

Cozy = gentle and slow. Global tiers:
| Tier | Duration | Easing | Examples |
|---|---|---|---|
| Micro | 80–150ms | ease-out | button hover/press, toggle |
| Standard | 200–300ms | ease-out (in), ease-in (out) | panel/modal open-close, bubble fade |
| Ambient loop | 1.6–6s | ease-in-out, infinite | star twinkle, fairy-light pulse, cloud/balloon float, candle flicker, online-dot pulse, avatar idle bob |
| Celebration | 1–2.5s | custom | cake-cut confetti burst, emote rise |

Rules:
- Avatar **idle bob**: 1–2px vertical, ~1.8s loop, randomized phase per avatar (avoid synchronized "breathing crowd").
- Walk: step animation tied to movement; stop → return to idle.
- Twinkle/flicker via opacity, not position, for lights.
- **No flashing > 3Hz** (photosensitivity).
- Particle counts capped and scaled down in performance mode / mobile.

## 19. Transition Rules

- **Route landing → room:** fade-to-deep-purple curtain (250ms) → Phaser preloader → fade-in room (350ms). Music continues across.
- Panel toggle: fade+scale (220ms). Drawer (mobile): slide from edge (240ms).
- Speech bubble: pop-in (scale 0.9→1, 140ms) / fade-out (300ms).
- Avatar join/leave: spawn fade-in + tiny scale pop; leave fade-out (so the crowd never "blinks").
- All transitions respect `prefers-reduced-motion` (see §24).

## 20. Lighting Rules

The scene is **night**; light is the storytelling tool.
- Baseline scene brightness is **dim**; readability comes from **accent light pools** (candles, fairy lights, lanterns, neon, moon).
- Each light source = warm core (`--c-warm-glow`/pink/gold) + soft falloff halo.
- Add a subtle **vignette** (darker edges) to focus attention on the open center + cake.
- Avatars sit on the floor with a **soft contact shadow** (small dark ellipse) to ground them.
- Neon sign casts a faint pink wash on nearby geometry.
- Never flat-light the whole room to daytime brightness (breaks the mood — see §25).

## 21. Decoration Rules

- Decor **frames the perimeter**, never the center: gifts/balloons/chalkboard left; floral arch/piano/bench right; plants, lanterns, candles around edges (matches the room reference).
- Maintain rough **left/right visual balance** of mass.
- **Depth layering (render order):** sky → back wall (windows/neon/hanging lights) → mid decor (plants, arch, piano, gifts) → stage+cake → floor → contact shadows → avatars (y-sorted) → in-world FX (emotes/confetti/bubbles) → HUD.
- Animated decor is sparse and ambient: fairy-light twinkle, balloon sway, candle flicker, fountain ripple, drifting petals. Everything else is static baked art.
- Petals/sparkles on the floor are decorative only (no collision, low opacity, must not reduce floor readability).

## 22. Rules for Maintaining Open Walkable Space

This is load-bearing for 150 guests:
- The **center must stay a large open floor** (the heart-shaped clearing in the reference). Target: ≥ 55–60% of the room's floor area walkable.
- **All decoration is collision-bound to the perimeter.** No solid props inside the central clearing.
- Reserve a clear **spawn band** near the bottom/entrance (walkable, no decor) so arrivals don't stack on props.
- Keep an unobstructed **sightline + path to the cake/stage** (the social focal point).
- Plan for crowd density: at 150 avatars the clearing should not feel jammed — size the world so avatars have ~1.5–2 avatar-widths of breathing room at expected peak (see ASSET_BIBLE world dimensions).
- Host stands at a **fixed stage spot** (non-walkable island) so she's always findable near the cake.

## 23. Responsive Layout Rules

Breakpoints: **mobile < 640px**, **tablet 640–1024px**, **desktop > 1024px**.

- The **Phaser canvas always fills the viewport**; the HUD is an overlay that re-flows. The world is the same; only camera zoom + HUD layout change.
- HUD uses safe-area insets (notches) and a max content width; never let panels cover > ~40% width on desktop.
- Panels are **docked** on desktop, **collapsible** on tablet, **drawer/sheet toggles** on mobile.
- Touch targets ≥ 44px; pointer hover affordances must have tap equivalents.

### Desktop ( >1024 )
- Full HUD as in the mockup: top bars, left toolbar (icon+label), docked chat (bottom-left) + wishes (right), music (bottom-right), Cut Cake (bottom-center).
- Camera zoom shows a generous slice of the room.

### Tablet ( 640–1024 )
- Toolbar collapses labels → icons only. Wishes/chat become toggleable side panels (one open at a time). Music compacts.
- Slightly tighter camera zoom; panels semi-transparent so the room stays visible.

### Mobile ( <640 )
- HUD reduces to: top bar (title + count + settings), a **bottom action dock** (Chat, Wishes, Emotes, Photo, Map as icons), and a floating music button.
- Panels open as **bottom sheets / full-screen drawers**, one at a time.
- Movement: **tap-to-move** primary; optional on-screen joystick toggle. No reliance on keyboard.
- Camera zooms in (fewer avatars on screen) to protect performance; name-tag LOD more aggressive.
- Cut Cake (host) is a prominent bottom button.

## 24. Accessibility Rules

- **Contrast:** body/meta text on panels must meet ≥ 4.5:1 (large/display ≥ 3:1). `--c-text` on `--c-panel` passes; verify `--c-text-muted` only for non-essential text.
- **Never rely on color alone:** online = dot **+** "Online" label; host = gold **+** 👑; errors = color **+** icon **+** text.
- **Keyboard:** all HUD actions reachable/operable by keyboard; visible `focus-visible` rings (`--c-lavender-300`); logical tab order; Esc closes modals/sheets.
- **Reduced motion** (`prefers-reduced-motion: reduce`): disable ambient loops, parallax, float, twinkle, count-up, confetti motion (show a static celebratory state instead). Keep essential feedback (button press) minimal.
- **Readable text:** long content (chat, wishes) uses **sans** (Track B), never pixel font. Pixel font reserved for short display strings.
- **Scalable:** rem-based sizing respects browser font scaling; layout must not break at 200% text zoom.
- **Labels:** every icon button has an accessible name (aria-label/tooltip); emoji-only buttons include text labels for SR.
- **Audio:** music never autoplays before user gesture (matches "music unlocks on first click"); provide mute; no audio-only critical info.
- **Tap targets:** ≥ 44×44px everywhere.

## 25. What NOT To Do Visually

- ❌ No bright/white **daytime** backgrounds or flat full-scene lighting — the venue is a dreamy **night**.
- ❌ No **anime** sprites in v1 (rejected style). Keep one pixel art register.
- ❌ No **non-palette** colors (e.g. saturated neon green/orange UI). Stay purple/lavender/pink + gold/blue accents.
- ❌ No **sharp/square** UI corners — everything is rounded (cozy).
- ❌ No **flat, glow-less** panels/CTAs — soft glow + depth are part of the identity.
- ❌ Don't **pixelate** HUD text/panels, and don't **antialias/scale** sprites with fractional transforms (keep integer pixel scale).
- ❌ Don't put **collision props or decor in the walkable center** (breaks crowd movement).
- ❌ Don't use **pixel font for paragraphs** (chat/wishes) — illegible.
- ❌ Don't **mix pixel resolutions/scales** between assets (one consistent pixel grid).
- ❌ No **harsh drop shadows** on sprites (use soft contact ellipse only); no realistic photos; no gradients that read as "corporate SaaS."
- ❌ No **fast flashing** (>3Hz) or strobing celebration effects.
- ❌ Don't let panels **cover the cake/host** focal area on desktop.

---

*End of Design System v1.0 — pairs with ASSET_BIBLE.md. Confirm flagged hex values + font picks before tokenizing in M0.*
