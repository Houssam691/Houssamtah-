"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextType = {
  toast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const colors: Record<ToastType, string> = {
    success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    error: "border-rose-400/30 bg-rose-500/10 text-rose-100",
    info: "border-indigo-400/30 bg-indigo-500/10 text-indigo-100",
  };

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✗",
    info: "ℹ",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[9999] mx-auto flex max-w-lg flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-slide-up cursor-pointer rounded-2xl border px-4 py-3 text-sm font-bold shadow-lg backdrop-blur-xl ${colors[t.type]}`}
            onClick={() => dismiss(t.id)}
          >
            {icons[t.type]} {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
