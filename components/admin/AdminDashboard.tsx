"use client";
import { useState } from "react";
import { User } from "@/types";
import AdminPanel from "./AdminPanel";
import SessionsPanel from "./SessionsPanel";
import QuestionsPage from "@/components/questions/QuestionsPage";

interface Props {
  user: User;
  onLogout: () => void;
}

type View = "dashboard" | "questions" | "sessions" | "questionBank";

export default function AdminDashboard({ user, onLogout }: Props) {
  const [view, setView] = useState<View>("dashboard");

  if (view === "questions") {
    return <AdminPanel onClose={() => setView("dashboard")} />;
  }

  if (view === "sessions") {
    return <SessionsPanel onClose={() => setView("dashboard")} />;
  }

  if (view === "questionBank") {
    return <QuestionsPage user={user} onLogout={() => setView("dashboard")} backLabel="← Dashboard" />;
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 h-16"
        style={{
          background: "rgba(6,8,16,0.92)",
          borderBottom: "1px solid rgba(255,165,0,0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <span
          className="font-syne text-xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #fff 30%, #ffa500)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          final-year
          <span className="ml-2 text-xs font-medium text-orange-400 align-middle opacity-80">
            Admin
          </span>
        </span>

        {/* Right: user + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.25)" }}>
            <i className="fa-solid fa-shield-halved text-orange-400 text-xs" />
            <span className="text-orange-300 text-xs font-semibold font-syne">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <i className="fa-solid fa-right-from-bracket" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">

        {/* Welcome */}
        <div className="text-center mb-14 fade-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.3)", color: "#ffa500" }}
          >
            <i className="fa-solid fa-shield-halved" />
            Developer Dashboard
          </div>
          <h1 className="font-syne text-4xl md:text-5xl font-extrabold text-white mb-3">
            What would you like<br />to manage?
          </h1>
          <p className="text-[var(--muted)] text-sm">Choose a section below to get started</p>
        </div>

        {/* Three cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl fade-up" style={{ animationDelay: "0.1s" }}>

          {/* ── Manage Questions ── */}
          <button
            onClick={() => setView("questions")}
            className="group relative rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(123,47,247,0.25)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(123,47,247,0.3)",
            }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top left, rgba(123,47,247,0.12), transparent 70%)" }}
            />

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(123,47,247,0.15)", border: "1.5px solid rgba(123,47,247,0.35)" }}
            >
              <i className="fa-solid fa-book-open text-2xl" style={{ color: "#7b2ff7" }} />
            </div>

            <h2 className="font-syne text-2xl font-bold text-white mb-2">Manage Questions</h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              Add, edit, and delete questions. Filter by type, CO, and K-level.
            </p>

            <div
              className="inline-flex items-center gap-2 mt-6 text-xs font-bold font-syne px-4 py-2 rounded-xl transition-all"
              style={{ background: "rgba(123,47,247,0.15)", color: "#a855f7", border: "1px solid rgba(123,47,247,0.3)" }}
            >
              Open Editor
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </div>
          </button>

          {/* ── Access Logs ── */}
          <button
            onClick={() => setView("sessions")}
            className="group relative rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,212,255,0.2)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(0,212,255,0.25)",
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top left, rgba(0,212,255,0.1), transparent 70%)" }}
            />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(0,212,255,0.12)", border: "1.5px solid rgba(0,212,255,0.3)" }}
            >
              <i className="fa-solid fa-chart-line text-2xl" style={{ color: "#00d4ff" }} />
            </div>
            <h2 className="font-syne text-2xl font-bold text-white mb-2">Access Logs</h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              Track student logins, session durations, active users, and usage stats.
            </p>
            <div
              className="inline-flex items-center gap-2 mt-6 text-xs font-bold font-syne px-4 py-2 rounded-xl"
              style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.25)" }}
            >
              View Logs
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </div>
          </button>

          {/* ── Question Bank ── */}
          <button
            onClick={() => setView("questionBank")}
            className="group relative rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(6,214,160,0.2)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(6,214,160,0.25)",
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top left, rgba(6,214,160,0.1), transparent 70%)" }}
            />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(6,214,160,0.12)", border: "1.5px solid rgba(6,214,160,0.3)" }}
            >
              <i className="fa-solid fa-graduation-cap text-2xl" style={{ color: "#06d6a0" }} />
            </div>
            <h2 className="font-syne text-2xl font-bold text-white mb-2">Question Bank</h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              Browse the full question bank exactly as students see it.
            </p>
            <div
              className="inline-flex items-center gap-2 mt-6 text-xs font-bold font-syne px-4 py-2 rounded-xl"
              style={{ background: "rgba(6,214,160,0.1)", color: "#06d6a0", border: "1px solid rgba(6,214,160,0.25)" }}
            >
              Browse Questions
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
