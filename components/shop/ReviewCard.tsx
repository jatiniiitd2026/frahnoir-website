import { type Review } from "@/lib/reviews";
import { reviewProductLabel } from "@/lib/reviewConstants";
import { isVideoUrl } from "@/lib/media";
import Stars from "@/components/shop/Stars";

/** Premium review card: rating, product, title, message, media preview. */
export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex flex-col rounded-2xl border border-velvet-gold/15 bg-velvet-night/40 p-6 transition-colors hover:border-velvet-gold/35">
      <div className="flex items-center justify-between gap-3">
        <Stars value={review.rating} />
        <span className="text-[0.56rem] uppercase tracking-luxe text-velvet-gold">
          {reviewProductLabel(review.product_slug)}
        </span>
      </div>

      {review.title && (
        <h3 className="mt-4 font-display text-2xl tracking-wide text-velvet-cream">
          {review.title}
        </h3>
      )}

      <p className="mt-2 flex-1 text-sm leading-relaxed text-velvet-cream/70">
        {review.message}
      </p>

      {review.media_urls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {review.media_urls.map((url) =>
            isVideoUrl(url) ? (
              <video
                key={url}
                src={url}
                controls
                className="h-28 w-full rounded-lg border border-velvet-gold/15 object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt="Customer media"
                loading="lazy"
                className="h-28 w-full rounded-lg border border-velvet-gold/15 object-cover"
              />
            ),
          )}
        </div>
      )}

      <p className="mt-5 text-[0.6rem] uppercase tracking-luxe text-velvet-cream/45">
        — {review.name}
      </p>
    </article>
  );
}
