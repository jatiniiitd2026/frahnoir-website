import Image from "next/image";
import Link from "next/link";

import { formatINR, type Product } from "@/lib/products";

/** Premium catalogue tile — framed product image + serif name + price. */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-velvet-gold/15 bg-velvet-night/40 transition-all duration-500 hover:border-velvet-gold/45 hover:shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-velvet-ink">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 90vw, 40vw"
          className="object-contain p-3 transition-opacity duration-500 group-hover:opacity-95"
        />
      </div>

      <div className="px-6 py-5 text-center">
        <p className="text-[0.58rem] uppercase tracking-luxe text-velvet-gold">
          {product.type}
        </p>
        <h3 className="mt-2 font-display text-2xl tracking-wide text-velvet-cream transition-colors group-hover:text-velvet-goldlight">
          {product.name}
        </h3>
        <p className="mt-1 text-[0.66rem] uppercase tracking-luxe text-velvet-cream/55">
          {product.size}
        </p>
        <p className="mt-4 font-display text-lg text-velvet-goldlight">
          {formatINR(product.price)}
        </p>
      </div>
    </Link>
  );
}
