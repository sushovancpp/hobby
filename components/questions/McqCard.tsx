"use client";
import { useState } from "react";
import { Question } from "@/types";
import AiPanel from "./AiPanel";

interface Props {
  question: Question;
  index: number;
}

export default function McqCard({ question, index }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);

  const opts = Object.entries(question.options || {});

  function getOptClass(key: string) {
    let cls = "mcq-opt";
    if (correct) {
      if (key === correct) cls += " correct";
      else if (key === selected && key !== correct) cls += " wrong";
    } else if (key === selected) {
      cls += " selected";
    }
    return cls;
  }

  return (
    <div
      className="rounded-2xl mb-5 overflow-hidden fade-up"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        animationDelay: `${index * 0.04}s`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,212,255,0.25)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 30px rgba(0,212,255,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-6 pt-5">
        <span
          className="px-2.5 py-1 rounded-lg text-xs font-bold font-syne flex-shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, #00d4ff, #7b2ff7)", color: "#fff" }}
        >
          Q{question.q_no}
        </span>
        <div className="flex gap-2 flex-wrap mt-0.5">
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}>
            {question.co}
          </span>
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: "rgba(123,47,247,0.15)", border: "1px solid rgba(123,47,247,0.25)", color: "#b88dff" }}>
            {question.k_level}
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="px-6 pt-3 pb-4 text-[15px] leading-relaxed">{question.question}</p>

      {/* Options */}
      {opts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-6 pb-4">
          {opts.map(([key, val]) => (
            <button
              key={key}
              onClick={() => {
                setSelected(key);
                if (correct && key === correct) {/* already revealed */}
              }}
              className={`${getOptClass(key)} flex items-start gap-2.5 text-left px-3.5 py-2.5 rounded-xl text-sm cursor-pointer border`}
              style={
                !selected && !correct
                  ? { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }
                  : {}
              }
            >
              <span className="font-bold font-syne text-xs flex-shrink-0 mt-0.5">{key}.</span>
              <span>{val}</span>
            </button>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mx-6 h-px bg-white/[0.06] mb-0" />

      {/* AI Panel */}
      <div className="pt-3">
        <AiPanel question={question} type="mcq" onCorrectAnswer={setCorrect} />
      </div>
    </div>
  );
}
