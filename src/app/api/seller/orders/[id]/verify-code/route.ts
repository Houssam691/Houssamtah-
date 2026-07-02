import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent, createNotification } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders";

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

  if (order.status !== "payment_confirmed_waiting_code") {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const body = await req.json();
  const enteredCode = body.code as string;

  if (!enteredCode || enteredCode !== order.order_secret_code) {
    await logAuditEvent({
      event_type: "order.code_verification_failed",
      user_id: user.id,
      order_id: id,
      ip_address: req.headers.get("x-forwarded-for") || undefined,
      details: `Failed code verification attempt for order ${order.order_tracking_id}`,
    });
    return NextResponse.json({ error: "الكود غير صحيح" }, { status: 400 });
  }

  const updated = await updateOrderStatus(id, "code_verified_deliver_now");

  await logAuditEvent({
    event_type: "order.code_verified",
    user_id: user.id,
    order_id: id,
    ip_address: req.headers.get("x-forwarded-for") || undefined,
    details: `Code verified for order ${order.order_tracking_id}`,
  });

  await createNotification({ userId: order.buyer_id, orderId: id, type: "code_verified", message: "تم التحقق من الكود، البائع سيبدأ بتجهيز طلبك" });

  return NextResponse.json(updated);
}
