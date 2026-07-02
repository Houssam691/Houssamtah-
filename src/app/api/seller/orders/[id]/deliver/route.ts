import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent, getSettings, createNotification } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import { encryptDeliveryData } from "@/lib/crypto";
import { updateProduct } from "@/lib/products";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "seller" || user.seller_status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "code_verified_deliver_now") {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const body = await req.json();
  const rawDeliveryData = body.delivery_data as string;

  if (!rawDeliveryData) {
    return NextResponse.json({ error: "Delivery data is required" }, { status: 400 });
  }

  let encryptedData: string;
  try {
    encryptedData = encryptDeliveryData(rawDeliveryData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Encryption failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const settings = await getSettings();
  const warrantyDays = parseInt(settings.warranty_days) || 16;
  const now = new Date();
  const warrantyEnd = new Date(now.getTime() + warrantyDays * 24 * 60 * 60 * 1000);

  const updated = await updateOrderStatus(id, "delivered", {
    delivery_data: encryptedData,
    delivery_date: now.toISOString(),
    warranty_end_date: warrantyEnd.toISOString(),
  });

  if (order.product_id) {
    await updateProduct(order.product_id, { status: "sold" });
  }

  const db = await getDb();
  await db.queryOne(
    "INSERT INTO order_chat_messages (id, order_id, sender_id, text, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [`msg-${crypto.randomUUID()}`, id, user.id, rawDeliveryData, now.toISOString()]
  );

  await logAuditEvent({
    event_type: "order.delivered",
    user_id: user.id,
    order_id: id,
    ip_address: req.headers.get("x-forwarded-for") || undefined,
    details: `Order ${order.order_tracking_id} delivered with ${warrantyDays} day warranty`,
  });

  await createNotification({ userId: order.buyer_id, orderId: id, type: "delivered", message: "تم تسليم الطلب، يمكنك عرض بيانات الحساب" });

  return NextResponse.json(updated);
}
