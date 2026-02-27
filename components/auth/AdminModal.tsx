"use client";
import { useEffect, useRef, useState } from "react";
import { User } from "@/types";
import { showToast } from "@/components/ui/Toast";

interface Props {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export default function AdminModal({ onClose, onLogin }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
    // Close on ESC
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { showToast("Enter password", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "Devloper(Admin)", password }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Admin access granted 🛡️", "success");
        onLogin(data.user);
        onClose();
      } else {
        showToast(data.message || "Wrong password", "error");
        setPassword("");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 fade-up"
        style={{
          background: "#0d1020",
          border: "1.5px solid rgba(0,212,255,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-syne text-xl font-bold">Devloper Access</h3>
            <p className="text-[var(--muted)] text-sm mt-1">Enter Dev password</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="input-group">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
            <i className="fa-solid fa-lock field-icon" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-syne font-bold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(123,47,247,0.4)] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #7b2ff7, #00d4ff)", color: "#fff" }}
          >
            {loading ? (
              <><div className="spinner" /> Verifying…</>
            ) : (
              <><i className="fa-solid fa-shield-halved" /> Login as Devloper</>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] text-sm hover:text-white transition-colors py-1"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
