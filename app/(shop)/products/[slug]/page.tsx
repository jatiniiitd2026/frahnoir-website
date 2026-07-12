import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllProducts,
  getProductBySlug,
  formatINR,
} from "@/lib/products";
import { productEnquiryMessage } from "@/lib/shop";
import AddToCartButtons from "@/components/shop/AddToCartButtons";
import WhatsAppButton from "@/components/shop/WhatsAppButton";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not found · Frahnoir" };
  return {
    title: `${product.name} · Frahnoir`,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <article className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
      <Link
        href="/products"
        className="text-[0.6rem] uppercase tracking-luxe text-velvet-cream/55 transition-colors hover:text-velvet-gold"
      >
        ← The Collection
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Product image — full render, never cropped */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-velvet-gold/20 bg-velvet-ink">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-contain p-4"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
            {product.type} · {product.size}
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-[0.04em] text-velvet-cream sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-md text-sm italic leading-relaxed text-velvet-cream/70">
            {product.tagline}
          </p>

          <p className="mt-6 font-display text-3xl text-velvet-goldlight">
            {formatINR(product.price)}
          </p>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-velvet-cream/65">
            {product.description}
          </p>

          {/* Character */}
          <div className="mt-8">
            <p className="text-[0.58rem] uppercase tracking-luxe text-velvet-gold">
              Character
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.character.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-velvet-gold/25 px-4 py-1.5 text-[0.66rem] uppercase tracking-luxe text-velvet-cream/80"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended for */}
          <div className="mt-6">
            <p className="text-[0.58rem] uppercase tracking-luxe text-velvet-gold">
              Recommended For
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {product.recommendedFor.map((r) => (
                <li
                  key={r}
                  className="flex items-center gap-2 text-[0.72rem] uppercase tracking-luxe text-velvet-cream/70"
                >
                  <span className="text-velvet-gold">✦</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Fragrance notes */}
          <div className="mt-6">
            <p className="text-[0.58rem] uppercase tracking-luxe text-velvet-gold">
              Fragrance Notes
            </p>
            <dl className="mt-3 space-y-2.5">
              {(
                [
                  ["Top", product.notes.top],
                  ["Heart", product.notes.heart],
                  ["Base", product.notes.base],
                ] as const
              ).map(([layer, list]) => (
                <div key={layer} className="flex items-baseline gap-4">
                  <dt className="w-14 shrink-0 text-[0.6rem] uppercase tracking-luxe text-velvet-cream/45">
                    {layer}
                  </dt>
                  <dd className="text-sm text-velvet-cream/80">
                    {list.join(" · ")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="my-8 h-px w-full gold-rule" />

          <AddToCartButtons slug={product.slug} />

          <div className="mt-6">
            <WhatsAppButton
              message={productEnquiryMessage(product)}
              label="Enquire on WhatsApp"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
