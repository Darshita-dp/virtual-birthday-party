# Supabase — Memory Capsule (M15)

Shared persistent **guests**, shared **wishes**, and real **counters** for
Darshita's Virtual Birthday. The web app talks to Supabase directly with the
public **anon key** (no server), protected by Row Level Security. If the env
vars are absent, the app runs in local-only fallback mode — nothing breaks.

## Tables

| Table | Purpose |
|---|---|
| `party_guests` | One row per browser `session_id`, upserted on Enter Party. Drives the room crowd + Joined count. Never deleted. |
| `party_wishes` | Append-only wishes wall. Drives the shared Wishes panel. |
| `party_events` | `accept` / `accepted` click rows. Drives the Viewers count. |

Full schema + RLS + realtime: [`migrations/0001_party_capsule.sql`](migrations/0001_party_capsule.sql).

## One-time setup

1. **Create a project** at <https://supabase.com> (free tier is fine).
2. **Run the migration:** open **SQL Editor** → paste the contents of
   `migrations/0001_party_capsule.sql` → **Run**.
   (Or, with the Supabase CLI linked to the project: `supabase db push`.)
3. **Get your keys:** Project Settings → **API** →
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (The anon key is safe to expose in the browser — access is governed by RLS.
   Do **not** use the service-role key; it isn't needed and must stay secret.)

## Environment variables

**Local dev** — create `apps/web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

**Production (Vercel)** — Project → Settings → **Environment Variables** → add
the same two keys for **Production** (and **Preview** if you use preview
deploys), then **redeploy** so the new build picks them up.

## RLS summary

No app-level auth (name-only identity), so the `anon` role may **select** and
**insert** on all tables, **update** `party_guests` (needed to re-RSVP under the
same `session_id`), and **cannot delete** anything. Worst case for a public
birthday link with no sensitive data is a cosmetic name/avatar edit — acceptable
here; the capsule (guests + wishes) is permanent by design.

## Verify

After setup, open the live site in two browsers:
- Accept in both → **Viewers** climbs.
- Enter Party in both (different names/avatars) → both appear in the room with
  name tags, and **Joined** shows 2.
- Post a wish in one → it appears in the other without refresh.
