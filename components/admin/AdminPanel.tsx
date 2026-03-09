"use client";
import { useEffect, useState, useMemo } from "react";
import { Question } from "@/types";
import { showToast } from "@/components/ui/Toast";
interface Props {
  onClose: () => void;
}

const QUESTION_TYPES = ["MCQ", "Short  (Text)", "Long  (Text)"];
const CO_OPTIONS = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"];
const K_LEVELS = ["K1", "K2", "K3", "K4", "K5", "K6"];
const BLANK_FORM: Omit<Question, "q_no"> & { q_no: string } = {
  q_no: "",
  question: "",
  type: "MCQ",
  co: "CO1",
  k_level: "K1",
  options: { A: "", B: "", C: "", D: "" },
  answer: "A",
};

export default function AdminPanel({ onClose }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "MCQ" | "Short" | "Long">("ALL");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch questions ───────────────────────────────────────
  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load questions", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
    // Close on ESC
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modal || deleteTarget) {
          setModal(null);
          setDeleteTarget(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, modal, deleteTarget]);

  // ── Filtered list ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = questions;
    if (filterType !== "ALL") {
      list = list.filter((q) => q.type.startsWith(filterType));
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (q) =>
          q.question.toLowerCase().includes(s) ||
          q.q_no.includes(s) ||
          q.co.toLowerCase().includes(s)
      );
    }
    return list;
  }, [questions, filterType, search]);

  // ── Open Add modal ────────────────────────────────────────
  function openAdd() {
    setForm({ ...BLANK_FORM, options: { A: "", B: "", C: "", D: "" } });
    setModal("add");
  }

  // ── Open Edit modal ───────────────────────────────────────
  function openEdit(q: Question) {
    setForm({
      q_no: q.q_no,
      question: q.question,
      type: q.type,
      co: q.co,
      k_level: q.k_level,
      options: q.type === "MCQ" ? { A: "", B: "", C: "", D: "", ...q.options } : {},
      answer: q.answer,
    });
    setModal("edit");
  }

  // ── Save (Add or Edit) ────────────────────────────────────
  async function handleSave() {
    if (!form.q_no.trim()) { showToast("Question number is required", "error"); return; }
    if (!form.question.trim()) { showToast("Question text is required", "error"); return; }
    if (!form.answer.trim()) { showToast("Answer is required", "error"); return; }
    if (form.type === "MCQ") {
      if (!form.options.A?.trim() || !form.options.B?.trim() || !form.options.C?.trim() || !form.options.D?.trim()) {
        showToast("All 4 MCQ options are required", "error"); return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        options: form.type === "MCQ" ? form.options : {},
      };
      const method = modal === "add" ? "POST" : "PUT";
      const res = await fetch("/api/admin/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setModal(null);
        await fetchQuestions();
      } else {
        showToast(data.message || "Something went wrong", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions?q_no=${encodeURIComponent(deleteTarget.q_no)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setDeleteTarget(null);
        await fetchQuestions();
      } else {
        showToast(data.message || "Delete failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setDeleting(false);
    }
  }

  // ── Type badge color ──────────────────────────────────────
  function typeColor(type: string) {
    if (type.startsWith("MCQ")) return "#00d4ff";
    if (type.startsWith("Short")) return "#ffd166";
    return "#f093fb";
  }

  const isMCQ = form.type === "MCQ";

  // ────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 md:px-8 h-16 shrink-0"
        style={{
          background: "rgba(6,8,16,0.95)",
          borderBottom: "1px solid rgba(255,165,0,0.25)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* ← Back arrow */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
            title="Back to Dashboard"
          >
            <i className="fa-solid fa-arrow-left text-sm" />
          </button>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,165,0,0.15)", border: "1px solid rgba(255,165,0,0.35)" }}
          >
            <i className="fa-solid fa-shield-halved text-orange-400 text-sm" />
          </div>
          <div>
            <h2 className="font-syne font-bold text-white text-base leading-tight">Question Bank Manager</h2>
            <p className="text-[var(--muted)] text-xs">Add · Edit · Delete questions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-syne transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7b2ff7, #00d4ff)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(123,47,247,0.4)",
            }}
          >
            <i className="fa-solid fa-plus text-xs" />
            <span className="hidden sm:inline">Add Question</span>
          </button>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div
        className="px-6 md:px-8 py-3 flex flex-col sm:flex-row gap-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by question, number, CO…"
            className="w-full rounded-lg pl-9 pr-4 py-2 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          {(["ALL", "MCQ", "Short", "Long"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="px-3 py-2 rounded-lg text-xs font-bold font-syne transition-all"
              style={{
                background: filterType === t ? "rgba(255,165,0,0.2)" : "rgba(255,255,255,0.05)",
                border: filterType === t ? "1.5px solid rgba(255,165,0,0.5)" : "1.5px solid rgba(255,255,255,0.1)",
                color: filterType === t ? "orange" : "var(--muted)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          className="flex items-center px-3 py-2 rounded-lg text-xs font-bold"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}
        >
          {filtered.length} / {questions.length} questions
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-32 gap-3 text-[var(--muted)]">
            <div className="spinner" /> Loading questions…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-[var(--muted)]">
            <i className="fa-solid fa-inbox text-4xl mb-4 block opacity-30" />
            <p>No questions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((q) => (
              <div
                key={q.q_no}
                className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all hover:bg-white/[0.03]"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Q number */}
                <span
                  className="text-xs font-bold font-syne shrink-0 w-8 text-center"
                  style={{ color: "var(--muted)" }}
                >
                  #{q.q_no}
                </span>

                {/* Question text */}
                <p className="flex-1 text-sm text-white line-clamp-1">{q.question}</p>

                {/* Meta badges */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${typeColor(q.type)}15`,
                      border: `1px solid ${typeColor(q.type)}35`,
                      color: typeColor(q.type),
                    }}
                  >
                    {q.type.startsWith("MCQ") ? "MCQ" : q.type.startsWith("Short") ? "Short" : "Long"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--muted)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {q.co}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--muted)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {q.k_level}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(q)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:bg-cyan-400/20"
                    style={{ color: "#00d4ff", border: "1px solid rgba(0,212,255,0.25)" }}
                    title="Edit"
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(q)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:bg-red-400/20"
                    style={{ color: "#ff4757", border: "1px solid rgba(255,71,87,0.25)" }}
                    title="Delete"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════ ADD / EDIT MODAL ══════════════ */}
      {modal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] fade-up"
            style={{
              background: "#0d1020",
              border: "1.5px solid rgba(0,212,255,0.2)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h3 className="font-syne font-bold text-lg">
                {modal === "add" ? (
                  <><i className="fa-solid fa-plus text-[#00d4ff] mr-2" />Add New Question</>
                ) : (
                  <><i className="fa-solid fa-pen text-[#ffd166] mr-2" />Edit Question #{form.q_no}</>
                )}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">

              {/* Row: Q No + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">Question No.</label>
                  <input
                    type="text"
                    value={form.q_no}
                    onChange={(e) => setForm({ ...form, q_no: e.target.value })}
                    disabled={modal === "edit"}
                    placeholder="e.g. 51"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">Question Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value, answer: e.target.value === "MCQ" ? "A" : "" })}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t} value={t} style={{ background: "#0d1020" }}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: CO + K Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">CO (Course Outcome)</label>
                  <select
                    value={form.co}
                    onChange={(e) => setForm({ ...form, co: e.target.value })}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                  >
                    {CO_OPTIONS.map((co) => (
                      <option key={co} value={co} style={{ background: "#0d1020" }}>{co}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">K Level (Bloom's Taxonomy)</label>
                  <select
                    value={form.k_level}
                    onChange={(e) => setForm({ ...form, k_level: e.target.value })}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                  >
                    {K_LEVELS.map((k) => (
                      <option key={k} value={k} style={{ background: "#0d1020" }}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">Question Text</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Enter the full question…"
                  rows={3}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                />
              </div>

              {/* MCQ Options */}
              {isMCQ && (
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-2">Options (A · B · C · D)</label>
                  <div className="space-y-2">
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <div key={opt} className="flex items-center gap-3">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}
                        >
                          {opt}
                        </span>
                        <input
                          type="text"
                          value={form.options[opt] || ""}
                          onChange={(e) =>
                            setForm({ ...form, options: { ...form.options, [opt]: e.target.value } })
                          }
                          placeholder={`Option ${opt}`}
                          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer */}
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">
                  {isMCQ ? "Correct Answer (A / B / C / D)" : "Answer / Key Points"}
                </label>
                {isMCQ ? (
                  <div className="flex gap-2">
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm({ ...form, answer: opt })}
                        className="flex-1 py-2.5 rounded-lg font-bold font-syne text-sm transition-all"
                        style={{
                          background: form.answer === opt ? "#00d4ff" : "rgba(255,255,255,0.06)",
                          color: form.answer === opt ? "#000" : "var(--muted)",
                          border: form.answer === opt ? "1.5px solid #00d4ff" : "1.5px solid rgba(255,255,255,0.12)",
                          transform: form.answer === opt ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    placeholder={"Write key points separated by newlines…\n1. First point\n2. Second point"}
                    rows={5}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                  />
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={() => setModal(null)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold font-syne transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #7b2ff7, #00d4ff)",
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(123,47,247,0.4)",
                }}
              >
                {saving ? (
                  <><div className="spinner" /> Saving…</>
                ) : modal === "add" ? (
                  <><i className="fa-solid fa-plus text-xs" /> Add Question</>
                ) : (
                  <><i className="fa-solid fa-floppy-disk text-xs" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ DELETE CONFIRM ══════════════ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 fade-up"
            style={{
              background: "#0d1020",
              border: "1.5px solid rgba(255,71,87,0.35)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
            }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,71,87,0.15)", border: "1px solid rgba(255,71,87,0.35)" }}
              >
                <i className="fa-solid fa-triangle-exclamation text-[#ff4757]" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-lg text-white">Delete Question #{deleteTarget.q_no}?</h3>
                <p className="text-[var(--muted)] text-sm mt-1 line-clamp-2">{deleteTarget.question}</p>
                <p className="text-[#ff4757] text-xs mt-2 font-semibold">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-white hover:bg-white/10 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold font-syne transition-all disabled:opacity-60"
                style={{
                  background: "#ff4757",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(255,71,87,0.4)",
                }}
              >
                {deleting ? (
                  <><div className="spinner" /> Deleting…</>
                ) : (
                  <><i className="fa-solid fa-trash text-xs" /> Yes, Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
