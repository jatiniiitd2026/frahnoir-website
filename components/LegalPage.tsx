import type { ReactNode } from "react";

/**
 * Shared shell for the compliance/legal/company pages so they all match the
 * Frahnoir look: gold eyebrow, serif title, readable cream prose. Child
 * <h2>/<p>/<ul>/<a>/<strong> are styled via arbitrary variants.
 */
export default function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
      <p className="text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
        Frahnoir
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-[0.04em] text-velvet-cream sm:text-5xl">
        {title}
      </h1>
      {intro && (
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-velvet-cream/70">
          {intro}
        </p>
      )}
      <div
        className="mt-10 space-y-5 text-sm leading-relaxed text-velvet-cream/75
          [&_a]:text-velvet-gold [&_a]:underline
          [&_h2]:mt-9 [&_h2]:font-display [&_h2]:text-xl [&_h2]:tracking-wide [&_h2]:text-velvet-goldlight
          [&_li]:marker:text-velvet-gold
          [&_strong]:text-velvet-cream
          [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
      >
        {children}
      </div>
    </section>
  );
}
