"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Dispute = {
  id: string;
  order_id: string;
  buyer_name: string;
  seller_name: string;
  order_tracking_id: string;
  reason: string;
  status: string;
  created_at: string;
};

export default function AdminDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadDisputes(); }, []);

  async function loadDisputes() {
    const res = await fetch("/api/disputes", { cache: "no-store" });
    if (!res.ok) { router.push("/admin/login"); return; }
    const data = await res.json();
    setDisputes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function resolveDispute(disputeId: string, status: string) {
    const note = prompt("ملاحظة عن القرار (اختياري):");
    setActionLoading(disputeId);
    await fetch(`/api/disputes/${disputeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolution_note: note || "" }),
    });
    setActionLoading(null);
    await loadDisputes();
  }

  if (loading) return null;

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <h1 className="title">إدارة النزاعات</h1>
        <p className="subtitle">مراجعة وحل النزاعات بين المشترين والبائعين.</p>
      </section>

      <div className="mt-6 grid gap-4">
        {disputes.map((d) => (
          <div key={d.id} className="glass rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/50">{d.order_tracking_id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    d.status === "open" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {d.status === "open" ? "مفتوح" : "مغلق"}
                  </span>
                </div>
                <p className="mt-2 font-bold text-white">{d.reason}</p>
                <div className="mt-1 text-sm text-white/70">
                  {d.buyer_name} ← {d.seller_name || "—"}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {d.status === "open" && (
                  <>
                    <button className="btn-primary" onClick={() => resolveDispute(d.id, "resolved_buyer")} disabled={actionLoading === d.id}>
                      رد للمشتري
                    </button>
                    <button className="btn-secondary" onClick={() => resolveDispute(d.id, "resolved_seller")} disabled={actionLoading === d.id}>
                      دفع للبائع
                    </button>
                    <button className="btn-secondary" onClick={() => resolveDispute(d.id, "closed")} disabled={actionLoading === d.id}>
                      إغلاق
                    </button>
                  </>
                )}
                <button className="btn-secondary" onClick={() => router.push(`/orders/${d.order_id}`)}>
                  💬 المحادثة
                </button>
              </div>
            </div>
          </div>
        ))}

        {disputes.length === 0 && (
          <div className="glass rounded-3xl p-6 text-center text-white/70">لا توجد نزاعات.</div>
        )}
      </div>
    </div>
  );
}
