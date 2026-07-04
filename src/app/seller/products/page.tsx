"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { Skeleton } from "@/components/Skeleton";
import DynamicProductWizard from "@/components/DynamicProductWizard";
import { getGameSpec } from "@/lib/game-specs";

type SafeUser = {
  id: string;
  role: string;
  email: string;
  first_name: string;
  last_name: string;
  seller_status: string | null;
};

type Product = {
  id: string;
  product_type: "account" | "recharge";
  category: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  attributes?: Record<string, unknown>;
  currency: string;
  status: string;
  created_at: string;
};

export default function SellerProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "seller" || data.user.seller_status !== "approved") {
          router.push("/login");
          return;
        }
        setUser(data.user);
        loadProducts(data.user.id);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  async function loadProducts(sellerId?: string) {
    const id = sellerId || user?.id;
    const url = id ? `/api/products?seller_id=${encodeURIComponent(id)}` : "/api/products";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  async function removeProduct(id: string, title: string) {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return;
    setDeleting(id);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast("success", "تم حذف المنتج بنجاح.");
    } else {
      const data = await res.json().catch(() => ({ error: "فشل الحذف" }));
      toast("error", data.error || "فشل حذف المنتج.");
    }
  }

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === "active" ? "inactive" : "active";
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
      toast("success", newStatus === "active" ? "تم تفعيل المنتج" : "تم إيقاف المنتج");
    } else {
      toast("error", "فشل تغيير الحالة");
    }
  }

  function renderAttributes(p: Product) {
    const spec = getGameSpec(p.category);
    if (!spec || !p.attributes) return null;
    const vals = spec.fields
      .filter((f) => {
        const v = p.attributes![f.key];
        return v !== undefined && v !== null && v !== "";
      })
      .slice(0, 4);
    if (vals.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {vals.map((f) => (
          <span key={f.key} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
            {f.label}: {String(p.attributes![f.key])}
          </span>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <section className="glass rounded-3xl p-6 md:p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-5 w-72" />
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <Skeleton className="h-[500px] rounded-3xl" />
          <div className="grid gap-4">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 max-md:flex-col">
          <div>
            <h1 className="title">إدارة المنتجات</h1>
            <p className="subtitle">أضف أو عدّل أو احذف منتجاتك.</p>
          </div>
          <div className="flex gap-2 max-md:w-full max-md:flex-col">
            <button className="btn-secondary" onClick={() => router.push("/seller")}>العودة</button>
            <button className="btn-primary" onClick={() => setShowWizard(true)}>
              + إضافة منتج
            </button>
          </div>
        </div>
      </section>

      {showWizard && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/80 backdrop-blur-sm p-4 py-10">
          <div className="mx-auto w-full max-w-2xl animate-scale-in">
            <DynamicProductWizard onComplete={() => { setShowWizard(false); loadProducts(); }} />
            <div className="mt-4 text-center">
              <button className="btn-secondary text-sm" onClick={() => setShowWizard(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {!showWizard && (
        <div className="mt-6 grid gap-4">
          {products.length === 0 && (
            <div className="glass rounded-3xl p-6 text-center text-white/70">
              لا توجد منتجات بعد. أضف منتجك الأول!
            </div>
          )}

          {products.map((p) => (
            <div key={p.id} className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                      {p.product_type === "account" ? "حساب" : "شحن"}
                    </span>
                    <span className="text-xs font-bold text-white/50">{p.category}</span>
                    <button
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border transition ${
                        p.status === "active"
                          ? "border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10"
                          : "border-rose-400/30 text-rose-300 hover:bg-rose-500/10"
                      }`}
                      onClick={() => toggleStatus(p.id, p.status)}
                    >
                      {p.status === "active" ? "نشط" : "موقوف"}
                    </button>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-white">{p.title}</h3>
                  {renderAttributes(p)}
                  <div className="mt-2 flex items-center gap-4">
                    <span className="font-black text-indigo-300">{p.price} {p.currency}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`/products/${encodeURIComponent(p.id)}`}
                    className="btn-secondary text-sm"
                  >
                    عرض
                  </a>
                  <button
                    className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
                    onClick={() => removeProduct(p.id, p.title)}
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? "جاري الحذف..." : "حذف"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
