import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent, createNotification } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders";

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

  if (order.status !== "delivered") {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const updated = await updateOrderStatus(id, "seller_paid");

  await logAuditEvent({
    event_type: "order.seller_paid",
    user_id: user.id,
    order_id: id,
    details: `Seller paid for order ${order.order_tracking_id}`,
  });

  if (order.seller_id) {
    await createNotification({ userId: order.seller_id, orderId: id, type: "seller_paid", message: "تم تحويل مبلغ الطلب إلى رصيدك" });
  }

  return NextResponse.json(updated);
}
