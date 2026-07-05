import { Pool, QueryResultRow } from "pg";
import bcrypt from "bcryptjs";

let pool: Pool | null = null;
let initialized = false;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on("error", (err) => {
      console.error("Unexpected pool error:", err);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function execute(sql: string, params?: unknown[]): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rowCount ?? 0;
  } finally {
    client.release();
  }
}

export async function getDb() {
  if (!initialized) {
    await initializeSchema();
    initialized = true;
  }
  return { query, queryOne, execute, getPool: getPool };
}

async function initializeSchema(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'buyer' CHECK(role IN ('buyer','seller','admin')),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      date_of_birth TEXT DEFAULT '',
      banned SMALLINT NOT NULL DEFAULT 0,
      seller_status TEXT DEFAULT NULL CHECK(seller_status IN (NULL,'pending','approved','rejected')),
      id_file_path TEXT DEFAULT '',
      email_verified SMALLINT NOT NULL DEFAULT 0,
      payment_full_name TEXT DEFAULT '',
      payment_surname TEXT DEFAULT '',
      payment_dob TEXT DEFAULT '',
      payment_rip TEXT DEFAULT '',
      payment_currency TEXT DEFAULT 'DZD',
      payment_usdt_address TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id TEXT REFERENCES users(id),
      order_id TEXT,
      ip_address TEXT,
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL REFERENCES users(id),
      reported_user_id TEXT REFERENCES users(id),
      report_type TEXT NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved','dismissed')),
      resolution_note TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_id TEXT REFERENCES users(id),
      product_type TEXT NOT NULL CHECK(product_type IN ('account','recharge')),
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price DOUBLE PRECISION NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'DZD',
      images TEXT NOT NULL DEFAULT '[]',
      delivery_data TEXT DEFAULT '',
      product_secret_code TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','sold')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_tracking_id TEXT UNIQUE NOT NULL,
      buyer_id TEXT NOT NULL REFERENCES users(id),
      seller_id TEXT REFERENCES users(id),
      product_id TEXT REFERENCES products(id),
      product_type TEXT NOT NULL CHECK(product_type IN ('account','recharge')),
      currency TEXT NOT NULL DEFAULT 'DZD',
      product_price DOUBLE PRECISION NOT NULL DEFAULT 0,
      tax_rate DOUBLE PRECISION NOT NULL DEFAULT 1,
      tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      payment_proof_file TEXT DEFAULT '',
      payment_reviewed_by TEXT REFERENCES users(id),
      order_secret_code TEXT DEFAULT '',
      delivery_data TEXT DEFAULT '',
      delivery_date TIMESTAMPTZ,
      warranty_end_date TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'awaiting_payment_proof' CHECK(status IN (
        'awaiting_payment_proof','payment_under_review','payment_rejected',
        'payment_confirmed_waiting_code','code_verified_deliver_now',
        'delivered','disputed','seller_paid'
      )),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      buyer_id TEXT NOT NULL REFERENCES users(id),
      seller_id TEXT REFERENCES users(id),
      reason TEXT NOT NULL,
      evidence_files TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','resolved_buyer','resolved_seller')),
      resolved_by TEXT REFERENCES users(id),
      resolution_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_chat_messages (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      sender_id TEXT NOT NULL REFERENCES users(id),
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id TEXT REFERENCES orders(id),
      type TEXT NOT NULL,
      title TEXT DEFAULT '',
      message TEXT NOT NULL,
      icon TEXT DEFAULT '',
      link TEXT DEFAULT '',
      read SMALLINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      buyer_id TEXT NOT NULL REFERENCES users(id),
      seller_id TEXT NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      edited_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      old_price DOUBLE PRECISION NOT NULL DEFAULT 0,
      new_price DOUBLE PRECISION NOT NULL DEFAULT 0,
      changed_by TEXT NOT NULL REFERENCES users(id),
      reason TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verification_user_id ON email_verification_tokens(user_id);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used SMALLINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const client = await getPool().connect();
  try {
    await client.query(sql);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
          ALTER TABLE users ADD COLUMN email_verified SMALLINT NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='attributes') THEN
          ALTER TABLE products ADD COLUMN attributes JSONB DEFAULT '{}'::jsonb;
        END IF;
      END $$;
    `);

    const { rows } = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (rows.length === 0 && process.env.ADMIN_INIT_PASSWORD) {
      const hash = bcrypt.hashSync(process.env.ADMIN_INIT_PASSWORD, 10);
      await client.query(
        "INSERT INTO users (id, role, email, password_hash, first_name) VALUES ($1, 'admin', $2, $3, 'Admin') ON CONFLICT (id) DO NOTHING",
        ["usr_admin", process.env.ADMIN_INIT_EMAIL || "admin@bupg.local", hash]
      );
    }
  } finally {
    client.release();
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    initialized = false;
  }
}
