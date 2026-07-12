/**
 * Single source of truth for the catalogue. The server ALWAYS recomputes order
 * amounts from this file — the frontend price is display-only and never trusted.
 */

/**
 * 3D-scene texture set for a product. These are NEVER used as the catalogue /
 * product-card image — they are panel/label maps for the React Three Fiber
 * scene only. The shopfront uses `Product.image` (a full product render).
 */
export interface ProductTextures {
  boxFront: string;
  boxLeft: string;
  boxRight: string;
  boxBack: string;
  boxTop: string;
  bottleLabel: string;
}

/** Fragrance pyramid for the product page notes section (display only). */
export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  slug: string;
  name: string;
  type: string;
  size: string;
  character: string[];
  recommendedFor: string[];
  notes: FragranceNotes;
  /** Price in major currency units (INR rupees). */
  price: number;
  currency: "INR";
  /** Full product render shown on cards + the product page (NOT a texture). */
  image: string;
  /** 3D-scene maps only — keep separate from `image`. */
  textures: ProductTextures;
  tagline: string;
  description: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "velvet-ember",
    name: "Velvet Ember",
    type: "Extrait de Parfum",
    size: "50ml",
    character: ["Aquatic", "Citrusy", "Aromatic", "Elegant"],
    recommendedFor: [
      "Casual Outings",
      "Weekend Getaways",
      "Summer Days",
      "Daily Wear",
    ],
    notes: {
      top: ["Bergamot", "Sea Salt", "Grapefruit"],
      heart: ["Lavender", "Geranium", "Sage"],
      base: ["Cedarwood", "Amber", "Musk"],
    },
    price: 2899,
    currency: "INR",
    image: "/images/products/velvet-ember.jpg",
    textures: {
      boxFront: "/textures/velvet_ember/velvet_ember_box_front.png",
      boxLeft: "/textures/velvet_ember/velvet_ember_box_left_character.png",
      boxRight: "/textures/velvet_ember/velvet_ember_box_right_recommended.png",
      boxBack: "/textures/velvet_ember/velvet_ember_box_back_legal.png",
      boxTop: "/textures/velvet_ember/velvet_ember_box_top.png",
      bottleLabel: "/textures/velvet_ember/velvet_ember_bottle_label_wrap.png",
    },
    tagline: "A glowing trail of sea salt, bergamot and warm amber.",
    description:
      "Velvet Ember opens with a clean breath of aquatic citrus, settling into an aromatic heart of lavender and sage before a refined, lingering drydown. An everyday signature with quiet confidence.",
  },
  {
    slug: "sweet-s1n",
    name: "Sweet S1N",
    type: "Extrait de Parfum",
    size: "50ml",
    character: ["Aromatic", "Woody", "Subtly Floral", "Sophisticated"],
    recommendedFor: [
      "Daytime Wear",
      "Dates",
      "Social Events",
      "Evening Outings",
    ],
    notes: {
      top: ["Bergamot", "Pink Pepper", "Cardamom"],
      heart: ["Orris", "Jasmine", "Violet"],
      base: ["Sandalwood", "Amber", "Musk"],
    },
    price: 2899,
    currency: "INR",
    image: "/images/products/sweet-s1n.jpg",
    textures: {
      boxFront: "/textures/sweet_s1n/sweet_s1n_box_front.png",
      boxLeft: "/textures/sweet_s1n/sweet_s1n_box_left_character.png",
      boxRight: "/textures/sweet_s1n/sweet_s1n_box_right_recommended.png",
      boxBack: "/textures/sweet_s1n/sweet_s1n_box_back_legal.png",
      boxTop: "/textures/sweet_s1n/sweet_s1n_box_top.png",
      bottleLabel: "/textures/sweet_s1n/sweet_s1n_bottle_label_wrap.png",
    },
    tagline: "Aromatic woods wrapped in a soft, sophisticated bloom.",
    description:
      "Sweet S1N balances warm woods with a subtle floral heart and an aromatic edge — a versatile, polished scent that carries from daytime ease into evening allure.",
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Format a rupee amount as e.g. "₹2,899". */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
