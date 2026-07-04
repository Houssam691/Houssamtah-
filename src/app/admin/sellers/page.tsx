"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { Skeleton } from "@/components/Skeleton";
import { downloadCSV } from "@/lib/export";

type Seller = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  seller_status: string | null;
  id_file_path: string;
  created_at: string;
};

export default function AdminVerificationCenter() {
  const router = useRouter();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDecisionModal, setShowDecisionModal] = useState<{ seller: Seller; action: "approve" | "reject" } | null>(null);
  const [decisionNote, setDecisionNote] = useState("");

  useEffect(() => { loadSellers(); }, []);

  async function loadSellers() {
    const res = await fetch("/api/admin/sellers", { cache: "no-store" });
    if (!res.ok) { router.push("/admin/login"); return; }
    const data = await res.json();
    setSellers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleAction(sellerId: string, action: string, note?: string) {
    setActionLoading(sellerId);
    const res = await fetch("/api/admin/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seller_id: sellerId, action, reason: note || "" }),
    });
    setActionLoading(null);
    if (res.ok) toast("success", "تمت العملية بنجاح");
    else { const d = await res.json().catch(() => ({ error: "فشل" })); toast("error", d.error || "فشل"); }
    await loadSellers();
  }

  async function handleBulkAction(action: string) {
    if (selected.size === 0) return;
    const note = action === "reject" ? prompt("سبب الرفض الجماعي:") : "";
    if (action === "reject" && note === null) return;
    for (const id of selected) {
      await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: id, action, reason: note || "" }),
      });
    }
    toast("success", `تم ${action === "approve" ? "قبول" : "رفض"} ${selected.size} بائع`);
    setSelected(new Set());
    await loadSellers();
  }

  function confirmDecision(seller: Seller, action: "approve" | "reject") {
    if (action === "reject") {
      setShowDecisionModal({ seller, action });
      setDecisionNote("");
    } else {
      handleAction(seller.id, action);
    }
  }

  const filtered = filter === "all" ? sellers : sellers.filter(s => (s.seller_status || "pending") === filter);
  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  if (loading) {
    return (
      <div>
        <section className="glass rounded-3xl p-6 md:p-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-5 w-72" />
        </section>
        <div className="mt-6 grid gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <h1 className="title">مركز التحقق</h1>
        <p className="subtitle">مراجعة وثائق البائعين وإدارة طلبات التوثيق</p>
      </section>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "الكل" },
            { key: "pending", label: "بانتظار المراجعة" },
            { key: "approved", label: "مقبول" },
            { key: "rejected", label: "مرفوض" },
          ].map(f => (
            <button key={f.key} className={filter === f.key ? "btn-primary" : "btn-secondary"} onClick={() => setFilter(f.key)}>
              {f.label} ({sellers.filter(s => (s.seller_status || "pending") === f.key).length})
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <button className="btn-secondary h-10" onClick={() => downloadCSV(filtered.map(s => ({
            name: `${s.first_name} ${s.last_name}`,
            email: s.email,
            status: s.seller_status || "pending",
            created: s.created_at,
          })), "sellers")}>تصدير CSV</button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
          <span className="text-sm font-bold text-white">{selected.size} بائع محدد</span>
          <button className="btn-primary h-10 text-sm" onClick={() => handleBulkAction("approve")}>قبول جماعي</button>
          <button className="btn-secondary h-10 text-sm" onClick={() => handleBulkAction("reject")}>رفض جماعي</button>
          <button className="btn-secondary h-10 text-sm" onClick={() => setSelected(new Set())}>إلغاء</button>
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {filtered.map((seller) => {
          const status = seller.seller_status || "pending";
          return (
            <div key={seller.id} className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <input type="checkbox" checked={selected.has(seller.id)} onChange={() => toggleSelect(seller.id)} className="accent-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-lg font-black text-white">
                    {seller.first_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-black text-white">{seller.first_name} {seller.last_name}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        status === "approved" ? "bg-emerald-500/20 text-emerald-300" :
                        status === "rejected" ? "bg-rose-500/20 text-rose-300" :
                        "bg-amber-500/20 text-amber-300"
                      }`}>
                        {status === "approved" ? "✅ مقبول" : status === "rejected" ? "❌ مرفوض" : "⏳ بانتظار المراجعة"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-white/60">{seller.email}</div>
                    <div className="mt-1 text-xs text-white/40">
                      تاريخ التسجيل: {new Date(seller.created_at).toLocaleString("ar-DZ")}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {seller.id_file_path && (
                    <a href={seller.id_file_path} target="_blank" className="btn-secondary text-sm">
                      📎 عرض الوثائق
                    </a>
                  )}
                  {status !== "approved" && (
                    <button
                      className="btn-primary text-sm"
                      onClick={() => confirmDecision(seller, "approve")}
                      disabled={actionLoading === seller.id}
                    >
                      {actionLoading === seller.id ? "..." : "✅ قبول"}
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button
                      className="btn-secondary text-sm text-rose-300 border-rose-500/30"
                      onClick={() => confirmDecision(seller, "reject")}
                      disabled={actionLoading === seller.id}
                    >
                      {actionLoading === seller.id ? "..." : "❌ رفض"}
                    </button>
                  )}
                  {(status === "rejected" || status === "approved") && (
                    <button
                      className="btn-secondary text-sm"
                      onClick={() => handleAction(seller.id, "restore")}
                      disabled={actionLoading === seller.id}
                    >
                      {actionLoading === seller.id ? "..." : "🔄 تراجع"}
                    </button>
                  )}
                  <button
                    className="btn-secondary text-sm text-rose-300"
                    onClick={() => {
                      if (!confirm("حذف هذا الحساب؟")) return;
                      handleAction(seller.id, "delete");
                    }}
                    disabled={actionLoading === seller.id}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* View full profile link */}
              <div className="mt-3">
                <button className="text-xs font-bold text-indigo-300 hover:text-indigo-200" onClick={() => router.push(`/admin/users/${seller.id}`)}>
                  عرض الملف الكامل ←
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-white/50">لا يوجد بائعون في هذا القسم</div>
        )}
      </div>

      {/* Decision Reason Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDecisionModal(null)}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white">سبب الرفض</h3>
            <p className="mt-1 text-sm text-white/60">سيتم إرسال هذا السبب للبائع.</p>
            <textarea
              className="mt-4 min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-indigo-400/50"
              value={decisionNote}
              onChange={e => setDecisionNote(e.target.value)}
              placeholder="اكتب سبب الرفض..."
            />
            <div className="mt-4 flex gap-3">
              <button className="btn-primary flex-1" onClick={() => {
                handleAction(showDecisionModal.seller.id, showDecisionModal.action, decisionNote);
                setShowDecisionModal(null);
              }}>تأكيد الرفض</button>
              <button className="btn-secondary flex-1" onClick={() => setShowDecisionModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
