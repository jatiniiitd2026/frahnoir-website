/** Shared shop configuration + small client helpers. */

import type { Product } from "@/lib/products";

/** WhatsApp number for the order/enquiry fallback (digits only, intl format). */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "910000000000";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryMessage(product: Product): string {
  return `Hi Frahnoir, I'm interested in ${product.name} (${product.type}, ${product.size}). Could you help me order?`;
}

export function orderEnquiryMessage(summary: string): string {
  return `Hi Frahnoir, I'd like to place an order:\n${summary}`;
}

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Order enquiry message that includes the chosen payment method. For Partial
 * COD it spells out the advance + remaining amounts (all in rupees).
 */
export function orderPaymentMessage(opts: {
  summary: string;
  method: "prepaid" | "partial_cod";
  total: number; // rupees
  advance: number; // rupees
  cod: number; // rupees
}): string {
  const lines = [
    "Hi Frahnoir, I'd like to place an order:",
    opts.summary,
    "",
    `Payment: ${opts.method === "partial_cod" ? "Partial COD" : "Pay Online"}`,
    `Order total: ${rupees(opts.total)}`,
  ];
  if (opts.method === "partial_cod") {
    lines.push(`Advance now (25%): ${rupees(opts.advance)}`);
    lines.push(`Pay on delivery (75%): ${rupees(opts.cod)}`);
  }
  lines.push("Delivered via Delhivery");
  return lines.join("\n");
}
