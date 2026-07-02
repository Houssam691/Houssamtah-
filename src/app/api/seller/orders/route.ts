import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOrdersBySeller } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "seller" || user.seller_status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrdersBySeller(user.id);
  return NextResponse.json(orders);
}
