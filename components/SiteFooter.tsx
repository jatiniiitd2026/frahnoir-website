import Link from "next/link";

/**
 * Shared site footer with the compliance links required for payment-gateway
 * review. Reused across all shop pages and the homepage. `relative z-40` +
 * solid background so it renders above the homepage's fixed 3D canvas when it
 * scrolls into view at the very bottom.
 */
const LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/refund-policy", label: "Cancellation & Refund" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-40 border-t border-velvet-gold/15 bg-velvet-ink px-6 py-12 text-velvet-cream sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand + contact */}
          <div className="max-w-xs">
            <p className="font-display text-2xl italic tracking-[0.18em] text-velvet-cream">
              Frahnoir
            </p>
            <p className="mt-3 text-[0.72rem] leading-relaxed text-velvet-cream/55">
              Luxury extrait de parfum — rich compositions, premium presentation.
            </p>
            <div className="mt-4 space-y-1 text-[0.68rem] text-velvet-cream/60">
              <p>
                <a href="mailto:frahnoir@gmail.com">frahnoir@gmail.com</a>
              </p>
              <p>
                <a href="https://wa.me/919311230533">+91 93112 30533</a>
              </p>
            </div>
          </div>

          {/* Policy / company links */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.66rem] uppercase tracking-luxe text-velvet-cream/70 transition-colors hover:text-velvet-gold"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-velvet-gold/10 pt-6 text-center">
          <p className="text-[0.58rem] leading-relaxed text-velvet-cream/45">
            A-3/99 2nd Floor, Paschim Vihar, New Delhi – 110063, West Delhi ·
            Support 9am–5pm IST, all week
          </p>
          <p className="mt-3 text-[0.58rem] uppercase tracking-luxe text-velvet-cream/35">
            © {new Date().getFullYear()} Frahnoir. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
