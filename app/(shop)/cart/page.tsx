import type { Metadata } from "next";

import CartView from "@/components/shop/CartView";

export const metadata: Metadata = { title: "Cart · Frahnoir" };

export default function CartPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-20">
      <h1 className="font-display text-4xl tracking-[0.04em] text-velvet-cream sm:text-5xl">
        Your Cart
      </h1>
      <div className="mt-10">
        <CartView />
      </div>
    </section>
  );
}
