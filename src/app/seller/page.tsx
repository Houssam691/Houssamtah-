"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SafeUser = { id: string; role: string; email: string; first_name: string; last_name: string; seller_status: string | null };

type Order = {
  id: string;
  order_tracking_id: string;
  product_title: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  read: number;
  icon: string;
  link: string;
  created_at: string;
  order_tracking_id: string | null;
};

export default function SellerPage() {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ products: number; orders: number; earnings: number; revenue: number } | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
          fetch("/api/notifications").then((r) => r.json()).catch(() => ({ notifications: [] })),
        ]).then(([products, orders, sellerStats, notifData]) => {
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
          setRecentOrders(ords.slice(0, 5));
          const notifs = Array.isArray(notifData.notifications) ? notifData.notifications : [];
          setNotifications(notifs.slice(0, 5));
          setUnreadCount(notifData.unread_count || 0);
          setLoading(false);
        }).catch(() => setLoading(false));
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const orderStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: "قيد الانتظار", cls: "bg-amber-500/20 text-amber-300" },
      paid: { label: "تم الدفع", cls: "bg-indigo-500/20 text-indigo-300" },
      processing: { label: "قيد المعالجة", cls: "bg-sky-500/20 text-sky-300" },
      delivered: { label: "تم التسليم", cls: "bg-emerald-500/20 text-emerald-300" },
      seller_paid: { label: "تم الدفع للبائع", cls: "bg-emerald-500/20 text-emerald-300" },
      disputed: { label: "نزاع", cls: "bg-rose-500/20 text-rose-300" },
      rejected: { label: "مرفوض", cls: "bg-rose-500/20 text-rose-300" },
      cancelled: { label: "ملغي", cls: "bg-zinc-500/20 text-zinc-300" },
    };
    return map[status] || { label: status, cls: "bg-white/10 text-white/50" };
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        <section className="glass rounded-2xl p-5">
          <div className="skeleton h-7 w-40" />
          <div className="skeleton mt-2 h-4 w-60" />
        </section>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 page-transition">
      {/* Welcome */}
      <section className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <span>👋</span>
              <span>مرحباً بعودتك</span>
            </div>
            <h1 className="text-xl font-black mt-3">لوحة البائع</h1>
            <p className="mt-1 text-sm text-white/60">{user?.first_name}، متجرك بين يديك.</p>
          </div>
        </div>
      </section>

      {/* Quick Tools */}
      <section>
        <h2 className="mb-2 text-sm font-black text-white/80">أدوات سريعة</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="glass rounded-xl px-4 py-3 text-center text-xs font-bold text-white hover:bg-white/10 transition min-w-[64px]" onClick={() => router.push("/seller/products")}>
            <div className="text-lg mb-1">➕</div>
            <span>منتج</span>
          </button>
          <button className="glass rounded-xl px-4 py-3 text-center text-xs font-bold text-white hover:bg-white/10 transition min-w-[64px]" onClick={() => router.push("/seller/orders")}>
            <div className="text-lg mb-1">📋</div>
            <span>طلبات</span>
          </button>
          <button className="glass rounded-xl px-4 py-3 text-center text-xs font-bold text-white hover:bg-white/10 transition min-w-[64px]" onClick={() => router.push("/seller/earnings")}>
            <div className="text-lg mb-1">💰</div>
            <span>أرباح</span>
          </button>
          <button className="glass rounded-xl px-4 py-3 text-center text-xs font-bold text-white hover:bg-white/10 transition min-w-[64px]" onClick={() => router.push("/seller/disputes")}>
            <div className="text-lg mb-1">⚖️</div>
            <span>نزاعات</span>
          </button>
          <button className="glass rounded-xl px-4 py-3 text-center text-xs font-bold text-white hover:bg-white/10 transition min-w-[64px]" onClick={() => router.push("/notifications")}>
            <div className="text-lg mb-1 relative">🔔
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </div>
            <span>إشعارات</span>
          </button>
          <button className="glass rounded-xl px-4 py-3 text-center text-xs font-bold text-white hover:bg-white/10 transition min-w-[64px]" onClick={() => router.push("/settings")}>
            <div className="text-lg mb-1">⚙️</div>
            <span>إعدادات</span>
          </button>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-xl">📦</div>
            <div className="mt-1 text-xl font-black text-white">{stats.products}</div>
            <div className="text-xs text-white/60">المنتجات</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-xl">📋</div>
            <div className="mt-1 text-xl font-black text-white">{stats.orders}</div>
            <div className="text-xs text-white/60">الطلبات</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-xl">💰</div>
            <div className="mt-1 text-xl font-black text-emerald-300">{stats.earnings.toFixed(2)}</div>
            <div className="text-xs text-white/60">أرباح معلقة</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-xl">🏆</div>
            <div className="mt-1 text-xl font-black text-indigo-300">{stats.revenue.toFixed(2)}</div>
            <div className="text-xs text-white/60">إجمالي الإيرادات</div>
          </div>
        </section>
      )}

      {/* Recent Orders + Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <section className="glass rounded-2xl p-4 animate-slide-up-fade">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black">آخر الطلبات</h2>
            <button className="text-xs font-bold text-indigo-300 hover:text-indigo-200" onClick={() => router.push("/seller/orders")}>عرض الكل</button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-6 text-center text-xs text-white/50">لا توجد طلبات بعد</div>
          ) : (
            <div className="grid gap-2">
              {recentOrders.map((o) => {
                const badge = orderStatusBadge(o.status);
                return (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 cursor-pointer hover:bg-white/[0.04] transition" onClick={() => router.push(`/seller/orders`)}>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{o.product_title || "منتج"}</div>
                      <div className="text-[10px] text-white/40">{o.order_tracking_id?.slice(0, 12) || o.id.slice(0, 10)}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-indigo-300">{o.total_amount} {o.currency}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${badge.cls}`}>{badge.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Notifications */}
        <section className="glass rounded-2xl p-4 animate-slide-up-fade">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black">آخر الإشعارات</h2>
            <button className="text-xs font-bold text-indigo-300 hover:text-indigo-200" onClick={() => router.push("/notifications")}>عرض الكل</button>
          </div>
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-white/50">لا توجد إشعارات</div>
          ) : (
            <div className="grid gap-2">
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 transition cursor-pointer hover:bg-white/[0.04] ${n.read ? "border-white/5 bg-white/[0.02]" : "border-indigo-400/20 bg-indigo-500/5"}`} onClick={() => {
                  fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: n.id }) });
                  if (n.link) router.push(n.link);
                }}>
                  <span className="text-base shrink-0 mt-0.5">{n.icon || "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-bold truncate ${n.read ? "text-white/60" : "text-white"}`}>{n.title || n.message}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{new Date(n.created_at).toLocaleDateString("ar-DZ")}</div>
                  </div>
                  {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Tips */}
      <section className="glass rounded-2xl p-4">
        <h2 className="text-xs font-bold text-white/80 mb-3">💡 نصائح سريعة</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <span className="font-bold text-white">صور احترافية</span>
            <p className="mt-0.5">المنتجات ذات الصور الواضحة تحصل على مبيعات أكثر بنسبة ٨٠٪.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <span className="font-bold text-white">أسعار منافسة</span>
            <p className="mt-0.5">راقب أسعار السوق لتحصل على مبيعات أسرع.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <span className="font-bold text-white">تسليم سريع</span>
            <p className="mt-0.5">التسليم السريع يبني سمعة قوية ويجلب تقييمات إيجابية.</p>
          </div>
        </div>
      </section>
    </div>
  );
}