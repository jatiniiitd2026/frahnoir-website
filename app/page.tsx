import HomeExperience from "@/components/HomeExperience";
import { DEBUG_VISUAL_LEATHER } from "@/lib/debug";

export default function Home() {
  return (
    // No wrapping <main> here — each variant renders its own semantic root,
    // and MobileHome uses a <main>, so wrapping would nest <main> (invalid).
    <>
      {/* TEMPORARY: only ever shows in dev while DEBUG_VISUAL_LEATHER is on — never in production. */}
      {DEBUG_VISUAL_LEATHER && process.env.NODE_ENV !== "production" && (
        <div className="pointer-events-none fixed bottom-4 left-4 z-50 rounded-full border border-velvet-gold/50 bg-velvet-ink/80 px-4 py-2 text-[0.6rem] uppercase tracking-luxe text-velvet-gold backdrop-blur">
          Leather material debug active
        </div>
      )}

      {/* Responsive: desktop = fixed 3D scroll hero; mobile = scroll-driven hero */}
      <HomeExperience />
    </>
  );
}
