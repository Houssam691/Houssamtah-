import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}

export async function PATCH() {
  return NextResponse.json({ error: "Not available" }, { status: 404 });
}
