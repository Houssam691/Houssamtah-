import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSellerStats } from "@/lib/reviews";

export async function GET(_req: Request, props: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await props.params;
    const { queryOne, query } = await getDb();

    const user = await queryOne<{
      id: string; first_name: string; last_name: string;
      role: string; seller_status: string | null; created_at: string;
    }>(
      "SELECT id, first_name, last_name, role, seller_status, created_at FROM users WHERE id = $1",
      [userId]
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const products = await query<Record<string, unknown>>(
      `SELECT p.*, u.first_name || ' ' || u.last_name as seller_name
       FROM products p LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.seller_id = $1 AND p.status IN ('active', 'sold')
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const stats = user.role === "seller" ? await getSellerStats(userId).catch(() => null) : null;

    return NextResponse.json({ user, products, stats });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
