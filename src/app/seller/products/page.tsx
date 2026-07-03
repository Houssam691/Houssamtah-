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

type Product = {
  id: string;
  product_type: "account" | "recharge";
  category: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  currency: string;
  status: string;
  created_at: string;
};

export default function SellerProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("pubg");
  const [productType, setProductType] = useState<"account" | "recharge">("account");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title || !description || price <= 0) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_type: productType,
        category,
        title,
        description,
        price,
        image: imageUrl || undefined,
      }),
    });
    setSaving(false);

    if (res.ok) {
      setTitle("");
      setDescription("");
      setPrice(0);
      setImageUrl("");
      await loadProducts();
    } else {
      const text = await res.text().catch(() => "");
      try {
        const data = JSON.parse(text);
        setError(data.error || `خطأ ${res.status}`);
      } catch {
        setError(`خطأ ${res.status}`);
      }
    }
  }

  async function removeProduct(id: string, title: string) {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return;
    setError(null);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadProducts();
    } else {
      const data = await res.json().catch(() => ({ error: "فشل الحذف" }));
      setError(data.error || `خطأ ${res.status}`);
    }
  }

  if (loading) return null;

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">إدارة المنتجات</h1>
            <p className="subtitle">أضف أو عدّل أو احذف منتجاتك.</p>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/seller")}>العودة</button>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="glass rounded-3xl p-5">
          <h2 className="text-sm font-black text-white">إضافة منتج جديد</h2>

          <form className="mt-4 grid gap-4" onSubmit={addProduct}>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">نوع المنتج</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={productType === "account" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                  onClick={() => setProductType("account")}
                >
                  حساب
                </button>
                <button
                  type="button"
                  className={productType === "recharge" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                  onClick={() => setProductType("recharge")}
                >
                  شحن
                </button>
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">القسم</span>
              <select
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="pubg">PUBG</option>
                <option value="free-fire">Free Fire</option>
                <option value="topup">Top-up</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">العنوان</span>
              <input
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المنتج"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">السعر ({category === "topup" ? "USD" : "دج"})</span>
              <input
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">الوصف</span>
              <textarea
                className="min-h-[100px] rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-indigo-400/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">صورة المنتج</span>
              {imageUrl && (
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={imageUrl} alt="Preview" className="h-32 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                    onClick={() => setImageUrl("")}
                  >
                    ✕
                  </button>
                </div>
              )}
              <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm text-white/60 hover:border-indigo-400/50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (res.ok) {
                      const data = await res.json();
                      setImageUrl(data.url);
                    }
                    setUploadingImage(false);
                  }}
                />
                {uploadingImage ? "جاري الرفع..." : "اختر صورة من الجهاز"}
              </label>
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
                {error}
              </div>
            )}

            <button className="btn-primary w-full" type="submit" disabled={saving}>
              {saving ? "..." : "إضافة منتج"}
            </button>
          </form>
        </section>

        <section className="grid gap-4">
          {products.length === 0 && (
            <div className="glass rounded-3xl p-6 text-center text-white/70">
              لا توجد منتجات بعد. أضف منتجك الأول!
            </div>
          )}

          {products.map((p) => (
            <div key={p.id} className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                      {p.product_type === "account" ? "حساب" : "شحن"}
                    </span>
                    <span className="text-xs font-bold text-white/50">{p.category}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-white">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/70">{p.description}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="font-black text-indigo-300">{p.price} {p.currency}</span>
                    <span className={`text-xs font-bold ${p.status === "active" ? "text-emerald-300" : "text-rose-300"}`}>
                      {p.status === "active" ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                </div>
                <button className="btn-secondary shrink-0" onClick={() => removeProduct(p.id, p.title)}>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
