"use client";
import { useState } from "react";
import { Question, QuestionCategory } from "@/types";

interface Props {
  question: Question;
  type: QuestionCategory;
  onCorrectAnswer?: (key: string) => void;
}

type Status = "idle" | "loading" | "done";

export default function AiPanel({ question, type, onCorrectAnswer }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);

  const btnLabels: Record<QuestionCategory, string> = {
    mcq: "Ask AI ",
    short: "Ask AI ",
    long: "Ask AI ",
  };

  function handleAsk() {
    if (status === "done") {
      setOpen((prev) => !prev);
      return;
    }
    setOpen(true);
    setStatus("loading");

    // Simulate AI "thinking" delay (0.8–1.4s feels natural)
    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      setStatus("done");
      if (type === "mcq") {
        onCorrectAnswer?.(question.answer.trim().toUpperCase());
      }
    }, delay);
  }

  function parsePoints(raw: string): string[] {
    return raw
      .split(/\d+\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function renderAnswer() {
    if (type === "mcq") {
      const key = question.answer.trim().toUpperCase();
      const text = question.options[key] || "";
      return (
        <div
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-syne font-bold text-base"
          style={{
            background: "rgba(46,213,115,0.12)",
            border: "1px solid rgba(46,213,115,0.3)",
            color: "#2ed573",
          }}
        >
          <i className="fa-solid fa-circle-check" />
          {key} — {text}
        </div>
      );
    }

    const points = parsePoints(question.answer);
    return (
      <ul className="space-y-2.5">
        {points.map((pt, i) => (
          <li key={i} className="flex gap-3 items-start text-sm leading-relaxed">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-syne mt-0.5"
              style={{ background: "rgba(123,47,247,0.25)", color: "#d8b4fe" }}
            >
              {i + 1}
            </span>
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="px-6 pb-5">
      <button
        onClick={handleAsk}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#d8b4fe] text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(123,47,247,0.4)]"
        style={{
          background: "linear-gradient(135deg, rgba(123,47,247,0.3), rgba(0,212,255,0.15))",
          border: "1.5px solid rgba(123,47,247,0.5)",
        }}
      >
        <span className="ai-dot w-2 h-2 rounded-full bg-[#d8b4fe]" />
        {btnLabels[type]}
        {status === "done" && (
          <i className={`fa-solid fa-chevron-${open ? "up" : "down"} text-xs opacity-60 ml-1`} />
        )}
      </button>

      {open && (
        <div
          className="mt-3 rounded-xl overflow-hidden fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(123,47,247,0.08), rgba(0,212,255,0.04))",
            border: "1.5px solid rgba(123,47,247,0.25)",
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 text-[#d8b4fe] text-xs font-bold tracking-widest font-syne"
            style={{
              background: "rgba(123,47,247,0.12)",
              borderBottom: "1px solid rgba(123,47,247,0.2)",
            }}
          >
            <i className="fa-solid fa-robot" />
            DoT AI ANSWER
            <div className="ml-auto flex items-center gap-2">
              {status === "done" && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: "rgba(46,213,115,0.15)",
                    color: "#2ed573",
                    border: "1px solid rgba(46,213,115,0.3)",
                  }}
                >
                  ✓ Generated
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--muted)] hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {status === "loading" && (
              <div className="flex items-center gap-3 text-[var(--muted)] text-sm italic">
                <div className="spinner" />
                <span>Analyzing with DoT AI…</span>
              </div>
            )}
            {status === "done" && renderAnswer()}
          </div>
        </div>
      )}
    </div>
  );
}
