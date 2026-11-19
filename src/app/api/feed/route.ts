import { connection } from "next/server";
import { handleRoute } from "@/lib/api/handleRoute";
import { jsonResponse } from "@/lib/api/jsonResponse";
import { CURRENT_USER_ID } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getFeed } from "@/lib/services";

export async function GET(): Promise<Response> {
  // Next.js 16 + cacheComponents: request-time opt-in (replaces force-dynamic).
  // Must stay outside handleRoute so prerender bailouts are not turned into 500s.
  await connection();

  return handleRoute(async () => {
    await connectToDatabase();
    await ensureSeeded();
    const profiles = await getFeed(CURRENT_USER_ID);
    return jsonResponse({ profiles });
  });
}
