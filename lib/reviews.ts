import { getDb } from "./db";
import crypto from "crypto";

export type Review = {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  rating: number;
  comment: string;
  edited_at: string | null;
  created_at: string;
  buyer_name?: string;
  product_title?: string;
};

export type SellerRatingStats = {
  average: number;
  count: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  satisfaction: number;
};

export async function createReview(params: {
  order_id: string;
  buyer_id: string;
  seller_id: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const { queryOne } = await getDb();

  const existing = await queryOne<{ id: string }>("SELECT id FROM reviews WHERE order_id = $1", [params.order_id]);
  if (existing) throw new Error("لقد قمت بتقييم هذا الطلب مسبقاً");

  const order = await queryOne<{ status: string }>("SELECT status FROM orders WHERE id = $1", [params.order_id]);
  if (!order || order.status !== "delivered") throw new Error("لا يمكن التقييم قبل اكتمال الطلب");

  const id = `rev-${crypto.randomBytes(12).toString("hex")}`;
  await queryOne(`
    INSERT INTO reviews (id, order_id, buyer_id, seller_id, rating, comment)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [id, params.order_id, params.buyer_id, params.seller_id, params.rating, params.comment || ""]);

  return (await queryOne<Review>("SELECT * FROM reviews WHERE id = $1", [id]))!;
}

export async function updateReview(id: string, buyerId: string, rating?: number, comment?: string): Promise<Review> {
  const { queryOne } = await getDb();

  const review = await queryOne<Review>("SELECT * FROM reviews WHERE id = $1 AND buyer_id = $2", [id, buyerId]);
  if (!review) throw new Error("التقييم غير موجود");

  const createdAt = new Date(review.created_at).getTime();
  const now = Date.now();
  if (now - createdAt > 24 * 60 * 60 * 1000) throw new Error("لا يمكن تعديل التقييم بعد 24 ساعة");

  await queryOne(`
    UPDATE reviews SET rating = COALESCE($1, rating), comment = COALESCE($2, comment), edited_at = NOW()
    WHERE id = $3
  `, [rating ?? null, comment !== undefined ? comment : null, id]);

  return (await queryOne<Review>("SELECT * FROM reviews WHERE id = $1", [id]))!;
}

export async function getSellerStats(sellerId: string): Promise<SellerRatingStats> {
  const { query } = await getDb();
  const reviews = await query<{ rating: number }>("SELECT rating FROM reviews WHERE seller_id = $1", [sellerId]);

  const count = reviews.length;
  if (count === 0) return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, satisfaction: 0 };

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const r of reviews) {
    dist[r.rating as keyof typeof dist]++;
    total += r.rating;
  }

  return {
    average: Math.round((total / count) * 10) / 10,
    count,
    distribution: dist,
    satisfaction: Math.round((dist[4] + dist[5]) / count * 100),
  };
}

export async function getSellerReviews(sellerId: string, limit = 10): Promise<Review[]> {
  const { query } = await getDb();
  return query<Review>(`
    SELECT r.*, b.first_name || ' ' || b.last_name as buyer_name, p.title as product_title
    FROM reviews r
    LEFT JOIN users b ON r.buyer_id = b.id
    LEFT JOIN orders o ON r.order_id = o.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE r.seller_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2
  `, [sellerId, limit]);
}

export async function getAllReviews(filters?: {
  seller_id?: string;
  buyer_id?: string;
  order_id?: string;
  from_date?: string;
  to_date?: string;
}): Promise<Review[]> {
  const { query } = await getDb();
  let sql = `
    SELECT r.*, b.first_name || ' ' || b.last_name as buyer_name,
      s.first_name || ' ' || s.last_name as seller_name,
      p.title as product_title
    FROM reviews r
    LEFT JOIN users b ON r.buyer_id = b.id
    LEFT JOIN users s ON r.seller_id = s.id
    LEFT JOIN orders o ON r.order_id = o.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE 1=1
  `;
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.seller_id) { sql += ` AND r.seller_id = $${idx++}`; params.push(filters.seller_id); }
  if (filters?.buyer_id) { sql += ` AND r.buyer_id = $${idx++}`; params.push(filters.buyer_id); }
  if (filters?.order_id) { sql += ` AND r.order_id = $${idx++}`; params.push(filters.order_id); }
  if (filters?.from_date) { sql += ` AND r.created_at >= $${idx++}`; params.push(filters.from_date); }
  if (filters?.to_date) { sql += ` AND r.created_at <= $${idx++}`; params.push(filters.to_date); }

  sql += " ORDER BY r.created_at DESC LIMIT 100";
  return query<Review>(sql, params);
}

export async function deleteReview(id: string): Promise<boolean> {
  const { execute } = await getDb();
  const count = await execute("DELETE FROM reviews WHERE id = $1", [id]);
  return count > 0;
}

export async function hideReviewComment(id: string): Promise<void> {
  const { execute } = await getDb();
  await execute("UPDATE reviews SET comment = '[مخفي من قبل الإدارة]' WHERE id = $1", [id]);
}
