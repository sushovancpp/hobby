import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ── POST /api/sessions ────────────────────────────────────────────
// Two uses:
//   1. action === "logout"  → called by navigator.sendBeacon on tab close
//   2. (no action)          → normal student login, creates a new session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Beacon logout (tab / browser close) ───────────────────────
    if (body.action === "logout" && body.sessionId) {
      const db = await getDb();
      const logoutTime = new Date().toISOString();

      let sessionObjectId: ObjectId;
      try {
        sessionObjectId = new ObjectId(body.sessionId);
      } catch {
        return NextResponse.json({ success: false, message: "Invalid sessionId" }, { status: 400 });
      }

      const session = await db
        .collection("sessions")
        .findOne({ _id: sessionObjectId });

      if (session && session.status === "active") {
        const durationSeconds = Math.round(
          (new Date(logoutTime).getTime() - new Date(session.loginTime).getTime()) / 1000
        );
        await db.collection("sessions").updateOne(
          { _id: sessionObjectId },
          { $set: { logoutTime, durationSeconds, status: "ended" } }
        );
      }

      return NextResponse.json({ success: true });
    }

    // ── Normal login — create a new session ───────────────────────
    const { studentName, studentCode } = body;
    if (!studentName || !studentCode) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.collection("sessions").insertOne({
      studentName,
      studentCode: studentCode.toUpperCase(),
      loginTime: now,
      logoutTime: null,
      durationSeconds: null,
      status: "active",
    });

    return NextResponse.json({ success: true, sessionId: result.insertedId.toString() });
  } catch (err) {
    console.error("Session POST error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── PATCH /api/sessions — logout one session (or force-logout-all) ─
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDb();
    const logoutTime = new Date().toISOString();

    // ── Force logout ALL active sessions ──────────────────────────
    if (body.forceLogoutAll) {
      const activeSessions = await db
        .collection("sessions")
        .find({ status: "active" })
        .toArray();

      if (activeSessions.length === 0) {
        return NextResponse.json({ success: true, affected: 0 });
      }

      await Promise.all(
        activeSessions.map((s) => {
          const durationSeconds = Math.round(
            (new Date(logoutTime).getTime() - new Date(s.loginTime).getTime()) / 1000
          );
          return db.collection("sessions").updateOne(
            { _id: s._id },
            { $set: { logoutTime, durationSeconds, status: "ended" } }
          );
        })
      );

      return NextResponse.json({ success: true, affected: activeSessions.length });
    }

    // ── Logout a single session ────────────────────────────────────
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing sessionId" },
        { status: 400 }
      );
    }

    const session = await db
      .collection("sessions")
      .findOne({ _id: new ObjectId(sessionId) });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const durationSeconds = Math.round(
      (new Date(logoutTime).getTime() - new Date(session.loginTime).getTime()) / 1000
    );
    await db.collection("sessions").updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { logoutTime, durationSeconds, status: "ended" } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session PATCH error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── GET /api/sessions — admin fetch all sessions ──────────────────
export async function GET() {
  try {
    const db = await getDb();
    const sessions = await db
      .collection("sessions")
      .find({})
      .sort({ loginTime: -1 })
      .limit(500)
      .toArray();

    const mapped = sessions.map((s) => ({
      ...s,
      _id: s._id.toString(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json([], { status: 500 });
  }
}