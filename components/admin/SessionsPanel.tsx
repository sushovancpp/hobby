"use client";
import { useEffect, useState, useMemo } from "react";
import { Session } from "@/types";

interface Props {
  onClose: () => void;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtDuration(secs?: number | null) {
  if (!secs) return "—";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function SessionsPanel({ onClose }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "active" | "ended">("ALL");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [forcingId, setForcingId] = useState<string | null>(null);
  const [forcingAll, setForcingAll] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  async function fetchSessions() {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
      setLastRefresh(new Date());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
    // ── Auto-refresh REMOVED ─────────────────────────────────────
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); };
  }, [onClose]);

  // ── Force logout a single session ──────────────────────────────
  async function handleForceLogout(sessionId: string) {
    setForcingId(sessionId);
    try {
      await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      await fetchSessions();
    } finally {
      setForcingId(null);
    }
  }

  // ── Force logout ALL active sessions ───────────────────────────
  async function handleForceLogoutAll() {
    setForcingAll(true);
    setConfirmAll(false);
    try {
      await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceLogoutAll: true }),
      });
      await fetchSessions();
    } finally {
      setForcingAll(false);
    }
  }

  // ── Derived stats ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === "active").length;
    const ended = sessions.filter((s) => s.status === "ended").length;
    const uniqueStudents = new Set(sessions.map((s) => s.studentCode)).size;
    const durations = sessions.filter((s) => s.durationSeconds).map((s) => s.durationSeconds!);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const maxDuration = durations.length ? Math.max(...durations) : 0;

    const perStudent: Record<string, { name: string; count: number; lastLogin: string }> = {};
    sessions.forEach((s) => {
      if (!perStudent[s.studentCode]) {
        perStudent[s.studentCode] = { name: s.studentName, count: 0, lastLogin: s.loginTime };
      }
      perStudent[s.studentCode].count++;
      if (s.loginTime > perStudent[s.studentCode].lastLogin) {
        perStudent[s.studentCode].lastLogin = s.loginTime;
      }
    });
    const topStudents = Object.entries(perStudent)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    return { total, active, ended, uniqueStudents, avgDuration, maxDuration, topStudents };
  }, [sessions]);

  // ── Filtered list ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = sessions;
    if (statusFilter !== "ALL") list = list.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sessions, statusFilter, search]);

  const activeCount = stats.active;

  // ── Stat card ───────────────────────────────────────────────────
  const StatCard = ({
    icon, label, value, color,
  }: { icon: string; label: string; value: string | number; color: string }) => (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}25`,
        boxShadow: `0 0 30px ${color}08`,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <i className={`fa-solid ${icon} text-sm`} style={{ color }} />
        </div>
        <span className="text-xs text-[var(--muted)] font-medium">{label}</span>
      </div>
      <p className="font-syne font-bold text-2xl text-white">{value}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 md:px-8 h-16 shrink-0"
        style={{
          background: "rgba(6,8,16,0.95)",
          borderBottom: "1px solid rgba(0,212,255,0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
            title="Back to Dashboard"
          >
            <i className="fa-solid fa-arrow-left text-sm" />
          </button>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.35)" }}
          >
            <i className="fa-solid fa-chart-line text-[#00d4ff] text-sm" />
          </div>
          <div>
            <h2 className="font-syne font-bold text-white text-base leading-tight">Student Access Tracker</h2>
            <p className="text-[var(--muted)] text-xs">
              Last updated: {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Force Logout All */}
          {activeCount > 0 && (
            confirmAll ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#ff6b6b]">Logout {activeCount} active?</span>
                <button
                  onClick={handleForceLogoutAll}
                  disabled={forcingAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "rgba(255,107,107,0.2)", border: "1.5px solid rgba(255,107,107,0.5)", color: "#ff6b6b" }}
                >
                  {forcingAll ? "Logging out…" : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmAll(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-[var(--muted)] hover:text-white hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmAll(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: "rgba(255,107,107,0.1)", border: "1.5px solid rgba(255,107,107,0.3)", color: "#ff6b6b" }}
              >
                <i className="fa-solid fa-right-from-bracket" />
                <span className="hidden sm:inline">Force Logout All</span>
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "rgba(255,107,107,0.25)" }}
                >
                  {activeCount}
                </span>
              </button>
            )
          )}

          {/* Refresh */}
          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <i className="fa-solid fa-rotate-right" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon="fa-users" label="Total Logins" value={stats.total} color="#00d4ff" />
          <StatCard icon="fa-circle-dot" label="Active Now" value={stats.active} color="#06d6a0" />
          <StatCard icon="fa-check-circle" label="Ended" value={stats.ended} color="#ffd166" />
          <StatCard icon="fa-user-graduate" label="Unique Students" value={stats.uniqueStudents} color="#f093fb" />
          <StatCard icon="fa-clock" label="Avg Session" value={fmtDuration(stats.avgDuration)} color="#ff6b6b" />
          <StatCard icon="fa-trophy" label="Longest Session" value={fmtDuration(stats.maxDuration)} color="#ff9f43" />
        </div>

        {/* ── Top students ── */}
        {stats.topStudents.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h3 className="font-syne font-bold text-sm text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-medal text-[#ffd166]" />
              Most Active Students
            </h3>
            <div className="space-y-2">
              {stats.topStudents.map(([code, info], i) => (
                <div key={code} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      background: i === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)",
                      color: i === 0 ? "#ffd166" : "var(--muted)",
                      border: `1px solid ${i === 0 ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-white">{info.name}</span>
                  <span className="text-xs text-[var(--muted)]">{code}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}
                  >
                    {info.count} {info.count === 1 ? "login" : "logins"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Session log ── */}
        <div>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or student code…"
                className="w-full rounded-lg pl-9 pr-4 py-2 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#fff" }}
              />
            </div>
            <div className="flex items-center gap-2">
              {(["ALL", "active", "ended"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-3 py-2 rounded-lg text-xs font-bold font-syne transition-all capitalize"
                  style={{
                    background: statusFilter === f
                      ? f === "active" ? "rgba(6,214,160,0.2)" : f === "ended" ? "rgba(255,209,102,0.2)" : "rgba(0,212,255,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: statusFilter === f
                      ? f === "active" ? "1.5px solid rgba(6,214,160,0.5)" : f === "ended" ? "1.5px solid rgba(255,209,102,0.5)" : "1.5px solid rgba(0,212,255,0.4)"
                      : "1.5px solid rgba(255,255,255,0.1)",
                    color: statusFilter === f
                      ? f === "active" ? "#06d6a0" : f === "ended" ? "#ffd166" : "#00d4ff"
                      : "var(--muted)",
                  }}
                >
                  {f === "ALL" ? "All" : f === "active" ? "🟢 Active" : "⚫ Ended"}
                </button>
              ))}
              <div
                className="flex items-center px-3 py-2 rounded-lg text-xs font-bold"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}
              >
                {filtered.length} records
              </div>
            </div>
          </div>

          {/* ── Column headers ── */}
          {!loading && filtered.length > 0 && (
            <div
              className="hidden md:grid px-4 py-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]"
              style={{ gridTemplateColumns: "2fr 1.6fr 1.6fr 100px 110px" }}
            >
              <span>Student</span>
              <span>Login Time</span>
              <span>Logout Time</span>
              <span>Session</span>
              <span className="text-right">Action</span>
            </div>
          )}

          {/* ── Rows ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-[var(--muted)]">
              <div className="spinner" /> Loading sessions…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-[var(--muted)]">
              <i className="fa-solid fa-clock-rotate-left text-4xl mb-4 block opacity-30" />
              <p>No sessions found</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((s) => (
                <div
                  key={s._id as string}
                  className="group px-4 py-3 rounded-xl transition-all hover:bg-white/[0.03]"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* ── Desktop: grid row ── */}
                  <div
                    className="hidden md:grid items-center gap-4"
                    style={{ gridTemplateColumns: "2fr 1.6fr 1.6fr 100px 110px" }}
                  >
                    {/* Student name + code */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: s.status === "active" ? "#06d6a0" : "#444",
                          boxShadow: s.status === "active" ? "0 0 6px #06d6a0" : "none",
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{s.studentName}</p>
                        <p className="text-[11px] text-[var(--muted)]">{s.studentCode}</p>
                      </div>
                    </div>

                    {/* Login time */}
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <i className="fa-solid fa-right-to-bracket text-[#06d6a0] text-[10px]" />
                      <span>{fmtDate(s.loginTime)}</span>
                    </div>

                    {/* Logout time */}
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      {s.logoutTime ? (
                        <>
                          <i className="fa-solid fa-right-from-bracket text-[#ff6b6b] text-[10px]" />
                          <span>{fmtDate(s.logoutTime)}</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-right-from-bracket text-[var(--muted)] opacity-20 text-[10px]" />
                          <span className="opacity-40 italic">Still active</span>
                        </>
                      )}
                    </div>

                    {/* Session duration / status */}
                    <div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: s.status === "active" ? "rgba(6,214,160,0.1)" : "rgba(255,255,255,0.06)",
                          color: s.status === "active" ? "#06d6a0" : "var(--muted)",
                          border: `1px solid ${s.status === "active" ? "rgba(6,214,160,0.25)" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        {s.status === "active" ? "🟢 Online" : fmtDuration(s.durationSeconds)}
                      </span>
                    </div>

                    {/* Force logout button */}
                    <div className="flex justify-end">
                      {s.status === "active" && (
                        <button
                          onClick={() => handleForceLogout(s._id as string)}
                          disabled={forcingId === (s._id as string)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all opacity-0 group-hover:opacity-100"
                          style={{
                            background: "rgba(255,107,107,0.1)",
                            border: "1px solid rgba(255,107,107,0.3)",
                            color: "#ff6b6b",
                          }}
                        >
                          {forcingId === (s._id as string) ? (
                            <><div className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />Ending…</>
                          ) : (
                            <><i className="fa-solid fa-right-from-bracket text-[10px]" />Logout</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Mobile: stacked layout ── */}
                  <div className="md:hidden flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background: s.status === "active" ? "#06d6a0" : "#444",
                            boxShadow: s.status === "active" ? "0 0 6px #06d6a0" : "none",
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">{s.studentName}</p>
                          <p className="text-[11px] text-[var(--muted)]">{s.studentCode}</p>
                        </div>
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: s.status === "active" ? "rgba(6,214,160,0.1)" : "rgba(255,255,255,0.06)",
                          color: s.status === "active" ? "#06d6a0" : "var(--muted)",
                          border: `1px solid ${s.status === "active" ? "rgba(6,214,160,0.25)" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        {s.status === "active" ? "🟢 Online" : fmtDuration(s.durationSeconds)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)] pl-4">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-right-to-bracket text-[#06d6a0] text-[10px]" />
                        {fmtDate(s.loginTime)}
                      </span>
                      {s.logoutTime ? (
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-right-from-bracket text-[#ff6b6b] text-[10px]" />
                          {fmtDate(s.logoutTime)}
                        </span>
                      ) : (
                        <span className="opacity-40 italic">Still active</span>
                      )}
                    </div>
                    {s.status === "active" && (
                      <button
                        onClick={() => handleForceLogout(s._id as string)}
                        disabled={forcingId === (s._id as string)}
                        className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ml-4 transition-all"
                        style={{
                          background: "rgba(255,107,107,0.1)",
                          border: "1px solid rgba(255,107,107,0.3)",
                          color: "#ff6b6b",
                        }}
                      >
                        {forcingId === (s._id as string) ? (
                          <><div className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />Ending…</>
                        ) : (
                          <><i className="fa-solid fa-right-from-bracket text-[10px]" />Force Logout</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}