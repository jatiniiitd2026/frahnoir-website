-- Frahnoir — Partial COD payment mode (adds columns to the existing orders table)
-- Run in the Supabase SQL editor AFTER supabase/schema.sql.
--
-- Amount unit: ALL amount columns are in PAISE (same as orders.amount), never
-- rupees. Convert to rupees only at the Delhivery boundary (÷100).

-- New columns (idempotent).
alter table public.orders
  add column if not exists payment_method       text not null default 'prepaid',
  add column if not exists payment_status       text,
  add column if not exists prepaid_amount       bigint,   -- paise charged online now
  add column if not exists cod_amount           bigint,   -- paise collected on delivery
  add column if not exists shipping_payment_mode text,    -- 'Pre-paid' | 'COD'
  add column if not exists delhivery_cod_amount bigint,   -- paise (mirrors cod_amount)
  add column if not exists shipping_status      text default 'pending', -- pending|created|failed
  add column if not exists awb                  text;     -- Delhivery tracking number

-- Backfill payment_status for any pre-existing rows.
update public.orders set payment_status = status where payment_status is null;

-- Allow the new 'advance_paid' status (partial COD advance verified).
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('created', 'paid', 'advance_paid', 'failed'));

-- Constrain the new enum-like columns.
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('prepaid', 'partial_cod'));

alter table public.orders drop constraint if exists orders_shipping_status_check;
alter table public.orders
  add constraint orders_shipping_status_check
  check (shipping_status in ('pending', 'created', 'failed'));
