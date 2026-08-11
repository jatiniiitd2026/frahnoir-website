"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { clamp } from "@/lib/scrollTimeline";

/**
 * HTML overlay choreographed against the same scroll progress as the 3D scene.
 * Each section fades + slides in/out within a progress window aligned to a
 * timeline phase, so copy reveals in sync with the box/bottle animation.
 *
 * Visual language follows the Stitch "Velvet Ember" campaign direction:
 * deep burgundy stage, brushed-gold display serif, tiny wide-tracked uppercase
 * labels, and ✦ gold accents — kept minimal so the 3D product stays the hero.
 */

const CHARACTER: { trait: string; note: string }[] = [
  { trait: "Aquatic", note: "A clean breath of sea salt and open water" },
  { trait: "Citrusy", note: "Bright bergamot lifts the opening" },
  { trait: "Aromatic", note: "Lavender and sage at the heart" },
  { trait: "Elegant", note: "A quiet, refined drydown" },
];

const RECOMMENDED = [
  "Casual Outings",
  "Weekend Getaways",
  "Summer Days",
  "Daily Wear",
];

const NOTES: { name: string; note: string }[] = [
  { name: "Rose", note: "Blooming rose, a glowing trail" },
  { name: "Vanilla", note: "Warm amber and vanilla bean" },
  { name: "Sandalwood", note: "Creamy woods, settled and calm" },
  { name: "Amber", note: "Amber-stone warmth that lingers" },
];

/** Eased 0→1 opacity for a [start,end] progress window with soft edges. */
function band(p: number, start: number, end: number, fade = 0.05) {
  const fadeIn = clamp((p - start) / fade);
  const fadeOut = clamp((end - p) / fade);
  return Math.min(fadeIn, fadeOut);
}

/**
 * Fade-IN only: ramps 0→1 across [start,end] and STAYS at 1 afterwards.
 * Used for the final showcase so the panels never fade back out at progress 1.
 */
function fadeInHold(p: number, start: number, end: number) {
  return clamp((p - start) / (end - start));
}

export default function ScrollOverlay() {
  const heroRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Fade + slide-up + gentle defocus as a section leaves its window.
    // Note: pointer-events are NOT toggled here — the section wrappers stay
    // non-interactive so they never block the product; only buttons opt in via
    // the `pointer-events-auto` class.
    const reveal = (el: HTMLElement | null, t: number) => {
      if (!el) return;
      el.style.opacity = String(t);
      el.style.transform = `translate3d(0, ${(1 - t) * 26}px, 0)`;
      el.style.filter = t > 0.99 ? "none" : `blur(${(1 - t) * 4}px)`;
    };

    const trigger = ScrollTrigger.create({
      trigger: "#scroll-stage",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        // Bands line up with lib/scrollTimeline phases.
        reveal(heroRef.current, band(p, 0.0, 0.22)); // idle
        reveal(characterRef.current, band(p, 0.26, 0.44)); // rotateSide
        // Final showcase: fade in by 0.92 and HOLD at full opacity through 1.0.
        reveal(finalRef.current, fadeInHold(p, 0.86, 0.92)); // final showcase
        if (hintRef.current)
          hintRef.current.style.opacity = String(clamp(1 - p / 0.06));
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 text-velvet-cream">
      {/* ===================== HERO ===================== */}
      <section
        ref={heroRef}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-transform"
      >
        <p className="mb-5 text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
          Frahnoir
        </p>
        <h1 className="text-gold-sheen font-display text-[3.25rem] font-medium leading-[0.95] tracking-[0.06em] sm:text-7xl md:text-8xl">
          Sweet Sin
        </h1>
        <p className="mt-5 text-xs uppercase tracking-wider2 text-velvet-cream/75 sm:text-sm">
          Extrait de Parfum · 50 ml
        </p>
        <Link
          href="/products"
          className="pointer-events-auto mt-9 rounded-full border border-velvet-gold/60 px-9 py-3 text-[0.7rem] uppercase tracking-luxe text-velvet-gold transition-colors hover:bg-velvet-gold hover:text-velvet-ink"
        >
          Buy Now
        </Link>
      </section>

      {/* ===================== CHARACTER ===================== */}
      <section
        ref={characterRef}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0 will-change-transform"
      >
        <p className="mb-3 text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
          Olfactory Character
        </p>
        <h2 className="font-display text-3xl font-normal tracking-[0.04em] text-velvet-cream sm:text-5xl">
          A Profile in Contrast
        </h2>
        <div className="glass-card mt-8 w-full max-w-4xl px-8 py-9 sm:px-12">
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-4">
            {CHARACTER.map(({ trait, note }) => (
              <div key={trait} className="flex flex-col items-center">
                <span className="font-display text-2xl tracking-wide text-velvet-goldlight sm:text-3xl">
                  {trait}
                </span>
                <span className="mt-2 max-w-[14rem] text-[0.72rem] leading-relaxed text-velvet-cream/60">
                  {note}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 h-px w-2/3 gold-rule" />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.6rem] uppercase tracking-luxe text-velvet-cream/60">
            <span>Top · Bergamot, Sea Salt, Grapefruit</span>
            <span className="hidden text-velvet-gold sm:inline">✦</span>
            <span>Heart · Lavender, Geranium, Sage</span>
            <span className="hidden text-velvet-gold sm:inline">✦</span>
            <span>Base · Cedarwood, Amber, Musk</span>
          </div>
        </div>
      </section>

      {/*
        ===================== FINAL SHOWCASE =====================
        Matches the Stitch reference: RECOMMENDED FOR pinned left, FRAGRANCE
        NOTES pinned right, CTA centred at the bottom. Everything sits at the
        edges so the centred 3D product is never covered.
      */}
      <section
        ref={finalRef}
        className="absolute inset-0 opacity-0 will-change-transform"
      >
        {/* Left — Recommended For */}
        <div className="absolute left-5 top-1/2 w-36 -translate-y-1/2 text-left sm:left-10 sm:w-52">
          <h3 className="font-display text-xl uppercase tracking-[0.12em] text-velvet-gold sm:text-3xl">
            Recommended For
          </h3>
          <div className="my-4 h-px w-16 gold-rule" />
          <ul className="space-y-3">
            {RECOMMENDED.map((use) => (
              <li
                key={use}
                className="flex items-center gap-2.5 text-[0.7rem] uppercase tracking-luxe text-velvet-cream/85 sm:text-xs"
              >
                <span className="text-velvet-gold">✦</span>
                {use}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — Fragrance Notes */}
        <div className="absolute right-5 top-1/2 w-36 -translate-y-1/2 text-right sm:right-10 sm:w-56">
          <h3 className="font-display text-xl uppercase tracking-[0.12em] text-velvet-gold sm:text-3xl">
            Fragrance Notes
          </h3>
          <div className="my-4 ml-auto h-px w-16 gold-rule" />
          <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6">
            {NOTES.map(({ name, note }) => (
              <div key={name}>
                <p className="font-display text-base tracking-wide text-velvet-goldlight sm:text-lg">
                  {name}
                </p>
                <p className="mt-1 hidden text-[0.66rem] leading-relaxed text-velvet-cream/55 sm:block">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — CTA */}
        <div className="pointer-events-auto absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4 px-4 sm:flex-row">
          <Link
            href="/products"
            className="min-w-44 rounded-full bg-gold-sheen px-8 py-3 text-center text-[0.68rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
          >
            Buy Now
          </Link>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="min-w-44 rounded-full border border-velvet-cream/35 px-8 py-3 text-center text-[0.68rem] uppercase tracking-luxe text-velvet-cream transition-colors hover:border-velvet-gold hover:text-velvet-gold"
          >
            WhatsApp
          </a>
          <a
            href="#"
            className="min-w-44 rounded-full border border-velvet-cream/35 px-8 py-3 text-center text-[0.68rem] uppercase tracking-luxe text-velvet-cream transition-colors hover:border-velvet-gold hover:text-velvet-gold"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* Scroll hint */}
      <div
        ref={hintRef}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-[0.6rem] uppercase tracking-wider2 text-velvet-cream/60">
          Scroll to Explore
        </p>
        <div className="mx-auto mt-3 h-9 w-px animate-pulse bg-gradient-to-b from-velvet-gold/70 to-transparent" />
      </div>
    </div>
  );
}
