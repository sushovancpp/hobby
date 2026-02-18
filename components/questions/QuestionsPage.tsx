"use client";
import { useEffect, useMemo, useState } from "react";
import { Question, QuestionCategory, User } from "@/types";
import { groupQuestions } from "@/lib/questions";
import McqCard from "./McqCard";
import TextCard from "./TextCard";

interface Props {
  user: User;
  onLogout: () => void;
}

type Tab = QuestionCategory;

const tabs: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: "mcq",   label: "MCQ",             icon: "fa-list-check",    color: "#00d4ff" },
  { id: "short", label: "Short (3 Marks)", icon: "fa-pen-to-square", color: "#ffd166" },
  { id: "long",  label: "Long (5 Marks)",  icon: "fa-scroll",        color: "#f093fb" },
];

export default function QuestionsPage({ user, onLogout }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("mcq");
  const [search, setSearch] = useState("");
  const [activeCO, setActiveCO] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => groupQuestions(questions), [questions]);

  // Derive unique COs for the active tab
  const coOptions = useMemo(() => {
    const set = new Set(grouped[activeTab].map((q) => q.co));
    return ["ALL", ...Array.from(set).sort()];
  }, [grouped, activeTab]);

  // Reset CO filter when tab changes
  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setSearch("");
    setActiveCO("ALL");
  }

  const filtered = useMemo(() => {
    let list = grouped[activeTab];
    if (activeCO !== "ALL") list = list.filter((q) => q.co === activeCO);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.question.toLowerCase().includes(q));
    }
    return list;
  }, [grouped, activeTab, activeCO, search]);

  const tab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="relative z-10 min-h-screen flex flex-col">

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 h-16"
        style={{
          background: "rgba(6,8,16,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,212,255,0.15)",
        }}
      >
        <span
          className="font-syne text-xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #fff, #00d4ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          final-year
        </span>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{
              background: user.role === "admin" ? "rgba(255,165,0,0.12)" : "rgba(0,212,255,0.12)",
              border: `1px solid ${user.role === "admin" ? "rgba(255,165,0,0.35)" : "rgba(0,212,255,0.3)"}`,
              color: user.role === "admin" ? "orange" : "#00d4ff",
            }}
          >
            <i className={`fa-solid ${user.role === "admin" ? "fa-shield-halved" : "fa-circle-user"} text-xs`} />
            <span className="font-medium text-xs hidden sm:inline">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(255,71,87,0.2)]"
            style={{
              background: "rgba(255,71,87,0.12)",
              border: "1px solid rgba(255,71,87,0.35)",
              color: "#ff4757",
            }}
          >
            <i className="fa-solid fa-right-from-bracket" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── TABS ── */}
      <div
        className="sticky top-16 z-40 flex items-end gap-1 px-6 md:px-8 overflow-x-auto"
        style={{
          background: "rgba(6,8,16,0.82)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className="flex items-center gap-2 px-5 py-4 text-sm font-semibold font-syne whitespace-nowrap transition-all duration-200 border-b-2 -mb-px"
            style={{
              color: activeTab === t.id ? t.color : "var(--muted)",
              borderBottomColor: activeTab === t.id ? t.color : "transparent",
            }}
          >
            <i className={`fa-solid ${t.icon} text-xs`} />
            {t.label}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: `${t.color}18`,
                border: `1px solid ${t.color}35`,
                color: t.color,
              }}
            >
              {grouped[t.id].length}
            </span>
          </button>
        ))}
      </div>

      {/* ── BODY ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-8 pb-20">

        {/* Section header */}
        <div className="mb-5">
          <h2
            className="font-syne text-2xl md:text-3xl font-extrabold mb-1 flex items-center gap-3"
            style={{ color: tab.color }}
          >
            <i className={`fa-solid ${tab.icon} text-xl`} />
            {activeTab === "mcq"
              ? "Multiple Choice Questions"
              : activeTab === "short"
              ? "Short Answer Questions"
              : "Long Answer Questions"}
          </h2>
          <p className="text-[var(--muted)] text-sm">
            {activeTab === "mcq" && "Select an option · Ask AI reveals the correct answer instantly"}
            {activeTab === "short" && "3-mark questions · AI generates 6 key points with explanation"}
            {activeTab === "long"  && "5-mark questions · AI generates 10 detailed points with explanation"}
          </p>
        </div>

        {/* Search + CO Filter row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontFamily: "Space Grotesk, sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = tab.color;
                e.target.style.boxShadow = `0 0 0 3px ${tab.color}18`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* CO Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {coOptions.map((co) => (
              <button
                key={co}
                onClick={() => setActiveCO(co)}
                className="px-3 py-2 rounded-lg text-xs font-bold font-syne transition-all duration-200 whitespace-nowrap"
                style={{
                  background: activeCO === co
                    ? tab.color
                    : "rgba(255,255,255,0.05)",
                  color: activeCO === co ? "#000" : "var(--muted)",
                  border: activeCO === co
                    ? `1.5px solid ${tab.color}`
                    : "1.5px solid rgba(255,255,255,0.1)",
                  transform: activeCO === co ? "scale(1.05)" : "scale(1)",
                  boxShadow: activeCO === co ? `0 4px 16px ${tab.color}40` : "none",
                }}
              >
                {co}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-[var(--muted)] text-xs mb-4">
            Showing <span style={{ color: tab.color }} className="font-bold">{filtered.length}</span> questions
            {activeCO !== "ALL" && <> in <span style={{ color: tab.color }} className="font-bold">{activeCO}</span></>}
            {search && <> matching &ldquo;<span className="text-white">{search}</span>&rdquo;</>}
          </p>
        )}

        {/* Admin notice */}
        {user.role === "admin" && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
            style={{ background: "rgba(255,165,0,0.08)", border: "1px solid rgba(255,165,0,0.25)" }}
          >
            <i className="fa-solid fa-shield-halved text-orange-400 text-base" />
            <div>
              <strong className="text-orange-300">Admin Mode</strong>
              <span className="text-[var(--muted)] ml-2">Full access to all questions and answers</span>
            </div>
          </div>
        )}

        {/* Questions list */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-[var(--muted)]">
            <div className="spinner" />
            Loading questions…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-[var(--muted)]">
            <i className="fa-solid fa-magnifying-glass text-3xl mb-4 block opacity-30" />
            <p>No questions found</p>
            {(search || activeCO !== "ALL") && (
              <button
                onClick={() => { setSearch(""); setActiveCO("ALL"); }}
                className="mt-3 text-xs underline hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((q, i) =>
              activeTab === "mcq" ? (
                <McqCard key={q.q_no} question={q} index={i} />
              ) : (
                <TextCard key={q.q_no} question={q} type={activeTab} index={i} />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
