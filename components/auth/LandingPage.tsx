"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onEnter: () => void;
}

const FEATURES = [
  {
    icon: "fa-solid fa-microchip",
    title: "VLSI Question Bank",
    desc: "Curated MCQ, Short & Long answer questions mapped to CO and K-levels.",
  },
  {
    icon: "fa-solid fa-robot",
    title: "AI Answer Reveal",
    desc: "Stuck on a question? Get instant AI-powered explanations on demand.",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Secure Access",
    desc: "Only registered students with valid credentials can log in.",
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "Session Tracking",
    desc: "Every login session is recorded so no access goes unnoticed.",
  },
];

const TOPICS = [
  "CMOS Logic Design",
  "Transmission Gates",
  "Stick Diagrams",
  "SPICE Simulation",
  "Layout Design Rules",
  "Timing Analysis",
  "Power Estimation",
  "FinFET Devices",
  "Standard Cells",
  "Floor Planning",
];

export default function LandingPage({ onEnter }: Props) {
  const [visible, setVisible] = useState(false);
  const [tagIndex, setTagIndex] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // cycle the floating topic tag
  useEffect(() => {
    const id = setInterval(() => {
      setTagIndex((i) => (i + 1) % TOPICS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative z-10 min-h-screen flex flex-col items-center px-4 py-16 overflow-x-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}
    >
      {/* ── Hero ── */}
      <section className="w-full max-w-3xl flex flex-col items-center text-center gap-6 pt-8 fade-up">
        {/* Badge */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.25)",
            color: "var(--cyan)",
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: "var(--cyan)", boxShadow: "0 0 6px var(--cyan)" }}
          />
          Final Year · Brainware University
        </div>

        {/* Title */}
        <h1
          className="font-syne text-6xl sm:text-7xl font-extrabold tracking-tighter leading-none"
          style={{
            background: "linear-gradient(135deg, #fff 25%, #00d4ff 60%, #7b2ff7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VLSI<br />Question Bank
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl max-w-xl leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          A focused exam-prep platform for VLSI Design — browse questions, test
          your knowledge, and get AI explanations instantly.
        </p>

        {/* Cycling topic tag */}
        <div
          key={tagIndex}
          className="px-4 py-1.5 rounded-full text-sm font-medium fade-up"
          style={{
            background: "rgba(123,47,247,0.12)",
            border: "1px solid rgba(123,47,247,0.3)",
            color: "#c084fc",
            animationDuration: "0.3s",
          }}
        >
          <i className="fa-solid fa-tag mr-2 text-xs" />
          {TOPICS[tagIndex]}
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="mt-2 px-10 py-4 rounded-2xl font-syne font-bold text-base tracking-wide flex items-center gap-3 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,212,255,0.4)] hover:-translate-y-1 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #00d4ff, #7b2ff7)",
            color: "#fff",
          }}
        >
          <i className="fa-solid fa-door-open" />
          Enter Question Bank
          <i className="fa-solid fa-arrow-right text-sm" />
        </button>

        <p className="text-xs" style={{ color: "rgba(232,234,246,0.3)" }}>
          Authorised students only · Powered by DoTAi
        </p>
      </section>

      {/* ── Divider ── */}
      <div
        className="w-full max-w-3xl my-16 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)" }}
      />

      {/* ── Feature cards ── */}
      <section className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="fade-up rounded-2xl p-6 flex gap-4 items-start transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(0,212,255,0.12)",
              animationDelay: `${0.1 + i * 0.08}s`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base"
              style={{
                background: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "var(--cyan)",
              }}
            >
              <i className={f.icon} />
            </div>
            <div>
              <h3 className="font-syne font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Stats row ── */}
      <section
        className="w-full max-w-3xl mt-10 rounded-2xl p-6 grid grid-cols-3 gap-4 text-center fade-up"
        style={{
          background: "rgba(123,47,247,0.06)",
          border: "1.5px solid rgba(123,47,247,0.2)",
          animationDelay: "0.45s",
        }}
      >
        {[
          { value: "3", label: "Question Types" },
          { value: "CO", label: "CO-Mapped" },
          { value: "K1–K6", label: "Bloom's Levels" },
        ].map((s) => (
          <div key={s.label}>
            <div
              className="font-syne font-extrabold text-2xl"
              style={{ color: "var(--cyan)" }}
            >
              {s.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <p className="mt-16 text-xs fade-up" style={{ color: "rgba(232,234,246,0.25)", animationDelay: "0.5s" }}>
        © {new Date().getFullYear()} final-year · VLSI Question Bank · Made with ♥ by{" "}
        <span style={{ color: "var(--cyan)" }}>DoTAi</span>
      </p>
    </div>
  );
}
