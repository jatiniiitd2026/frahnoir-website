"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStore } from "@/lib/cart/store";
import { detailedLines, cartSubtotal } from "@/lib/cart/utils";
import { formatINR } from "@/lib/products";
import { useMounted } from "@/lib/useMounted";
import QuantityStepper from "@/components/shop/QuantityStepper";

export default function CartView() {
  const mounted = useMounted();
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (!mounted) {
    return <div className="h-64" aria-hidden />;
  }

  const items = detailedLines(lines);
  const subtotal = cartSubtotal(lines);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-velvet-gold/15 bg-velvet-night/40 px-8 py-16 text-center">
        <p className="font-display text-2xl text-velvet-cream">
          Your cart is empty
        </p>
        <p className="mt-3 text-sm text-velvet-cream/60">
          Discover the Frahnoir collection.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-gold-sheen px-8 py-3 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      {/* Line items */}
      <ul className="space-y-5">
        {items.map(({ product, quantity, lineTotal }) => (
          <li
            key={product.slug}
            className="flex gap-5 rounded-2xl border border-velvet-gold/15 bg-velvet-night/40 p-4"
          >
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-velvet-gold/20 bg-velvet-ink">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="96px"
                className="object-contain p-1.5"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-display text-xl text-velvet-cream hover:text-velvet-goldlight"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 text-[0.62rem] uppercase tracking-luxe text-velvet-cream/55">
                    {product.type} · {product.size}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(product.slug)}
                  className="text-[0.62rem] uppercase tracking-luxe text-velvet-cream/45 transition-colors hover:text-ember"
                >
                  Remove
                </button>
              </div>

              <div className="flex items-end justify-between">
                <QuantityStepper
                  value={quantity}
                  onChange={(n) => setQuantity(product.slug, n)}
                />
                <p className="font-display text-lg text-velvet-goldlight">
                  {formatINR(lineTotal)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <aside className="h-fit rounded-2xl border border-velvet-gold/20 bg-velvet-night/50 p-7">
        <h2 className="font-display text-xl text-velvet-cream">Order Summary</h2>
        <div className="my-5 h-px w-full gold-rule" />
        <div className="flex items-center justify-between text-sm text-velvet-cream/75">
          <span>Subtotal</span>
          <span className="text-velvet-cream">{formatINR(subtotal)}</span>
        </div>
        <p className="mt-2 text-[0.66rem] text-velvet-cream/45">
          Taxes &amp; shipping calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-7 block rounded-full bg-gold-sheen px-8 py-3.5 text-center text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
        >
          Proceed to Checkout
        </Link>
        <Link
          href="/products"
          className="mt-3 block text-center text-[0.62rem] uppercase tracking-luxe text-velvet-cream/55 transition-colors hover:text-velvet-gold"
        >
          Continue Shopping
        </Link>
      </aside>
    </div>
  );
}
