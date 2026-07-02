import { NextResponse } from "next/server";
import { updateProduct, deleteProduct, readAllProducts } from "@/lib/products";
import { getSessionUser } from "@/lib/auth";
import { recordPriceChange } from "@/lib/priceHistory";

export const runtime = "nodejs";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "seller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const products = await readAllProducts();
  const product = products.find((p) => p.id === id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role === "seller" && product.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.price !== undefined && body.price !== product.price) {
    await recordPriceChange({
      product_id: id,
      old_price: product.price,
      new_price: body.price,
      changed_by: user.id,
      reason: body.price_reason || "تعديل السعر",
    });
  }

  const updated = await updateProduct(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "seller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const products = await readAllProducts();
  const product = products.find((p) => p.id === id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role === "seller" && product.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await deleteProduct(id);
  return NextResponse.json({ ok: deleted });
}
