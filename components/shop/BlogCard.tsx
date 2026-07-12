import Link from "next/link";

import { type BlogPost } from "@/lib/blog";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Editorial blog card — cover image, date, title, excerpt. */
export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-velvet-gold/15 bg-velvet-night/40 transition-all duration-500 hover:border-velvet-gold/40 hover:shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-velvet-ink">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl italic text-velvet-gold/40">
            Frahnoir
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.56rem] uppercase tracking-luxe text-velvet-gold">
          {formatDate(post.published_at)} · Journal
        </p>
        <h3 className="mt-3 font-display text-2xl leading-tight tracking-wide text-velvet-cream transition-colors group-hover:text-velvet-goldlight">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-velvet-cream/60">
            {post.excerpt}
          </p>
        )}
        <span className="mt-5 text-[0.6rem] uppercase tracking-luxe text-velvet-gold">
          Read Article →
        </span>
      </div>
    </Link>
  );
}
