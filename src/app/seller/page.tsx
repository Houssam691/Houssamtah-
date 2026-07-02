"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SafeUser = {
  id: string;
  role: string;
  email: string;
  first_name: string;
  last_name: string;
  seller_status: string | null;
};

export default function SellerPage() {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "seller") {
          router.push("/login");
          return;
        }
        if (data.user.seller_status !== "approved") {
          router.push("/seller/pending");
          return;
        }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (loading) return null;

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">لوحة البائع</h1>
            <p className="subtitle">مرحباً {user?.first_name}، أهلاً بك في لوحة التحكم الخاصة بالبائعين.</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <button
          className="glass glass-hover rounded-3xl p-6 text-right"
          onClick={() => router.push("/seller/products")}
        >
          <div className="text-2xl font-black text-white">📦</div>
          <div className="mt-3 text-lg font-black text-white">إدارة المنتجات</div>
          <div className="mt-1 text-sm text-white/70">إضافة وتعديل وحذف المنتجات</div>
        </button>

        <button
          className="glass glass-hover rounded-3xl p-6 text-right"
          onClick={() => router.push("/seller/orders")}
        >
          <div className="text-2xl font-black text-white">📋</div>
          <div className="mt-3 text-lg font-black text-white">الطلبات</div>
          <div className="mt-1 text-sm text-white/70">عرض الطلبات والتسليم</div>
        </button>

        <button
          className="glass glass-hover rounded-3xl p-6 text-right"
          onClick={() => router.push("/seller/disputes")}
        >
          <div className="text-2xl font-black text-white">⚖️</div>
          <div className="mt-3 text-lg font-black text-white">النزاعات</div>
          <div className="mt-1 text-sm text-white/70">النزاعات المرفوعة على طلباتك</div>
        </button>

        <button
          className="glass glass-hover rounded-3xl p-6 text-right"
          onClick={() => router.push("/seller/earnings")}
        >
          <div className="text-2xl font-black text-white">💰</div>
          <div className="mt-3 text-lg font-black text-white">الأرباح</div>
          <div className="mt-1 text-sm text-white/70">الأرباح قيد الضمان وجاهزة للسحب</div>
        </button>
      </div>
    </div>
  );
}
