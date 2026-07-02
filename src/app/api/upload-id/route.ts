import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `id_${Date.now()}_${safeName}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "ids");
    await fs.mkdir(uploadsDir, { recursive: true });

    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, buffer);

    return NextResponse.json({ url: `/uploads/ids/${filename}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
