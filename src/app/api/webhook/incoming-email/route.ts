import { NextResponse } from "next/server";
import { processWebhookEmail, WebhookPayload } from "@/lib/paymentVerification";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expectedKey = process.env.WEBHOOK_API_KEY;
  if (expectedKey) {
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (!token || token !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!payload.from || !payload.text) {
    return NextResponse.json({ error: "Missing required fields: from, text" }, { status: 400 });
  }

  const result = await processWebhookEmail(payload);

  switch (result.status) {
    case "rejected_security":
      return NextResponse.json({
        status: "rejected",
        reason: result.reason,
      }, { status: 200 });

    case "rejected_duplicate":
      return NextResponse.json({
        status: "duplicate",
        reason: result.reason,
      }, { status: 200 });

    case "accepted":
      return NextResponse.json({
        status: "accepted",
        order_id: result.order?.id,
        order_tracking_id: result.order?.order_tracking_id,
      }, { status: 200 });

    case "manual_review":
      return NextResponse.json({
        status: "manual_review",
        reason: result.reason,
      }, { status: 200 });
  }
}
