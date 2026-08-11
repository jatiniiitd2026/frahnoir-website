"use client";

import Link from "next/link";

import PerfumeScene from "@/components/PerfumeScene";
import SiteHeader from "@/components/SiteHeader";
import { whatsappLink } from "@/lib/shop";

/**
 * Mobile homepage: a normal, vertically-stacked document (NO scroll hijack).
 * The 3D product sits in a height-controlled hero so it never covers the page,
 * and all copy / CTAs / panels flow beneath it and stay visible.
 */

const CHARACTER = ["Aquatic", "Citrusy", "Aromatic", "Elegant"];
const NOTES = ["Rose", "Vanilla", "Sandalwood", "Amber"];
const RECOMMENDED = [
  "Casual Outings",
  "Weekend Getaways",
  "Summer Days",
  "Daily Wear",
];

const label = "text-[0.6rem] uppercase tracking-luxe text-velvet-gold";

export default function MobileHome() {
  return (
    <main className="relative w-full overflow-x-hidden bg-velvet-ink pb-20 text-velvet-cream">
      <SiteHeader />

      {/* Contained 3D hero — controlled height, never full-screen.
          `isolate` keeps the canvas z-context local so it can't sit over the
          content sections below. */}
      <section className="relative isolate h-[clamp(360px,52dvh,500px)] w-full overflow-hidden">
        <div className="scene-backdrop absolute inset-0 z-0" />
        <PerfumeScene variant="static" />
      </section>

      {/* Hero copy + CTAs */}
      <section className="px-6 pt-8 text-center">
        <p className={label}>Frahnoir</p>
        <h1 className="text-gold-sheen mt-3 font-display text-5xl font-medium leading-[0.95] tracking-[0.06em]">
          Velvet Ember
        </h1>
        <p className="mt-3 text-xs uppercase tracking-wider2 text-velvet-cream/75">
          Extrait de Parfum · 50 ml
        </p>

        <div className="mx-auto mt-7 flex max-w-xs flex-col gap-3">
          <Link
            href="/products"
            className="rounded-full bg-gold-sheen px-8 py-3.5 text-center text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
          >
            Pre-order
          </Link>
          <div className="flex gap-3">
            <a
              href={whatsappLink(
                "Hi Frahnoir, I'd like to enquire about Velvet Ember.",
              )}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-full border border-velvet-cream/35 px-6 py-3 text-center text-[0.66rem] uppercase tracking-luxe text-velvet-cream transition-colors hover:border-velvet-gold hover:text-velvet-gold"
            >
              WhatsApp
            </a>
            <Link
              href="/products"
              className="flex-1 rounded-full border border-velvet-cream/35 px-6 py-3 text-center text-[0.66rem] uppercase tracking-luxe text-velvet-cream transition-colors hover:border-velvet-gold hover:text-velvet-gold"
            >
              Explore
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto my-10 h-px w-4/5 gold-rule" />

      {/* Character */}
      <section className="px-6 text-center">
        <p className={label}>Olfactory Character</p>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
          {CHARACTER.map((trait) => (
            <span
              key={trait}
              className="font-display text-2xl tracking-wide text-velvet-goldlight"
            >
              {trait}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto my-10 h-px w-4/5 gold-rule" />

      {/* Fragrance notes */}
      <section className="px-6 text-center">
        <p className={label}>Fragrance Notes</p>
        <ul className="mt-5 space-y-3">
          {NOTES.map((n) => (
            <li
              key={n}
              className="flex items-center justify-center gap-2.5 font-display text-xl text-velvet-cream"
            >
              <span className="text-velvet-gold">✦</span>
              {n}
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto my-10 h-px w-4/5 gold-rule" />

      {/* Recommended for */}
      <section className="px-6 text-center">
        <p className={label}>Recommended For</p>
        <ul className="mt-5 space-y-3">
          {RECOMMENDED.map((r) => (
            <li
              key={r}
              className="flex items-center justify-center gap-2.5 text-[0.78rem] uppercase tracking-luxe text-velvet-cream/80"
            >
              <span className="text-velvet-gold">✦</span>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 px-6 text-center">
        <Link
          href="/products"
          className="inline-block rounded-full bg-gold-sheen px-9 py-3.5 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
        >
          Shop the Collection
        </Link>
      </div>
    </main>
  );
}
