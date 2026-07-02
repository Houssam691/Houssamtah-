import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logAuditEvent } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.CRON_API_KEY;
  if (apiKey) {
    const { headers } = await import("next/headers");
    const h = await headers();
    const auth = h.get("authorization");
    if (auth !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = await getDb();
  const now = new Date().toISOString();

  const expiredWarranties = await db.query<{ id: string; order_tracking_id: string; seller_id: string | null }>(`
    SELECT id, order_tracking_id, seller_id
    FROM orders
    WHERE status = 'delivered'
      AND warranty_end_date IS NOT NULL
      AND warranty_end_date < $1::timestamptz
      AND id NOT IN (SELECT order_id FROM disputes WHERE status = 'open')
  `, [now]);

  let processed = 0;
  for (const order of expiredWarranties) {
    await db.execute("UPDATE orders SET status = 'seller_paid' WHERE id = $1", [order.id]);
    await logAuditEvent({
      event_type: "order.warranty_expired",
      order_id: order.id,
      details: `Warranty expired for order ${order.order_tracking_id}, marked as seller_paid`,
    });
    processed++;
  }

  return NextResponse.json({ processed, total: expiredWarranties.length });
}
