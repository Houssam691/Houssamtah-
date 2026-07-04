"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  user_id: string;
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

export default function NavNotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          loadNotifs();
          const interval = setInterval(loadNotifs, 15000);
          return () => clearInterval(interval);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function loadNotifs() {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unread_count || 0);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
  }

  async function deleteNotif(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnread((prev) => Math.max(0, prev - (notifications.find(n => n.id === id)?.read ? 0 : 1)));
  }

  function getIcon(n: Notification) {
    if (n.icon) return n.icon;
    const icons: Record<string, string> = {
      new_order: "🛒", payment_confirmed: "✅", code_verified: "🔑",
      delivered: "📦", seller_paid: "💰", dispute_opened: "⚖️",
      dispute_resolved: "🤝", new_review: "⭐", wrong_code: "❌",
      admin_broadcast: "📢", admin: "📋",
    };
    return icons[n.type] || "🔔";
  }

  function getLink(n: Notification): string {
    if (n.link) return n.link;
    if (n.order_id) return `/orders/${n.order_id}`;
    return "#";
  }

  return (
    <div ref={ref} className="relative">
      <button className={`relative ${className || ""}`} onClick={() => setOpen(!open)} aria-label="الإشعارات">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 max-md:right-0 max-md:left-auto max-md:translate-x-0 max-md:max-w-[calc(100vw-1rem)] rounded-3xl border border-white/10 bg-zinc-900 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.4)]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black text-white">الإشعارات</div>
            <div className="flex gap-2">
              {unread > 0 && (
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300" onClick={markAllRead}>
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="py-6 text-center text-sm text-white/50">لا توجد إشعارات</div>
            )}
            {notifications.map((n) => (
              <Link key={n.id} href={getLink(n)} className={`group relative rounded-2xl p-3 text-sm transition hover:bg-white/5 ${n.read ? "opacity-60" : "border-r-2 border-indigo-400"}`} onClick={() => setOpen(false)}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">{getIcon(n)}</span>
                  <div className="min-w-0 flex-1">
                    {n.title && <div className="font-bold text-white">{n.title}</div>}
                    <div className="text-white/90">{n.message}</div>
                    <div className="mt-1 text-[10px] text-white/50">{new Date(n.created_at).toLocaleString("ar-DZ")}</div>
                  </div>
                  <button className="shrink-0 opacity-0 group-hover:opacity-100 transition text-white/30 hover:text-rose-400 text-xs" onClick={(e) => deleteNotif(n.id, e)}>✕</button>
                </div>
              </Link>
            ))}
          </div>

          {notifications.length > 0 && (
            <Link href="/notifications" className="mt-3 block text-center text-xs font-bold text-indigo-400 hover:text-indigo-300" onClick={() => setOpen(false)}>
              عرض الكل
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
