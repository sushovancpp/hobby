import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  // ── ADMIN LOGIN ──────────────────────────────────────────────
  if (type === "admin") {
    const { password } = body;
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPass) {
      return NextResponse.json({ success: true, user: { name: "Admin", role: "admin" } });
    }
    return NextResponse.json({ success: false, message: "Wrong password" }, { status: 401 });
  }

  // ── STUDENT LOGIN ────────────────────────────────────────────
  if (type === "student") {
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: "Name and student code are required" },
        { status: 400 }
      );
    }

    try {
      const db = await getDb();

      // Case-insensitive name match + exact code match
      const student = await db.collection("students").findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        code: code.trim().toUpperCase(),
      });

      if (!student) {
        return NextResponse.json(
          { success: false, message: "Student not found. Check your name and code." },
          { status: 401 }
        );
      }

      // ── Create a session record ───────────────────────────────
      const now = new Date().toISOString();
      const sessionResult = await db.collection("sessions").insertOne({
        studentName: student.name,
        studentCode: student.code,
        loginTime: now,
        logoutTime: null,
        durationSeconds: null,
        status: "active",
      });

      return NextResponse.json({
        success: true,
        user: { name: student.name, role: "student" },
        sessionId: sessionResult.insertedId.toString(),
      });
    } catch (err) {
      console.error("Auth error:", err);
      return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
}
