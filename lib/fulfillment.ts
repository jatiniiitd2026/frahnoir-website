import "server-only";

import { orderStore } from "@/lib/orders";
import { createShipmentForOrder } from "@/lib/delhivery";
import type { Order } from "@/lib/orders/types";

/**
 * Shared, idempotent shipment creation for a PAID order. Called from BOTH the
 * client-driven verify route and the Razorpay webhook, so a shipment is created
 * even if the customer's browser never returns to /verify.
 *
 * Guarantees:
 *  - Never changes payment status (only shipping_status / awb).
 *  - Never throws — payment confirmation must not depend on Delhivery.
 *  - Idempotent — re-reads the freshest order state and no-ops if already shipped.
 *  - Logs are safe (HTTP status / messages only, never tokens/secrets).
 */
export async function createShipmentForPaidOrder(input: Order): Promise<void> {
  try {
    // Re-load the freshest state to guard against stale reads / double-fire
    // (verify + webhook). Falls back to the passed order if the re-read fails.
    const order =
      (await orderStore.getByRazorpayOrderId(input.razorpayOrderId)) ?? input;

    // Only ship confirmed payments.
    if (order.status !== "paid" && order.status !== "advance_paid") return;
    // Idempotent: never create a second shipment.
    if (order.shippingStatus === "created") return;

    const result = await createShipmentForOrder(order);

    if (result.ok) {
      await orderStore.setShipping(order.razorpayOrderId, {
        shippingStatus: "created",
        awb: result.awb,
      });
    } else if (result.skipped) {
      // Delhivery not configured — keep payment successful, leave shipping pending.
      console.warn(
        `[fulfillment] Delhivery not configured — shipment skipped for order ${order.id}`,
      );
    } else {
      console.error(
        `[fulfillment] Delhivery shipment failed for order ${order.id}: ${result.error}`,
      );
      await orderStore.setShipping(order.razorpayOrderId, {
        shippingStatus: "failed",
      });
    }
  } catch (err) {
    // Absolute safety net — never propagate to the payment flow.
    console.error(
      "[fulfillment] shipment creation threw:",
      err instanceof Error ? err.message : "unknown error",
    );
    try {
      await orderStore.setShipping(input.razorpayOrderId, {
        shippingStatus: "failed",
      });
    } catch {
      /* ignore — must never block payment success */
    }
  }
}
