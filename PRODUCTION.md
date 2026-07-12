# Frahnoir — Production / Go-Live

## 1. Supabase (order persistence)

Orders now persist to Supabase when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
are set. Without them the app falls back to the local file store (`.data/`) for
development.

1. Create a Supabase project.
2. Open **SQL Editor** → run [`supabase/schema.sql`](supabase/schema.sql). This
   creates `orders` + `order_items` with RLS enabled and no public policies.
3. Get credentials from **Project Settings → API**:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = **service_role** key (secret — server only)
4. Data model:
   - `orders.amount` is in **paise**; `order_items.unit_price/total_price` are in **rupees**.
   - Customer details are denormalised on `orders` (no separate `customers` table).
   - Status transitions: `created` → `paid` (verify/webhook) or `created` → `failed`.

Verify: place a test order (see §4) and confirm a row appears in `orders` with
`status = paid` and matching rows in `order_items`.

## 2. Environment variables

Set these in the host (e.g. Vercel → Project → Settings → Environment Variables).
See [`.env.example`](.env.example). **Never** expose the secret/service keys.

| Variable | Scope | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | server | Live key id |
| `RAZORPAY_KEY_SECRET` | server | Live secret — secret |
| `RAZORPAY_WEBHOOK_SECRET` | server | Must match the dashboard webhook secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | public | Same value as `RAZORPAY_KEY_ID` |
| `SUPABASE_URL` | server | |
| `SUPABASE_SERVICE_ROLE_KEY` | server | secret |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | public | Intl digits, e.g. `9198…` |

## 3. Deploy + domain

1. Push the repo to GitHub and import into Vercel (Next.js preset, no config needed).
2. Add all env vars for the **Production** environment; redeploy.
3. Domain: Vercel → **Domains** → add your domain, set the DNS records at your
   registrar (A/ALIAS to Vercel, or `CNAME` for `www`). Wait for the certificate.

## 4. Razorpay go-live

1. Complete KYC and activate **Live mode**; generate live API keys → set the
   `RAZORPAY_*` env vars above.
2. **Webhook**: Dashboard → Settings → Webhooks → add
   `https://YOUR_DOMAIN/api/razorpay/webhook`.
   - Secret = `RAZORPAY_WEBHOOK_SECRET`.
   - Subscribe to `payment.captured`, `payment.failed`, `order.paid`.
3. Test end-to-end first in **Test mode** (test keys + Razorpay test cards):
   checkout → pay → redirect to `/order-success` → row `paid` in Supabase.
   Then switch to live keys.

## Partial COD + Delhivery

- Run `supabase/partial_cod.sql` (after `schema.sql`) to add the payment-mode +
  shipping columns and the `advance_paid` status.
- Payment modes: **Pay Online** (prepaid, full amount) and **Partial COD**
  (25% online advance now, 75% collected by Delhivery on delivery).
- All amount columns are in **paise**. The 25% advance is rounded in rupees
  (`Math.round(total * 0.25)`) then converted to paise. Razorpay is charged the
  online portion only; the amount is always computed server-side.
- Delhivery: set `DELHIVERY_API_TOKEN`, `DELHIVERY_PICKUP_NAME`
  (+ optional `DELHIVERY_BASE_URL`). Shipment is created after payment is
  verified and never blocks payment success. **Confirm the CMU payload field
  names / `payment_mode` enum against your Delhivery account** — see the
  `TODO(delhivery)` notes in `lib/delhivery.ts` before go-live.

## Security invariants (already implemented — don't regress)

- Order amount is recomputed server-side from `lib/products.ts`; the frontend
  amount/price is never trusted.
- The Razorpay **secret** never reaches the browser (only `NEXT_PUBLIC_RAZORPAY_KEY_ID`).
- Payment is marked `paid` only after **server-side signature verification**
  (`/api/razorpay/verify`) and/or the signed **webhook**; both are idempotent.
- Supabase writes use the service-role key server-side only; RLS blocks anon access.
