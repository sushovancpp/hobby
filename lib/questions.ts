import { Question, QuestionCategory } from "@/types";

export function classifyQuestion(q: Question): QuestionCategory {
  const t = q.type.toLowerCase();
  if (t.includes("mcq")) return "mcq";
  if (t.includes("short")) return "short";
  return "long";
}

export function groupQuestions(questions: Question[]) {
  return {
    mcq: questions.filter((q) => classifyQuestion(q) === "mcq"),
    short: questions.filter((q) => classifyQuestion(q) === "short"),
    long: questions.filter((q) => classifyQuestion(q) === "long"),
  };
}
