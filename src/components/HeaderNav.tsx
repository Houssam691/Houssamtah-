"use client";

import Link from "next/link";
import NavNotificationBell from "@/components/NavNotificationBell";
import { useGlobalPortals } from "@/components/GlobalPortalContainer";

export default function HeaderNav() {
  const { toggleSideNav } = useGlobalPortals();

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
        <img src="https://aisndkhxmhgtnfu9.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-04%20at%2011.25.00%20AM.jpeg" alt="Nexivo" className="h-9 w-9 rounded-2xl object-cover shadow-[0_10px_30px_rgba(2,6,23,0.18)]" />
        <span>Nexivo</span>
      </Link>

      <div className="flex items-center gap-2">
        <NavNotificationBell className="rounded-full px-3 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white" />
        <button onClick={toggleSideNav} aria-label="القائمة" className="rounded-full px-2 py-2 text-white/80 hover:bg-white/5 hover:text-white transition">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
