# Supabase (placeholder)

Database, storage, and identity are introduced in later milestones (wishes,
photos, name-only identity — M5+). Per [ARCHITECTURE.md](../ARCHITECTURE.md) §7,
the schema covers `events`, `guests`, `wishes`, `photos`, `moderation_actions`,
and (optional) `chat_messages`, all behind Row Level Security.

For now this folder only reserves the structure:

- `migrations/` — SQL migrations (added in M5).

**No database functionality is wired in M0.**
