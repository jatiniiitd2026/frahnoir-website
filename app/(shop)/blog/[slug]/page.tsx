import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPostBySlug } from "@/lib/blog";
import { isVideoUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found · Frahnoir" };
  return {
    title: `${post.title} · Frahnoir`,
    description: post.excerpt ?? undefined,
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.content.split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-6 py-14 sm:px-10 sm:py-20">
      <Link
        href="/blog"
        className="text-[0.6rem] uppercase tracking-luxe text-velvet-cream/55 transition-colors hover:text-velvet-gold"
      >
        ← The Journal
      </Link>

      <header className="mt-8 text-center">
        <p className="text-[0.6rem] uppercase tracking-luxe text-velvet-gold">
          {formatDate(post.published_at)}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight tracking-[0.02em] text-velvet-cream sm:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mx-auto mt-5 max-w-xl text-sm italic leading-relaxed text-velvet-cream/65">
            {post.excerpt}
          </p>
        )}
      </header>

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mt-10 w-full rounded-3xl border border-velvet-gold/20 object-cover"
        />
      )}

      {/* Article body */}
      <div className="mt-12 space-y-6">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="whitespace-pre-line text-[0.95rem] leading-8 text-velvet-cream/80"
          >
            {para}
          </p>
        ))}
      </div>

      {/* Optional media gallery */}
      {post.media_urls.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {post.media_urls.map((url) =>
            isVideoUrl(url) ? (
              <video
                key={url}
                src={url}
                controls
                className="w-full rounded-2xl border border-velvet-gold/15"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={post.title}
                loading="lazy"
                className="w-full rounded-2xl border border-velvet-gold/15 object-cover"
              />
            ),
          )}
        </div>
      )}

      {/* Related product CTA */}
      <div className="mt-16 rounded-2xl border border-velvet-gold/20 bg-velvet-night/50 p-8 text-center">
        <p className="text-[0.6rem] uppercase tracking-luxe text-velvet-gold">
          Discover
        </p>
        <h2 className="mt-3 font-display text-3xl text-velvet-cream">
          The Frahnoir Collection
        </h2>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-gold-sheen px-8 py-3.5 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
        >
          Shop Now
        </Link>
      </div>
    </article>
  );
}
