"use client";

import { useRef, useState } from "react";

import { REVIEW_PRODUCTS } from "@/lib/reviewConstants";
import {
  ACCEPTED_MEDIA,
  MAX_FILE_SIZE,
  MAX_REVIEW_FILES,
  isAllowedMimeType,
} from "@/lib/media";

type Status = "idle" | "submitting" | "success" | "error";

export default function ReviewForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const labelCls =
    "mb-1.5 block text-[0.6rem] uppercase tracking-luxe text-velvet-cream/55";
  const inputCls =
    "w-full rounded-lg border border-velvet-gold/20 bg-velvet-ink/60 px-4 py-3 text-sm text-velvet-cream outline-none transition-colors placeholder:text-velvet-cream/30 focus:border-velvet-gold/60";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("rating", String(rating));

    // --- Client-side validation (server re-validates) ---
    if (!String(data.get("name") ?? "").trim()) {
      setError("Please enter your name.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }
    if (!String(data.get("message") ?? "").trim()) {
      setError("Please write your review.");
      return;
    }
    const files = data.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_REVIEW_FILES) {
      setError(`Please upload at most ${MAX_REVIEW_FILES} files.`);
      return;
    }
    for (const f of files) {
      if (!isAllowedMimeType(f.type)) {
        setError("Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4 or WEBM.");
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError("File too large — each file must be 8 MB or smaller.");
        return;
      }
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/reviews", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      form.reset();
      setRating(0);
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-velvet-gold/25 bg-velvet-night/50 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-velvet-gold/50 text-xl text-velvet-gold">
          ✓
        </div>
        <p className="mt-6 font-display text-2xl text-velvet-cream">Thank you.</p>
        <p className="mt-3 text-sm text-velvet-cream/65">
          Your review will appear after approval.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 rounded-full border border-velvet-gold/50 px-7 py-2.5 text-[0.66rem] uppercase tracking-luxe text-velvet-gold transition-colors hover:bg-velvet-gold hover:text-velvet-ink"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-velvet-gold/20 bg-velvet-night/50 p-7 sm:p-9"
    >
      <h2 className="font-display text-2xl text-velvet-cream">Share your experience</h2>
      <div className="my-5 h-px w-full gold-rule" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label>
          <span className={labelCls}>Name *</span>
          <input name="name" type="text" autoComplete="name" className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Email (optional)</span>
          <input name="email" type="email" autoComplete="email" className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Product</span>
          <select name="product" defaultValue="general" className={inputCls}>
            {REVIEW_PRODUCTS.map((p) => (
              <option key={p.value} value={p.value} className="bg-velvet-ink">
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className={labelCls}>Rating *</span>
          <div className="flex items-center gap-1 pt-1.5 text-2xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className={
                  i <= (hover || rating)
                    ? "text-velvet-gold"
                    : "text-velvet-cream/25"
                }
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="mt-5 block">
        <span className={labelCls}>Title (optional)</span>
        <input name="title" type="text" className={inputCls} />
      </label>

      <label className="mt-5 block">
        <span className={labelCls}>Your review *</span>
        <textarea name="message" rows={4} className={`${inputCls} resize-none`} />
      </label>

      <label className="mt-5 block">
        <span className={labelCls}>
          Photos / videos (optional · up to {MAX_REVIEW_FILES}, 8 MB each · JPG, PNG, WEBP, GIF, MP4, WEBM)
        </span>
        <input
          name="media"
          type="file"
          multiple
          accept={ACCEPTED_MEDIA}
          className="w-full text-xs text-velvet-cream/70 file:mr-4 file:rounded-full file:border file:border-velvet-gold/40 file:bg-transparent file:px-5 file:py-2 file:text-[0.62rem] file:uppercase file:tracking-luxe file:text-velvet-gold hover:file:bg-velvet-gold/10"
        />
      </label>

      {error && (
        <p className="mt-5 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-xs text-velvet-cream/85">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 w-full rounded-full bg-gold-sheen px-8 py-3.5 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
