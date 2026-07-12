import type { Metadata } from "next";
import Link from "next/link";

import { orderStore } from "@/lib/orders";
import { formatINR } from "@/lib/products";
import type { Order } from "@/lib/orders/types";

export const metadata: Metadata = { title: "Order Confirmed · Frahnoir" };
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  let order: Order | null = null;
  if (orderId) {
    try {
      order = await orderStore.getById(orderId);
    } catch {
      order = null;
    }
  }

  const isPartial = order?.paymentMethod === "partial_cod";
  const codRupees = order ? Math.round(order.codAmount / 100) : 0;

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center sm:py-36">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-velvet-gold/50 text-2xl text-velvet-gold">
        ✓
      </div>
      <p className="mt-8 text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
        {isPartial ? "Advance Received" : "Payment Confirmed"}
      </p>
      <h1 className="mt-4 font-display text-5xl tracking-[0.04em] text-velvet-cream">
        Thank You
      </h1>

      <p className="mt-5 max-w-sm text-sm leading-relaxed text-velvet-cream/70">
        {isPartial ? "Advance payment received." : "Payment successful."}
      </p>

      {isPartial && (
        <p className="mt-3 rounded-full border border-velvet-gold/30 bg-velvet-gold/5 px-5 py-2 text-sm text-velvet-goldlight">
          Pay remaining {formatINR(codRupees)} on delivery
        </p>
      )}

      <p className="mt-5 text-sm text-velvet-cream/60">Shipping via Delhivery.</p>

      {order?.awb ? (
        <p className="mt-2 text-[0.66rem] uppercase tracking-luxe text-velvet-cream/70">
          Tracking (AWB) · {order.awb}
        </p>
      ) : (
        <p className="mt-2 text-[0.66rem] text-velvet-cream/50">
          Tracking details will be shared soon.
        </p>
      )}

      {order && (
        <p className="mt-6 rounded-full border border-velvet-gold/20 px-5 py-2 text-[0.62rem] uppercase tracking-luxe text-velvet-cream/55">
          Order Ref · {order.id}
        </p>
      )}

      {!order && orderId && (
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-velvet-cream/55">
          Your order has been received and verified. We&apos;ll be in touch
          shortly with dispatch details.
        </p>
      )}

      <Link
        href="/products"
        className="mt-10 rounded-full bg-gold-sheen px-8 py-3.5 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
      >
        Continue Shopping
      </Link>
    </section>
  );
}
