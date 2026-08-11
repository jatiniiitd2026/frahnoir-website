import Link from "next/link";

import ShopHeader from "@/components/shop/ShopHeader";

/**
 * Chrome for all ecommerce routes (/products, /cart, /checkout, …). The 3D
 * homepage lives at app/page.tsx OUTSIDE this group, so it is untouched.
 */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-bg flex min-h-screen flex-col text-velvet-cream">
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-velvet-gold/15 px-6 py-10 text-center sm:px-10">
        <p className="font-display text-lg italic tracking-[0.18em] text-velvet-cream/80">
          Frahnoir
        </p>
        <div className="mt-4 flex justify-center gap-6 text-[0.58rem] uppercase tracking-luxe text-velvet-cream/50">
          <Link href="/products" className="hover:text-velvet-gold">
            Collection
          </Link>
          <Link href="/cart" className="hover:text-velvet-gold">
            Cart
          </Link>
          <Link href="/" className="hover:text-velvet-gold">
            Experience
          </Link>
        </div>
        <p className="mt-6 text-[0.58rem] uppercase tracking-luxe text-velvet-cream/35">
          © {new Date().getFullYear()} Frahnoir
        </p>
      </footer>
    </div>
  );
}
