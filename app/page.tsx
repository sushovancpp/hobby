"use client";
import { useState, useEffect } from "react";
import { User } from "@/types";
import LandingPage from "@/components/auth/LandingPage";
import LoginPage from "@/components/auth/LoginPage";
import QuestionsPage from "@/components/questions/QuestionsPage";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Toast from "@/components/ui/Toast";

type View = "landing" | "login" | "app";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ── Close session when tab is closed / browser is refreshed ─────
  useEffect(() => {
    const handleUnload = () => {
      if (sessionId) {
        navigator.sendBeacon(
          "/api/sessions",
          new Blob(
            [JSON.stringify({ action: "logout", sessionId })],
            { type: "application/json" }
          )
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sessionId]);

  function handleLogin(u: User, sid?: string) {
    setUser(u);
    setSessionId(sid ?? null);
    setView("app");
  }

  async function handleLogout() {
    if (sessionId) {
      try {
        await fetch("/api/sessions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      } catch { /* silently ignore */ }
    }
    setSessionId(null);
    setUser(null);
    setView("landing");
  }

  return (
    <>
      <Toast />

      {view === "landing" && (
        <LandingPage onEnter={() => setView("login")} />
      )}

      {view === "login" && (
        <LoginPage onLogin={handleLogin} onBack={() => setView("landing")} />
      )}

      {view === "app" && user?.role === "admin" && (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}

      {view === "app" && user?.role === "student" && (
        <QuestionsPage
          user={user}
          sessionId={sessionId}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}