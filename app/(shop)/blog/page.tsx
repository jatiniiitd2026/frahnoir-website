import type { Metadata } from "next";

import { getPublishedPosts } from "@/lib/blog";
import BlogCard from "@/components/shop/BlogCard";

export const metadata: Metadata = {
  title: "Journal · Frahnoir",
  description: "Stories, notes and craft from the house of Frahnoir.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <header className="text-center">
        <p className="text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
          Maison Frahnoir
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[0.04em] text-velvet-cream sm:text-6xl">
          The Journal
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-velvet-cream/60">
          Notes on craft, character and the art of scent.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-sm text-velvet-cream/50">
          New stories are coming soon.
        </p>
      )}
    </section>
  );
}
