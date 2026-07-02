"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { copyToClipboard } from "@/lib/clipboard";

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("productId");

  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(productIdParam || "");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [currency, setCurrency] = useState("DZD");
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push("/login"));

    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});

    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setProducts(arr);
        if (productIdParam) {
          const found = arr.find((p: any) => p.id === productIdParam);
          if (found) {
            setSelectedProductId(productIdParam);
            setProduct(found);
          }
        }
      });
  }, [router, productIdParam]);

  useEffect(() => {
    if (selectedProductId) {
      const found = products.find((p: any) => p.id === selectedProductId);
      setProduct(found || null);
    } else {
      setProduct(null);
    }
  }, [selectedProductId, products]);

  async function uploadProof(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-proof", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!paymentProof) {
      setError("يرجى رفع إثبات الدفع");
      return;
    }

    setLoading(true);
    try {
      const proofUrl = await uploadProof(paymentProof);

      const orderData: any = {
        payment_proof_file: proofUrl,
        currency,
      };

      if (product) {
        orderData.product_id = product.id;
        orderData.product_type = product.product_type;
      } else {
        orderData.product_type = "account";
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "فشل إنشاء الطلب" }));
        throw new Error(data.error || "فشل إنشاء الطلب");
      }

      const order = await res.json();
      setCreated(order.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء الطلب");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="mx-auto max-w-lg pt-12">
        <section className="glass rounded-3xl p-6 text-center md:p-10">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="title">تم إنشاء الطلب بنجاح</h1>
          <p className="subtitle">سيتم مراجعة إثبات الدفع من قبل الإدارة. يرجى الانتظار.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button className="btn-primary" onClick={() => router.push(`/orders/${created}`)}>
              عرض الطلب
            </button>
            <button className="btn-secondary" onClick={() => router.push("/orders")}>
              طلباتي
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <section className="glass rounded-3xl p-6 md:p-10">
        <h1 className="title">طلب جديد</h1>
        <p className="subtitle">اختر المنتج وارفع إثبات الدفع.</p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-white/80">المنتج</span>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">اختر منتجاً (اختياري)</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.price} {p.currency}
                </option>
              ))}
            </select>
          </label>

          {product && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-white">{product.title}</div>
                  <div className="mt-1 text-sm text-white/70">{product.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-indigo-300">
                    {Math.round(product.price * (1 + (parseFloat(settings?.tax_rate || "1") / 100)) * 100) / 100} {product.currency}
                  </div>
                  <div className="text-xs text-white/50">
                    {product.price} + {(parseFloat(settings?.tax_rate || "1"))}% ضريبة
                  </div>
                </div>
              </div>
            </div>
          )}

          <label className="grid gap-2">
            <span className="text-sm font-bold text-white/80">عملة الدفع</span>
            <div className="flex gap-2">
              <button
                type="button"
                className={currency === "DZD" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                onClick={() => setCurrency("DZD")}
              >
                دينار (DZD)
              </button>
              <button
                type="button"
                className={currency === "USDT" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                onClick={() => setCurrency("USDT")}
              >
                USDT
              </button>
            </div>
          </label>

          {currency === "DZD" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="font-bold text-white">تعليمات التحويل (CCP):</p>
              <div className="mt-2 grid gap-1">
                <p><span className="text-white">البنك:</span> {settings?.bank_name || "—"}</p>
                <p><span className="text-white">صاحب الحساب:</span> {settings?.bank_account_holder || "—"}
                  {settings?.bank_account_holder && settings.bank_account_holder !== "—" && (
                    <button type="button" className="btn-primary text-xs px-2 py-0.5 mr-2" onClick={() => {
                      copyToClipboard(settings.bank_account_holder);
                      setCopiedBank(true);
                      setTimeout(() => setCopiedBank(false), 2000);
                    }}>
                      {copiedBank ? "تم" : "نسخ"}
                    </button>
                  )}
                </p>
                <p><span className="text-white">IBAN:</span> <span dir="ltr">{settings?.bank_iban || "—"}</span></p>
              </div>
            </div>
          )}

          {currency === "DZD" && settings?.payment_email && settings.payment_email !== "—" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="font-bold text-white">أرسل الوصل على الإيميل:</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-white" dir="ltr">{settings.payment_email}</p>
                <button type="button" className="btn-primary text-xs px-3 py-1" onClick={() => {
                  copyToClipboard(settings.payment_email);
                  setCopiedEmail(true);
                  setTimeout(() => setCopiedEmail(false), 2000);
                }}>
                  {copiedEmail ? "تم" : "نسخ"}
                </button>
              </div>
            </div>
          )}

          {currency === "USDT" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="font-bold text-white">عنوان USDT (شبكة TRC20):</p>
              <p className="mt-2 text-white break-all" dir="ltr">{settings?.usdt_address || "—"}</p>
            </div>
          )}

          <label className="grid gap-2">
            <span className="text-sm font-bold text-white/80">إثبات الدفع (إلزامي)</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
              <span className="text-sm text-white/70">
                {paymentProof ? paymentProof.name : "PDF, JPG, PNG"}
              </span>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => document.getElementById("proof-input")?.click()}
              >
                تصفّح
              </button>
              <input
                id="proof-input"
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
              />
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
              {error}
            </div>
          )}

          <button
            className="btn-primary h-12 w-full"
            type="submit"
            disabled={loading || !paymentProof}
          >
            {loading ? "..." : "إرسال الطلب"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-white/70">جاري التحميل...</div>}>
      <NewOrderForm />
    </Suspense>
  );
}
