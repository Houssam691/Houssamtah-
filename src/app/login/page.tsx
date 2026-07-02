"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "بيانات الدخول غير صحيحة" }));
      setError(data.error || "بيانات الدخول غير صحيحة");
      return;
    }

    const data = await res.json();
    const role = data.user?.role;

    if (role === "admin") {
      router.push("/admin");
    } else if (role === "seller") {
      router.push("/seller");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <section className="glass rounded-3xl p-6 md:p-10">
        <h1 className="title">تسجيل دخول</h1>
        <p className="subtitle">أدخل بريدك الإلكتروني وكلمة المرور.</p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-white/80">البريد الإلكتروني</span>
            <input
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-white/80">كلمة المرور</span>
            <input
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
              {error}
            </div>
          ) : null}

          <button className="btn-primary h-12 w-full" type="submit" disabled={loading}>
            {loading ? "..." : "دخول"}
          </button>

          <div className="text-center text-sm text-white/60">
            ليس لديك حساب؟{" "}
            <a href="/register" className="font-bold text-indigo-300 hover:text-indigo-200">
              إنشاء حساب
            </a>
          </div>
        </form>
      </section>
    </div>
  );
}
