import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { put } from "@vercel/blob";
import { checkRateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { getRealMimeType } from "@/lib/mimeCheck";
import { csrfGuard } from "@/lib/csrf";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(req: Request) {
  console.log("[UPLOAD-ID DIAG] Entered POST handler");
  const csrfResponse = csrfGuard(req);
  if (csrfResponse) {
    console.log("[UPLOAD-ID DIAG] Blocked by csrfGuard");
    return csrfResponse;
  }
  console.log("[UPLOAD-ID DIAG] csrfGuard passed");

  const user = await getSessionUser();
  if (!user) {
    console.log("[UPLOAD-ID DIAG] No session user → 401");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[UPLOAD-ID DIAG] Session user found:", user.id);

  const rlKey = getRateLimitKey(req, `upload-id:${user.id}`);
  const rl = await checkRateLimit(rlKey, 5, 60000);
  if (!rl.allowed) {
    console.log("[UPLOAD-ID DIAG] Rate limited");
    return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });
  }
  console.log("[UPLOAD-ID DIAG] Rate limit passed");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[UPLOAD-ID DIAG] BLOB_READ_WRITE_TOKEN is not set");
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 500 });
  }
  console.log("[UPLOAD-ID DIAG] Blob token present");

  try {
    console.log("[UPLOAD-ID DIAG] Parsing formData...");
    const formData = await req.formData();
    console.log("[UPLOAD-ID DIAG] formData parsed successfully");
    const file = formData.get("file");

    if (!(file instanceof File)) {
      console.log("[UPLOAD-ID DIAG] file is not a File instance:", typeof file);
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    console.log("[UPLOAD-ID DIAG] File received:", file.name, file.size, file.type);

    if (file.size > MAX_SIZE) {
      console.log("[UPLOAD-ID DIAG] File too large:", file.size);
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    console.log("[UPLOAD-ID DIAG] Reading file buffer...");
    const buf = Buffer.from(await file.arrayBuffer());
    console.log("[UPLOAD-ID DIAG] Buffer read, size:", buf.length);

    const realMime = getRealMimeType(buf);
    console.log("[UPLOAD-ID DIAG] Real MIME:", realMime);
    if (!realMime || !ALLOWED_TYPES.includes(realMime)) {
      console.log("[UPLOAD-ID DIAG] Invalid MIME type");
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed." }, { status: 400 });
    }

    const ext = EXT_MAP[realMime] || "jpg";
    const safeName = `id_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    console.log("[UPLOAD-ID DIAG] Uploading to blob:", safeName);
    const blob = await put(safeName, buf, {
      access: "public",
      contentType: realMime,
    });
    console.log("[UPLOAD-ID DIAG] Upload success, URL:", blob.url);

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("[UPLOAD-ID DIAG] Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
