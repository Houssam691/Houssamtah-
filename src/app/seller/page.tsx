"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";

type SafeUser = { id: string; role: string; email: string; first_name: string; last_name: string; seller_status: string | null };

export default function SellerPage() {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ products: number; orders: number; earnings: number; revenue: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "seller") { router.push("/login"); return; }
        if (data.user.seller_status !== "approved") { router.push("/seller/pending"); return; }
        setUser(data.user);
        Promise.all([
          fetch(`/api/products?seller_id=${encodeURIComponent(data.user.id)}`).then((r) => r.json()),
          fetch("/api/seller/orders").then((r) => r.json()),
          fetch("/api/seller/stats").then((r) => r.json()).catch(() => ({})),
        ]).then(([products, orders, sellerStats]) => {
          const prods = Array.isArray(products) ? products : [];
          const ords = Array.isArray(orders) ? orders : [];
          const totalRevenue = ords
            .filter((o: any) => o.status === "seller_paid" || o.status === "delivered")
            .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
          setStats({
            products: prods.length,
            orders: ords.length,
            earnings: sellerStats?.pending_earnings || 0,
            revenue: totalRevenue,
          });
          setLoading(false);
        }).catch(() => setLoading(false));
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (loading) {
    return (
      <div className="grid gap-6">
        <section className="glass rounded-3xl p-6 md:p-8">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton mt-3 h-5 w-72" />
        </section>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 page-transition">
      {/* Welcome */}
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
              <span>👋</span>
              <span>مرحباً بعودتك</span>
            </div>
            <h1 className="title mt-4">لوحة البائع</h1>
            <p className="subtitle">{user?.first_name}، متجرك بين يديك. ماذا تريد أن تفعل اليوم؟</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="glass rounded-3xl p-5 text-center">
            <div className="text-2xl">📦</div>
            <div className="mt-2 text-2xl font-black text-white">{stats.products}</div>
            <div className="mt-1 text-sm text-white/60">المنتجات</div>
          </div>
          <div className="glass rounded-3xl p-5 text-center">
            <div className="text-2xl">📋</div>
            <div className="mt-2 text-2xl font-black text-white">{stats.orders}</div>
            <div className="mt-1 text-sm text-white/60">الطلبات</div>
          </div>
          <div className="glass rounded-3xl p-5 text-center">
            <div className="text-2xl">💰</div>
            <div className="mt-2 text-2xl font-black text-emerald-300">{stats.earnings.toFixed(2)}</div>
            <div className="mt-1 text-sm text-white/60">أرباح معلقة</div>
          </div>
          <div className="glass rounded-3xl p-5 text-center">
            <div className="text-2xl">🏆</div>
            <div className="mt-2 text-2xl font-black text-indigo-300">{stats.revenue.toFixed(2)}</div>
            <div className="mt-1 text-sm text-white/60">إجمالي الإيرادات</div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="animate-fade-in-up stagger-1">
        <h2 className="mb-4 text-lg font-black">إجراءات سريعة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/seller/products")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-2xl">➕</div>
            <div className="mt-4 text-lg font-black text-white">إضافة منتج</div>
            <div className="mt-1 text-sm text-white/70">انشر منتجاً جديداً في ثوانٍ</div>
          </button>

          <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/seller/orders")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-2xl">📋</div>
            <div className="mt-4 text-lg font-black text-white">الطلبات</div>
            <div className="mt-1 text-sm text-white/70">تسليم الطلبات ومتابعتها</div>
          </button>

          <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/seller/earnings")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-2xl">💰</div>
            <div className="mt-4 text-lg font-black text-white">الأرباح</div>
            <div className="mt-1 text-sm text-white/70">عرض أرباحك وإحصائياتك</div>
          </button>

          <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/seller/disputes")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-2xl">⚖️</div>
            <div className="mt-4 text-lg font-black text-white">النزاعات</div>
            <div className="mt-1 text-sm text-white/70">حل النزاعات إن وجدت</div>
          </button>

          <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/notifications")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-2xl">🔔</div>
            <div className="mt-4 text-lg font-black text-white">الإشعارات</div>
            <div className="mt-1 text-sm text-white/70">آخر التحديثات والتنبيهات</div>
          </button>

          <a className="glass glass-hover rounded-3xl p-6 text-right" href="/settings">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-2xl">⚙️</div>
            <div className="mt-4 text-lg font-black text-white">الإعدادات</div>
            <div className="mt-1 text-sm text-white/70">تعديل معلومات المتجر</div>
          </a>
        </div>
      </section>

      {/* Tips */}
      <section className="animate-fade-in-up stagger-2 glass rounded-3xl p-6">
        <h2 className="text-sm font-black text-white/80">💡 نصائح سريعة</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <span className="font-bold text-white">صور احترافية</span>
            <p className="mt-1">المنتجات ذات الصور الواضحة تحصل على مبيعات أكثر بنسبة ٨٠٪.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <span className="font-bold text-white">أسعار منافسة</span>
            <p className="mt-1">راقب أسعار السوق لتحصل على مبيعات أسرع.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <span className="font-bold text-white">تسليم سريع</span>
            <p className="mt-1">التسليم السريع يبني سمعة قوية ويجلب تقييمات إيجابية.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
