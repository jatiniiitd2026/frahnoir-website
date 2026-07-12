-- Frahnoir order persistence schema (Supabase / Postgres)
-- Run in the Supabase SQL editor (or `supabase db push`).
--
-- Notes:
--  * `orders.amount` is stored in PAISE (smallest unit) to match Razorpay and
--    the app's Order.amount. Item prices are stored in RUPEES (whole units),
--    matching Product.price. Both round-trip through the OrderStore unchanged.
--  * Customer details are denormalised onto `orders` (matches CustomerDetails);
--    a separate `customers` table is intentionally NOT used for this scope.
--  * Writes happen only from the server using the SERVICE ROLE key, which
--    bypasses RLS. RLS is enabled with no public policies so the anon key
--    cannot read or write orders.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  razorpay_order_id   text not null unique,
  razorpay_payment_id text,
  status              text not null default 'created'
                        check (status in ('created', 'paid', 'failed')),
  customer_name       text not null,
  phone               text not null,
  email               text not null,
  address             text not null,
  city                text not null,
  state               text not null,
  pincode             text not null,
  amount              bigint not null,          -- paise
  currency            text not null default 'INR',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists orders_razorpay_order_id_idx
  on public.orders (razorpay_order_id);
create index if not exists orders_status_idx on public.orders (status);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_slug  text not null,
  product_name  text not null,
  quantity      integer not null check (quantity > 0),
  unit_price    integer not null,               -- rupees
  total_price   integer not null,               -- rupees (unit_price * quantity)
  created_at    timestamptz not null default now()
);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: lock everything down. The server uses the service role
-- key (bypasses RLS); no anon/public access is granted.
-- ---------------------------------------------------------------------------
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
