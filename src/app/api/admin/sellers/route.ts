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
  const sellers = await db.query(`
    SELECT id, email, first_name, last_name, seller_status, created_at
    FROM users WHERE role = 'seller' ORDER BY created_at DESC
  `);

  return NextResponse.json(sellers);
}

export async function POST(req: Request) {
  const csrfResponse = csrfGuard(req);
  if (csrfResponse) return csrfResponse;

  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { seller_id, action } = body;

  if (!seller_id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = await getDb();
  const seller = await db.queryOne("SELECT * FROM users WHERE id = $1 AND role = 'seller'", [seller_id]);
  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const status = action === "approve" ? "approved" : "rejected";
  await db.execute("UPDATE users SET seller_status = $1 WHERE id = $2", [status, seller_id]);

  await logAuditEvent({
    event_type: `seller.${status}`,
    user_id: user.id,
    details: `Seller ${seller.email} ${status}`,
  });

  return NextResponse.json({ ok: true });
}
