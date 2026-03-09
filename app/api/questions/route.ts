import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    const questions = await db
      .collection("questions")
      .find({}, { projection: { _id: 0 } }) // exclude MongoDB internal _id field
      .sort({ q_no: 1 })
      .toArray();

    return NextResponse.json(questions);
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
