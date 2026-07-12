import "server-only";

import type { Order } from "@/lib/orders/types";

/**
 * Delhivery shipment creation. Token comes ONLY from env (never hard-coded, no
 * login/password in code). All money is converted from PAISE → RUPEES here,
 * since Delhivery expects rupee amounts for COD/total.
 *
 * IMPORTANT: exact field names + accepted enum values vary per Delhivery
 * account/manifest. The payload below follows the common CMU "create package"
 * shape. Confirm against your account's API docs before go-live — TODOs mark
 * the spots most likely to differ.
 */

const BASE_URL = process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com";

export function isDelhiveryConfigured(): boolean {
  return Boolean(
    process.env.DELHIVERY_API_TOKEN && process.env.DELHIVERY_PICKUP_NAME,
  );
}

export interface ShipmentResult {
  ok: boolean;
  awb?: string;
  /** True when Delhivery isn't configured — treated as a soft skip. */
  skipped?: boolean;
  error?: string;
}

const paiseToRupees = (paise: number) => Math.round(paise) / 100;

export async function createShipmentForOrder(
  order: Order,
): Promise<ShipmentResult> {
  if (!isDelhiveryConfigured()) {
    return { ok: false, skipped: true, error: "Delhivery not configured." };
  }

  const token = process.env.DELHIVERY_API_TOKEN!;
  const pickupName = process.env.DELHIVERY_PICKUP_NAME!;

  // Business rule: partial_cod ships as COD (collect cod_amount), prepaid ships
  // Pre-paid with 0 collectable. Amounts are server-derived, never client.
  const isCod = order.paymentMethod === "partial_cod";
  // TODO(delhivery): confirm the exact accepted enum — some accounts use
  // "Prepaid"/"COD", others "Pre-paid". Adjust if the API rejects this value.
  const paymentMode = isCod ? "COD" : "Prepaid";
  const codAmount = isCod ? paiseToRupees(order.delhiveryCodAmount) : 0;
  const totalAmount = paiseToRupees(order.amount);

  const shipment = {
    name: order.customer.fullName,
    add: order.customer.address,
    city: order.customer.city,
    state: order.customer.state,
    country: "India",
    pin: order.customer.pincode,
    phone: order.customer.phone,
    order: order.id,
    payment_mode: paymentMode,
    cod_amount: codAmount, // rupees (0 for prepaid)
    total_amount: totalAmount, // rupees
    // TODO(delhivery): add product/description/weight fields your manifest requires.
  };

  const payload = {
    shipments: [shipment],
    pickup_location: { name: pickupName },
  };

  const body =
    "format=json&data=" + encodeURIComponent(JSON.stringify(payload));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${BASE_URL}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      signal: controller.signal,
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: `Delhivery HTTP ${res.status}` };
    }

    // TODO(delhivery): confirm the response shape. CMU commonly returns
    // { success, packages: [{ waybill, status }] }.
    const packages = (json as { packages?: Array<{ waybill?: string }> })
      ?.packages;
    const awb = packages?.[0]?.waybill;
    if (!awb) {
      return { ok: false, error: "No AWB returned by Delhivery." };
    }
    return { ok: true, awb };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Delhivery request failed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
