import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent, createNotification } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.status !== "payment_under_review" && order.status !== "waiting_payment_verification") {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const updated = await updateOrderStatus(id, "code_verified_deliver_now", {
    payment_reviewed_by: user.id,
  });

  await logAuditEvent({
    event_type: "order.payment_confirmed",
    user_id: user.id,
    order_id: id,
    ip_address: _req.headers.get("x-forwarded-for") || undefined,
    details: `Payment confirmed for order ${order.order_tracking_id}`,
  });

  await createNotification({ userId: order.buyer_id, orderId: id, type: "payment_confirmed", message: "تم تأكيد الدفع، في انتظار إدخال بيانات الحساب" });

  const db = await getDb();
  const admins = await db.query<{ id: string }>("SELECT id FROM users WHERE role = 'admin'");
  for (const a of admins) {
    if (a.id !== user.id) {
      await createNotification({
        userId: a.id,
        orderId: id,
        type: "delivery_pending",
        title: "بانتظار إدخال بيانات الحساب",
        message: `تم تأكيد دفع الطلب ${order.order_tracking_id}، يرجى إدخال بيانات الحساب للتسليم.`,
        link: `/admin/orders`,
      });
    }
  }

  return NextResponse.json(updated);
}