import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is not set");
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and PDF files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const safeName = `proof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const buf = Buffer.from(await file.arrayBuffer());

    const blob = await put(safeName, buf, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Upload error:", e);
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
