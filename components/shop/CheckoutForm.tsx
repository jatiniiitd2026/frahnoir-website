"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/lib/cart/store";
import { detailedLines, cartSubtotal } from "@/lib/cart/utils";
import { formatINR } from "@/lib/products";
import { useMounted } from "@/lib/useMounted";
import {
  loadRazorpayScript,
  openRazorpay,
  type RazorpayHandlerResponse,
} from "@/lib/razorpayClient";
import { orderPaymentMessage } from "@/lib/shop";
import WhatsAppButton from "@/components/shop/WhatsAppButton";

type PayMethod = "prepaid" | "partial_cod";

const FIELDS = [
  { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "phone", label: "Phone Number", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "address", label: "Address Line", type: "text", autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "state", label: "State", type: "text", autoComplete: "address-level1" },
  { name: "pincode", label: "Pincode", type: "text", autoComplete: "postal-code" },
] as const;

type FormState = Record<(typeof FIELDS)[number]["name"], string>;

const EMPTY: FormState = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutForm() {
  const mounted = useMounted();
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("prepaid");

  const items = useMemo(() => detailedLines(lines), [lines]);
  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);

  // Display-only figures (server recomputes the authoritative amounts). Uses
  // the same rounding rule as the server: advance = round(total * 0.25).
  const total = subtotal;
  const payNow =
    paymentMethod === "partial_cod" ? Math.round(total * 0.25) : total;
  const payOnDelivery = total - payNow;

  const summary = items
    .map((i) => `${i.product.name} x${i.quantity} — ${formatINR(i.lineTotal)}`)
    .join("\n");

  const update = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): string | null => {
    for (const f of FIELDS) {
      if (!form[f.name].trim()) return `Please enter your ${f.label.toLowerCase()}.`;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!/^\d{6}$/.test(form.pincode)) return "Pincode must be 6 digits.";
    if (form.phone.replace(/\D/g, "").length < 10)
      return "Please enter a valid phone number.";
    return null;
  };

  const handlePay = async () => {
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines,
          customer: form,
          paymentMethod, // server decides the amount from this
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.code === "RAZORPAY_NOT_CONFIGURED"
            ? "Online payments aren't live yet — please order via WhatsApp below."
            : data?.error || "Could not start payment.",
        );
        setLoading(false);
        return;
      }

      // Never open Razorpay without a public key id (would throw
      // "Authentication key was missing"). Fail cleanly instead.
      if (!data.keyId) {
        setError(
          "Payment could not start due to a configuration issue. Please try again, or order via WhatsApp below.",
        );
        setLoading(false);
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        setError("Could not load the payment window. Please try again.");
        setLoading(false);
        return;
      }

      openRazorpay({
        key: data.keyId,
        amount: data.amount, // server-authoritative charge (paise)
        currency: data.currency,
        name: "Frahnoir",
        description:
          paymentMethod === "partial_cod"
            ? "25% Advance · Extrait de Parfum"
            : "Extrait de Parfum",
        order_id: data.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#c9a24b" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.verified) {
              clear();
              router.push(`/order-success?order=${verifyData.orderId}`);
            } else {
              router.push("/order-failed");
            }
          } catch {
            router.push("/order-failed");
          }
        },
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Avoid SSR/persisted-cart hydration mismatch — wait for the client store.
  if (!mounted) {
    return <div className="h-[30rem]" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-velvet-gold/15 bg-velvet-night/40 px-8 py-16 text-center">
        <p className="font-display text-2xl text-velvet-cream">
          Your cart is empty
        </p>
        <Link
          href="/products"
          className="mt-7 inline-block rounded-full bg-gold-sheen px-8 py-3 text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      {/* Details form */}
      <div>
        <h2 className="font-display text-2xl text-velvet-cream">
          Shipping Details
        </h2>
        <div className="my-5 h-px w-full gold-rule" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label
              key={f.name}
              className={f.name === "address" ? "sm:col-span-2" : ""}
            >
              <span className="mb-1.5 block text-[0.6rem] uppercase tracking-luxe text-velvet-cream/55">
                {f.label}
              </span>
              <input
                type={f.type}
                autoComplete={f.autoComplete}
                value={form[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                className="w-full rounded-lg border border-velvet-gold/20 bg-velvet-ink/60 px-4 py-3 text-sm text-velvet-cream outline-none transition-colors placeholder:text-velvet-cream/30 focus:border-velvet-gold/60"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Summary + pay */}
      <aside className="h-fit rounded-2xl border border-velvet-gold/20 bg-velvet-night/50 p-7">
        <h2 className="font-display text-xl text-velvet-cream">Your Order</h2>
        <div className="my-5 h-px w-full gold-rule" />
        <ul className="space-y-3">
          {items.map((i) => (
            <li
              key={i.product.slug}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-velvet-cream/80">
                {i.product.name}
                <span className="text-velvet-cream/45"> × {i.quantity}</span>
              </span>
              <span className="text-velvet-cream">{formatINR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="my-5 h-px w-full gold-rule" />

        {/* Payment method selector (default: Pay Online) */}
        <p className="mb-2 text-[0.6rem] uppercase tracking-luxe text-velvet-cream/55">
          Payment Method
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: "prepaid", label: "Pay Online" },
              { key: "partial_cod", label: "Partial COD" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPaymentMethod(opt.key)}
              className={`rounded-lg border px-3 py-2.5 text-[0.62rem] uppercase tracking-luxe transition-colors ${
                paymentMethod === opt.key
                  ? "border-velvet-gold bg-velvet-gold/10 text-velvet-gold"
                  : "border-velvet-gold/20 text-velvet-cream/60 hover:border-velvet-gold/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {paymentMethod === "partial_cod" && (
          <p className="mt-2 text-[0.62rem] leading-relaxed text-velvet-cream/55">
            Pay 25% now, pay the remaining 75% on delivery.
          </p>
        )}

        {/* Breakdown */}
        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-velvet-cream/70">Product total</dt>
            <dd className="text-velvet-cream">{formatINR(total)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-velvet-cream/70">Shipping</dt>
            <dd className="text-velvet-cream/80">Included</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-velvet-cream/70">
              Pay now
              {paymentMethod === "partial_cod" && (
                <span className="text-velvet-cream/45"> · 25%</span>
              )}
            </dt>
            <dd className="text-velvet-goldlight">{formatINR(payNow)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-velvet-cream/70">
              Pay on delivery
              {paymentMethod === "partial_cod" && (
                <span className="text-velvet-cream/45"> · 75%</span>
              )}
            </dt>
            <dd className="text-velvet-cream">{formatINR(payOnDelivery)}</dd>
          </div>
          <div className="!mt-4 flex items-center justify-between border-t border-velvet-gold/15 pt-3">
            <dt className="text-[0.66rem] uppercase tracking-luxe text-velvet-cream/55">
              Total
            </dt>
            <dd className="font-display text-xl text-velvet-goldlight">
              {formatINR(total)}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-[0.58rem] uppercase tracking-luxe text-velvet-cream/40">
          Delivered via Delhivery
        </p>

        {error && (
          <p className="mt-5 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-xs text-velvet-cream/85">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="mt-6 block w-full rounded-full bg-gold-sheen px-8 py-3.5 text-center text-[0.7rem] font-medium uppercase tracking-luxe text-velvet-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Processing…"
            : paymentMethod === "partial_cod"
              ? `Pay 25% Advance ${formatINR(payNow)}`
              : `Pay ${formatINR(total)}`}
        </button>

        <p className="mt-4 text-center text-[0.6rem] uppercase tracking-luxe text-velvet-cream/40">
          Secured by Razorpay
        </p>

        <div className="my-5 h-px w-full gold-rule" />
        <WhatsAppButton
          message={orderPaymentMessage({
            summary,
            method: paymentMethod,
            total,
            advance: payNow,
            cod: payOnDelivery,
          })}
          label="Order on WhatsApp"
          className="w-full"
        />
      </aside>
    </div>
  );
}
