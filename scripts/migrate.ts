/**
 * Migration script: SQLite -> PostgreSQL (Neon)
 *
 * Steps:
 *   1. npm install better-sqlite3 dotenv --no-save
 *   2. Set DATABASE_URL in .env.local (see .env.example)
 *   3. Make sure data/bupg.db exists (from the old SQLite setup)
 *   4. Run: npx tsx scripts/migrate.ts
 *   5. npm uninstall better-sqlite3
 */

import Database from "better-sqlite3";
import { Pool } from "pg";
import path from "path";

// Load .env.local manually
import { readFileSync } from "fs";
const envPath = path.join(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {}

const SQLITE_PATH = path.join(process.cwd(), "data", "bupg.db");

async function main() {
  const pgUrl = process.env.DATABASE_URL;
  if (!pgUrl) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    console.error("   Add: DATABASE_URL=postgresql://user:pass@host/db?sslmode=require");
    process.exit(1);
  }

  const sqlite = new Database(SQLITE_PATH);
  sqlite.pragma("journal_mode = WAL");

  console.log("🐘 Connecting to PostgreSQL...");
  const pool = new Pool({
    connectionString: pgUrl,
    ssl: pgUrl.includes("localhost") ? false : { rejectUnauthorized: false },
  });
  const pg = await pool.connect();

  try {
    await pg.query("SET session_replication_role = 'replica'");

    const tables = [
      "price_history", "reviews", "notifications", "order_chat_messages",
      "disputes", "orders", "products", "audit_log", "settings",
      "sessions", "users",
    ];
    for (const t of tables) {
      await pg.query(`DELETE FROM ${t}`);
    }

    const migrateTable = async (name: string, columns: string, placeholders: string, rows: any[]) => {
      console.log(`📊 Migrating ${name}...`);
      for (const row of rows) {
        await pg.query(
          `INSERT INTO ${name} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          Object.values(row)
        );
      }
      console.log(`  ✅ ${rows.length} ${name} migrated`);
    };

    const toArray = (rows: any) => JSON.parse(JSON.stringify(rows));

    await migrateTable("users",
      "id,role,email,password_hash,first_name,last_name,date_of_birth,banned,seller_status,id_file_path,payment_full_name,payment_surname,payment_dob,payment_rip,payment_currency,payment_usdt_address,created_at",
      "$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17",
      toArray(sqlite.prepare("SELECT * FROM users").all()));

    await migrateTable("sessions",
      "id,user_id,token,created_at,expires_at",
      "$1,$2,$3,$4,$5",
      toArray(sqlite.prepare("SELECT * FROM sessions").all()));

    await migrateTable("settings",
      "key,value",
      "$1,$2",
      toArray(sqlite.prepare("SELECT * FROM settings").all()));

    await migrateTable("audit_log",
      "id,event_type,user_id,order_id,ip_address,details,created_at",
      "$1,$2,$3,$4,$5,$6,$7",
      toArray(sqlite.prepare("SELECT * FROM audit_log").all()));

    await migrateTable("products",
      "id,seller_id,product_type,category,title,description,price,currency,images,delivery_data,product_secret_code,status,created_at",
      "$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13",
      toArray(sqlite.prepare("SELECT * FROM products").all()));

    await migrateTable("orders",
      "id,order_tracking_id,buyer_id,seller_id,product_id,product_type,currency,product_price,tax_rate,tax_amount,total_amount,payment_proof_file,payment_reviewed_by,order_secret_code,delivery_data,delivery_date,warranty_end_date,status,created_at",
      "$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19",
      toArray(sqlite.prepare("SELECT * FROM orders").all()));

    await migrateTable("disputes",
      "id,order_id,buyer_id,seller_id,reason,evidence_files,status,resolved_by,resolution_note,created_at",
      "$1,$2,$3,$4,$5,$6,$7,$8,$9,$10",
      toArray(sqlite.prepare("SELECT * FROM disputes").all()));

    await migrateTable("order_chat_messages",
      "id,order_id,sender_id,text,created_at",
      "$1,$2,$3,$4,$5",
      toArray(sqlite.prepare("SELECT * FROM order_chat_messages").all()));

    await migrateTable("notifications",
      "id,user_id,order_id,type,title,message,icon,link,read,created_at",
      "$1,$2,$3,$4,$5,$6,$7,$8,$9,$10",
      toArray(sqlite.prepare("SELECT * FROM notifications").all()));

    await migrateTable("reviews",
      "id,order_id,buyer_id,seller_id,rating,comment,edited_at,created_at",
      "$1,$2,$3,$4,$5,$6,$7,$8",
      toArray(sqlite.prepare("SELECT * FROM reviews").all()));

    await migrateTable("price_history",
      "id,product_id,old_price,new_price,changed_by,reason,created_at",
      "$1,$2,$3,$4,$5,$6,$7",
      toArray(sqlite.prepare("SELECT * FROM price_history").all()));

    await pg.query("SET session_replication_role = 'origin'");
    console.log("\n🎉 Migration completed successfully!");

  } catch (err) {
    console.error("❌ Migration failed:", err);
    await pg.query("SET session_replication_role = 'origin'");
    process.exit(1);
  } finally {
    pg.release();
    await pool.end();
    sqlite.close();
  }
}

main();
