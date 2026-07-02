import { NextResponse } from "next/server";
import { getSessionUser, createNotification } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, message, userId, type, icon, link } = body;

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (userId) {
    await createNotification({ userId, type: type || "admin", title: title || "", message, icon: icon || "", link: link || "" });
    return NextResponse.json({ ok: true });
  }

  const db = await getDb();
  const users = await db.query<{ id: string }>("SELECT id FROM users");
  for (const u of users) {
    await createNotification({ userId: u.id, type: type || "admin_broadcast", title: title || "إشعار من الإدارة", message, icon: icon || "📢", link: link || "" });
  }

  return NextResponse.json({ sent: users.length });
}
