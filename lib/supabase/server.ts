import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key. This bypasses RLS and
 * must NEVER be imported into client components. Env vars are read lazily so the
 * app still builds/runs (falling back to the file store) when unset.
 */

let admin: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured on the server.");
  }
  if (!admin) {
    admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
