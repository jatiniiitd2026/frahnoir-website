"use client";

import Link from "next/link";

/**
 * Slim, always-visible top chrome: a centered serif wordmark flanked by a
 * couple of quiet uppercase links — the restrained campaign-site header seen
 * in the Stitch reference. Links route into the shop.
 */
export default function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        <nav className="pointer-events-auto hidden flex-1 items-center gap-8 text-[0.62rem] uppercase tracking-luxe text-velvet-cream/70 sm:flex">
          <Link
            href="/products"
            className="transition-colors hover:text-velvet-gold"
          >
            Fragrances
          </Link>
          <Link
            href="/products"
            className="transition-colors hover:text-velvet-gold"
          >
            The House
          </Link>
        </nav>

        <span className="flex-1 text-center font-display text-xl italic tracking-[0.18em] text-velvet-cream sm:text-2xl">
          Frahnoir
        </span>

        <nav className="pointer-events-auto flex flex-1 items-center justify-end gap-8 text-[0.62rem] uppercase tracking-luxe text-velvet-cream/70">
          <Link
            href="/cart"
            className="hidden transition-colors hover:text-velvet-gold sm:inline"
          >
            Cart
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-velvet-gold/50 px-4 py-2 text-velvet-gold transition-colors hover:bg-velvet-gold hover:text-velvet-ink"
          >
            Shop
          </Link>
        </nav>
      </div>
    </header>
  );
}
