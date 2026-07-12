import type { Metadata } from "next";
import Link from "next/link";

import { whatsappLink } from "@/lib/shop";

export const metadata: Metadata = { title: "Payment Failed · Frahnoir" };

export default function OrderFailedPage() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center sm:py-36">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ember/60 text-2xl text-ember">
        !
      </div>
      <p className="mt-8 text-[0.62rem] uppercase tracking-wider2 text-velvet-cream/55">
        Payment Not Completed
      </p>
      <h1 className="mt-4 font-display text-5xl tracking-[0.04em] text-velvet-cream">
        Something Went Wrong
      </h1>
      <p className="mt-5 max-w-sm text-sm leading-relaxed text-velvet-cream/65">
        Your payment could not be confirmed. No amount has been captured. You can
        retry checkout or reach us directly on WhatsApp.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/checkout"
          className="rounded-full bg-gold-sheen px-8 py-3.5 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
        >
          Retry Checkout
        </Link>
        <a
          href={whatsappLink("Hi Frahnoir, I had trouble completing my payment.")}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-velvet-gold/50 px-8 py-3.5 text-[0.7rem] uppercase tracking-luxe text-velvet-gold transition-colors hover:bg-velvet-gold hover:text-velvet-ink"
        >
          Contact on WhatsApp
        </a>
      </div>
    </section>
  );
}
