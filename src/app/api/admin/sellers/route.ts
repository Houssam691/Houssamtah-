import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { csrfGuard } from "@/lib/csrf";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const sellers = await db.query(`
    SELECT id, email, first_name, last_name, seller_status, id_file_path, created_at
    FROM users WHERE role = 'seller' ORDER BY created_at DESC
  `);

  return NextResponse.json(sellers);
}

export async function POST(req: Request) {
  const csrfResponse = csrfGuard(req);
  if (csrfResponse) return csrfResponse;

  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { seller_id, action } = body;

  if (!seller_id || !["approve", "reject", "delete", "restore"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = await getDb();
  const seller = await db.queryOne("SELECT * FROM users WHERE id = $1 AND role = 'seller'", [seller_id]);
  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  if (action === "delete") {
    if (seller.id_file_path) {
      try { await del(seller.id_file_path); } catch (e) { console.error("[ADMIN] Failed to delete blob:", e); }
    }
    const pool = db.getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [seller_id]);
      await client.query("DELETE FROM sessions WHERE user_id = $1", [seller_id]);
      await client.query("DELETE FROM notifications WHERE user_id = $1", [seller_id]);
      await client.query("UPDATE orders SET seller_id = NULL WHERE seller_id = $1", [seller_id]);
      await client.query("UPDATE products SET seller_id = NULL WHERE seller_id = $1", [seller_id]);
      await client.query("DELETE FROM reviews WHERE seller_id = $1", [seller_id]);
      await client.query("DELETE FROM price_history WHERE changed_by = $1", [seller_id]);
      await client.query("DELETE FROM users WHERE id = $1", [seller_id]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("[ADMIN] Failed to delete seller:", e);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    } finally {
      client.release();
    }

    await logAuditEvent({
      event_type: "seller.deleted",
      user_id: admin.id,
      details: `Seller ${seller.email} deleted by admin`,
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "restore") {
    await db.execute("UPDATE users SET seller_status = NULL, id_file_path = '' WHERE id = $1", [seller_id]);
    await logAuditEvent({
      event_type: "seller.restored",
      user_id: admin.id,
      details: `Seller ${seller.email} restored to pending by admin`,
    });
    return NextResponse.json({ ok: true });
  }

  const status = action === "approve" ? "approved" : "rejected";
  await db.execute("UPDATE users SET seller_status = $1 WHERE id = $2", [status, seller_id]);

  await logAuditEvent({
    event_type: `seller.${status}`,
    user_id: admin.id,
    details: `Seller ${seller.email} ${status}`,
  });

  return NextResponse.json({ ok: true });
}
