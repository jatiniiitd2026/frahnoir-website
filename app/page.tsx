import PerfumeScene from "@/components/PerfumeScene";
import ScrollOverlay from "@/components/ScrollOverlay";
import SiteHeader from "@/components/SiteHeader";
import { DEBUG_VISUAL_LEATHER } from "@/lib/debug";

export default function Home() {
  return (
    <main>
      {/* Layer 0: cinematic burgundy/amber backdrop behind the transparent canvas */}
      <div className="scene-backdrop pointer-events-none fixed inset-0 z-0" />

      {/* TEMPORARY: only ever shows in dev while DEBUG_VISUAL_LEATHER is on — never in production. */}
      {DEBUG_VISUAL_LEATHER && process.env.NODE_ENV !== "production" && (
        <div className="pointer-events-none fixed bottom-4 left-4 z-50 rounded-full border border-velvet-gold/50 bg-velvet-ink/80 px-4 py-2 text-[0.6rem] uppercase tracking-luxe text-velvet-gold backdrop-blur">
          Leather material debug active
        </div>
      )}

      {/* Fixed full-viewport 3D scene + HTML overlay + chrome */}
      <PerfumeScene />
      <SiteHeader />
      <ScrollOverlay />

      {/*
        The scroll "stage" provides the scrollable length that GSAP
        ScrollTrigger maps to a 0→1 progress value. Six viewport heights gives
        the reveal room to breathe across all six timeline phases.
      */}
      <div id="scroll-stage" className="relative h-[600vh]" aria-hidden />
    </main>
  );
}
