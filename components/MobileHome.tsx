"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import PerfumeScene from "@/components/PerfumeScene";
import SiteHeader from "@/components/SiteHeader";
import { whatsappLink } from "@/lib/shop";
import { clamp } from "@/lib/scrollTimeline";

/**
 * Mobile homepage: the SAME full-screen 3D hero as desktop, sized for phones,
 * now scroll-driven. A tall hero section pins a 100svh stage while you scroll;
 * that scroll distance maps to 0→1 progress which animates the box/bottle
 * through the existing timeline (via PerfumeScene variant="mobile-scroll").
 * The title stays; the info cards + CTAs fade in near the end — landing on the
 * same premium final composition. No fixed desktop ScrollOverlay, no 600vh.
 */

const RECOMMENDED = [
  "Casual Outings",
  "Weekend Getaways",
  "Summer Days",
  "Daily Wear",
];
const NOTES = ["Rose", "Vanilla", "Sandalwood", "Amber"];

export default function MobileHome() {
  const heroRef = useRef<HTMLDivElement>(null); // tall outer scroll section
  const progressRef = useRef(0); // 0–1, fed to the 3D scene
  const finalRef = useRef<HTMLDivElement>(null); // cards + CTAs (fade in late)

  useEffect(() => {
    const onScroll = () => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = rect.height - window.innerHeight; // sticky travel in px
      const p = dist > 0 ? clamp(-rect.top / dist) : 0;
      progressRef.current = p;

      // Reveal the final overlay across the last third of the scroll.
      const t = clamp((p - 0.68) / 0.24);
      const el2 = finalRef.current;
      if (el2) {
        el2.style.opacity = String(t);
        el2.style.transform = `translate3d(0, ${(1 - t) * 16}px, 0)`;
        // Only interactive once mostly visible so it can't capture early taps.
        el2.style.pointerEvents = t > 0.6 ? "auto" : "none";
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <main className="relative w-full overflow-x-clip bg-velvet-ink text-velvet-cream">
      <SiteHeader />

      {/* Tall section provides the scroll distance; inner stage stays pinned.
          svh matches the sticky child. Height 350svh → ~2.5 screens of sticky
          travel, so the 3D animation plays out and isn't skipped by a fast flick. */}
      <section ref={heroRef} className="relative h-[350svh] w-full">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden isolate">
          {/* Burgundy backdrop + live scroll-driven 3D product */}
          <div className="absolute inset-0 z-0">
            <div className="scene-backdrop absolute inset-0" />
            <PerfumeScene variant="mobile-scroll" progressRef={progressRef} />
          </div>

          {/* Overlay — non-interactive wrapper; buttons opt back in */}
          <div className="pointer-events-none relative z-20 flex h-[100svh] flex-col px-5">
            {/* Hero title (top, always visible) */}
            <div className="pt-[4.5rem] text-center">
              <p className="text-[0.56rem] uppercase tracking-luxe text-velvet-gold">
                Frahnoir
              </p>
              <h1 className="text-gold-sheen mt-2 font-display text-4xl font-medium leading-[0.95] tracking-[0.05em]">
                Sweet Sin
              </h1>
              <p className="mt-2 text-[0.6rem] uppercase tracking-wider2 text-velvet-cream/75">
                Extrait de Parfum · 50 ml
              </p>
            </div>

            {/* Product shows through this flexible gap */}
            <div className="flex-1" />

            {/* Final overlay: info cards + CTAs (fade/slide in near the end) */}
            <div ref={finalRef} style={{ opacity: 0 }} className="pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 text-left">
                  <p className="text-[0.5rem] uppercase tracking-luxe text-velvet-gold">
                    Recommended For
                  </p>
                  <ul className="mt-2 space-y-1">
                    {RECOMMENDED.map((r) => (
                      <li
                        key={r}
                        className="text-[0.6rem] leading-tight text-velvet-cream/80"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-3 text-right">
                  <p className="text-[0.5rem] uppercase tracking-luxe text-velvet-gold">
                    Fragrance Notes
                  </p>
                  <ul className="mt-2 space-y-1">
                    {NOTES.map((n) => (
                      <li
                        key={n}
                        className="text-[0.6rem] leading-tight text-velvet-cream/80"
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2.5">
                <Link
                  href="/products"
                  className="rounded-full bg-gold-sheen px-6 py-3 text-center text-[0.66rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
                >
                  Buy Now
                </Link>
                <div className="flex gap-2.5">
                  <a
                    href={whatsappLink(
                      "Hi Frahnoir, I'd like to enquire about Velvet Ember.",
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-velvet-cream/35 px-4 py-2.5 text-center text-[0.62rem] uppercase tracking-luxe text-velvet-cream transition-colors hover:border-velvet-gold hover:text-velvet-gold"
                  >
                    WhatsApp
                  </a>
                  <Link
                    href="/products"
                    className="flex-1 rounded-full border border-velvet-cream/35 px-4 py-2.5 text-center text-[0.62rem] uppercase tracking-luxe text-velvet-cream transition-colors hover:border-velvet-gold hover:text-velvet-gold"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
