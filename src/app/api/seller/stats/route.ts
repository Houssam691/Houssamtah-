import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getSellerStats } from "@/lib/reviews";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "seller" || user.seller_status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();

  const totalOrders = await db.queryOne<{ val: number }>("SELECT COUNT(*)::int as val FROM orders WHERE seller_id = $1", [user.id]);
  const totalSales = await db.queryOne<{ val: number }>("SELECT COALESCE(SUM(product_price),0) as val FROM orders WHERE seller_id = $1 AND status IN ('delivered','seller_paid')", [user.id]);
  const totalEarnings = await db.queryOne<{ val: number }>("SELECT COALESCE(SUM(product_price),0) as val FROM orders WHERE seller_id = $1 AND status = 'seller_paid'", [user.id]);
  const commissions = await db.queryOne<{ val: number }>("SELECT COALESCE(SUM(tax_amount),0) as val FROM orders WHERE seller_id = $1 AND status IN ('delivered','seller_paid')", [user.id]);
  const netProfit = totalEarnings?.val || 0;
  const reviews = await getSellerStats(user.id);
  const productSales = await db.query(`
    SELECT p.title, COUNT(o.id)::int as sales
    FROM orders o JOIN products p ON o.product_id = p.id
    WHERE o.seller_id = $1 AND o.status IN ('delivered','seller_paid')
    GROUP BY o.product_id ORDER BY sales DESC LIMIT 5
  `, [user.id]);

  return NextResponse.json({
    total_orders: totalOrders?.val || 0,
    total_sales: totalSales?.val || 0,
    total_earnings: totalEarnings?.val || 0,
    commissions: commissions?.val || 0,
    net_profit: netProfit,
    reviews,
    top_products: productSales,
  });
}
