import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

/** A blog post. Media URLs are public Supabase Storage URLs (blog-media). */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  media_urls: string[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Public list — PUBLISHED posts only, newest first. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[blog] getPublishedPosts failed:", error.message);
    return [];
  }
  return (data ?? []) as BlogPost[];
}

/** Single PUBLISHED post by slug, or null. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    console.error("[blog] getPostBySlug failed:", error.message);
    return null;
  }
  return (data as BlogPost) ?? null;
}
