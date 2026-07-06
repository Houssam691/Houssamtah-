import { getDb } from "./db";
import { updateOrderStatus, Order } from "./orders";
import { createNotification, logAuditEvent } from "./auth";
import crypto from "crypto";

export type EmailLog = {
  id: string;
  sender: string;
  subject: string;
  body_text: string;
  body_html: string;
  raw_from: string;
  extracted_amount: number | null;
  extracted_transaction_id: string;
  extracted_target_account: string;
  extracted_currency: string;
  message_id: string;
  received_at: string;
  processed: number;
  created_at: string;
};

export type UnmatchedPayment = {
  id: string;
  email_log_id: string;
  transaction_id: string;
  amount: number | null;
  currency: string;
  target_account: string;
  email_sender: string;
  email_subject: string;
  email_body: string;
  reviewed: number;
  resolved_order_id: string | null;
  notes: string;
  created_at: string;
  reviewed_at: string | null;
};

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

export async function saveEmailLog(params: {
  sender: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  rawFrom: string;
  amount: number | null;
  transactionId: string;
  targetAccount: string;
  currency: string;
  messageId: string;
}): Promise<EmailLog> {
  const { queryOne } = await getDb();
  const id = generateId("eml");
  await queryOne(
    `INSERT INTO email_logs (id, sender, subject, body_text, body_html, raw_from, extracted_amount, extracted_transaction_id, extracted_target_account, extracted_currency, message_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [id, params.sender, params.subject, params.bodyText, params.bodyHtml, params.rawFrom, params.amount, params.transactionId, params.targetAccount, params.currency, params.messageId]
  );
  return (await queryOne<EmailLog>("SELECT * FROM email_logs WHERE id = $1", [id]))!;
}

export async function markEmailProcessed(id: string): Promise<void> {
  const { execute } = await getDb();
  await execute("UPDATE email_logs SET processed = 1 WHERE id = $1", [id]);
}

export async function saveUnmatchedPayment(params: {
  emailLogId: string;
  transactionId: string;
  amount: number | null;
  currency: string;
  targetAccount: string;
  emailSender: string;
  emailSubject: string;
  emailBody: string;
}): Promise<UnmatchedPayment> {
  const { queryOne } = await getDb();
  const id = generateId("unm");
  await queryOne(
    `INSERT INTO unmatched_payments (id, email_log_id, transaction_id, amount, currency, target_account, email_sender, email_subject, email_body)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [id, params.emailLogId, params.transactionId, params.amount, params.currency, params.targetAccount, params.emailSender, params.emailSubject, params.emailBody]
  );
  return (await queryOne<UnmatchedPayment>("SELECT * FROM unmatched_payments WHERE id = $1", [id]))!;
}

function findNumberInText(text: string, label: string): string | null {
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.toLowerCase().includes(label.toLowerCase())) {
      const match = line.match(/[\d,.]+/);
      if (match) return match[0].replace(/,/g, "");
    }
  }
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const globalMatch = text.match(new RegExp(`${escaped}[\\s:]*([\\d,.]+)`, "i"));
  if (globalMatch) return globalMatch[1].replace(/,/g, "");
  return null;
}

function findValueAfterLabel(text: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.toLowerCase().includes(label.toLowerCase())) {
      const afterLabel = line.replace(new RegExp(`.*${escaped}\\s*[:\\s]*`, "i"), "").trim();
      if (afterLabel) return afterLabel;
    }
  }
  const match = text.match(new RegExp(`${escaped}[\\s:]*([^\\n]+)`, "i"));
  if (match) return match[1].trim();
  return null;
}

export function parseBaridiMobEmail(bodyText: string): {
  amount: number | null;
  transactionId: string;
  targetAccount: string;
  currency: string;
} {
  let amount: number | null = null;
  let transactionId = "";
  let targetAccount = "";
  let currency = "DZD";

  const amountStr = findNumberInText(bodyText, "Amount") || findNumberInText(bodyText, "Montant") || findNumberInText(bodyText, "المبلغ");
  if (amountStr) {
    amount = parseFloat(amountStr);
  }

  const txId = findValueAfterLabel(bodyText, "Transaction ID") || findValueAfterLabel(bodyText, "Transaction") || findValueAfterLabel(bodyText, "Identifiant") || findValueAfterLabel(bodyText, "رقم المعاملة");
  if (txId) transactionId = txId;

  const account = findValueAfterLabel(bodyText, "Target account") || findValueAfterLabel(bodyText, "Account") || findValueAfterLabel(bodyText, "Compte") || findValueAfterLabel(bodyText, "Compte cible") || findValueAfterLabel(bodyText, "رقم الحساب") || findValueAfterLabel(bodyText, "حساب");
  if (account) targetAccount = account;

  const curr = findValueAfterLabel(bodyText, "Currency") || findValueAfterLabel(bodyText, "Devise") || findValueAfterLabel(bodyText, "العملة");
  if (curr) currency = curr;

  return { amount, transactionId, targetAccount, currency };
}

export async function autoMatchPayment(emailLog: EmailLog): Promise<{
  matched: "exact" | "multiple" | "none";
  order?: Order | null;
  orders?: Order[];
}> {
  const db = await getDb();
  const txId = emailLog.extracted_transaction_id?.trim();
  if (!txId) {
    return { matched: "none" };
  }

  const matchingOrders = await db.query<Order>(
    `SELECT o.*,
      b.first_name || ' ' || b.last_name as buyer_name,
      s.first_name || ' ' || s.last_name as seller_name,
      p.title as product_title
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.status = 'waiting_payment_verification'
      AND o.transaction_id = $1`,
    [txId]
  );

  if (matchingOrders.length === 1) {
    const order = matchingOrders[0];
    const secretCode = crypto.randomBytes(9).toString("base64url").slice(0, 12);

    await updateOrderStatus(order.id, "paid", {
      order_secret_code: secretCode,
      matched_via_email: 1,
      auto_confirmed_at: new Date().toISOString(),
    });

    await logAuditEvent({
      event_type: "order.payment_auto_confirmed",
      order_id: order.id,
      details: `Payment auto-confirmed via email match for transaction ${txId}`,
    });

    await createNotification({
      userId: order.buyer_id,
      orderId: order.id,
      type: "payment_confirmed",
      title: "تم تأكيد الدفع",
      message: "تم تأكيد دفع طلبك تلقائياً. يمكنك الآن الاطلاع على الكود السري.",
      link: `/orders/${order.id}`,
    });

    if (order.seller_id) {
      await createNotification({
        userId: order.seller_id,
        orderId: order.id,
        type: "payment_confirmed",
        title: "تم تأكيد دفع طلب",
        message: `تم تأكيد دفع الطلب ${order.order_tracking_id}. يرجى انتظار الكود السري من المشتري.`,
        link: `/seller/orders`,
      });
    }

    const admins = await db.query<{ id: string }>("SELECT id FROM users WHERE role = 'admin'");
    for (const a of admins) {
      await createNotification({
        userId: a.id,
        orderId: order.id,
        type: "payment_confirmed",
        title: "تم تأكيد الدفع تلقائياً",
        message: `تم تأكيد دفع الطلب ${order.order_tracking_id} تلقائياً.`,
        link: `/admin/orders`,
      });
    }

    return { matched: "exact", order };
  }

  if (matchingOrders.length > 1) {
    return { matched: "multiple", orders: matchingOrders };
  }

  return { matched: "none" };
}
