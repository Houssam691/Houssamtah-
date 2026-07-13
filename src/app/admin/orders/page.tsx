"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadCSV } from "@/lib/export";
import { useToast } from "@/components/ToastProvider";
import { Skeleton } from "@/components/Skeleton";

type Order = {
  id: string;
  order_tracking_id: string;
  seller_id: string | null;
  buyer_name: string;
  seller_name: string | null;
  product_title: string | null;
  product_type: "account" | "recharge";
  currency: string;
  product_price: number;
  total_amount: number;
  payment_proof_file: string;
  status: string;
  created_at: string;
  transaction_id?: string;
  payment_proof_submitted_at?: string;
  matched_via_email?: number;
  auto_confirmed_at?: string;
};

type SellerPaymentInfo = {
  id: string;
  first_name: string;
  last_name: string;
  payment_full_name: string;
  payment_surname: string;
  payment_rip: string;
  payment_currency: string;
  payment_usdt_address: string;
};

const statusLabels: Record<string, string> = {
  awaiting_payment_proof: "بانتظار الإثبات",
  payment_under_review: "قيد المراجعة",
  payment_rejected: "مرفوض",
  code_verified_deliver_now: "بانتظار التسليم",
  delivered: "تم التسليم",
  disputed: "نزاع",
  seller_paid: "تم الدفع للبائع",
  waiting_for_payment: "بانتظار الدفع",
  waiting_payment_verification: "بانتظار التحقق",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paySellerOrder, setPaySellerOrder] = useState<Order | null>(null);
  const [sellerPayInfo, setSellerPayInfo] = useState<SellerPaymentInfo | null>(null);
  const [loadingPayInfo, setLoadingPayInfo] = useState(false);
  const [deliveryInputs, setDeliveryInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (!res.ok) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function confirmPayment(orderId: string) {
    setActionLoading(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}/confirm`, { method: "POST" });
    setActionLoading(null);
    if (res.ok) toast("success", "تم تأكيد الدفع.");
    else toast("error", "فشل تأكيد الدفع.");
    await loadOrders();
  }

  async function rejectPayment(orderId: string) {
    if (!confirm("هل أنت متأكد؟ سيتم حظر المشتري.")) return;
    setActionLoading(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}/reject`, { method: "POST" });
    setActionLoading(null);
    if (res.ok) toast("success", "تم رفض الدفع.");
    else toast("error", "فشل رفض الدفع.");
    await loadOrders();
  }

  async function deliverOrder(orderId: string) {
    const deliveryData = deliveryInputs[orderId];
    if (!deliveryData?.trim()) {
      toast("error", "يرجى إدخال بيانات الحساب");
      return;
    }
    setActionLoading(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "delivered",
        delivery_data: deliveryData,
        delivery_date: new Date().toISOString(),
      }),
    });
    setActionLoading(null);
    if (res.ok) {
      toast("success", "تم تسليم المنتج!");
      setDeliveryInputs((prev) => ({ ...prev, [orderId]: "" }));
    } else toast("error", "فشل تسليم المنتج");
    await loadOrders();
  }

  async function showPaySellerInfo(order: Order) {
    if (!order.seller_id) { toast("error", "الطلب لا يحتوي على بائع."); return; }
    setPaySellerOrder(order);
    setLoadingPayInfo(true);
    setSellerPayInfo(null);
    try {
      const res = await fetch(`/api/users/${order.seller_id}`);
      if (!res.ok) { toast("error", "فشل تحميل معلومات البائع."); setPaySellerOrder(null); setLoadingPayInfo(false); return; }
      const data = await res.json();
      setSellerPayInfo(data.user);
    } catch { toast("error", "خطأ في الاتصال."); setPaySellerOrder(null); }
    setLoadingPayInfo(false);
  }

  async function confirmPaySeller() {
    if (!paySellerOrder) return;
    setActionLoading(paySellerOrder.id);
    const res = await fetch(`/api/admin/orders/${paySellerOrder.id}/pay-seller`, { method: "POST" });
    setActionLoading(null);
    if (res.ok) toast("success", "تم تأكيد الدفع للبائع.");
    else toast("error", "فشل تأكيد الدفع.");
    setPaySellerOrder(null);
    setSellerPayInfo(null);
    await loadOrders();
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div>
        <section className="glass rounded-3xl p-6 md:p-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-3 h-5 w-56" />
        </section>
        <div className="mt-6 grid gap-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">إدارة الطلبات</h1>
            <p className="subtitle">مراجعة الطلبات وإدارة المدفوعات.</p>
          </div>
          <button className="btn-secondary" onClick={() => loadOrders()}>تحديث</button>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
          {["all", "payment_under_review", "waiting_payment_verification", "code_verified_deliver_now", "delivered", "disputed", "seller_paid"].map((f) => (
          <button
            key={f}
            className={filter === f ? "btn-primary" : "btn-secondary"}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "الكل" : statusLabels[f] || f}
          </button>
        ))}
        {filtered.length > 0 && (
          <button className="btn-secondary" onClick={() => downloadCSV(filtered.map(o => ({
            tracking_id: o.order_tracking_id,
            product: o.product_title,
            buyer: o.buyer_name,
            seller: o.seller_name,
            total: o.total_amount,
            currency: o.currency,
            status: statusLabels[o.status] || o.status,
            created_at: o.created_at,
          })), "orders")}>
            تصدير CSV
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.map((order) => (
          <div key={order.id} className="glass rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/50">{order.order_tracking_id}</span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <h3 className="mt-2 font-bold text-white">{order.product_title || "—"}</h3>
                <div className="mt-1 text-sm text-white/70">
                  {order.buyer_name} | {order.total_amount} {order.currency}
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {order.seller_name ? `بائع: ${order.seller_name}` : "بدون بائع"}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {order.payment_proof_file && (
                  <a
                    href={order.payment_proof_file}
                    target="_blank"
                    className="btn-secondary"
                  >
                    عرض الإثبات
                  </a>
                )}

                {(order.status === "payment_under_review" || order.status === "waiting_payment_verification") && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => confirmPayment(order.id)}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id ? "جاري التنفيذ..." : "تأكيد الدفع"}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => rejectPayment(order.id)}
                      disabled={actionLoading === order.id}
                    >
                      رفض
                    </button>
                  </>
                )}

                {order.status === "delivered" && (
                  <button
                    className="btn-primary"
                    onClick={() => showPaySellerInfo(order)}
                    disabled={actionLoading === order.id}
                  >
                    {actionLoading === order.id ? "جاري التنفيذ..." : "دفع للبائع"}
                  </button>
                )}

                {order.status === "disputed" && (
                  <>
                    <a href={`/orders/${order.id}`} className="btn-primary">
                      محادثة
                    </a>
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        if (!confirm("إغلاق النزاع مع استمرار الطلب؟")) return;
                        setActionLoading(order.id);
                        const res = await fetch("/api/disputes/resolve", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ order_id: order.id, resolution: "close" }),
                        });
                        setActionLoading(null);
                        if (res.ok) await loadOrders();
                      }}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id ? "جاري التنفيذ..." : "إغلاق النزاع"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {order.status === "waiting_payment_verification" && order.transaction_id && (
              <div className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
                <div className="text-xs font-bold text-white/50">Transaction ID المقدم من المشتري</div>
                <div className="mt-1 font-bold text-white" dir="ltr">{order.transaction_id}</div>
                {order.payment_proof_submitted_at && (
                  <div className="mt-1 text-xs text-white/50">
                    تاريخ الإرسال: {new Date(order.payment_proof_submitted_at).toLocaleString("ar-DZ")}
                  </div>
                )}
              </div>
            )}

            {order.status === "code_verified_deliver_now" && (
              <div className="mt-4 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4">
                <div className="text-sm font-bold text-white">إدخال بيانات الحساب</div>
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-indigo-400/50"
                  value={deliveryInputs[order.id] || ""}
                  onChange={(e) => setDeliveryInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                  placeholder="أدخل بيانات الحساب (البريد الإلكتروني، كلمة المرور...)"
                />
                <button
                  className="btn-primary mt-2"
                  onClick={() => deliverOrder(order.id)}
                  disabled={actionLoading === order.id || !deliveryInputs[order.id]?.trim()}
                >
                  {actionLoading === order.id ? "جاري التنفيذ..." : "تسليم المنتج"}
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass rounded-3xl p-6 text-center text-white/70">لا توجد طلبات.</div>
        )}
      </div>

      {paySellerOrder && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => { setPaySellerOrder(null); setSellerPayInfo(null); }} />
          <div className="fixed left-1/2 top-1/2 z-[41] w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
            <div className="glass rounded-3xl p-6 shadow-2xl">
              <h2 className="text-lg font-black">معلومات دفع البائع</h2>
              <p className="mt-1 text-sm text-white/60">قم بتحويل المبلغ إلى الحساب التالي ثم أكد الدفع.</p>

              {loadingPayInfo ? (
                <p className="mt-4 text-center text-white/50">جاري التحميل...</p>
              ) : sellerPayInfo ? (
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-bold text-white/50">اسم البائع</div>
                    <div className="mt-1 font-bold text-white">{sellerPayInfo.first_name} {sellerPayInfo.last_name}</div>
                  </div>
                  {sellerPayInfo.payment_full_name && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-bold text-white/50">الاسم الكامل للدفع</div>
                      <div className="mt-1 font-bold text-white" dir="ltr">{sellerPayInfo.payment_full_name} {sellerPayInfo.payment_surname}</div>
                    </div>
                  )}
                  {sellerPayInfo.payment_rip && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-bold text-white/50">RIP</div>
                      <div className="mt-1 font-bold text-white" dir="ltr">{sellerPayInfo.payment_rip}</div>
                    </div>
                  )}
                  {sellerPayInfo.payment_usdt_address && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-bold text-white/50">USDT (TRC20)</div>
                      <div className="mt-1 break-all font-bold text-white font-mono text-sm" dir="ltr">{sellerPayInfo.payment_usdt_address}</div>
                    </div>
                  )}
                  {sellerPayInfo.payment_currency && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-bold text-white/50">العملة</div>
                      <div className="mt-1 font-bold text-white">{sellerPayInfo.payment_currency}</div>
                    </div>
                  )}
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                    <div className="text-xs font-bold text-white/50">المبلغ</div>
                    <div className="mt-1 text-xl font-black text-emerald-300">{paySellerOrder.total_amount} {paySellerOrder.currency}</div>
                  </div>

                  <div className="mt-2 flex gap-3">
                    <button className="btn-primary flex-1" onClick={confirmPaySeller} disabled={actionLoading === paySellerOrder.id}>
                      {actionLoading === paySellerOrder.id ? "جاري التنفيذ..." : "تأكيد الدفع للبائع"}
                    </button>
                    <button className="btn-secondary flex-1" onClick={() => { setPaySellerOrder(null); setSellerPayInfo(null); }}>
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-center text-white/50">لا توجد معلومات دفع.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}