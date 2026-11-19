import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  indexesSynced: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
  indexesSynced: false,
};

globalThis.mongooseCache = cached;

export type ConnectOptions = {
  /** Sync model indexes after connect (seed script + Vitest). */
  syncIndexes?: boolean;
};

/**
 * Connect to MongoDB, reusing a single cached connection across Next.js
 * hot reloads (and concurrent requests) via globalThis.
 */
export async function connectToDatabase(
  options: ConnectOptions = {},
): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Copy .env.example to .env.local and set the connection string.",
    );
  }

  if (!cached.conn) {
    if (!cached.promise) {
      cached.promise = mongoose.connect(uri);
    }

    try {
      cached.conn = await cached.promise;
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  if (options.syncIndexes && !cached.indexesSynced) {
    const { ensureIndexes } = await import("./models/ensureIndexes");
    await ensureIndexes();
    cached.indexesSynced = true;
  }

  return cached.conn;
}

/**
 * Disconnect and clear the global connection cache.
 * Intended for Vitest so a memory-server URI can be wired cleanly.
 */
export async function resetDatabaseConnection(): Promise<void> {
  if (cached.conn || cached.promise) {
    await mongoose.disconnect().catch(() => undefined);
  }

  cached.conn = null;
  cached.promise = null;
  cached.indexesSynced = false;
}
