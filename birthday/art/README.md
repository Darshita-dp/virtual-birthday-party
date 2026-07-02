# Art (source assets)

Design-time source art lives here. Built atlases/audio are emitted to
`apps/web/public/assets` (and later uploaded to Supabase Storage / CDN).
See [ASSET_BIBLE.md](../ASSET_BIBLE.md) for naming conventions, dimensions,
atlas packing, animation states, and the now-vs-later asset list.

Folders:

- `fonts/` `landing/` `avatars/` `host/` `room/` `fx/` `audio/` `tilemap/` `texturepacker/`

The asset build pipeline (`scripts/build-assets.mjs`) is a placeholder until the
first real art lands.
