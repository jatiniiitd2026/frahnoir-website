import ShopHeader from "@/components/shop/ShopHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Chrome for all ecommerce routes (/products, /cart, /checkout, policy pages…).
 * The 3D homepage lives at app/page.tsx OUTSIDE this group.
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
      <SiteFooter />
    </div>
  );
}
