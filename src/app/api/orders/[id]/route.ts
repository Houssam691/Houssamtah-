import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role !== "admin" && order.buyer_id !== user.id && order.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();
  const { status, ...extra } = body;

  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const updated = await updateOrderStatus(id, status, extra);
    await logAuditEvent({
      event_type: `order.${status}`,
      user_id: user.id,
      order_id: id,
      details: `Order status changed to ${status}`,
    });
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid transition";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
