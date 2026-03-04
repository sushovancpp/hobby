"use client";
import { useState } from "react";
import { User } from "@/types";
import { showToast } from "@/components/ui/Toast";
import AdminModal from "./AdminModal";

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  async function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast("Please fill both fields", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "student", name: name.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Welcome, ${data.user.name}! 🎉`, "success");
        onLogin(data.user);
      } else {
        showToast(data.message || "Login failed", "error");
      }
    } catch {
      showToast("Network error, please try again", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10"
    >
      {/* Logo */}
      <div className="text-center mb-10 fade-up">
        <h1
          className="font-syne text-5xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #fff 30%, #00d4ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          final-year
        </h1>
        <p className="text-[var(--muted)] tracking-[0.25em] uppercase text-xs mt-2">
          VLSI Question Bank
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md fade-up rounded-2xl p-10"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(0,212,255,0.2)",
          boxShadow: "0 0 60px rgba(0,212,255,0.07)",
          animationDelay: "0.1s",
        }}
      >
        <h2 className="font-syne text-2xl font-bold text-center mb-1">Student Login</h2>
        <p className="text-[var(--muted)] text-sm text-center mb-8">
          Enter your registered name and student code
        </p>

        <form onSubmit={handleStudentLogin} className="flex flex-col gap-5">
          {/* Name */}
          <div className="input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Shivnath Ghosh"
              autoComplete="off"
              spellCheck={false}
            />
            <i className="fa-solid fa-user field-icon" />
          </div>

          {/* Code */}
          <div className="input-group">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex. BWU/BTA/18/069"
              autoComplete="off"
              spellCheck={false}
            />
            <i className="fa-solid fa-id-badge field-icon" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 font-syne font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,212,255,0.35)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #7b2ff7)",
              color: "#fff",
            }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Verifying…
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrow-right-to-bracket" />
                Access Question Bank
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[var(--muted)] text-xs">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button
          onClick={() => setShowAdmin(true)}
          className="w-full rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/10 hover:text-white"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            color: "var(--muted)",
          }}
        >
          <i className="fa-solid fa-user-shield" />
          Login as Devloper 
        </button>
      </div>

      <p className="text-[var(--muted)] text-xs text-center mt-8 fade-up" style={{ animationDelay: "0.2s" }}>
        Only authorised students may log in &nbsp;·&nbsp; Made with ♥ by{" "}
        <span className="text-[var(--cyan)] font-semibold">DoTAi</span>
      </p>

      {showAdmin && (
        <AdminModal onClose={() => setShowAdmin(false)} onLogin={onLogin} />
      )}
    </div>
  );
}
