/**
 * Client-safe review constants. Kept OUT of lib/reviews.ts (which is
 * server-only) so client components like ReviewForm can import these without
 * pulling the Supabase service-role client into the browser bundle.
 */

export const REVIEW_PRODUCTS = [
  { value: "velvet-ember", label: "Velvet Ember" },
  { value: "sweet-s1n", label: "Sweet S1N" },
  { value: "general", label: "General" },
] as const;

export function reviewProductLabel(slug: string | null): string {
  return REVIEW_PRODUCTS.find((p) => p.value === slug)?.label ?? "General";
}
