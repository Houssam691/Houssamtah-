"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({ pending_review: 0, open_disputes: 0, pending_sellers: 0, total: 0 });

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <h1 className="title">لوحة الإدارة</h1>
        <p className="subtitle">مرحباً بك في لوحة التحكم.</p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/admin/orders")}>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-white">📋</div>
            {notifications.pending_review > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-black text-white">
                {notifications.pending_review}
              </span>
            )}
          </div>
          <div className="mt-3 text-lg font-black text-white">الطلبات</div>
          <div className="mt-1 text-sm text-white/70">مراجعة المدفوعات وإدارة الطلبات</div>
        </button>

        <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/admin/disputes")}>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-white">⚖️</div>
            {notifications.open_disputes > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-black text-white">
                {notifications.open_disputes}
              </span>
            )}
          </div>
          <div className="mt-3 text-lg font-black text-white">النزاعات</div>
          <div className="mt-1 text-sm text-white/70">حل النزاعات بين المشترين والبائعين</div>
        </button>

        <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/admin/pending-payments")}>
          <div className="text-2xl font-black text-white">💰</div>
          <div className="mt-3 text-lg font-black text-white">المدفوعات المستحقة</div>
          <div className="mt-1 text-sm text-white/70">المبالغ المستحقة للبائعين</div>
        </button>

        <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/admin/sellers")}>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-white">👥</div>
            {notifications.pending_sellers > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-black text-white">
                {notifications.pending_sellers}
              </span>
            )}
          </div>
          <div className="mt-3 text-lg font-black text-white">البائعون</div>
          <div className="mt-1 text-sm text-white/70">مراجعة وموافقة البائعين الجدد</div>
        </button>

        <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/admin/audit-log")}>
          <div className="text-2xl font-black text-white">📜</div>
          <div className="mt-3 text-lg font-black text-white">سجل التدقيق</div>
          <div className="mt-1 text-sm text-white/70">جميع أحداث النظام</div>
        </button>

        <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/admin/settings")}>
          <div className="text-2xl font-black text-white">⚙️</div>
          <div className="mt-3 text-lg font-black text-white">الإعدادات</div>
          <div className="mt-1 text-sm text-white/70">الضريبة، الضمان، بيانات الدفع</div>
        </button>

        <button className="glass glass-hover rounded-3xl p-6 text-right" onClick={() => router.push("/")}>
          <div className="text-2xl font-black text-white">🏠</div>
          <div className="mt-3 text-lg font-black text-white">الرئيسية</div>
          <div className="mt-1 text-sm text-white/70">العودة للمتجر</div>
        </button>
      </div>
    </div>
  );
}
