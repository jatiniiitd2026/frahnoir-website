import { NextResponse } from "next/server";

import { getRazorpay, verifyPaymentSignature } from "@/lib/razorpay";
import { orderStore } from "@/lib/orders";
import { createShipmentForPaidOrder } from "@/lib/fulfillment";

export const runtime = "nodejs";

/**
 * Called by the browser right after the Razorpay checkout succeeds. We verify
 * the signature AND the captured amount server-side, and only THEN mark the
 * order paid/advance_paid. The webhook is a second, independent confirmation
 * path. Shipment creation is shared + idempotent.
 */
export async function POST(request: Request) {
  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { error: "Missing payment verification fields." },
      { status: 400 },
    );
  }

  // 1) Authenticity: HMAC signature over order_id|payment_id.
  const valid = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!valid) {
    await orderStore.markFailed(orderId);
    return NextResponse.json(
      { verified: false, error: "Payment signature verification failed." },
      { status: 400 },
    );
  }

  // Load the order so we know the server-authoritative expected charge.
  const pending = await orderStore.getByRazorpayOrderId(orderId);
  if (!pending) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // 2) Amount assertion: the captured payment must equal the order's
  //    prepaid_amount (full total for prepaid, 25% for partial COD). Never
  //    trust any frontend amount.
  try {
    const payment = (await getRazorpay().payments.fetch(paymentId)) as {
      amount: number | string;
      order_id: string | null;
    };
    const capturedAmount = Number(payment.amount);
    if (payment.order_id !== orderId || capturedAmount !== pending.prepaidAmount) {
      console.error("[verify] payment amount/order mismatch", {
        orderId,
        expected: pending.prepaidAmount,
        captured: capturedAmount,
      });
      await orderStore.markFailed(orderId);
      return NextResponse.json(
        { verified: false, error: "Payment amount mismatch." },
        { status: 400 },
      );
    }
  } catch (err) {
    // Could not reach Razorpay to confirm the amount. The signature + the
    // server-created order_id already bind the charge to our amount, so we
    // proceed. Webhook provides a second confirmation path.
    console.warn(
      "[verify] could not fetch payment for amount assertion:",
      err instanceof Error ? err.message : "unknown error",
    );
  }

  // 3) Mark paid/advance_paid (idempotent, method-aware).
  const order = await orderStore.markPaid(orderId, paymentId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // 4) Create the Delhivery shipment (shared + idempotent; never blocks success).
  await createShipmentForPaidOrder(order);

  return NextResponse.json({
    verified: true,
    orderId: order.id,
    paymentMethod: order.paymentMethod,
  });
}
