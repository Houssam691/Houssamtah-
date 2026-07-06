import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent, createNotification } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import { getProductWithSecret } from "@/lib/products";
import { getDb } from "@/lib/db";
import crypto from "crypto";

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

  if (order.status === "payment_under_review") {
    let secretCode = "";

    if (order.product_type === "account" && order.product_id) {
      const product = await getProductWithSecret(order.product_id);
      if (product?.product_secret_code) {
        secretCode = product.product_secret_code;
      }
    }

    if (!secretCode) {
      secretCode = crypto.randomBytes(9).toString("base64url").slice(0, 12);
    }

    const updated = await updateOrderStatus(id, "payment_confirmed_waiting_code", {
      payment_reviewed_by: user.id,
      order_secret_code: secretCode,
    });

    await logAuditEvent({
      event_type: "order.payment_confirmed",
      user_id: user.id,
      order_id: id,
      ip_address: _req.headers.get("x-forwarded-for") || undefined,
      details: `Payment confirmed for order ${order.order_tracking_id}`,
    });

    await createNotification({ userId: order.buyer_id, orderId: id, type: "payment_confirmed", message: "تم تأكيد الدفع، يمكنك الآن إرسال الكود للبائع" });

    return NextResponse.json(updated);
  }

  if (order.status === "waiting_payment_verification") {
    const secretCode = crypto.randomBytes(9).toString("base64url").slice(0, 12);

    const updated = await updateOrderStatus(id, "paid", {
      payment_reviewed_by: user.id,
      order_secret_code: secretCode,
      matched_via_email: 1,
      auto_confirmed_at: new Date().toISOString(),
    });

    await logAuditEvent({
      event_type: "order.payment_admin_confirmed",
      user_id: user.id,
      order_id: id,
      ip_address: _req.headers.get("x-forwarded-for") || undefined,
      details: `Admin confirmed payment for order ${order.order_tracking_id} (auto-verify flow)`,
    });

    await createNotification({
      userId: order.buyer_id,
      orderId: id,
      type: "payment_confirmed",
      title: "تم تأكيد الدفع",
      message: "تم تأكيد دفع طلبك. يمكنك الآن الاطلاع على الكود السري.",
      link: `/orders/${id}`,
    });

    const db = await getDb();
    if (order.seller_id) {
      await createNotification({
        userId: order.seller_id,
        orderId: id,
        type: "payment_confirmed",
        title: "تم تأكيد دفع طلب",
        message: `تم تأكيد دفع الطلب ${order.order_tracking_id}. يرجى انتظار الكود السري من المشتري.`,
        link: `/seller/orders`,
      });
    }

    const admins = await db.query<{ id: string }>("SELECT id FROM users WHERE role = 'admin'");
    for (const a of admins) {
      if (a.id !== user.id) {
        await createNotification({
          userId: a.id,
          orderId: id,
          type: "payment_confirmed",
          title: "تم تأكيد الدفع يدوياً",
          message: `تم تأكيد دفع الطلب ${order.order_tracking_id} يدوياً بواسطة ${user.first_name}.`,
          link: `/admin/orders`,
        });
      }
    }

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
}
