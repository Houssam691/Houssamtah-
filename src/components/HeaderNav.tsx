"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import NavNotificationBell from "@/components/NavNotificationBell";
import SideNav from "@/components/SideNav";

export default function HeaderNav() {
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) throw new Error();

        const data = await response.json();

        if (mounted) {
          setUserId(data?.user?.id ?? null);
        }
      } catch {
        if (mounted) {
          setUserId(null);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return (
    <header className="flex w-full items-center justify-between">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 select-none"
      >
        <Image
          src="https://aisndkhxmhgtnfu9.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-04%20at%2011.25.00%20AM.jpeg"
          alt="Nexivo"
          width={40}
          height={40}
          priority
          className="rounded-2xl object-cover shadow-lg"
        />

        <span className="text-lg font-black tracking-wide text-white">
          Nexivo
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <NavNotificationBell
          userId={userId}
          className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        />

        <SideNav userId={userId} />
      </div>
    </header>
  );
}
