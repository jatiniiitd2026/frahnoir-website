import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStore,
  ShippingUpdate,
} from "@/lib/orders/types";

/**
 * Supabase-backed OrderStore. Implements the exact same interface as the file
 * store — swapped in via lib/orders/index.ts when Supabase env vars are set.
 *
 * Amount columns (amount, prepaid_amount, cod_amount, delhivery_cod_amount) are
 * ALL in PAISE. `payment_status` mirrors `status`.
 */

interface OrderRow {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: Order["status"];
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  amount: number;
  currency: string;
  payment_method: Order["paymentMethod"];
  prepaid_amount: number | null;
  cod_amount: number | null;
  shipping_payment_mode: Order["shippingPaymentMode"] | null;
  delhivery_cod_amount: number | null;
  shipping_status: Order["shippingStatus"] | null;
  awb: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

function rowToOrder(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    razorpayOrderId: row.razorpay_order_id,
    amount: row.amount,
    currency: row.currency,
    items,
    customer: {
      fullName: row.customer_name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
    },
    status: row.status,
    paymentId: row.razorpay_payment_id ?? undefined,
    paymentMethod: row.payment_method ?? "prepaid",
    prepaidAmount: row.prepaid_amount ?? row.amount,
    codAmount: row.cod_amount ?? 0,
    shippingPaymentMode: row.shipping_payment_mode ?? "Pre-paid",
    delhiveryCodAmount: row.delhivery_cod_amount ?? 0,
    shippingStatus: row.shipping_status ?? "pending",
    awb: row.awb ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchItems(orderId: string): Promise<OrderItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("order_items")
    .select("product_slug, product_name, quantity, unit_price, total_price")
    .eq("order_id", orderId);
  if (error) throw error;
  return (data as OrderItemRow[]).map((r) => ({
    slug: r.product_slug,
    name: r.product_name,
    price: r.unit_price,
    quantity: r.quantity,
  }));
}

export const supabaseOrderStore: OrderStore = {
  async create(input: CreateOrderInput): Promise<Order> {
    const supabase = getSupabaseAdmin();

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        razorpay_order_id: input.razorpayOrderId,
        status: "created",
        payment_status: "created",
        customer_name: input.customer.fullName,
        phone: input.customer.phone,
        email: input.customer.email,
        address: input.customer.address,
        city: input.customer.city,
        state: input.customer.state,
        pincode: input.customer.pincode,
        amount: input.amount,
        currency: input.currency,
        payment_method: input.paymentMethod,
        prepaid_amount: input.prepaidAmount,
        cod_amount: input.codAmount,
        shipping_payment_mode: input.shippingPaymentMode,
        delhivery_cod_amount: input.delhiveryCodAmount,
        shipping_status: "pending",
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const row = orderRow as OrderRow;

    const itemRows = input.items.map((i) => ({
      order_id: row.id,
      product_slug: i.slug,
      product_name: i.name,
      quantity: i.quantity,
      unit_price: i.price,
      total_price: i.price * i.quantity,
    }));
    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemRows);
    if (itemsErr) throw itemsErr;

    return rowToOrder(row, input.items);
  },

  async getById(id: string): Promise<Order | null> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select()
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as OrderRow;
    return rowToOrder(row, await fetchItems(row.id));
  },

  async getByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select()
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as OrderRow;
    return rowToOrder(row, await fetchItems(row.id));
  },

  async markPaid(
    razorpayOrderId: string,
    paymentId: string,
  ): Promise<Order | null> {
    const supabase = getSupabaseAdmin();
    const { data: existing, error: getErr } = await supabase
      .from("orders")
      .select()
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();
    if (getErr) throw getErr;
    if (!existing) return null;

    const row = existing as OrderRow;
    // Idempotent: webhook + client verify may both land.
    if (row.status === "paid" || row.status === "advance_paid") {
      return rowToOrder(row, await fetchItems(row.id));
    }

    // Partial-COD advances resolve to `advance_paid`; prepaid to `paid`.
    const target =
      row.payment_method === "partial_cod" ? "advance_paid" : "paid";

    const { data: updated, error: updErr } = await supabase
      .from("orders")
      .update({
        status: target,
        payment_status: target,
        razorpay_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpayOrderId)
      .select()
      .single();
    if (updErr) throw updErr;

    const updatedRow = updated as OrderRow;
    return rowToOrder(updatedRow, await fetchItems(updatedRow.id));
  },

  async markFailed(razorpayOrderId: string): Promise<Order | null> {
    const supabase = getSupabaseAdmin();
    const { data: existing, error: getErr } = await supabase
      .from("orders")
      .select()
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();
    if (getErr) throw getErr;
    if (!existing) return null;

    const row = existing as OrderRow;
    if (row.status !== "created") {
      return rowToOrder(row, await fetchItems(row.id));
    }

    const { data: updated, error: updErr } = await supabase
      .from("orders")
      .update({
        status: "failed",
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpayOrderId)
      .select()
      .single();
    if (updErr) throw updErr;

    const updatedRow = updated as OrderRow;
    return rowToOrder(updatedRow, await fetchItems(updatedRow.id));
  },

  async setShipping(
    razorpayOrderId: string,
    update: ShippingUpdate,
  ): Promise<Order | null> {
    const supabase = getSupabaseAdmin();
    const patch: Record<string, unknown> = {
      shipping_status: update.shippingStatus,
      updated_at: new Date().toISOString(),
    };
    if (update.awb) patch.awb = update.awb;

    const { data: updated, error } = await supabase
      .from("orders")
      .update(patch)
      .eq("razorpay_order_id", razorpayOrderId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!updated) return null;
    const row = updated as OrderRow;
    return rowToOrder(row, await fetchItems(row.id));
  },
};
