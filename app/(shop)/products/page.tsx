import type { Metadata } from "next";

import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/shop/ProductCard";

export const metadata: Metadata = {
  title: "The Collection · Frahnoir",
  description: "Frahnoir extrait de parfum — Velvet Ember & Sweet S1N.",
};

export default function ProductsPage() {
  const products = getAllProducts();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <header className="text-center">
        <p className="text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
          Maison Frahnoir
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[0.04em] text-velvet-cream sm:text-6xl">
          The Collection
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-velvet-cream/60">
          Two extrait de parfums, each a study in contrast — composed to linger,
          designed to be lived in.
        </p>
      </header>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
