import { z } from "zod";
import { handleRoute } from "@/lib/api/handleRoute";
import { jsonResponse } from "@/lib/api/jsonResponse";
import { CURRENT_USER_ID } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import { swipe } from "@/lib/services";

const swipeBodySchema = z.object({
  targetId: z.string().min(1),
  direction: z.enum(["like", "pass"]),
});

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    await connectToDatabase();

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = swipeBodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError("Invalid swipe payload");
    }

    const result = await swipe(
      CURRENT_USER_ID,
      parsed.data.targetId,
      parsed.data.direction,
    );

    return jsonResponse(result);
  });
}
