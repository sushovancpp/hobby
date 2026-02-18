import { NextRequest, NextResponse } from "next/server";
import students from "@/data/studentlist.json";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  // ── ADMIN LOGIN ──
  if (type === "admin") {
    const { password } = body;
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPass) {
      return NextResponse.json({ success: true, user: { name: "Admin", role: "admin" } });
    }
    return NextResponse.json({ success: false, message: "Wrong password" }, { status: 401 });
  }

  // ── STUDENT LOGIN ──
  if (type === "student") {
    const { name, code } = body;
    if (!name || !code) {
      return NextResponse.json({ success: false, message: "Name and student code are required" }, { status: 400 });
    }
    const match = (students as { name: string; code: string }[]).find(
      (s) =>
        s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        s.code.trim().toUpperCase() === code.trim().toUpperCase()
    );
    if (match) {
      return NextResponse.json({ success: true, user: { name: match.name, role: "student" } });
    }
    return NextResponse.json(
      { success: false, message: "Student not found. Check your name and code." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
}
