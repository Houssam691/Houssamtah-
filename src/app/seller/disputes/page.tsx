"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";

type Dispute = {
  id: string;
  order_id: string;
  order_tracking_id: string;
  reason: string;
  status: string;
  created_at: string;
  buyer_name: string;
};

export default function SellerDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (!data.user || (data.user.role !== "seller" && data.user.role !== "admin")) {
        router.push("/login"); return;
      }
      fetch("/api/disputes", { cache: "no-store" })
        .then(r => r.json())
        .then(data => setDisputes(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl pt-12">
        <section className="glass rounded-3xl p-6 md:p-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-3 h-5 w-56" />
        </section>
        <div className="mt-6 grid gap-4">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pt-12">
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="title">النزاعات</h1>
            <p className="subtitle">النزاعات المرفوعة على طلباتك</p>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/seller")}>الرجوع</button>
        </div>
      </section>

      <div className="mt-6 grid gap-4">
        {disputes.map((d) => (
          <button
            key={d.id}
            className="glass rounded-3xl p-5 text-right transition hover:bg-white/5"
            onClick={() => router.push(`/orders/${d.order_id}`)}
          >
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
              {new Date(d.created_at).toLocaleDateString("ar-DZ")}
            </div>
          </button>
        ))}

        {disputes.length === 0 && (
          <div className="glass rounded-3xl p-6 text-center text-white/70">لا توجد نزاعات.</div>
        )}
      </div>
    </div>
  );
}
