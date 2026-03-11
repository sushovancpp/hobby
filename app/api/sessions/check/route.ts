import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ── GET /api/sessions/check?id=<sessionId> ────────────────────────
// Called every 30 seconds by the student's browser.
// Returns { valid: true }  → session is still active, student may continue.
// Returns { valid: false } → session was ended (force-logout or expired),
//                            client must redirect to login.
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ valid: false });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      // Malformed id — treat as invalid
      return NextResponse.json({ valid: false });
    }

    const db = await getDb();
    const session = await db
      .collection("sessions")
      .findOne({ _id: objectId }, { projection: { status: 1 } });

    // If session doesn't exist or status is not "active" → kick the student
    const valid = session?.status === "active";
    return NextResponse.json({ valid });
  } catch (err) {
    console.error("Session check error:", err);
    // On server error, don't kick the student (fail open)
    return NextResponse.json({ valid: true });
  }
}