import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { csrfGuard } from "@/lib/csrf";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const orders = await db.query(`
    SELECT o.id, o.order_tracking_id, o.product_price, o.total_amount, o.currency,
      o.status, o.delivery_date, o.created_at,
      s.first_name || ' ' || s.last_name as seller_name,
      s.payment_currency as seller_currency,
      p.title as product_title
    FROM orders o
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.status = 'seller_paid'
    ORDER BY o.delivery_date ASC
  `);

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const csrfResponse = csrfGuard(req);
  if (csrfResponse) return csrfResponse;

  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { order_id } = body;

  if (!order_id) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const db = await getDb();
  const order = await db.queryOne("SELECT * FROM orders WHERE id = $1 AND status = 'seller_paid'", [order_id]);
  if (!order) {
    return NextResponse.json({ error: "Order not found or not payable" }, { status: 404 });
  }

  await logAuditEvent({
    event_type: "order.marked_paid_to_seller",
    user_id: user.id,
    order_id,
    details: `Admin marked order ${order.order_tracking_id} as paid to seller`,
  });

  return NextResponse.json({ ok: true });
}
