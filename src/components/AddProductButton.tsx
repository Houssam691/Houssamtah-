"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AddProductButton() {
  const [canAdd, setCanAdd] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const role = d.user?.role;
        if (role === "seller" || role === "admin") setCanAdd(true);
      })
      .catch(() => {});
  }, []);

  if (!canAdd) return null;

  return (
    <Link href="/seller/products" className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-2xl font-black text-white shadow-lg shadow-indigo-500/25 transition hover:scale-110 active:scale-95">
      +
    </Link>
  );
}
