import { NextResponse } from "next/server";
import { getSessionUser, sanitizeUser, hashPassword, clearSessionCookie, revokeUserSessions } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: sanitizeUser(user, user.role) });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function PUT(req: Request) {
  const csrfResponse = csrfGuard(req);
  if (csrfResponse) return csrfResponse;

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { first_name, last_name, date_of_birth, payment_full_name, payment_surname, payment_dob, payment_rip, payment_currency, payment_usdt_address } = body;

    const { queryOne } = await getDb();
    await queryOne(`
      UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        date_of_birth = COALESCE($3, date_of_birth),
        payment_full_name = COALESCE($4, payment_full_name),
        payment_surname = COALESCE($5, payment_surname),
        payment_dob = COALESCE($6, payment_dob),
        payment_rip = COALESCE($7, payment_rip),
        payment_currency = COALESCE($8, payment_currency),
        payment_usdt_address = COALESCE($9, payment_usdt_address)
      WHERE id = $10
    `, [
      first_name || null,
      last_name || null,
      date_of_birth || null,
      payment_full_name || null,
      payment_surname || null,
      payment_dob || null,
      payment_rip || null,
      payment_currency || null,
      payment_usdt_address || null,
      user.id,
    ]);

    const updated = await queryOne<any>("SELECT * FROM users WHERE id = $1", [user.id]);
    return NextResponse.json({ user: sanitizeUser(updated!, updated!.role) });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const csrfResponse = csrfGuard(req);
  if (csrfResponse) return csrfResponse;

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getPool } = await getDb();
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query("DELETE FROM notifications WHERE user_id = $1", [user.id]);
      await client.query("DELETE FROM sessions WHERE user_id = $1", [user.id]);
      await client.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [user.id]);
      await client.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user.id]);

      const products = await client.query("SELECT id FROM products WHERE seller_id = $1", [user.id]);
      for (const p of products.rows) {
        await client.query("DELETE FROM price_history WHERE product_id = $1", [p.id]);
        await client.query("UPDATE orders SET product_id = NULL, seller_id = NULL WHERE product_id = $1", [p.id]);
      }
      await client.query("UPDATE orders SET buyer_id = NULL WHERE buyer_id = $1", [user.id]);
      await client.query("UPDATE orders SET seller_id = NULL WHERE seller_id = $1", [user.id]);
      await client.query("DELETE FROM reviews WHERE buyer_id = $1 OR seller_id = $1", [user.id]);
      await client.query("DELETE FROM products WHERE seller_id = $1", [user.id]);
      await client.query("DELETE FROM disputes WHERE buyer_id = $1 OR seller_id = $1", [user.id]);
      await client.query("DELETE FROM users WHERE id = $1", [user.id]);

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
