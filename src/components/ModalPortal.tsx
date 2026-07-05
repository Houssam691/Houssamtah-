"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
};

export default function ModalPortal({ open, onClose, children, maxWidth = "max-w-2xl" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-hidden">
      <div
        ref={ref}
        className={`w-full ${maxWidth} animate-scale-in max-h-[calc(100vh-4rem)] overflow-y-auto`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
