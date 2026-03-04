export interface Student {
  name: string;
  code: string;
}

export interface Question {
  q_no: string;
  question: string;
  type: string;        // "MCQ" | "Short  (Text)" | "Long  (Text)"
  co: string;
  k_level: string;
  options: Record<string, string>;
  answer: string;      // For MCQ: "A"/"B"/"C"/"D" | For Short/Long: numbered point string
}

export type QuestionCategory = "mcq" | "short" | "long";

export interface User {
  name: string;
  role: "student" | "admin";
}

export type ToastType = "success" | "error" | "info";
