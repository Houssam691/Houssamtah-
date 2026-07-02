import { NextResponse } from "next/server";
import { getSessionUser, sanitizeUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: sanitizeUser(user, user.role) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
