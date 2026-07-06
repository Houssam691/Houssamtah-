import { getDb } from "./db";
import { getSettings } from "./auth";
import crypto from "crypto";

export type OrderStatus =
  | "awaiting_payment_proof"
  | "payment_under_review"
  | "payment_rejected"
  | "payment_confirmed_waiting_code"
  | "code_verified_deliver_now"
  | "delivered"
  | "disputed"
  | "seller_paid"
  | "waiting_for_payment"
  | "waiting_payment_verification"
  | "paid";

export type Order = {
  id: string;
  order_tracking_id: string;
  buyer_id: string;
  seller_id: string | null;
  product_id: string | null;
  product_type: "account" | "recharge";
  currency: string;
  product_price: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  payment_proof_file: string;
  payment_reviewed_by: string | null;
  order_secret_code: string;
  delivery_data: string;
  delivery_date: string | null;
  warranty_end_date: string | null;
  status: OrderStatus;
  created_at: string;
  buyer_name?: string;
  seller_name?: string;
  product_title?: string;
  transaction_id?: string;
  payment_proof_submitted_at?: string;
  matched_via_email?: number;
  auto_confirmed_at?: string;
};

export function generateTrackingId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BUPG-${ts}-${rand}`;
}

export async function createOrder(params: {
  buyer_id: string;
  seller_id?: string;
  product_id?: string;
  product_type: "account" | "recharge";
  currency?: string;
  product_price: number;
  payment_proof_file: string;
  initial_status?: OrderStatus;
}): Promise<Order> {
  const { queryOne } = await getDb();
  const settings = await getSettings();
  const taxRate = parseFloat(settings.tax_rate) || 1;
  const taxAmount = params.product_price * taxRate / 100;
  const totalAmount = params.product_price + taxAmount;

  const id = `ord-${crypto.randomBytes(12).toString("hex")}`;
  const trackingId = generateTrackingId();
  const initialStatus = params.initial_status || "payment_under_review";

  await queryOne(`
    INSERT INTO orders (id, order_tracking_id, buyer_id, seller_id, product_id, product_type, currency, product_price, tax_rate, tax_amount, total_amount, payment_proof_file, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `, [
    id, trackingId,
    params.buyer_id,
    params.seller_id || null,
    params.product_id || null,
    params.product_type,
    params.currency || "DZD",
    params.product_price,
    taxRate,
    taxAmount,
    totalAmount,
    params.payment_proof_file,
    initialStatus,
  ]);

  return (await queryOne<Order>("SELECT * FROM orders WHERE id = $1", [id]))!;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { queryOne } = await getDb();
  const row = await queryOne<Order>(`
    SELECT o.*,
      b.first_name || ' ' || b.last_name as buyer_name,
      s.first_name || ' ' || s.last_name as seller_name,
      p.title as product_title
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.id = $1
  `, [id]);
  return row || null;
}

export async function getOrderByTrackingId(trackingId: string): Promise<Order | null> {
  const { queryOne } = await getDb();
  const row = await queryOne<Order>(`
    SELECT o.*,
      b.first_name || ' ' || b.last_name as buyer_name,
      s.first_name || ' ' || s.last_name as seller_name,
      p.title as product_title
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.order_tracking_id = $1
  `, [trackingId]);
  return row || null;
}

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  const { query } = await getDb();
  return query<Order>(`
    SELECT o.*,
      b.first_name || ' ' || b.last_name as buyer_name,
      s.first_name || ' ' || s.last_name as seller_name,
      p.title as product_title
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.buyer_id = $1
    ORDER BY o.created_at DESC
  `, [buyerId]);
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const { query } = await getDb();
  return query<Order>(`
    SELECT o.*,
      b.first_name || ' ' || b.last_name as buyer_name,
      s.first_name || ' ' || s.last_name as seller_name,
      p.title as product_title,
      p.description as product_description
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.seller_id = $1
    ORDER BY o.created_at DESC
  `, [sellerId]);
}

export async function getAllOrders(): Promise<Order[]> {
  const { query } = await getDb();
  return query<Order>(`
    SELECT o.*,
      b.first_name || ' ' || b.last_name as buyer_name,
      s.first_name || ' ' || s.last_name as seller_name,
      p.title as product_title
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC
  `);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra?: Partial<Order>
): Promise<Order | null> {
  const { queryOne } = await getDb();
  const existing = await queryOne<Order>("SELECT * FROM orders WHERE id = $1", [id]);
  if (!existing) return null;

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    awaiting_payment_proof: ["payment_under_review", "waiting_for_payment"],
    payment_under_review: ["payment_rejected", "payment_confirmed_waiting_code"],
    payment_rejected: [],
    payment_confirmed_waiting_code: ["code_verified_deliver_now", "paid"],
    code_verified_deliver_now: ["delivered"],
    delivered: ["disputed", "seller_paid"],
    disputed: ["delivered", "seller_paid"],
    seller_paid: [],
    waiting_for_payment: ["waiting_payment_verification", "payment_rejected"],
    waiting_payment_verification: ["paid", "payment_rejected", "waiting_for_payment"],
    paid: [],
  };

  const allowed = allowedTransitions[existing.status] || [];
  if (!allowed.includes(status)) {
    throw new Error(
      `Invalid status transition: ${existing.status} -> ${status}`
    );
  }

  const sets: string[] = ["status = $1"];
  const vals: unknown[] = [status];
  let idx = 2;

  if (extra?.payment_reviewed_by !== undefined) {
    sets.push(`payment_reviewed_by = $${idx++}`);
    vals.push(extra.payment_reviewed_by);
  }
  if (extra?.order_secret_code !== undefined) {
    sets.push(`order_secret_code = $${idx++}`);
    vals.push(extra.order_secret_code);
  }
  if (extra?.delivery_data !== undefined) {
    sets.push(`delivery_data = $${idx++}`);
    vals.push(extra.delivery_data);
  }
  if (extra?.delivery_date !== undefined) {
    sets.push(`delivery_date = $${idx++}`);
    vals.push(extra.delivery_date);
  }
  if (extra?.warranty_end_date !== undefined) {
    sets.push(`warranty_end_date = $${idx++}`);
    vals.push(extra.warranty_end_date);
  }
  if (extra?.transaction_id !== undefined) {
    sets.push(`transaction_id = $${idx++}`);
    vals.push(extra.transaction_id);
  }
  if (extra?.payment_proof_file !== undefined) {
    sets.push(`payment_proof_file = $${idx++}`);
    vals.push(extra.payment_proof_file);
  }
  if (extra?.payment_proof_submitted_at !== undefined) {
    sets.push(`payment_proof_submitted_at = $${idx++}`);
    vals.push(extra.payment_proof_submitted_at);
  }
  if (extra?.matched_via_email !== undefined) {
    sets.push(`matched_via_email = $${idx++}`);
    vals.push(extra.matched_via_email);
  }
  if (extra?.auto_confirmed_at !== undefined) {
    sets.push(`auto_confirmed_at = $${idx++}`);
    vals.push(extra.auto_confirmed_at);
  }

  vals.push(id);
  await queryOne(
    `UPDATE orders SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    vals
  );

  return (await queryOne<Order>("SELECT * FROM orders WHERE id = $1", [id]))!;
}
