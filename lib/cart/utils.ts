import { getProductBySlug, type Product } from "@/lib/products";
import type { CartLine } from "@/lib/cart/store";

export interface CartLineDetailed {
  product: Product;
  quantity: number;
  lineTotal: number;
}

/** Resolve cart lines against the catalogue, dropping any unknown slugs. */
export function detailedLines(lines: CartLine[]): CartLineDetailed[] {
  return lines
    .map((l) => {
      const product = getProductBySlug(l.slug);
      if (!product) return null;
      return {
        product,
        quantity: l.quantity,
        lineTotal: product.price * l.quantity,
      };
    })
    .filter((x): x is CartLineDetailed => x !== null);
}

export function cartSubtotal(lines: CartLine[]): number {
  return detailedLines(lines).reduce((sum, l) => sum + l.lineTotal, 0);
}
