"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";

type User = {
  id: string;
  role: string;
  email: string;
  first_name: string;
  seller_status: string | null;
};

export default function SellerPendingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "seller") {
          router.push("/login");
          return;
        }
        setUser(data.user);
        if (data.user.seller_status === "approved") {
          router.push("/seller");
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg pt-12">
        <section className="glass rounded-3xl p-6 md:p-10">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-5 w-64" />
          <Skeleton className="mt-4 h-20 w-full" />
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg pt-12">
      <section className="glass rounded-3xl p-6 text-center md:p-10">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="title">طلبك قيد المراجعة</h1>
        <p className="subtitle">
          تم استلام طلب تسجيلك كبائع. سيقوم الأدمن بمراجعة المستندات الخاصة بك والموافقة على الحساب في أقرب وقت.
        </p>
        <button className="btn-secondary mt-6" onClick={() => router.push("/")}>
          العودة للرئيسية
        </button>
      </section>
    </div>
  );
}
