import { simpleParser } from "mailparser";
import { getDb } from "./db";
import { parseBaridiMobEmail, saveEmailLog, saveUnmatchedPayment, autoMatchPayment, markEmailProcessed } from "./paymentVerification";

const BARIDIMOB_SENDER = "baridimob@poste.dz";

async function getImapConfig(): Promise<{
  host: string;
  port: number;
  user: string;
  password: string;
} | null> {
  const { queryOne } = await getDb();
  const host = await queryOne<{ value: string }>("SELECT value FROM settings WHERE key = 'imap_host'");
  const port = await queryOne<{ value: string }>("SELECT value FROM settings WHERE key = 'imap_port'");
  const user = await queryOne<{ value: string }>("SELECT value FROM settings WHERE key = 'imap_user'");
  const password = await queryOne<{ value: string }>("SELECT value FROM settings WHERE key = 'imap_password'");

  if (!host || !user || !password) return null;

  return {
    host: host.value,
    port: port ? parseInt(port.value, 10) : 993,
    user: user.value,
    password: password.value,
  };
}

async function getLastCheckedUid(): Promise<number> {
  const { queryOne } = await getDb();
  const row = await queryOne<{ value: string }>("SELECT value FROM settings WHERE key = 'last_checked_uid'");
  return row ? parseInt(row.value, 10) || 0 : 0;
}

async function setLastCheckedUid(uid: number): Promise<void> {
  const { execute } = await getDb();
  await execute(
    "INSERT INTO settings (key, value) VALUES ('last_checked_uid', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [String(uid)]
  );
}

export async function checkEmailInbox(): Promise<{
  checked: number;
  matched: number;
  unmatched: number;
  multiple: number;
  errors: number;
}> {
  const config = await getImapConfig();
  if (!config) {
    console.log("[EMAIL_CHECKER] IMAP not configured — skipping");
    return { checked: 0, matched: 0, unmatched: 0, multiple: 0, errors: 0 };
  }

  let checked = 0;
  let matched = 0;
  let unmatched = 0;
  let multiple = 0;
  let errors = 0;

  let client: import("imapflow").ImapFlow | null = null;

  try {
    const { ImapFlow } = await import("imapflow");
    client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.port === 993,
      auth: {
        user: config.user,
        pass: config.password,
      },
      logger: false,
    });

    await client.connect();

    const lock = await client.getMailboxLock("INBOX");
    try {
      const lastUid = await getLastCheckedUid();
      const searchCriteria: Record<string, unknown> = { from: BARIDIMOB_SENDER };
      if (lastUid > 0) {
        searchCriteria.uid = { gt: lastUid };
      }

      const messages = client.fetch(searchCriteria, {
        source: true,
        uid: true,
        envelope: true,
        internalDate: true,
      });

      let maxUid = lastUid;

      for await (const msg of messages) {
        try {
          const uid = msg.uid;
          if (uid > maxUid) maxUid = uid;

          if (!msg.source) continue;

          const parsed = await simpleParser(msg.source);

          const senderEmail = (parsed.from?.value?.[0]?.address || "").toLowerCase();
          if (senderEmail !== BARIDIMOB_SENDER) continue;

          const bodyText = parsed.text || parsed.html || "";

          const extracted = parseBaridiMobEmail(bodyText);

          const emailLog = await saveEmailLog({
            sender: senderEmail,
            subject: parsed.subject || "",
            bodyText: parsed.text || "",
            bodyHtml: parsed.html || "",
            rawFrom: parsed.from?.text || "",
            amount: extracted.amount,
            transactionId: extracted.transactionId,
            targetAccount: extracted.targetAccount,
            currency: extracted.currency,
            messageId: parsed.messageId || "",
          });

          checked++;

          if (!extracted.transactionId) {
            await saveUnmatchedPayment({
              emailLogId: emailLog.id,
              transactionId: extracted.transactionId,
              amount: extracted.amount,
              currency: extracted.currency,
              targetAccount: extracted.targetAccount,
              emailSender: senderEmail,
              emailSubject: parsed.subject || "",
              emailBody: bodyText.slice(0, 2000),
            });
            unmatched++;
            await markEmailProcessed(emailLog.id);
            continue;
          }

          const result = await autoMatchPayment(emailLog);
          await markEmailProcessed(emailLog.id);

          if (result.matched === "exact") {
            matched++;
          } else if (result.matched === "multiple") {
            multiple++;
            await saveUnmatchedPayment({
              emailLogId: emailLog.id,
              transactionId: extracted.transactionId,
              amount: extracted.amount,
              currency: extracted.currency,
              targetAccount: extracted.targetAccount,
              emailSender: senderEmail,
              emailSubject: parsed.subject || "",
              emailBody: bodyText.slice(0, 2000),
            });
          } else {
            unmatched++;
            await saveUnmatchedPayment({
              emailLogId: emailLog.id,
              transactionId: extracted.transactionId,
              amount: extracted.amount,
              currency: extracted.currency,
              targetAccount: extracted.targetAccount,
              emailSender: senderEmail,
              emailSubject: parsed.subject || "",
              emailBody: bodyText.slice(0, 2000),
            });
          }
        } catch (err) {
          console.error("[EMAIL_CHECKER] Error processing message:", err);
          errors++;
        }
      }

      if (maxUid > lastUid) {
        await setLastCheckedUid(maxUid);
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    console.error("[EMAIL_CHECKER] Connection error:", err);
    errors++;
    if (client) {
      try { await client.logout(); } catch {}
    }
  }

  return { checked, matched, unmatched, multiple, errors };
}
