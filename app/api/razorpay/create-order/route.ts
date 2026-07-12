import { NextResponse } from "next/server";

import { getProductBySlug } from "@/lib/products";
import { getRazorpay, isRazorpayConfigured } from "@/lib/razorpay";
import { orderStore } from "@/lib/orders";
import type {
  CustomerDetails,
  OrderItem,
  PaymentMethod,
} from "@/lib/orders/types";

export const runtime = "nodejs";

interface IncomingLine {
  slug: string;
  quantity: number;
}

const VALID_METHODS: PaymentMethod[] = ["prepaid", "partial_cod"];

function validateCustomer(c: unknown): CustomerDetails | null {
  if (!c || typeof c !== "object") return null;
  const o = c as Record<string, unknown>;
  const fields = [
    "fullName",
    "phone",
    "email",
    "address",
    "city",
    "state",
    "pincode",
  ] as const;
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = o[f];
    if (typeof v !== "string" || v.trim().length === 0) return null;
    out[f] = v.trim();
  }
  if (!/^\S+@\S+\.\S+$/.test(out.email)) return null;
  if (!/^\d{6}$/.test(out.pincode)) return null;
  if (out.phone.replace(/\D/g, "").length < 10) return null;
  return out as unknown as CustomerDetails;
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      {
        error: "Online payments are not configured yet.",
        code: "RAZORPAY_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let body: {
    items?: IncomingLine[];
    customer?: unknown;
    paymentMethod?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Frontend may ONLY choose the method — never any amount.
  const paymentMethod = body.paymentMethod as PaymentMethod;
  if (!VALID_METHODS.includes(paymentMethod)) {
    return NextResponse.json(
      { error: "Invalid payment method." },
      { status: 400 },
    );
  }

  const customer = validateCustomer(body.customer);
  if (!customer) {
    return NextResponse.json(
      { error: "Please provide complete, valid customer details." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Recompute everything from the catalogue — never trust frontend amounts.
  const items: OrderItem[] = [];
  let amountInRupees = 0;
  for (const line of body.items) {
    const product = getProductBySlug(String(line?.slug ?? ""));
    const qty = Number(line?.quantity);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json(
        { error: "Cart contains an invalid item." },
        { status: 400 },
      );
    }
    items.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: qty,
    });
    amountInRupees += product.price * qty;
  }

  const currency = "INR";

  // --- Server-side money math (all amounts in PAISE) ---
  // Rounding for the 25% advance is done in RUPEES so it lands on whole rupees
  // (e.g. ₹2,899 → ₹725 advance / ₹2,174 COD), then converted to paise.
  const totalPaise = amountInRupees * 100;
  let advanceRupees: number;
  if (paymentMethod === "partial_cod") {
    advanceRupees = Math.round(amountInRupees * 0.25);
  } else {
    advanceRupees = amountInRupees; // prepaid pays in full
  }
  const codRupees = amountInRupees - advanceRupees;

  const prepaidAmount = advanceRupees * 100; // paise charged online now
  const codAmount = codRupees * 100; // paise collected on delivery
  const shippingPaymentMode =
    paymentMethod === "partial_cod" ? "COD" : "Pre-paid";
  // Razorpay is charged ONLY the online portion.
  const razorpayAmount = prepaidAmount;

  try {
    const rzpOrder = await getRazorpay().orders.create({
      amount: razorpayAmount,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        payment_method: paymentMethod,
        total_amount: String(totalPaise),
        prepaid_amount: String(prepaidAmount),
        cod_amount: String(codAmount),
        customerName: customer.fullName,
        email: customer.email,
      },
    });

    const order = await orderStore.create({
      razorpayOrderId: rzpOrder.id,
      amount: totalPaise,
      currency,
      items,
      customer,
      paymentMethod,
      prepaidAmount,
      codAmount,
      shippingPaymentMode,
      delhiveryCodAmount: codAmount,
    });

    return NextResponse.json({
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      orderId: rzpOrder.id,
      currency,
      internalOrderId: order.id,
      // Server-authoritative amounts (paise) — frontend displays these only.
      amount: razorpayAmount, // what the Razorpay widget charges
      paymentMethod,
      totalAmount: totalPaise,
      prepaidAmount,
      codAmount,
    });
  } catch (err) {
    console.error("Razorpay create-order failed:", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
