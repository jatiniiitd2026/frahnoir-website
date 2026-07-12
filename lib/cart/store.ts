"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A cart line stores only slug + quantity; price/details come from lib/products. */
export interface CartLine {
  slug: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  addItem: (slug: string, quantity?: number) => void;
  /** Upsert to an EXACT quantity (used by Buy Now — never increments). */
  buyNow: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (slug, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.slug === slug);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.slug === slug
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { slug, quantity }] };
        }),
      buyNow: (slug, quantity) =>
        set((state) => {
          const q = Math.max(1, quantity);
          const exists = state.lines.some((l) => l.slug === slug);
          return {
            lines: exists
              ? state.lines.map((l) =>
                  l.slug === slug ? { ...l, quantity: q } : l,
                )
              : [...state.lines, { slug, quantity: q }],
          };
        }),
      removeItem: (slug) =>
        set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.slug !== slug)
              : state.lines.map((l) =>
                  l.slug === slug ? { ...l, quantity } : l,
                ),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "frahnoir-cart" },
  ),
);

/** Total number of units in the cart (selector helper). */
export const selectCartCount = (state: CartState) =>
  state.lines.reduce((n, l) => n + l.quantity, 0);
