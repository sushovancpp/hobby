"use client";
import { useState, useEffect } from "react";
import { User } from "@/types";
import LoginPage from "@/components/auth/LoginPage";
import QuestionsPage from "@/components/questions/QuestionsPage";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Toast from "@/components/ui/Toast";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ── Close session when tab is closed / refreshed ──────────────
  useEffect(() => {
    const handleUnload = () => {
      if (sessionId) {
        navigator.sendBeacon(
          "/api/sessions",
          new Blob(
            [JSON.stringify({ sessionId })],
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
  }

  return (
    <>
      <Toast />
      {!user && <LoginPage onLogin={handleLogin} />}
      {user?.role === "admin" && <AdminDashboard user={user} onLogout={handleLogout} />}
      {user?.role === "student" && <QuestionsPage user={user} onLogout={handleLogout} />}
    </>
  );
}