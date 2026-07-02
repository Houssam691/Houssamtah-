import Image from "next/image";
import Link from "next/link";
import { getProductById } from "@/lib/products";
import { getSellerReviews, getSellerStats } from "@/lib/reviews";
import RatingStars from "@/components/RatingStars";

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const product = await getProductById(id);
  if (!product) return <div className="mx-auto max-w-2xl pt-12"><section className="glass rounded-3xl p-6 text-center md:p-10"><h1 className="title">المنتج غير موجود</h1><Link href="/" className="btn-secondary mt-4 inline-block">الرئيسية</Link></section></div>;

  let stats = null;
  let reviews: any[] = [];
  if (product.seller_id) {
    [stats, reviews] = await Promise.all([
      getSellerStats(product.seller_id).catch(() => null),
      getSellerReviews(product.seller_id, 5).catch(() => []),
    ]);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="glass rounded-3xl p-6 md:p-8">
        <Link href="/" className="btn-secondary mb-4 inline-block">← الرجوع</Link>
        <div className="relative h-64 overflow-hidden rounded-2xl">
          <Image src={product.image || "/uploads/placeholder.svg"} alt={product.title} fill className="object-cover" />
        </div>
        <div className="mt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="title">{product.title}</h1>
              <p className="subtitle">{product.category} • {product.product_type === "account" ? "حساب" : "شحن"}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-indigo-300">{product.price} {product.currency}</div>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-sm font-black text-white/80">المواصفات والتفاصيل</h2>
            <div className="mt-2 whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/90">
              {product.description || "لا توجد تفاصيل"}
            </div>
          </div>

          {stats && stats.count > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-black text-white/80">تقييمات البائع</h2>
              <div className="mt-2 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-300">{stats.average}</div>
                  <div className="text-xs text-white/50">من 5</div>
                </div>
                <div>
                  <RatingStars rating={Math.round(stats.average)} size="sm" />
                  <div className="mt-1 text-xs text-white/50">{stats.count} تقييم | {stats.satisfaction}% رضا</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link className="btn-primary w-full py-4 text-center text-lg" href={`/orders/new?productId=${encodeURIComponent(product.id)}`}>
              شراء الآن
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
