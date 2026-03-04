import { MongoClient } from "mongodb";

// ── Connection URI from environment ──────────────────────────────
const uri = process.env.MONGODB_URI!;

if (!uri) {
  throw new Error(
    "Please add your MONGODB_URI to .env.local\n" +
    "It looks like: mongodb+srv://username:password@cluster.mongodb.net/final-year"
  );
}

// ── Connection pooling (reuse across API calls) ──────────────────
// Next.js hot-reloads in dev, so we cache the client on globalThis
// to avoid creating too many connections.

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export default clientPromise;

// ── Helper: get the "final-year" database ───────────────────────
export async function getDb() {
  const client = await clientPromise;
  return client.db("final-year");
}
