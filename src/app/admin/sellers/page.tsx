"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Seller = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  seller_status: string | null;
  id_file_path: string;
  created_at: string;
};

export default function AdminSellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadSellers(); }, []);

  async function loadSellers() {
    const res = await fetch("/api/admin/sellers", { cache: "no-store" });
    if (!res.ok) { router.push("/admin/login"); return; }
    const data = await res.json();
    setSellers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleAction(sellerId: string, action: string) {
    setError(null);
    if (action === "delete" && !confirm("هل أنت متأكد من حذف هذا الحساب نهائياً؟")) return;

    setActionLoading(sellerId);
    const res = await fetch("/api/admin/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seller_id: sellerId, action }),
    });
    setActionLoading(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "فشل العملية" }));
      setError(data.error || `خطأ ${res.status}`);
    }
    await loadSellers();
  }

  if (loading) return null;

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <h1 className="title">إدارة البائعين</h1>
        <p className="subtitle">مراجعة وموافقة على طلبات تسجيل البائعين.</p>
      </section>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {sellers.map((s) => (
          <div key={s.id} className="glass rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white">{s.first_name} {s.last_name}</div>
                <div className="text-sm text-white/70">{s.email}</div>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    s.seller_status === "approved" ? "bg-emerald-500/20 text-emerald-300"
                    : s.seller_status === "rejected" ? "bg-rose-500/20 text-rose-300"
                    : "bg-yellow-500/20 text-yellow-300"
                  }`}>
                    {s.seller_status === "approved" ? "مقبول" : s.seller_status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                  </span>
                  {s.id_file_path && (
                    <a href={`/api/admin/id-document/${s.id}`} target="_blank" className="text-xs font-bold text-indigo-300 hover:text-indigo-200">
                      عرض بطاقة الهوية
                    </a>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {s.seller_status === "pending" && (
                  <>
                    <button className="btn-primary" onClick={() => handleAction(s.id, "approve")} disabled={actionLoading === s.id}>
                      موافقة
                    </button>
                    <button className="btn-secondary" onClick={() => handleAction(s.id, "reject")} disabled={actionLoading === s.id}>
                      رفض
                    </button>
                  </>
                )}
                {s.seller_status === "rejected" && (
                  <button className="btn-primary" onClick={() => handleAction(s.id, "restore")} disabled={actionLoading === s.id}>
                    إعادة المراجعة
                  </button>
                )}
                {s.seller_status === "approved" && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">تم التحقق</span>
                )}
                <button
                  className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                  onClick={() => handleAction(s.id, "delete")}
                  disabled={actionLoading === s.id}
                >
                  حذف الحساب
                </button>
              </div>
            </div>
          </div>
        ))}

        {sellers.length === 0 && (
          <div className="glass rounded-3xl p-6 text-center text-white/70">لا يوجد بائعون مسجلون.</div>
        )}
      </div>
    </div>
  );
}
