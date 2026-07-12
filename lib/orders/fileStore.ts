import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

import type {
  CreateOrderInput,
  Order,
  OrderStore,
  ShippingUpdate,
} from "@/lib/orders/types";

/**
 * Placeholder persistence: a JSON file under `.data/`. Good enough for local
 * development and demonstrates the OrderStore contract. Replace with a real DB
 * implementation (Supabase/Mongo) later — the API routes only depend on the
 * `OrderStore` interface exported from lib/orders/index.ts.
 *
 * Note: on serverless/ephemeral filesystems this resets between deploys; that
 * is acceptable for the MVP and is exactly why it's isolated behind the store.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "orders.json");

async function readAll(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeAll(orders: Order[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(orders, null, 2), "utf8");
}

export const fileOrderStore: OrderStore = {
  async create(input: CreateOrderInput): Promise<Order> {
    const now = new Date().toISOString();
    const order: Order = {
      id: crypto.randomUUID(),
      ...input,
      status: "created",
      shippingStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };
    const orders = await readAll();
    orders.push(order);
    await writeAll(orders);
    return order;
  },

  async getById(id: string): Promise<Order | null> {
    const orders = await readAll();
    return orders.find((o) => o.id === id) ?? null;
  },

  async getByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    const orders = await readAll();
    return orders.find((o) => o.razorpayOrderId === razorpayOrderId) ?? null;
  },

  async markPaid(
    razorpayOrderId: string,
    paymentId: string,
  ): Promise<Order | null> {
    const orders = await readAll();
    const order = orders.find((o) => o.razorpayOrderId === razorpayOrderId);
    if (!order) return null;
    // Partial-COD advances resolve to `advance_paid`; prepaid to `paid`.
    const target = order.paymentMethod === "partial_cod" ? "advance_paid" : "paid";
    // Idempotent: webhook + client verify may both land.
    if (order.status !== "paid" && order.status !== "advance_paid") {
      order.status = target;
      order.paymentId = paymentId;
      order.updatedAt = new Date().toISOString();
      await writeAll(orders);
    }
    return order;
  },

  async markFailed(razorpayOrderId: string): Promise<Order | null> {
    const orders = await readAll();
    const order = orders.find((o) => o.razorpayOrderId === razorpayOrderId);
    if (!order) return null;
    if (order.status === "created") {
      order.status = "failed";
      order.updatedAt = new Date().toISOString();
      await writeAll(orders);
    }
    return order;
  },

  async setShipping(
    razorpayOrderId: string,
    update: ShippingUpdate,
  ): Promise<Order | null> {
    const orders = await readAll();
    const order = orders.find((o) => o.razorpayOrderId === razorpayOrderId);
    if (!order) return null;
    order.shippingStatus = update.shippingStatus;
    if (update.awb) order.awb = update.awb;
    order.updatedAt = new Date().toISOString();
    await writeAll(orders);
    return order;
  },
};
