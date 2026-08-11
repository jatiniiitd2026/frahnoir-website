"use client";

import { useEffect, useState } from "react";

import PerfumeScene from "@/components/PerfumeScene";
import ScrollOverlay from "@/components/ScrollOverlay";
import SiteHeader from "@/components/SiteHeader";
import MobileHome from "@/components/MobileHome";
import { useMounted } from "@/lib/useMounted";

/**
 * Chooses the homepage experience by viewport:
 *  - desktop/tablet (≥768px): the fixed full-screen, scroll-driven 3D hero
 *    (unchanged).
 *  - mobile (<768px): a stacked, height-controlled layout so the 3D never
 *    covers the page.
 *
 * A single 3D canvas is ever mounted (we branch, not CSS-hide), avoiding a
 * second WebGL context. Renders a neutral backdrop until mounted to avoid any
 * SSR/hydration mismatch.
 */
export default function HomeExperience() {
  const mounted = useMounted();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!mounted) {
    return <div className="scene-backdrop min-h-screen w-full" aria-hidden />;
  }

  if (isMobile) {
    return <MobileHome />;
  }

  // Desktop cinematic experience (unchanged).
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
