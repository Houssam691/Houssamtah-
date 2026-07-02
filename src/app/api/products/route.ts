import { NextResponse } from "next/server";
import { readProducts, createProduct, type ProductCategory } from "@/lib/products";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as ProductCategory | null;
  const sellerId = url.searchParams.get("seller_id");
  let products = await readProducts();
  if (category) products = products.filter((p) => p.category === category);
  if (sellerId) products = products.filter((p) => p.seller_id === sellerId);
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "seller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "seller" && user.seller_status !== "approved") {
    return NextResponse.json({ error: "Seller not approved" }, { status: 403 });
  }

  const body = await req.json();
  const product = await createProduct({
    seller_id: user.role === "seller" ? user.id : (body.seller_id || undefined),
    product_type: body.product_type || "account",
    category: body.category || "pubg",
    title: body.title || "منتج جديد",
    description: body.description || "",
    price: typeof body.price === "number" ? body.price : 0,
    images: body.images || (body.image ? [body.image] : []),
    currency: body.currency || "DZD",
  });

  return NextResponse.json(product, { status: 201 });
}
