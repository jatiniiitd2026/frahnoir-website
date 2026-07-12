export type OrderStatus = "created" | "paid" | "advance_paid" | "failed";

export type PaymentMethod = "prepaid" | "partial_cod";

export type ShippingPaymentMode = "Pre-paid" | "COD";

export type ShippingStatus = "pending" | "created" | "failed";

export interface OrderItem {
  slug: string;
  name: string;
  /** Unit price in INR at time of order. */
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  razorpayOrderId: string;
  /** FULL order total in paise (authoritative server value). */
  amount: number;
  currency: string;
  items: OrderItem[];
  customer: CustomerDetails;
  status: OrderStatus;
  paymentId?: string;

  // --- Payment mode (prepaid vs partial COD) — all money in PAISE ---
  paymentMethod: PaymentMethod;
  /** Amount charged online now, in paise (= total for prepaid, 25% for partial). */
  prepaidAmount: number;
  /** Amount collected on delivery, in paise (0 for prepaid). */
  codAmount: number;
  shippingPaymentMode: ShippingPaymentMode;
  /** COD amount handed to Delhivery, in paise (mirrors codAmount). */
  delhiveryCodAmount: number;

  // --- Shipping (Delhivery) ---
  shippingStatus?: ShippingStatus;
  awb?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  razorpayOrderId: string;
  /** FULL order total in paise. */
  amount: number;
  currency: string;
  items: OrderItem[];
  customer: CustomerDetails;
  paymentMethod: PaymentMethod;
  prepaidAmount: number;
  codAmount: number;
  shippingPaymentMode: ShippingPaymentMode;
  delhiveryCodAmount: number;
}

export interface ShippingUpdate {
  shippingStatus: ShippingStatus;
  awb?: string;
}

/**
 * Storage contract. Swap the implementation in lib/orders/index.ts for Supabase
 * or MongoDB later without touching the API routes.
 */
export interface OrderStore {
  create(input: CreateOrderInput): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  getByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null>;
  /**
   * Marks a verified payment. Resolves to `paid` for prepaid orders and
   * `advance_paid` for partial-COD orders (decided from the stored method).
   */
  markPaid(razorpayOrderId: string, paymentId: string): Promise<Order | null>;
  markFailed(razorpayOrderId: string): Promise<Order | null>;
  setShipping(
    razorpayOrderId: string,
    update: ShippingUpdate,
  ): Promise<Order | null>;
}
