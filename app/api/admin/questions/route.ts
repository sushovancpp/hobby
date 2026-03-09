import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ── POST: Add a new question ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { q_no, question, type, co, k_level, options, answer } = body;

    if (!q_no || !question || !type || !co || !k_level || !answer) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();

    // Check for duplicate q_no
    const existing = await db.collection("questions").findOne({ q_no: String(q_no) });
    if (existing) {
      return NextResponse.json({ success: false, message: `Question number ${q_no} already exists` }, { status: 409 });
    }

    const doc = {
      q_no: String(q_no),
      question,
      type,
      co,
      k_level,
      options: options || {},
      answer,
    };

    await db.collection("questions").insertOne(doc);
    return NextResponse.json({ success: true, message: "Question added successfully" });
  } catch (err) {
    console.error("Admin POST error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── PUT: Edit an existing question ───────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { q_no, question, type, co, k_level, options, answer } = body;

    if (!q_no) {
      return NextResponse.json({ success: false, message: "q_no is required" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection("questions").updateOne(
      { q_no: String(q_no) },
      {
        $set: {
          question,
          type,
          co,
          k_level,
          options: options || {},
          answer,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Question updated successfully" });
  } catch (err) {
    console.error("Admin PUT error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── DELETE: Remove a question ────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q_no = searchParams.get("q_no");

    if (!q_no) {
      return NextResponse.json({ success: false, message: "q_no is required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("questions").deleteOne({ q_no: String(q_no) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    console.error("Admin DELETE error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
