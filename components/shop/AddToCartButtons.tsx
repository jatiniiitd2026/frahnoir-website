"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/lib/cart/store";
import QuantityStepper from "@/components/shop/QuantityStepper";

export default function AddToCartButtons({ slug }: { slug: string }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const buyNow = useCartStore((s) => s.buyNow);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    // Set the exact selected quantity (never increments / double-adds).
    buyNow(slug, qty);
    router.push("/checkout");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <span className="text-[0.62rem] uppercase tracking-luxe text-velvet-cream/60">
          Quantity
        </span>
        <QuantityStepper value={qty} onChange={setQty} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          className="min-w-44 rounded-full border border-velvet-gold/55 px-8 py-3.5 text-[0.7rem] uppercase tracking-luxe text-velvet-gold transition-colors hover:bg-velvet-gold hover:text-velvet-ink"
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="min-w-44 rounded-full bg-gold-sheen px-8 py-3.5 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
