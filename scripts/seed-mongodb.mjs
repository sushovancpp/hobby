/**
 * seed-mongodb.mjs
 * -----------------
 * Run this ONCE to upload your local JSON data into MongoDB Atlas.
 *
 * Usage:
 *   npm run seed
 */

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("\n  MONGODB_URI not found in .env.local");
  console.error("    Add this line to your .env.local file:");
  console.error("    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/final-year\n");
  process.exit(1);
}

// ── Load local JSON data ─────────────────────────────────────────
const questions = JSON.parse(
  readFileSync(join(__dirname, "../data/questions.json"), "utf-8")
);
const students = JSON.parse(
  readFileSync(join(__dirname, "../data/studentlist.json"), "utf-8")
);

// ── Normalise data ───────────────────────────────────────────────
const normalisedQuestions = questions.map((q) => ({
  q_no:     String(q.q_no),
  question: q.question,
  type:     q.type,
  co:       q.co,
  k_level:  q.k_level,
  options:  q.options || {},
  answer:   q.answer ?? "",
}));

const normalisedStudents = students.map((s) => ({
  name: s.name.trim(),
  code: s.code.trim().toUpperCase(),
}));

// ── Connect and seed ─────────────────────────────────────────────
const client = new MongoClient(uri);

try {
  console.log("\n🚀  Connecting to MongoDB Atlas…");
  await client.connect();
  console.log("✅  Connected!\n");

  const db = client.db("final-year");

  // ── Questions ──
  process.stdout.write("   Uploading questions… ");
  const qCol = db.collection("questions");
  await qCol.deleteMany({}); // clear old data first
  await qCol.insertMany(normalisedQuestions);
  console.log(`✅  ${normalisedQuestions.length} questions uploaded.`);

  // ── Students ──
  process.stdout.write("   Uploading students…  ");
  const sCol = db.collection("students");
  await sCol.deleteMany({}); // clear old data first
  await sCol.insertMany(normalisedStudents);
  console.log(`✅  ${normalisedStudents.length} students uploaded.`);

  // ── Create indexes for fast login lookups ──
  process.stdout.write("   Creating indexes…    ");
  await sCol.createIndex({ code: 1 }, { unique: true });
  await sCol.createIndex({ name: 1 });
  await qCol.createIndex({ q_no: 1 });
  await qCol.createIndex({ type: 1 });
  await qCol.createIndex({ co: 1 });
  console.log("✅  Indexes created.");

  console.log("\n🎉  Done! Your MongoDB database is ready.");
  console.log("    Database: final-year");
  console.log("    Collections: questions, students\n");

} catch (err) {
  console.error("\n❌  Error:", err.message);
  console.error("\n    Common fixes:");
  console.error("    1. Check your MONGODB_URI is correct in .env.local");
  console.error("    2. Make sure your IP is whitelisted in MongoDB Atlas → Network Access");
  console.error("    3. Make sure your username/password in the URI are correct\n");
  process.exit(1);
} finally {
  await client.close();
}
