import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `proof_${Date.now()}_${safeName}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "proofs");
    await fs.mkdir(uploadsDir, { recursive: true });

    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, buffer);

    return NextResponse.json({ url: `/uploads/proofs/${filename}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
