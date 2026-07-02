import { NextResponse } from "next/server";
import { getSessionUser, logAuditEvent, createNotification } from "@/lib/auth";
import { createOrder, getOrdersByBuyer, getAllOrders } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const all = url.searchParams.get("all");

  if (user.role === "admin" && all === "1") {
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  }

  const orders = await getOrdersByBuyer(user.id);
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.banned) {
    return NextResponse.json({ error: "Account banned" }, { status: 403 });
  }

  const body = await req.json();
  const { product_id, product_type, payment_proof_file } = body;

  if (!payment_proof_file) {
    return NextResponse.json({ error: "Payment proof is required" }, { status: 400 });
  }

  if (product_id) {
    const product = await getProductById(product_id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.status !== "active") {
      return NextResponse.json({ error: "Product is not available" }, { status: 400 });
    }

    const order = await createOrder({
      buyer_id: user.id,
      seller_id: product.seller_id,
      product_id: product.id,
      product_type: product.product_type,
      currency: product.currency,
      product_price: product.price,
      payment_proof_file,
    });

    await logAuditEvent({
      event_type: "order.created",
      user_id: user.id,
      order_id: order.id,
      details: `New order created for product ${product.title}`,
    });

    if (product.seller_id) {
      await createNotification({ userId: product.seller_id, orderId: order.id, type: "new_order", message: `طلب جديد على منتجك: ${product.title}` });
    }
    const db1 = await getDb();
    const admins = await db1.query<{ id: string }>("SELECT id FROM users WHERE role = 'admin'");
    for (const a of admins) {
      await createNotification({ userId: a.id, orderId: order.id, type: "new_order", message: `طلب جديد من ${user.first_name}` });
    }

    return NextResponse.json(order, { status: 201 });
  }

  if (!product_type) {
    return NextResponse.json({ error: "Product type is required" }, { status: 400 });
  }

  const price = parseFloat(body.product_price);
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const order = await createOrder({
    buyer_id: user.id,
    product_type: product_type as "account" | "recharge",
    currency: body.currency || "DZD",
    product_price: price,
    payment_proof_file,
  });

  const db2 = await getDb();
  const admins = await db2.query<{ id: string }>("SELECT id FROM users WHERE role = 'admin'");
  for (const a of admins) {
    await createNotification({ userId: a.id, orderId: order.id, type: "new_order", message: `طلب جديد من ${user.first_name}` });
  }

  return NextResponse.json(order, { status: 201 });
}
