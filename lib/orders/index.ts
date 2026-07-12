import { fileOrderStore } from "@/lib/orders/fileStore";
import { supabaseOrderStore } from "@/lib/orders/supabaseStore";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { OrderStore } from "@/lib/orders/types";

/**
 * Active order store. Uses Supabase in production (when SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY are set) and falls back to the local file store for
 * development without a database. Both implement the same `OrderStore`
 * interface, so nothing else in the app changes.
 */
export const orderStore: OrderStore = isSupabaseConfigured()
  ? supabaseOrderStore
  : fileOrderStore;

if (!isSupabaseConfigured() && process.env.NODE_ENV === "production") {
  console.warn(
    "[orders] Supabase is not configured — using the local file store. " +
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for durable persistence.",
  );
}

export type { Order, OrderItem, CustomerDetails } from "@/lib/orders/types";
