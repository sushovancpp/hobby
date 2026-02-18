"use client";
import { useEffect, useState } from "react";

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastListener: ((t: ToastData) => void) | null = null;

export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  toastListener?.({ id: Date.now(), message, type });
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    toastListener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    return () => { toastListener = null; };
  }, []);

  const icons: Record<string, string> = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    info: "fa-circle-info",
  };
  const colors: Record<string, string> = {
    success: "border-[#2ed573] text-[#2ed573]",
    error: "border-[#ff4757] text-[#ff4757]",
    info: "border-[#00d4ff] text-[#00d4ff]",
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-show flex items-center gap-3 px-5 py-3.5 rounded-xl border bg-[#0d1020]/90 backdrop-blur-xl shadow-2xl min-w-[280px] text-sm font-medium ${colors[t.type]}`}
        >
          <i className={`fa-solid ${icons[t.type]} text-lg`} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
