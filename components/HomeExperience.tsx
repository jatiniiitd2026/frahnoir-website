"use client";

import { useEffect, useState } from "react";

import PerfumeScene from "@/components/PerfumeScene";
import ScrollOverlay from "@/components/ScrollOverlay";
import SiteHeader from "@/components/SiteHeader";
import MobileHome from "@/components/MobileHome";

/** Desktop cinematic experience only kicks in at/above this width. */
const DESKTOP_MIN_WIDTH = 1024;

/**
 * Chooses the homepage experience by viewport width.
 *
 * MOBILE-FIRST + FAIL-SAFE: `isMobile` defaults to `true`, so the server and
 * the first client render both produce the stacked MobileHome (never the
 * desktop scroll overlay). We only widen to the desktop hero after measuring
 * `window.innerWidth >= 1024` on mount / resize / orientation change. This
 * guarantees phones never get the fixed ScrollOverlay, even if a media listener
 * misbehaves — the worst case is "mobile layout", which is always safe.
 *
 * Only ONE 3D canvas is mounted at a time (we branch, not CSS-hide).
 */
export default function HomeExperience() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const update = () =>
      setIsMobile(window.innerWidth < DESKTOP_MIN_WIDTH);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Mobile / tablet (< 1024px): stacked layout. No ScrollOverlay, no fixed
  // full-screen scroll-stage — the 3D is contained inside MobileHome.
  if (isMobile) {
    return <MobileHome />;
  }

  // Desktop (>= 1024px): the fixed, scroll-driven cinematic hero (unchanged).
  return (
    <>
      <div className="scene-backdrop pointer-events-none fixed inset-0 z-0" />
      <PerfumeScene />
      <SiteHeader />
      <ScrollOverlay />
      <div id="scroll-stage" className="relative h-[600vh]" aria-hidden />
    </>
  );
}
