"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RatingStars from "@/components/RatingStars";
import { downloadCSV } from "@/lib/export";

type Order = {
  id: string;
  order_tracking_id: string;
  product_title: string | null;
  product_price: number;
  currency: string;
  status: string;
  warranty_end_date: string | null;
  delivery_date: string | null;
};

export default function SellerEarningsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "seller" || data.user.seller_status !== "approved") {
          router.push("/login");
          return;
        }
        loadOrders();
      })
      .catch(() => router.push("/login"));
  }, [router]);

  async function loadOrders() {
    const res = await fetch("/api/seller/orders", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    }
    const st = await fetch("/api/seller/stats", { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null);
    if (st?.reviews) setReviewStats(st.reviews);
    setLoading(false);
  }

  if (loading) return null;

  const underWarranty = orders.filter(
    (o) => o.status === "delivered" && o.warranty_end_date && new Date(o.warranty_end_date) > new Date()
  );
  const readyForPayout = orders.filter(
    (o) => o.status === "delivered" && o.warranty_end_date && new Date(o.warranty_end_date) <= new Date()
  );
  const paid = orders.filter((o) => o.status === "seller_paid");

  const warrantyTotal = underWarranty.reduce((s, o) => s + o.product_price, 0);
  const readyTotal = readyForPayout.reduce((s, o) => s + o.product_price, 0);
  const paidTotal = paid.reduce((s, o) => s + o.product_price, 0);

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">الأرباح</h1>
            <p className="subtitle">عرض أرباحك وحالتها.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => router.push("/seller")}>العودة</button>
            <button className="btn-secondary" onClick={() => downloadCSV(orders.filter(o => o.status === "seller_paid" || o.status === "delivered").map(o => ({
              tracking_id: o.order_tracking_id,
              product: o.product_title,
              price: o.product_price,
              currency: o.currency,
              status: o.status,
              delivery_date: o.delivery_date || "",
              warranty_end: o.warranty_end_date || "",
            })), "earnings")}>تصدير CSV</button>
          </div>
        </div>
      </section>

      {reviewStats && reviewStats.count > 0 && (
        <div className="mt-6 glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white/50">التقييمات</div>
              <div className="mt-2 text-2xl font-black text-yellow-300">{reviewStats.average} <span className="text-sm text-white/50">/ 5</span></div>
              <div className="mt-1 text-xs text-white/50">{reviewStats.count} تقييم | {reviewStats.satisfaction}% رضا</div>
            </div>
            <div className="text-left">
              {[5,4,3,2,1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-white/50">{star}</span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${(reviewStats.distribution[star] / reviewStats.count) * 100}%` }} />
                  </div>
                  <span className="w-4 text-white/50">{reviewStats.distribution[star]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="glass rounded-3xl p-5">
          <div className="text-xs font-bold text-white/50">قيد الضمان</div>
          <div className="mt-2 text-2xl font-black text-yellow-300">{warrantyTotal.toFixed(2)} DZD</div>
          <div className="mt-1 text-xs text-white/50">{underWarranty.length} طلب</div>
        </div>
        <div className="glass rounded-3xl p-5">
          <div className="text-xs font-bold text-white/50">جاهزة للسحب</div>
          <div className="mt-2 text-2xl font-black text-emerald-300">{readyTotal.toFixed(2)} DZD</div>
          <div className="mt-1 text-xs text-white/50">{readyForPayout.length} طلب</div>
        </div>
        <div className="glass rounded-3xl p-5">
          <div className="text-xs font-bold text-white/50">تم الدفع</div>
          <div className="mt-2 text-2xl font-black text-indigo-300">{paidTotal.toFixed(2)} DZD</div>
          <div className="mt-1 text-xs text-white/50">{paid.length} طلب</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-black text-white/70">طلبات قيد الضمان</h2>
        <div className="grid gap-3">
          {underWarranty.map((o) => (
            <div key={o.id} className="glass rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{o.product_title || "—"}</div>
                  <div className="text-xs text-white/50">{o.order_tracking_id}</div>
                </div>
                <div className="text-left">
                  <div className="font-black text-yellow-300">{o.product_price} {o.currency}</div>
                  <div className="text-xs text-white/50">
                    ضمان حتى: {o.warranty_end_date ? new Date(o.warranty_end_date).toLocaleDateString("ar-DZ") : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {underWarranty.length === 0 && (
            <div className="text-sm text-white/70">لا توجد طلبات قيد الضمان.</div>
          )}
        </div>
      </div>
    </div>
  );
}
