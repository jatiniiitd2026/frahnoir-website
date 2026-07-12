import "server-only";

import crypto from "crypto";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

/** A customer review. `media_urls` are public Supabase Storage URLs. */
export interface Review {
  id: string;
  name: string;
  email: string | null;
  product_slug: string | null;
  rating: number;
  title: string | null;
  message: string;
  media_urls: string[];
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/** Public read — APPROVED reviews only, newest first. */
export async function getApprovedReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[reviews] getApprovedReviews failed:", error.message);
    return [];
  }
  return (data ?? []) as Review[];
}

export interface NewReview {
  name: string;
  email: string | null;
  productSlug: string | null;
  rating: number;
  title: string | null;
  message: string;
  mediaUrls: string[];
}

/** Insert a review with status `pending` (never public until approved). */
export async function createPendingReview(input: NewReview): Promise<Review> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      name: input.name,
      email: input.email,
      product_slug: input.productSlug,
      rating: input.rating,
      title: input.title,
      message: input.message,
      media_urls: input.mediaUrls,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

// --- Rate limiting (Supabase-backed, IP hashed server-side) ----------------

export const REVIEW_RATE_LIMIT_MAX = 3; // submissions per window
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/** One-way hash of the client IP (never stored or returned in plaintext). */
export function hashIp(ip: string): string {
  const salt = process.env.REVIEW_RATE_LIMIT_SALT || "frahnoir-default-salt";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}

/** True if this IP hash has hit the submission cap in the last 24h. */
export async function isRateLimited(ipHash: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("review_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error) {
    // Fail open so a transient DB error never blocks a genuine customer.
    console.error("[reviews] rate-limit check failed:", error.message);
    return false;
  }
  return (count ?? 0) >= REVIEW_RATE_LIMIT_MAX;
}

/** Record one accepted submission against the IP hash. */
export async function recordSubmission(ipHash: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("review_rate_limits")
    .insert({ ip_hash: ipHash });
  if (error) console.error("[reviews] rate-limit record failed:", error.message);
}
