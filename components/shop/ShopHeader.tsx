"use client";

import Link from "next/link";

import { useCartStore, selectCartCount } from "@/lib/cart/store";
import { useMounted } from "@/lib/useMounted";

/** Sticky luxury shop chrome with a live cart count. */
export default function ShopHeader() {
  const mounted = useMounted();
  const count = useCartStore(selectCartCount);

  return (
    <header className="sticky top-0 z-40 border-b border-velvet-gold/15 bg-velvet-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="font-display text-xl italic tracking-[0.18em] text-velvet-cream transition-colors hover:text-velvet-gold sm:text-2xl"
        >
          Frahnoir
        </Link>

        <nav className="flex items-center gap-7 text-[0.62rem] uppercase tracking-luxe text-velvet-cream/75">
          <Link
            href="/products"
            className="transition-colors hover:text-velvet-gold"
          >
            Collection
          </Link>
          <Link
            href="/reviews"
            className="hidden transition-colors hover:text-velvet-gold sm:inline"
          >
            Reviews
          </Link>
          <Link
            href="/blog"
            className="hidden transition-colors hover:text-velvet-gold sm:inline"
          >
            Journal
          </Link>
          <Link
            href="/cart"
            className="group relative inline-flex items-center gap-2 transition-colors hover:text-velvet-gold"
            aria-label="Cart"
          >
            Cart
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-velvet-gold px-1.5 text-[0.6rem] font-semibold text-velvet-ink">
              {mounted ? count : 0}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
