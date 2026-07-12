import type { Metadata } from "next";

import CheckoutForm from "@/components/shop/CheckoutForm";

export const metadata: Metadata = { title: "Checkout · Frahnoir" };

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-20">
      <h1 className="font-display text-4xl tracking-[0.04em] text-velvet-cream sm:text-5xl">
        Checkout
      </h1>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </section>
  );
}
