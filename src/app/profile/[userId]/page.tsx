import Image from "next/image";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getSellerStats, getSellerReviews } from "@/lib/reviews";
import RatingStars from "@/components/RatingStars";
import { type ProductCategory } from "@/lib/products";

type PublicUser = {
  id: string; first_name: string; last_name: string;
  role: string; seller_status: string | null; created_at: string;
};

type ProfileProduct = {
  id: string; title: string; description: string; price: number;
  currency: string; image: string; status: string; category: string;
  product_type: string; created_at: string;
};

export default async function ProfilePage(props: { params: Promise<{ userId: string }> }) {
  const { userId } = await props.params;
  const { queryOne, query } = await getDb();

  const user = await queryOne<PublicUser>(
    "SELECT id, first_name, last_name, role, seller_status, created_at FROM users WHERE id = $1",
    [userId]
  );
  if (!user) {
    return <div className="mx-auto max-w-2xl pt-12"><section className="glass rounded-3xl p-6 text-center md:p-10"><h1 className="title">المستخدم غير موجود</h1><Link href="/" className="btn-secondary mt-4 inline-block">الرئيسية</Link></section></div>;
  }

  const products = await query<ProfileProduct>(
    `SELECT id, title, description, price, currency, images, status, category, product_type, created_at
     FROM products WHERE seller_id = $1 AND status IN ('active', 'sold')
     ORDER BY created_at DESC`,
    [userId]
  );

  const stats = user.role === "seller" ? await getSellerStats(userId).catch(() => null) : null;
  const reviews = user.role === "seller" ? await getSellerReviews(userId, 5).catch(() => []) : [];

  const productCount = products.length;
  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="btn-secondary mb-4 inline-block">← الرجوع</Link>

      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-3xl font-black text-white shadow-lg">
            {user.first_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="title">{fullName}</h1>
            <p className="subtitle">
              {user.role === "seller" ? "بائع" : user.role === "admin" ? "إدارة" : "مشتري"}
              {user.role === "seller" && user.seller_status === "approved" && " • موثق"}
            </p>
            <p className="mt-1 text-sm text-white/50">
              {productCount} منتج{productCount !== 1 ? "ات" : ""}
            </p>
          </div>
        </div>

        {stats && stats.count > 0 && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300">{stats.average}</div>
              <div className="text-xs text-white/50">من 5</div>
            </div>
            <div>
              <RatingStars rating={Math.round(stats.average)} size="sm" />
              <div className="mt-1 text-xs text-white/50">{stats.count} تقييم | {stats.satisfaction}% رضا</div>
            </div>
          </div>
        )}
      </section>

      {products.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-4 text-xl font-black">المنتجات</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((p) => {
              const images = (() => {
                try { const parsed = JSON.parse(p.image || "[]"); return Array.isArray(parsed) ? parsed : []; }
                catch { return []; }
              })();
              const imageUrl = images[0] || "/uploads/placeholder.svg";
              return (
                <Link key={p.id} href={`/products/${encodeURIComponent(p.id)}`} className="glass glass-hover flex flex-col rounded-3xl">
                  <div className="relative h-40 shrink-0 overflow-hidden">
                    <Image src={imageUrl} alt={p.title} fill className="object-cover" />
                    {p.status === "sold" && (
                      <div className="absolute left-2 top-2 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg">تم البيع</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="text-lg font-black">{p.title}</div>
                    <div className="mt-2 flex-1 break-words text-sm leading-7 text-white/70">{p.description}</div>
                    <div className="mt-3 text-xl font-black text-white">{p.price} {p.currency}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-4 text-xl font-black">آخر التقييمات</h2>
          <div className="grid gap-3">
            {reviews.map((r: any) => (
              <div key={r.id} className="glass rounded-3xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-white">{r.buyer_name}</span>
                    <RatingStars rating={r.rating} size="sm" />
                  </div>
                  <span className="text-xs text-white/50">{new Date(r.created_at).toLocaleDateString("ar-DZ")}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-white/70">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
