"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "uploading">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !password) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف أو أكثر");
      return;
    }

    let idFilePath = "";

    if (role === "seller") {
      if (!idFile) {
        setError("يرجى رفع بطاقة الهوية (مطلوب للبائعين)");
        return;
      }
      setStep("uploading");
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", idFile);
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      const uploadRes = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => resolve(new Response(xhr.responseText, { status: xhr.status }));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", "/api/upload-id");
        xhr.send(formData);
      });
      if (!uploadRes.ok) {
        setError("فشل رفع بطاقة الهوية");
        setStep("form");
        return;
      }
      const uploadData = JSON.parse(xhr.responseText);
      idFilePath = uploadData.url || "";
    }

    setLoading(true);
    setStep("form");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        date_of_birth: dateOfBirth,
        id_file_path: idFilePath,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "فشل التسجيل" }));
      setError(data.error || "فشل التسجيل");
      return;
    }

    toast("success", "تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني.");
    setRegistered(true);
  }

  if (registered) {
    return (
      <div className="mx-auto max-w-lg">
        <section className="glass rounded-3xl p-6 md:p-10">
          <h1 className="title">تم إنشاء الحساب!</h1>
          <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100">
            تم إرسال رابط تأكيد إلى <span dir="ltr">{email}</span>. يرجى التحقق من بريدك الإلكتروني (بما في ذلك مجلد البريد المزعج) والنقر على الرابط لتفعيل حسابك.
          </div>
          <div className="mt-6 text-center">
            <a href="/login" className="btn-primary inline-block h-12 px-8 leading-[3rem]">
              تسجيل الدخول
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <section className="glass rounded-3xl p-6 md:p-10">
        <h1 className="title">إنشاء حساب جديد</h1>
        <p className="subtitle">سجّل للوصول إلى الطلبات والمتجر.</p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">الاسم الأول</span>
              <input
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="محمد"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">الاسم الأخير</span>
              <input
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="أحمد"
              />
            </label>
          </div>

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

          <label className="grid gap-2">
            <span className="text-sm font-bold text-white/80">تاريخ الميلاد (اختياري)</span>
            <input
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-indigo-400/50"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-bold text-white/80">نوع الحساب</span>
            <div className="flex gap-2">
              <button
                type="button"
                className={role === "buyer" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                onClick={() => setRole("buyer")}
              >
                مشتري
              </button>
              <button
                type="button"
                className={role === "seller" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                onClick={() => setRole("seller")}
              >
                بائع
              </button>
            </div>
          </div>

          {role === "seller" && (
            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">بطاقة الهوية (إلزامي للبائعين)</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                <span className="text-sm text-white/70">{idFile ? idFile.name : "اختر ملف"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                />
                <button type="button" className="btn-secondary text-sm" onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
                  input?.click();
                }}>
                  تصفّح
                </button>
              </div>
            </label>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
              {error}
            </div>
          )}

          {step === "uploading" && (
            <div className="grid gap-2">
              <div className="text-center text-sm text-white/70">جاري رفع الملفات... {uploadProgress}%</div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <button className="btn-primary h-12 w-full" type="submit" disabled={loading || step === "uploading"}>
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </button>

          <div className="text-center text-sm text-white/60">
            لديك حساب بالفعل؟{" "}
            <a href="/login" className="font-bold text-indigo-300 hover:text-indigo-200">
              تسجيل دخول
            </a>
          </div>
        </form>
      </section>
    </div>
  );
}
