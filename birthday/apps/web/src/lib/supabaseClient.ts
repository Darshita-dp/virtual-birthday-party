import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy singleton Supabase browser client (M15). Uses the public anon key —
 * safe to expose because access is governed by Row Level Security (see the
 * migration in supabase/migrations). If the env vars are absent the app runs
 * in local-only fallback mode: every consumer checks `isSupabaseConfigured()`
 * / a null client and degrades gracefully, so nothing breaks without a backend.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  if (!url || !anonKey) return null;
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  });
  return client;
}
