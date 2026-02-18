# final-year — VLSI Question Bank

A Next.js 14 (App Router) + TypeScript + Tailwind CSS project for final year VLSI students.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables (`.env.local`)

| Variable | Description | Default |
|---|---|---|
| `ADMIN_PASSWORD` | Admin login password | `admin123` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `final-year` |

> No external API key needed — answers are served directly from `data/questions.json`.

---

## 👥 Managing Students (`data/studentlist.json`)

Add or remove students by editing `data/studentlist.json`:

```json
[
  { "name": "Sayon Roy",    "code": "BWUBTA20001" },
  { "name": "Aisha Rahman", "code": "BWUBTA20002" }
]
```

- **name** — case-insensitive match
- **code** — case-insensitive match

---

## 🧠 AI Answers (from JSON)

The "Ask AI" button reads pre-loaded answers from `questions.json` with a realistic loading delay.

| Question Type | AI Response Format |
|---|---|
| MCQ | Correct option letter + text, highlighted green |
| Short (3 Marks) | 6 numbered key points |
| Long (5 Marks) | 10 numbered detailed points |

---

## 🔍 Filters

- **Search** — full-text search within each section
- **CO Filter** — filter by Course Outcome (CO1, CO2, CO3, CO4…)

---

## 🔐 Login

1. **Student Login** — Name + Student Code (from `studentlist.json`)
2. **Admin Login** — Password from `.env.local`

---

## 📁 Project Structure

```
final-year/
├── app/
│   ├── api/
│   │   ├── auth/route.ts        ← Login API
│   │   └── questions/route.ts   ← Questions API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── AdminModal.tsx
│   ├── questions/
│   │   ├── QuestionsPage.tsx    ← Tabs + CO filter + search
│   │   ├── McqCard.tsx
│   │   ├── TextCard.tsx
│   │   └── AiPanel.tsx          ← Reads answer from JSON
│   └── ui/Toast.tsx
├── data/
│   ├── questions.json           ← All questions + answers
│   └── studentlist.json         ← Authorised students
├── lib/questions.ts
├── types/index.ts
├── .env.local
└── README.md
```

---

## 🏗️ Build for Production

```bash
npm run build
npm start
```
