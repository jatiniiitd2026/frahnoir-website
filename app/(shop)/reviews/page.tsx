import type { Metadata } from "next";

import { getApprovedReviews } from "@/lib/reviews";
import ReviewCard from "@/components/shop/ReviewCard";
import ReviewForm from "@/components/shop/ReviewForm";

export const metadata: Metadata = {
  title: "Reviews · Frahnoir",
  description: "What our clients say about the Frahnoir collection.",
};

// Reviews are dynamic (fetched per request); never statically cached.
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <header className="text-center">
        <p className="text-[0.62rem] uppercase tracking-wider2 text-velvet-gold">
          Frahnoir
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[0.04em] text-velvet-cream sm:text-6xl">
          Client Reviews
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-velvet-cream/60">
          Impressions from those who wear Frahnoir. Every review is read and
          approved before it appears here.
        </p>
      </header>

      {/* Approved reviews */}
      {reviews.length > 0 ? (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-sm text-velvet-cream/50">
          No reviews yet — be the first to share your experience.
        </p>
      )}

      {/* Submission form */}
      <div className="mx-auto mt-20 max-w-2xl">
        <ReviewForm />
      </div>
    </section>
  );
}
