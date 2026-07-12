import { NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/razorpay";
import { orderStore } from "@/lib/orders";
import { createShipmentForPaidOrder } from "@/lib/fulfillment";

export const runtime = "nodejs";
// Razorpay signs the raw body, so we must read it verbatim (no JSON parsing first).
export const dynamic = "force-dynamic";

interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; amount?: number } };
    order?: { entity?: { id?: string } };
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // Only these confirm a captured payment; mark paid idempotently.
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderId =
      payment?.order_id ?? event.payload?.order?.entity?.id ?? null;
    if (orderId) {
      // If the event carries an amount, confirm it matches the order's
      // expected prepaid_amount before marking paid. (order.paid may omit the
      // payment entity — then we rely on the signature-verified event.)
      // TODO: for absolute assurance, reconcile via getRazorpay().payments.fetch.
      const existing = await orderStore.getByRazorpayOrderId(orderId);
      const payloadAmount =
        payment?.amount != null ? Number(payment.amount) : null;
      if (
        existing &&
        payloadAmount != null &&
        payloadAmount !== existing.prepaidAmount
      ) {
        console.error("[webhook] payment amount mismatch", {
          orderId,
          expected: existing.prepaidAmount,
          captured: payloadAmount,
        });
        return NextResponse.json({ received: true });
      }

      const order = await orderStore.markPaid(orderId, payment?.id ?? "webhook");
      // Shared, idempotent shipment creation — covers the case where the
      // browser never reached /verify.
      if (order) await createShipmentForPaidOrder(order);
    }
  } else if (event.event === "payment.failed") {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) await orderStore.markFailed(orderId);
  }

  // Always 200 on a verified event so Razorpay stops retrying.
  return NextResponse.json({ received: true });
}
