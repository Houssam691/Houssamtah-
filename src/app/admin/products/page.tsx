"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { downloadCSV } from "@/lib/export";

type AdminProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  seller_name: string;
  seller_id: string;
  created_at: string;
  description: string;
  image: string;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user?.role !== "admin") { router.push("/admin/login"); return; }
      loadProducts();
    }).catch(() => router.push("/admin/login"));
  }, [router]);

  async function loadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    if (res.ok) setProducts(Array.isArray(await res.json()) ? await res.json() : []);
    setLoading(false);
  }

  async function handleAction(productId: string, action: string) {
    setActionLoading(productId);
    if (action === "delete" && !confirm("حذف المنتج؟")) { setActionLoading(null); return; }
    const body: any = {};
    if (action === "approve") body.status = "active";
    else if (action === "reject") body.status = "inactive";
    else if (action === "suspend") body.status = "inactive";
    else if (action === "activate") body.status = "active";
    else if (action === "delete") { await fetch(`/api/products/${productId}`, { method: "DELETE" }); setActionLoading(null); await loadProducts(); return; }

    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setActionLoading(null);
    if (res.ok) toast("success", "تم التحديث");
    else toast("error", "فشل التحديث");
    await loadProducts();
  }

  async function handleBulkAction(action: string) {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`حذف ${selected.size} منتج؟`)) return;
    for (const id of selected) {
      if (action === "delete") await fetch(`/api/products/${id}`, { method: "DELETE" });
      else await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action === "activate" ? "active" : "inactive" }) });
    }
    toast("success", `تم ${action === "delete" ? "حذف" : "تحديث"} ${selected.size} منتج`);
    setSelected(new Set());
    await loadProducts();
  }

  const filtered = products.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  if (loading) {
    return <div className="grid gap-6">
      <section className="glass rounded-3xl p-6 md:p-8"><div className="skeleton h-8 w-48" /><div className="skeleton mt-3 h-5 w-64" /></section>
      <div className="glass rounded-3xl p-5">{[1,2,3].map(i => <div key={i} className="skeleton h-20 mb-3" />)}</div>
    </div>;
  }

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">إدارة المنتجات</h1>
            <p className="subtitle">{products.length} منتج • عرض، تعديل، حذف، وإدارة المنتجات</p>
          </div>
          <button className="btn-secondary" onClick={() => loadProducts()}>تحديث</button>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <input className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50" placeholder="بحث بالاسم أو ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">كل الأقسام</option>
          <option value="pubg">PUBG</option>
          <option value="free-fire">Free Fire</option>
          <option value="topup">Top-up</option>
        </select>
        <select className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="sold">تم البيع</option>
        </select>
        {filtered.length > 0 && (
          <button className="btn-secondary h-11" onClick={() => downloadCSV(filtered.map(p => ({ title: p.title, category: p.category, price: p.price, currency: p.currency, status: p.status, seller: p.seller_name })), "products")}>تصدير CSV</button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
          <span className="text-sm font-bold text-white">{selected.size} منتج محدد</span>
          <button className="btn-primary h-10 text-sm" onClick={() => handleBulkAction("activate")}>تفعيل</button>
          <button className="btn-secondary h-10 text-sm" onClick={() => handleBulkAction("suspend")}>إيقاف</button>
          <button className="btn-secondary h-10 text-sm text-rose-300" onClick={() => handleBulkAction("delete")}>حذف</button>
          <button className="btn-secondary h-10 text-sm" onClick={() => setSelected(new Set())}>إلغاء</button>
        </div>
      )}

      <div className="mt-6 glass rounded-3xl p-5 overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/10 text-xs font-bold text-white/50">
              <th className="pb-3 pl-3"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={() => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(p => p.id))); }} className="accent-indigo-500" /></th>
              <th className="pb-3 pl-3">المنتج</th>
              <th className="pb-3 pl-3">القسم</th>
              <th className="pb-3 pl-3">السعر</th>
              <th className="pb-3 pl-3">الحالة</th>
              <th className="pb-3 pl-3">البائع</th>
              <th className="pb-3 pl-3">التاريخ</th>
              <th className="pb-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 pl-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="accent-indigo-500" /></td>
                <td className="py-3 pl-3">
                  <div className="text-sm font-bold text-white">{p.title}</div>
                  <div className="text-xs text-white/40">{p.id.slice(0, 12)}...</div>
                </td>
                <td className="py-3 pl-3 text-sm text-white/60">{p.category}</td>
                <td className="py-3 pl-3 text-sm font-bold text-white">{p.price} {p.currency}</td>
                <td className="py-3 pl-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    p.status === "active" ? "bg-emerald-500/20 text-emerald-300" :
                    p.status === "sold" ? "bg-rose-500/20 text-rose-300" :
                    "bg-amber-500/20 text-amber-300"
                  }`}>{p.status === "active" ? "نشط" : p.status === "sold" ? "تم البيع" : "غير نشط"}</span>
                </td>
                <td className="py-3 pl-3 text-sm text-white/60">{p.seller_name || "—"}</td>
                <td className="py-3 pl-3 text-xs text-white/40">{new Date(p.created_at).toLocaleDateString("ar-DZ")}</td>
                <td className="py-3">
                  <div className="flex gap-1 flex-wrap">
                    <a className="btn-primary text-xs px-2 py-1" href={`/products/${p.id}`}>عرض</a>
                    {p.status !== "active" && <button className="btn-secondary text-xs px-2 py-1" onClick={() => handleAction(p.id, "activate")} disabled={actionLoading === p.id}>تفعيل</button>}
                    {p.status === "active" && <button className="btn-secondary text-xs px-2 py-1" onClick={() => handleAction(p.id, "suspend")} disabled={actionLoading === p.id}>إيقاف</button>}
                    <button className="btn-secondary text-xs px-2 py-1 text-rose-300 border-rose-500/30" onClick={() => handleAction(p.id, "delete")} disabled={actionLoading === p.id}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-white/50">لا توجد منتجات</div>}
      </div>
    </div>
  );
}
