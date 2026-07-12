import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const total = await db.queryOne<{ val: number }>("SELECT COUNT(*)::int as val FROM users");
  const buyers = await db.queryOne<{ val: number }>("SELECT COUNT(*)::int as val FROM users WHERE role = 'buyer'");
  return NextResponse.json({
    total: total?.val || 0,
    buyers: buyers?.val || 0,
  });
}
