"use client";

import Link from "next/link";
import NavDashboardLink from "@/components/NavDashboardLink";
import NavAuthButton from "@/components/NavAuthButton";
import NavNotificationBell from "@/components/NavNotificationBell";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function HeaderNav() {
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserId(d.user?.id || null))
      .catch(() => setUserId(null));
  }, [pathname]);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
        <img src="https://aisndkhxmhgtnfu9.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-04%20at%2011.25.00%20AM.jpeg" alt="Nexivo" className="h-9 w-9 rounded-2xl object-cover shadow-[0_10px_30px_rgba(2,6,23,0.18)]" />
        <span>Nexivo</span>
      </Link>

      <div className="flex items-center gap-2">
        <NavNotificationBell
          userId={userId}
          className="rounded-full px-3 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white"
          links={
            <div className="grid gap-1">
              <Link href="/pubg" className="rounded-2xl px-4 py-3 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                PUBG
              </Link>
              <Link href="/free-fire" className="rounded-2xl px-4 py-3 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                Free Fire
              </Link>
              <Link href="/topup" className="rounded-2xl px-4 py-3 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                Top-up
              </Link>
              <hr className="border-white/10" />
              {userId && (
                <>
                  <Link href={`/profile/${encodeURIComponent(userId)}`} className="rounded-2xl px-4 py-3 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                    الملف الشخصي
                  </Link>
                  <Link href="/settings" className="rounded-2xl px-4 py-3 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                    الإعدادات
                  </Link>
                </>
              )}
              <NavDashboardLink className="rounded-2xl px-4 py-3 font-bold text-white/80 hover:bg-white/5 hover:text-white" />
              <NavAuthButton className="rounded-2xl px-4 py-3 font-bold text-white/80 hover:bg-white/5 hover:text-white" />
            </div>
          }
        />
      </div>
    </div>
  );
}
