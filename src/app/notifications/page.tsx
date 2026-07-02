"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  icon: string;
  link: string;
  read: number;
  created_at: string;
  order_tracking_id: string | null;
};

const icons: Record<string, string> = {
  new_order: "🛒", payment_confirmed: "✅", code_verified: "🔑",
  delivered: "📦", seller_paid: "💰", dispute_opened: "⚖️",
  dispute_resolved: "🤝", new_review: "⭐", wrong_code: "❌",
  admin_broadcast: "📢", admin: "📋",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (!data.user) { router.push("/login"); return; }
      loadNotifs();
    }).catch(() => router.push("/login"));
  }, [router]);

  async function loadNotifs() {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) { const data = await res.json(); setNotifications(data.notifications || []); }
    setLoading(false);
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
  }

  async function deleteNotif(id: string) {
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function deleteAll() {
    if (!confirm("حذف جميع الإشعارات؟")) return;
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setNotifications([]);
  }

  if (loading) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">الإشعارات</h1>
            <p className="subtitle">جميع الإشعارات المتعلقة بحسابك</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={markAllRead}>تحديد الكل مقروء</button>
            <button className="btn-secondary" onClick={deleteAll}>حذف الكل</button>
            <button className="btn-secondary" onClick={() => router.push("/")}>العودة</button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-3">
        {notifications.length === 0 && <div className="glass rounded-3xl p-6 text-center text-white/70">لا توجد إشعارات</div>}
        {notifications.map((n) => (
          <Link key={n.id} href={n.link || (n.order_id ? `/orders/${n.order_id}` : "#")} className={`glass rounded-3xl p-5 transition hover:bg-white/[0.07] group ${n.read ? "" : "border-r-2 border-indigo-400"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-2xl">{n.icon || icons[n.type] || "🔔"}</span>
                <div>
                  {n.title && <div className="font-black text-white">{n.title}</div>}
                  <div className="text-white/90">{n.message}</div>
                  <div className="mt-1 text-xs text-white/50">{new Date(n.created_at).toLocaleString("ar-DZ")}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                {!n.read && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">جديد</span>}
                <button className="text-white/20 hover:text-rose-400 transition text-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotif(n.id); }}>✕</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
