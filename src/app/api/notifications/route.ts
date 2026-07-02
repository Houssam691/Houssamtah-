import { NextResponse } from "next/server";
import { getSessionUser, createNotification as createNotif } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const notifications = await db.query(`
    SELECT n.*, o.order_tracking_id
    FROM notifications n
    LEFT JOIN orders o ON n.order_id = o.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50
  `, [user.id]);

  const unreadRows = await db.query<{ count: number }>(
    "SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND read = 0",
    [user.id]
  );

  return NextResponse.json({ notifications, unread_count: unreadRows[0]?.count || 0 });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { orderId, type, title, message, icon, link, userId } = body;

  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  let targetUserId = userId || user.id;
  if (targetUserId === "__buyer__" && orderId) {
    const db = await getDb();
    const order = await db.queryOne<{ buyer_id: string }>("SELECT buyer_id FROM orders WHERE id = $1", [orderId]);
    if (order) targetUserId = order.buyer_id;
  }

  await createNotif({ userId: targetUserId, orderId: orderId || undefined, type: type || "info", title: title || "", message, icon: icon || "", link: link || "" });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { notificationId } = body;

  const db = await getDb();
  if (notificationId) {
    await db.execute("UPDATE notifications SET read = 1 WHERE id = $1 AND user_id = $2", [notificationId, user.id]);
  } else {
    await db.execute("UPDATE notifications SET read = 1 WHERE user_id = $1", [user.id]);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { notificationId, all } = body;

  const db = await getDb();
  if (all) {
    await db.execute("DELETE FROM notifications WHERE user_id = $1", [user.id]);
  } else if (notificationId) {
    await db.execute("DELETE FROM notifications WHERE id = $1 AND user_id = $2", [notificationId, user.id]);
  }

  return NextResponse.json({ ok: true });
}
