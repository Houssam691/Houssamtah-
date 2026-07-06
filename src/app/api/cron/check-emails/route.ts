import { NextResponse } from "next/server";
import { checkEmailInbox } from "@/lib/emailChecker";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const apiKey = process.env.CRON_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
  }

  const { headers } = await import("next/headers");
  const h = await headers();
  const auth = h.get("authorization");
  if (auth !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await checkEmailInbox();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
