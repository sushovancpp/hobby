"use client";
import { Question, QuestionCategory } from "@/types";
import AiPanel from "./AiPanel";

interface Props {
  question: Question;
  type: QuestionCategory;
  index: number;
}

const typeStyles: Record<string, { accent: string; label: string; marks: string }> = {
  short: { accent: "#ffd166", label: "Short Answer", marks: "3 Marks" },
  long:  { accent: "#f093fb", label: "Long Answer",  marks: "5 Marks" },
};

export default function TextCard({ question, type, index }: Props) {
  const style = typeStyles[type] || typeStyles.long;

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
        (e.currentTarget as HTMLDivElement).style.borderColor = `${style.accent}30`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 30px ${style.accent}10`;
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
          <span
            className="px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{ background: `${style.accent}18`, border: `1px solid ${style.accent}40`, color: style.accent }}
          >
            {style.marks}
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="px-6 pt-3 pb-5 text-[15px] leading-relaxed">{question.question}</p>

      {/* Divider */}
      <div className="mx-6 h-px bg-white/[0.06]" />

      {/* AI Panel */}
      <div className="pt-3">
        <AiPanel question={question} type={type} />
      </div>
    </div>
  );
}
