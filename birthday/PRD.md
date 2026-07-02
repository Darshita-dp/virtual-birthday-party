# Product Requirements Document (PRD)
## Darshita's Virtual Birthday — A Multiplayer Pixel-Art Birthday Venue

**Document owner:** Product
**Status:** Draft v1.0 (for review)
**Last updated:** 2026-06-29
**Visual source of truth:** Attached reference images (pixel sprite sheet + purple-night-garden room screenshot + landing invitation + birthday-girl character). The **pixel** art style is canonical. The attached *anime* sprite sheet is a rejected alternate, retained only as a possible future theme.

---

## 0. Document Conventions & Scope Guardrails

- This is **one product, built incrementally**. Each milestone ships on top of the previous one without rebuilds.
- The attached images define the visual language. **No new aesthetic may be invented.**
- Priorities use **MoSCoW**: **M**ust / **S**hould / **C**ould / **W**on't (this release).
- "Room" = the single shared birthday venue. "Instance" = one synchronized copy of the room when sharding is needed for scale.
- Open assumptions are tracked in §11 and require your sign-off before the relevant milestone starts.

---

## 1. Product Vision

**Vision statement**
A magical, cozy, pixel-art birthday venue that lets friends and family from anywhere in the world walk into the same dreamy garden under a purple night sky, gather around Darshita's cake, and celebrate together in real time — the warmth of a house party, delivered through a link.

**The problem we're solving**
Birthdays are increasingly celebrated across distance. Video calls are flat, transactional, and capped at "who's talking." Group chats lack presence and atmosphere. There is no shared *place* that feels like a party — somewhere you arrive, see who else is there, move around, and leave a mark.

**Our answer**
A persistent, beautiful, low-friction **social venue** (not a game) where:
- Arrival is effortless (a link, a name, a click — no install, no account required).
- Presence is felt (you see real people moving, chatting, reacting in the same space).
- The celebration has a heartbeat (a shared cake-cutting moment, ambient music, a wall of wishes that lasts).
- The space is unmistakably *hers* — themed, named, and warm.

**What this is NOT**
- Not a game (no scoring, levels, win/lose, combat, or skill challenges).
- Not a metaverse platform (one venue, one occasion; not a world-builder).
- Not a video-conferencing tool (no mandatory camera/mic; presence is avatar-first).

**Design pillars**
1. **Cozy over flashy** — soft, dreamy, warm; the pixel night-garden mood is sacred.
2. **Presence over features** — feeling other people there beats any single feature.
3. **Zero-friction joy** — from link to "I'm in the party" in under 15 seconds.
4. **A celebration with a center** — everything orients around Darshita and the cake.
5. **Leaves a keepsake** — the wishes wall and photos outlive the live event.

**Success metrics (proposed)**

| Goal | Metric | Target (event-day) |
|---|---|---|
| Frictionless entry | Landing → Room conversion | ≥ 85% of link-openers enter the room |
| Presence works | Median concurrent guests during peak hour | meaningful crowd (dozens) |
| Engagement | % of entrants who perform ≥1 interaction (chat/emote/wish/dance) | ≥ 70% |
| Keepsake value | Total wishes submitted | ≥ 1 per 2 guests |
| Stability | Realtime uptime during event window | ≥ 99.9% |
| Performance | First Interaction (link → controllable avatar) | < 15s on average mobile |

---

## 2. Personas

- **The Birthday Girl (Darshita / Host).** Wants to feel celebrated, see who came, be the visual center, and keep the wishes/photos afterward. May want light host controls (e.g., trigger the cake-cutting).
- **The Close Friend (active guest).** Will chat, emote, dance, leave a heartfelt wish, take a photo. Power user of interactions.
- **The Distant Relative (casual guest).** Lower tech comfort. Needs an obvious path: open link → type name → see the party → leave a wish. Must never feel lost.
- **The Drop-in (lurker).** Pops in from a shared link, looks around, maybe reacts. Should get value with zero learning curve.
- **The Organizer (you/admin).** Sets up the event, configures name/date/theme, moderates if needed, monitors load.

---

## 3. User Journey

### 3.1 Happy path (guest)
1. **Receives invitation link** (WhatsApp/iMessage/email). Link is the entire onboarding.
2. **Landing / Invitation screen** (ref: invitation modal). Sees "You are cordially invited — DARSHITA'S VIRTUAL BIRTHDAY — a cozy pixel party · June 15, 2026," starry purple sky, pixel clouds. Two actions: **Accept** and **Already Accepted**. Note: *"music unlocks on your first click."*
3. **First click** satisfies the browser autoplay gate → ambient music begins; guest proceeds.
4. **Quick identity step** — enter a display name and pick an avatar (from the pixel sprite roster). Lightweight, optional sign-in; no hard account.
5. **Enters the room** — a brief load, then a fade-in to the purple night garden. Their avatar spawns near the entrance/crowd.
6. **Orients** — sees the "Happy Birthday Darshita" neon stage, the tiered cake, the birthday girl, gifts, balloon arch, fountain, other guests with name tags and speech bubbles.
7. **Moves** — walks around (click-to-move and/or WASD), scrolls/pans the scrollable room.
8. **Interacts** — chats (All/Nearby), sends emotes 🎉, dances 🎵, takes a photo 📷, opens the Map 📍.
9. **Leaves a wish** — opens Wishes 💌, writes a message, submits; it appears in the persistent Birthday Wishes panel attributed to their name.
10. **Shared moment** — the **Cut Cake 🎂** moment plays (confetti, animation, music swell) as a collective highlight.
11. **Leaves** — closes the tab. Their presence disappears for others; their wish/photo persists.

### 3.2 Host journey
- Opens the same link, recognized/branded as host; appears as the **birthday girl** avatar near the cake (sash + party hat per reference).
- (Optional) Can trigger the cake-cutting moment and read the wishes wall live.

### 3.3 Edge journeys
- **Returning guest** chooses "Already Accepted," restores their name/avatar, re-enters.
- **Capacity reached** → routed to another **instance** of the same room (identical scene) so they still get the party.
- **Low-end device / poor network** → graceful degraded mode (reduced avatar count rendered, lower animation, but chat + wishes still work).
- **Mobile guest** → touch controls, responsive panels (collapsible sidebars).

---

## 4. Features

Grouped and prioritized. (See §5 for testable requirements.)

### 4.1 Entry & Identity
- **F1. Invitation landing page** *(Must)* — themed modal, event name/date, Accept / Already Accepted, autoplay-unlock-on-click.
- **F2. Display name + avatar selection** *(Must)* — pick from the pixel roster (incl. costume variants: cat-ears, panda, dino, astronaut, fairy, etc. per sprite sheet).
- **F3. Lightweight session identity** *(Must)* — persisted locally so returning guests keep their name/avatar; no mandatory account.

### 4.2 The Room (rendering & navigation)
- **F4. Pixel-art birthday garden scene** *(Must)* — purple night sky, neon "Happy Birthday Darshita" stage, tiered cake, gifts, balloon arch, fountain, lanterns, flowers, fairy lights, moon, sofa — matching the reference exactly.
- **F5. Scrollable / pannable room** *(Must)* — camera follows the player's avatar; room larger than viewport.
- **F6. Birthday girl centerpiece** *(Must)* — the host avatar (gown + sash + hat) stands near the cake.
- **F7. Avatar movement** *(Must)* — click-to-move and/or keyboard; smooth, collision-aware around props.
- **F8. Minimap / Map** *(Should)* — the 📍 Map control; overview + quick navigation.

### 4.3 Presence & Multiplayer
- **F9. Real-time presence** *(Must)* — see other guests' avatars, names, positions, movement in real time.
- **F10. Online counter** *(Must)* — "Guests Online: N" (top bar + top-right), live.
- **F11. Spatial awareness** *(Should)* — "Nearby" is computed from in-room proximity.

### 4.4 Communication & Interaction
- **F12. Chat** *(Must)* — text chat with **All** and **Nearby** tabs; messages also surface as speech bubbles above avatars.
- **F13. Emotes / reactions** *(Must)* — 🎉 quick reactions and floating emotes (hearts, confetti) per reference bubbles.
- **F14. Dance** *(Should)* — 🎵 looping dance animation state for the avatar.
- **F15. Birthday Wishes wall** *(Must)* — persistent, scrollable list of wishes with author attribution; "+ Send a Wish."
- **F16. Photo mode** *(Should)* — 📷 capture a framed snapshot of the scene (with avatars) to download/share.

### 4.5 Atmosphere & Moments
- **F17. Ambient music player** *(Must)* — "Lo-fi Birthday" track; play/pause, next/prev, progress, mute; respects autoplay rules.
- **F18. Cut Cake moment** *(Must)* — central celebratory event (confetti, animation, music swell); shared/synchronized feel.
- **F19. Sound effects & ambient detail** *(Could)* — subtle SFX for emotes, joins, cake.

### 4.6 Settings & System
- **F20. Settings** *(Should)* — ⚙ audio volume, performance mode, name/avatar change, fullscreen.
- **F21. Fullscreen + sound toggles** *(Should)* — quick controls in the top bar.

### 4.7 Trust, Safety & Admin
- **F22. Content moderation for chat & wishes** *(Must)* — profanity filter + rate limiting; wishes optionally held for host approval.
- **F23. Admin/host controls** *(Should)* — trigger cake moment, hide/remove a message or guest, view load.
- **F24. Abuse protection** *(Must)* — rate limits, name filtering, spawn/spam protection.

---

## 5. Functional Requirements

Written as testable statements. IDs map to features above.

### Entry & Identity
- **FR-1.1** The system SHALL serve a landing page rendering event title, subtitle, and date from configuration.
- **FR-1.2** The landing page SHALL present "Accept" and "Already Accepted" actions.
- **FR-1.3** On the first user click anywhere, the system SHALL initialize the audio context and begin ambient music (autoplay-policy compliant).
- **FR-2.1** The system SHALL let a guest enter a display name (1–24 chars, filtered) before entering the room.
- **FR-2.2** The system SHALL let a guest select an avatar from the pixel roster; a default is assigned if skipped.
- **FR-3.1** The system SHALL persist the guest's name + avatar locally and restore them on return.

### Room & Navigation
- **FR-4.1** The room SHALL render all canonical props (stage/neon sign, tiered cake, gifts, balloon arch, fountain, lanterns, flowers, fairy lights, moon, sofa) consistent with the reference.
- **FR-5.1** The camera SHALL follow the player's avatar; the room SHALL be larger than the viewport and navigable by moving the avatar.
- **FR-6.1** The birthday-girl avatar SHALL be rendered at a fixed feature position near the cake.
- **FR-7.1** Avatar movement SHALL support click/tap-to-move; SHOULD support keyboard (WASD/arrows).
- **FR-7.2** Avatars SHALL not overlap solid props (basic collision).
- **FR-8.1** The Map control SHALL show a room overview and allow recentering the camera.

### Presence & Multiplayer
- **FR-9.1** When a guest joins/moves/leaves, all other connected clients SHALL reflect the change within a target latency budget (see NFR).
- **FR-9.2** Each remote avatar SHALL display its owner's name label.
- **FR-10.1** The online counter SHALL reflect the live count of connected guests in the instance.
- **FR-11.1** "Nearby" SHALL be defined as guests within a configurable radius of the player.

### Communication
- **FR-12.1** A guest SHALL send chat messages routed to **All** or **Nearby**; recipients receive them in near-real-time.
- **FR-12.2** A recent message SHALL appear as a transient speech bubble above the sender's avatar.
- **FR-12.3** The chat panel SHALL show a scrollable recent-messages list with author names.
- **FR-13.1** A guest SHALL trigger emotes that render as floating/animated effects visible to nearby guests.
- **FR-14.1** A guest SHALL toggle a dance state that loops an animation visible to others.
- **FR-15.1** A guest SHALL submit a wish (text, ≤ configurable length); it SHALL persist and display in the Wishes panel with author attribution.
- **FR-15.2** The Wishes panel SHALL be scrollable and ordered (newest or curated).
- **FR-15.3** (If moderation-hold enabled) a wish SHALL not display publicly until approved.
- **FR-16.1** Photo mode SHALL produce a downloadable image of the current framed scene including visible avatars.

### Atmosphere & Moments
- **FR-17.1** The music player SHALL support play/pause, next/prev, mute, and show progress.
- **FR-18.1** The Cut Cake action SHALL play a celebratory animation + audio; it SHOULD be broadcast so guests experience it together.
- **FR-18.2** (If host-gated) only the host/admin SHALL trigger the canonical cake moment; otherwise it is a personal/sharable effect.

### Settings, Safety, Admin
- **FR-20.1** Settings SHALL allow volume control, fullscreen, performance mode, and name/avatar change.
- **FR-22.1** Chat and wishes SHALL pass a profanity/abuse filter before broadcast/persist.
- **FR-22.2** The system SHALL rate-limit messages, emotes, and wishes per guest.
- **FR-23.1** An admin SHALL hide/remove a message or wish and remove/mute a guest.
- **FR-24.1** Display names SHALL be filtered for disallowed content.

---

## 6. Non-Functional Requirements

**Performance**
- **NFR-P1** Link → controllable avatar in < 15s on a mid-range mobile over typical mobile data.
- **NFR-P2** Sustained client frame rate ≥ 30 FPS (target 60 on desktop) with a full crowd in view.
- **NFR-P3** Movement/presence broadcast median latency target ≤ ~150 ms regional / ≤ ~300 ms cross-region.
- **NFR-P4** Initial asset payload minimized via sprite atlases, compression, lazy-loading, and CDN caching.

**Scalability**
- **NFR-S1** Support a large concurrent audience for a single event via **instance sharding** of the room when an instance exceeds a configured cap.
- **NFR-S2** Realtime layer SHALL scale horizontally; presence state SHALL be partitioned per instance.
- **NFR-S3** Interest management: a client SHALL only receive updates for guests relevant to its view/instance.

**Reliability & Availability**
- **NFR-R1** ≥ 99.9% realtime uptime during the event window; graceful reconnect with state resync on drop.
- **NFR-R2** Wishes (the keepsake) SHALL be durably persisted with backups; no data loss is acceptable.

**Usability & Accessibility**
- **NFR-U1** Fully responsive: desktop, tablet, mobile (collapsible panels, touch controls).
- **NFR-U2** No install, no plugin; runs in modern evergreen browsers.
- **NFR-U3** Reasonable accessibility: keyboard navigation for core UI, sufficient contrast for text panels, captions/labels on controls, reduced-motion option.
- **NFR-U4** Localization-ready copy (event is global); initial release in English.

**Security & Privacy**
- **NFR-SEC1** Minimal PII: display name only by default; no sensitive data required.
- **NFR-SEC2** All transport over TLS/WSS; server-authoritative validation of all client messages.
- **NFR-SEC3** Invite-link access control (unguessable token); optional passphrase.
- **NFR-SEC4** Privacy-respecting analytics; clear data-retention policy for wishes/photos.

**Maintainability & Quality**
- **NFR-M1** Modular architecture (rendering, realtime, persistence, UI) with clear seams so features add without rebuilds.
- **NFR-M2** Config-driven event details (name, date, theme, caps) — no code change to re-skin for another birthday.
- **NFR-M3** Art pipeline standardized (atlas format, sprite naming, tile sizes) so new assets drop in cleanly.

**Cost**
- **NFR-C1** Architecture SHALL favor managed/serverless realtime where it controls cost for a bursty, event-shaped traffic profile (quiet, then a sharp peak).

---

## 7. Technical Risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | **Realtime scaling under a sudden crowd** (a shared link can spike to hundreds at once) | High | High | Instance sharding with per-instance caps; load test before event; managed realtime that autoscales; interest management. |
| R2 | **Movement/presence cost** (broadcasting many avatars' positions is O(N²) naïvely) | High | Med | Tick-based delta updates, position interpolation client-side, area-of-interest filtering, capped broadcast rate. |
| R3 | **Browser autoplay blocking music** | Med | High | Gate audio on the first click (already designed into landing); explicit unmute control. |
| R4 | **Mobile performance** with many sprites/animations | High | Med | Performance mode (cap rendered avatars, simplify animations), sprite atlases, off-screen culling. |
| R5 | **Asset/art consistency drift** (new assets breaking the cozy pixel look) | Med | Med | Locked style guide from references; single atlas; art review gate; no AI-restyle without sign-off. |
| R6 | **Abuse / inappropriate content** in a public-link party | High | Med | Profanity filter, rate limits, name filtering, host moderation, optional wish approval. |
| R7 | **Cost blowups** from always-on servers for a one-evening event | Med | Med | Serverless/managed realtime; scale-to-zero when idle; teardown after event. |
| R8 | **State resync on reconnect** (flaky mobile networks) | Med | High | Snapshot-on-join, heartbeat, automatic reconnect with full state pull. |
| R9 | **Time-zone & "global" timing** (peak windows differ by region) | Low | Med | Persistent venue open before/after the moment; wishes wall covers async attendance. |
| R10 | **Single-event spike testing is hard to rehearse** | Med | Med | Synthetic load harness simulating N bots moving/chatting; dry run. |

---

## 8. Suggested Architecture

> Recommendation, not a mandate — chosen to fit a bursty, event-shaped, global, no-install product, and to add features incrementally without rebuilds. Final stack to be confirmed (see §11).

### 8.1 High-level shape
```
                 ┌──────────────────────────────────────────────┐
   Invite link → │  CLIENT (browser, no install)                │
                 │  • Landing/Invite UI                         │
                 │  • Room renderer (2D pixel engine)           │
                 │  • UI layer (chat, wishes, music, controls)  │
                 │  • Realtime client (WebSocket)               │
                 └───────────────┬──────────────────────────────┘
                                 │ WSS (presence, movement, chat, emotes)
                                 ▼
                 ┌──────────────────────────────────────────────┐
                 │  REALTIME SERVER (authoritative, per-instance)│
                 │  • Presence & movement sync (tick + deltas)  │
                 │  • Chat (All/Nearby) routing                 │
                 │  • Emote/dance/cake broadcast                │
                 │  • Instance/room management + capacity        │
                 │  • Validation, rate-limit, moderation hooks  │
                 └───────┬───────────────────────┬──────────────┘
                         │ HTTPS                  │ read/write
                         ▼                        ▼
        ┌────────────────────────┐   ┌──────────────────────────┐
        │  APP/API (stateless)   │   │  DATABASE (durable)      │
        │  • Wishes CRUD         │   │  • Wishes (keepsake)     │
        │  • Guest registry      │   │  • Guests / sessions     │
        │  • Config/event data   │   │  • Moderation log        │
        │  • Photo upload sign   │   └──────────────────────────┘
        └───────────┬────────────┘
                    ▼
        ┌────────────────────────┐
        │  OBJECT STORAGE + CDN  │  (sprite atlases, audio, photos)
        └────────────────────────┘
```

### 8.2 Layer responsibilities
- **Client renderer** — a 2D pixel engine (recommended: **Phaser** or **PixiJS**) for the scrollable scene, sprite avatars, animations, and camera. Renders local prediction; interpolates remote avatars.
- **UI layer** — framework UI (recommended: **React**, e.g. via **Next.js**) for landing, panels (chat, wishes, music, settings) layered over the canvas. Clean separation: canvas = world, DOM = chrome.
- **Realtime server** — **authoritative** WebSocket service owning live state (positions, presence, chat, emotes, cake). Strong candidates: **Colyseus** (room-oriented, built for exactly this) or **PartyKit/Cloudflare Durable Objects** (edge, scale-friendly), or **Socket.IO** on Node if self-managed. Server validates everything; clients never trust peers.
- **App/API** — stateless HTTP for non-realtime: wishes, guest registry, event config, photo upload signing. Could be Next.js API routes / serverless functions.
- **Database** — durable store for the **keepsake** data (wishes, guests, moderation). Recommended managed Postgres (e.g. **Supabase**/Neon) for reliability + easy backups.
- **Storage + CDN** — sprite atlases, audio, and user photos on object storage fronted by a CDN for fast global asset delivery.

### 8.3 Realtime model (the hard part)
- **Authoritative server, fixed tick** (e.g. ~10–20 Hz). Clients send intent (move target / input); server resolves and broadcasts **state deltas**.
- **Client-side interpolation/prediction** for smooth motion despite network jitter.
- **Area-of-interest / Nearby** filtering so each client receives only relevant updates (caps bandwidth as crowd grows).
- **Instance sharding**: when an instance hits its cap (e.g. ~75–150 guests), spin up another identical instance; route overflow there. Online counter is per-instance (with optional global total).
- **Reconnect**: heartbeat + snapshot-on-join; on drop, client reconnects and pulls a fresh snapshot.

### 8.4 Why this fits
- No install, runs everywhere → pure web client.
- Bursty one-evening traffic → managed/serverless realtime that scales up and back down (cost control, R7).
- Keepsake matters → separate durable DB so wishes/photos never depend on the ephemeral realtime layer (R-data).
- Incremental build → the four layers have clean seams; later features (photo mode, dance, admin) slot into existing layers without rebuilds (NFR-M1).

---

## 9. Build Order (incremental milestones)

Each milestone is independently demoable and builds on the last. No rebuilds.

- **M0 — Foundations & art pipeline.** Repo, project scaffold, config-driven event data, asset atlas pipeline, design tokens/palette locked to references. *Exit:* a blank themed shell + assets load.
- **M1 — Landing / invitation flow (single-player).** Invite page, Accept / Already Accepted, autoplay-unlock-on-click, name + avatar selection, local session persistence. *Exit:* a guest can "accept" and reach a placeholder room.
- **M2 — Static room + own avatar (single-player).** Full pixel garden scene (all props), scrollable camera, birthday-girl centerpiece, local avatar movement + collision. *Exit:* you can walk around the finished-looking room alone.
- **M3 — Real-time presence & multiplayer movement.** Realtime server, join/leave, position sync with interpolation, name labels, live online counter. *Exit:* two+ devices see each other move.
- **M4 — Chat.** All / Nearby tabs, recent-messages list, speech bubbles, rate limiting + profanity filter. *Exit:* guests converse spatially.
- **M5 — Wishes + Emotes + Dance.** Persistent Wishes wall (DB-backed, "+ Send a Wish"), emote reactions, dance state. *Exit:* guests leave lasting wishes and react/dance.
- **M6 — Cut Cake moment + music.** Ambient "Lo-fi Birthday" player (with controls), the synchronized Cut Cake celebration. *Exit:* the emotional centerpiece works.
- **M7 — Photo mode + Map.** Snapshot/download, minimap navigation. *Exit:* keepsake photos + easy navigation.
- **M8 — Hardening: scale, moderation, admin, analytics.** Instance sharding, load testing, host/admin controls, settings (volume/performance/fullscreen), analytics, accessibility pass, reconnect robustness. *Exit:* production-ready for the live event.

> If any single milestone proves too large in execution, it will be split into sub-tasks and flagged to you before coding — per project rules.

---

## 10. Future Expansion Ideas

- **Gift-giving**: open the gift stacks; guests "leave a gift" (a note/animation/sticker) for the host.
- **Guestbook export**: a beautiful PDF/printable of all wishes + a group photo as a post-event keepsake.
- **Voice/video zones**: optional proximity voice "huddles" near the sofa/fountain.
- **Mini-moments**: synchronized "blow out the candles," fireworks, group dance.
- **Theme packs**: reuse the engine for other events (the *anime* sprite sheet becomes an alternate theme), config-driven re-skin per birthday.
- **Avatar customization**: hats, accessories, color swaps, "birthday crown."
- **Spatial activities**: photo booth corner, dance floor with synced music, a wish-lantern release.
- **Host dashboard**: live attendance, top wishes, "spotlight a guest."
- **Async/post-event mode**: venue stays open; late guests still wander and leave wishes.
- **Replay/highlight reel**: auto-generated montage of the cake moment and crowd.
- **Accessibility & i18n expansion**: multi-language UI, screen-reader-friendly wishes wall.

---

## 11. Open Questions / Assumptions to Confirm

These need your decision before the dependent milestone begins:

1. **Art style lock (M0):** Confirm **pixel** sprite sheet + purple-garden room is canonical and the **anime** sheet is shelved as a future theme. *(Assumed: yes.)*
2. **Identity (M1):** Name-only, no accounts (lightest friction) vs. optional login for "return as me"? *(Assumed: name + local persistence, no accounts.)*
3. **Cake moment ownership (M6):** Host-only trigger (one shared canonical moment) vs. any guest can trigger their own cake effect? *(Assumed: host-gated canonical + personal confetti for guests.)*
4. **Wish moderation (M5):** Auto-publish with profanity filter vs. host-approval queue? *(Assumed: auto-publish + filter, with an approval toggle available.)*
5. **Scale target (M3/M8):** Expected peak concurrency? This sets instance caps and load-test goals. *(Assumed: plan for hundreds via sharding.)*
6. **Realtime stack (M3):** Managed (Colyseus / PartyKit) vs. self-hosted Socket.IO? *(Assumed: managed/serverless for cost + scale.)*
7. **Tech stack (M0):** React/Next.js + Phaser/PixiJS acceptable? *(Assumed: yes.)*
8. **Privacy/retention:** How long do wishes/photos live, and who can see them after the event?
9. **Access control:** Public unguessable link vs. optional passphrase?

---

*End of PRD v1.0 — awaiting review and sign-off on §11 before M0 begins.*
