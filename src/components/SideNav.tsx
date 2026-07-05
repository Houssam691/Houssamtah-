"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavDashboardLink from "@/components/NavDashboardLink";
import NavAuthButton from "@/components/NavAuthButton";

type Props = {
  userId?: string |null;
};

export default function SideNav({ userId }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      {/* زر القائمة */}
      <button
        onClick={() => setOpen(true)}
        aria-label="القائمة"
        className="rounded-xl p-2 text-white hover:bg-white/10 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* الخلفية */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* القائمة */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-[290px] max-w-[88vw] bg-zinc-950 border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 shrink-0">
          <h2 className="text-white font-bold text-lg">القائمة</h2>

          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* العناصر */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">

          <Link
            href="/pubg"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition"
          >
            PUBG
          </Link>

          <Link
            href="/free-fire"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition"
          >
            Free Fire
          </Link>

          <Link
            href="/topup"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition"
          >
            Top-up
          </Link>

          {userId && (
            <>
              <div className="border-t border-white/10 my-2" />

              <Link
                href={`/profile/${encodeURIComponent(userId)}`}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition"
              >
                الملف الشخصي
              </Link>

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition"
              >
                الإعدادات
              </Link>
            </>
          )}

          <div className="border-t border-white/10 my-2" />

          <NavDashboardLink
            className="block rounded-xl px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition"
          />

          <NavAuthButton
            className="block rounded-xl px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition"
          />
        </div>
      </aside>
    </>
  );
}
