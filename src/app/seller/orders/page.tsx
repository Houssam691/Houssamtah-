"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { copyToClipboard } from "@/lib/clipboard";
import RatingStars from "@/components/RatingStars";
import { useToast } from "@/components/ToastProvider";
import { Skeleton } from "@/components/Skeleton";

type Order = {
  id: string;
  order_tracking_id: string;
  buyer_name: string;
  product_title: string | null;
  product_description: string | null;
  product_type: "account" | "recharge";
  currency: string;
  product_price: number;
  total_amount: number;
  status: string;
  created_at: string;
};

type ChatMessage = {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  payment_confirmed_waiting_code: "بانتظار الكود",
  code_verified_deliver_now: "أدخل بيانات التسليم",
  delivered: "تم التسليم",
  disputed: "نزاع",
  seller_paid: "تم الدفع",
};

export default function SellerOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState<string | null>(null);
  const [deliveryInput, setDeliveryInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [chatData, setChatData] = useState<Record<string, ChatMessage[]>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "seller" || data.user.seller_status !== "approved") {
          router.push("/login");
          return;
        }
        loadOrders();
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    const waitingOrders = orders.filter((o) => o.status === "payment_confirmed_waiting_code");
    for (const order of waitingOrders) {
      if (!chatData[order.id]) {
        fetch(`/api/order-chat/${order.id}`, { cache: "no-store" })
          .then((r) => r.ok ? r.json() : [])
          .then((data) => setChatData((prev) => ({ ...prev, [order.id]: Array.isArray(data) ? data : [] })))
          .catch(() => {});
      }
    }
  }, [orders]);

  async function loadOrders() {
    const res = await fetch("/api/seller/orders", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  async function handleVerifyCode(orderId: string) {
    setActionLoading(true);
    setCodeError(null);
    const res = await fetch(`/api/seller/orders/${orderId}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeInput }),
    });
    setActionLoading(false);
    if (res.ok) {
      toast("success", "تم التحقق من الكود بنجاح.");
      setVerifyCode(null);
      setCodeInput("");
      await loadOrders();
    } else {
      const data = await res.json().catch(() => ({ error: "الكود غير صحيح" }));
      setCodeError(data.error || "الكود غير صحيح");
      toast("error", data.error || "الكود غير صحيح");
    }
  }

  async function sendWrongCode(orderId: string) {
    await fetch(`/api/order-chat/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "الكود الذي أرسلته غير صحيح، يرجى إعادة إرسال الكود الصحيح" }),
    });
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, type: "wrong_code", message: "البائع يقول أن الكود غير صحيح، يرجى إعادة إرساله", userId: "__buyer__" }),
    });
    setVerifyCode(null);
    setCodeInput("");
    setCodeError(null);
  }

  async function handleDeliver(orderId: string) {
    if (!deliveryInput.trim()) return;
    setActionLoading(true);
    setDeliveryError(null);
    const res = await fetch(`/api/seller/orders/${orderId}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_data: deliveryInput }),
    });
    setActionLoading(false);
    if (res.ok) {
      toast("success", "تم تسليم المنتج بنجاح.");
      setDeliveryData(null);
      setDeliveryInput("");
      await loadOrders();
    } else {
      const data = await res.json().catch(() => ({ error: "فشل التسليم" }));
      setDeliveryError(data.error || "فشل التسليم");
      toast("error", data.error || "فشل التسليم");
    }
  }

  function handleCopy(text: string, msgId: string) {
    copyToClipboard(text);
    setCopied(msgId);
    setTimeout(() => setCopied(null), 2000);
  }

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

  const pendingOrders = orders.filter(
    (o) => o.status === "payment_confirmed_waiting_code" || o.status === "code_verified_deliver_now"
  );
  const otherOrders = orders.filter(
    (o) => o.status !== "payment_confirmed_waiting_code" && o.status !== "code_verified_deliver_now"
  );

  return (
    <div>
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">الطلبات</h1>
            <p className="subtitle">إدارة طلباتك وتسليم المنتجات.</p>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/seller")}>العودة</button>
        </div>
      </section>

      {pendingOrders.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-sm font-black text-white/70">بانتظار الإجراء</h2>
          <div className="grid gap-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="glass rounded-3xl p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/50">{order.order_tracking_id}</span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <h3 className="mt-2 font-bold text-white">{order.product_title || "—"}</h3>
                {order.product_description && (
                  <div className="mt-1 text-sm text-white/60 whitespace-pre-wrap">{order.product_description}</div>
                )}
                <div className="mt-1 text-sm text-white/70">
                  {order.buyer_name} | {order.total_amount} {order.currency}
                </div>

                {order.status === "payment_confirmed_waiting_code" && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-bold text-white/80">أدخل الكود المرسل من المشتري:</div>
                    {chatData[order.id] ? (
                      <div className="mt-3 grid gap-3">
                        {chatData[order.id].length > 0 ? (
                          chatData[order.id].map((msg) => (
                            <div key={msg.id} className="flex items-start justify-between gap-2 rounded-2xl bg-indigo-500/20 p-3 text-white/90">
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 text-xs font-bold text-white/60">{msg.sender_name || "مستخدم"}</div>
                                <div className="text-sm leading-7 whitespace-pre-wrap break-words">{msg.text}</div>
                                <div className="mt-1 text-xs font-bold text-white/50">
                                  {new Date(msg.created_at).toLocaleString()}
                                </div>
                              </div>
                              <button
                                className="btn-primary shrink-0 text-xs"
                                onClick={() => handleCopy(msg.text, msg.id)}
                              >
                                {copied === msg.id ? "تم" : "نسخ"}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="mt-2 text-sm text-white/50">لم يرسل المشتري الكود بعد.</div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-white/50">جاري التحميل...</div>
                    )}

                    <div className="mt-4">
                      {verifyCode === order.id ? (
                        <div className="grid gap-3">
                          <input
                            className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white text-center text-2xl tracking-widest outline-none focus:border-indigo-400/50"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="****"
                            dir="ltr"
                            maxLength={20}
                          />
                          {codeError && (
                            <div className="text-sm font-bold text-rose-300">{codeError}</div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="btn-primary"
                              onClick={() => handleVerifyCode(order.id)}
                              disabled={actionLoading || !codeInput}
                            >
                              {actionLoading ? "..." : "تحقق وتسليم"}
                            </button>
                            <button className="btn-secondary" onClick={() => { setVerifyCode(null); setCodeInput(""); setCodeError(null); }}>
                              إلغاء
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => sendWrongCode(order.id)}
                            >
                              الكود غير صحيح
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn-primary mt-3" onClick={() => setVerifyCode(order.id)}>
                          إدخال الكود
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {order.status === "code_verified_deliver_now" && (
                  <div className="mt-4">
                    {deliveryData === order.id ? (
                      <div className="grid gap-3">
                        <div className="text-sm font-bold text-white/80">بيانات الحساب (بريد، كلمة مرور، ملاحظات):</div>
                        <textarea
                          className="min-h-[120px] rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-indigo-400/50"
                          value={deliveryInput}
                          onChange={(e) => setDeliveryInput(e.target.value)}
                          placeholder="أدخل بيانات الحساب بالكامل..."
                        />
                        {deliveryError && (
                          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
                            {deliveryError}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="btn-primary"
                            onClick={() => handleDeliver(order.id)}
                            disabled={actionLoading || !deliveryInput.trim()}
                          >
                            {actionLoading ? "جارٍ..." : "تأكيد التسليم النهائي"}
                          </button>
                          <button className="btn-secondary" onClick={() => { setDeliveryData(null); setDeliveryInput(""); setDeliveryError(null); }}>
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-primary mt-3" onClick={() => setDeliveryData(order.id)}>
                        إدخال بيانات التسليم
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {otherOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-black text-white/70">الطلبات السابقة</h2>
          <div className="grid gap-4">
            {otherOrders.map((order) => (
              <div key={order.id} className="glass rounded-3xl p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/50">{order.order_tracking_id}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white/70">
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <h3 className="mt-2 font-bold text-white">{order.product_title || "—"}</h3>
                {order.product_description && (
                  <div className="mt-1 text-sm text-white/60 whitespace-pre-wrap">{order.product_description}</div>
                )}
                <div className="mt-1 text-sm text-white/70">
                  {order.buyer_name} | {order.total_amount} {order.currency}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="mt-6 glass rounded-3xl p-6 text-center text-white/70">لا توجد طلبات.</div>
      )}
    </div>
  );
}
