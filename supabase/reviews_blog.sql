-- Frahnoir — Reviews + Blog schema (Supabase / Postgres)
-- Run in the Supabase SQL editor. Independent of the orders schema.
--
-- Access model (mirrors the orders setup):
--  * All WRITES happen server-side with the SERVICE ROLE key (bypasses RLS):
--    review submission via /api/reviews, blog posts managed in the dashboard.
--  * Public pages read APPROVED reviews / PUBLISHED posts only. RLS is enabled
--    with anon SELECT policies scoped to those states as defence-in-depth; the
--    app itself reads server-side and also filters by status.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  product_slug text,
  rating       integer not null check (rating between 1 and 5),
  title        text,
  message      text not null,
  media_urls   text[] not null default '{}',
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now()
);

create index if not exists reviews_status_created_idx
  on public.reviews (status, created_at desc);

alter table public.reviews enable row level security;

-- Public may read ONLY approved reviews (writes are server/service-role only).
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select using (status = 'approved');

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text unique not null,
  excerpt         text,
  content         text not null,
  cover_image_url text,
  media_urls      text[] not null default '{}',
  status          text not null default 'draft'
                    check (status in ('draft', 'published')),
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);

alter table public.blog_posts enable row level security;

-- Public may read ONLY published posts.
drop policy if exists blog_public_read on public.blog_posts;
create policy blog_public_read on public.blog_posts
  for select using (status = 'published');

-- ---------------------------------------------------------------------------
-- review_rate_limits — one row per accepted review submission (IP hashed).
-- Used to cap submissions per IP hash per 24h. Server/service-role only.
-- ---------------------------------------------------------------------------
create table if not exists public.review_rate_limits (
  id         uuid primary key default gen_random_uuid(),
  ip_hash    text not null,
  created_at timestamptz not null default now()
);

create index if not exists review_rate_limits_ip_created_idx
  on public.review_rate_limits (ip_hash, created_at desc);

-- No public access; only the server (service role) reads/writes this.
alter table public.review_rate_limits enable row level security;

-- Requires env var REVIEW_RATE_LIMIT_SALT (server-only) to hash IPs.

-- ---------------------------------------------------------------------------
-- STORAGE BUCKETS (create in Dashboard → Storage, or via API)
-- ---------------------------------------------------------------------------
--  1. Create bucket `review-media`  → set as PUBLIC (public read).
--  2. Create bucket `blog-media`    → set as PUBLIC (public read).
--
-- Review uploads are written to `review-media` by the server using the service
-- role key (bypasses storage RLS). Blog images/videos live in `blog-media` and
-- are referenced from blog_posts.cover_image_url / media_urls. The service-role
-- key is NEVER sent to the browser.
